import os
import hashlib
import logging
from typing import List
import numpy as np
from app.core.config import settings

logger = logging.getLogger(__name__)

EMBEDDING_DIM = 768


class EmbeddingService:
    """Provides high-quality embeddings with Google Gemini and local semantic fallback."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.model_name = settings.GEMINI_EMBEDDING_MODEL
        self._genai_client = None
        self._init_client()

    def _init_client(self):
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai_client = genai
                logger.info("Initialized Google Gemini Embeddings client successfully.")
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI SDK: {e}. Fallback embedding will be used.")
                self._genai_client = None

    def _local_fallback_embed(self, text: str) -> List[float]:
        """Deterministic 768-dimensional normalized semantic-hash embedding vector.
        Uses character n-grams and word hashing to preserve similarity for lexical and semantic overlap."""
        vec = np.zeros(EMBEDDING_DIM, dtype=np.float32)
        words = text.lower().split()
        for i, word in enumerate(words):
            # Hash single word
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            idx = h % EMBEDDING_DIM
            weight = 1.0 / (1.0 + 0.05 * min(i, 20))
            vec[idx] += weight

            # Hash character 3-grams
            if len(word) >= 3:
                for j in range(len(word) - 2):
                    ngram = word[j:j+3]
                    h_ng = int(hashlib.sha256(ngram.encode("utf-8")).hexdigest(), 16)
                    vec[h_ng % EMBEDDING_DIM] += 0.5

        # Normalize vector
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        else:
            vec[0] = 1.0
        return vec.tolist()

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for a single string."""
        if not text or not text.strip():
            return [0.0] * EMBEDDING_DIM

        if self._genai_client and self.api_key:
            try:
                result = self._genai_client.embed_content(
                    model=self.model_name,
                    content=text,
                    task_type="retrieval_query",
                )
                embedding = result.get("embedding")
                if embedding:
                    # If returned length differs from 768, truncate or pad
                    if len(embedding) > EMBEDDING_DIM:
                        return embedding[:EMBEDDING_DIM]
                    elif len(embedding) < EMBEDDING_DIM:
                        return embedding + [0.0] * (EMBEDDING_DIM - len(embedding))
                    return embedding
            except Exception as e:
                logger.warning(f"Gemini API embed failed ({e}), using local embedding engine.")

        return self._local_fallback_embed(text)

    def get_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embedding vectors for a list of strings."""
        if not texts:
            return []

        if self._genai_client and self.api_key:
            try:
                # Gemini batch embed if supported, or iterate
                embeddings = []
                for text in texts:
                    emb = self.get_embedding(text)
                    embeddings.append(emb)
                return embeddings
            except Exception as e:
                logger.warning(f"Gemini batch embed failed ({e}), falling back.")

        return [self._local_fallback_embed(t) for t in texts]


embedding_service = EmbeddingService()
