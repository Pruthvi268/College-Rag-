import re
import logging
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
from app.core.config import settings
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store

logger = logging.getLogger(__name__)


def tokenize_corpus(text: str) -> List[str]:
    """Tokenize text into lower-cased alphanumeric words."""
    return re.findall(r"\w+", text.lower())


class HybridRetriever:
    """Combines Dense Vector Search (Qdrant) and Lexical Search (BM25) using Reciprocal Rank Fusion."""

    def __init__(self):
        self.vector_store = vector_store
        self.embedding_service = embedding_service
        self._bm25_index = None
        self._bm25_corpus: List[Dict[str, Any]] = []

    def update_bm25_corpus(self, chunks: List[Dict[str, Any]]):
        """Update the in-memory BM25 index with current chunks from database/vector store."""
        if not chunks:
            self._bm25_index = None
            self._bm25_corpus = []
            return

        self._bm25_corpus = chunks
        tokenized_corpus = [tokenize_corpus(c["content"]) for c in chunks]
        self._bm25_index = BM25Okapi(tokenized_corpus)
        logger.info(f"Updated BM25 index with {len(chunks)} chunks")

    def _bm25_search(
        self,
        query: str,
        limit: int = 10,
        filter_category: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Search BM25 keyword index."""
        if not self._bm25_index or not self._bm25_corpus:
            return []

        tokenized_query = tokenize_corpus(query)
        if not tokenized_query:
            return []

        scores = self._bm25_index.get_scores(tokenized_query)
        
        # Pair with chunks
        scored_results = []
        for i, score in enumerate(scores):
            chunk = self._bm25_corpus[i]
            if filter_category and filter_category.lower() not in ["all", "general"]:
                if chunk.get("category", "").lower() != filter_category.lower():
                    continue
            if score > 0:
                scored_results.append({
                    "chunk": chunk,
                    "bm25_score": float(score)
                })

        scored_results.sort(key=lambda x: x["bm25_score"], reverse=True)
        top_results = scored_results[:limit]

        # Normalize score
        max_s = top_results[0]["bm25_score"] if top_results else 1.0
        normalized = []
        for item in top_results:
            c = dict(item["chunk"])
            c["score"] = min(1.0, item["bm25_score"] / max(max_s, 1e-5))
            c["match_type"] = "keyword"
            normalized.append(c)
        return normalized

    def retrieve(
        self,
        query: str,
        top_k: int = None,
        filter_category: Optional[str] = None,
        filter_dept: Optional[str] = None,
        hybrid: bool = True,
    ) -> List[Dict[str, Any]]:
        """Hybrid retrieval combining dense vector similarity and BM25 keyword rank."""
        top_k = top_k or settings.TOP_K_RETRIEVAL

        # 1. Dense Semantic Search
        query_vector = self.embedding_service.get_embedding(query)
        dense_results = self.vector_store.search(
            query_vector=query_vector,
            limit=top_k * 2,
            score_threshold=0.0,
            filter_category=filter_category,
            filter_dept=filter_dept,
        )

        for res in dense_results:
            res["match_type"] = "semantic"

        if not hybrid or not self._bm25_index:
            return dense_results[:top_k]

        # 2. Sparse BM25 Keyword Search
        bm25_results = self._bm25_search(
            query=query,
            limit=top_k * 2,
            filter_category=filter_category
        )

        # 3. Reciprocal Rank Fusion (RRF)
        # RRF formula: Score(d) = sum(1 / (k + rank_i(d)))
        k_const = 60
        rrf_scores = {}
        chunks_map = {}

        # Dense ranking
        for rank, item in enumerate(dense_results):
            key = f"{item['document_id']}_{item.get('page_number', 1)}_{hash(item['content'][:50])}"
            chunks_map[key] = item
            rrf_scores[key] = rrf_scores.get(key, 0.0) + (0.6 * (1.0 / (k_const + rank + 1)))

        # BM25 ranking
        for rank, item in enumerate(bm25_results):
            key = f"{item['document_id']}_{item.get('page_number', 1)}_{hash(item['content'][:50])}"
            if key not in chunks_map:
                chunks_map[key] = item
            rrf_scores[key] = rrf_scores.get(key, 0.0) + (0.4 * (1.0 / (k_const + rank + 1)))

        # Sort combined results by RRF score
        sorted_keys = sorted(rrf_scores.keys(), key=lambda k: rrf_scores[k], reverse=True)

        final_chunks = []
        for key in sorted_keys[:top_k]:
            chunk_data = chunks_map[key]
            # Blend original cosine score or calibrated confidence
            original_score = chunk_data.get("score", 0.5)
            # Combine RRF bonus
            chunk_data["relevance"] = round(min(0.99, max(0.20, original_score)), 2)
            final_chunks.append(chunk_data)

        return final_chunks


retriever = HybridRetriever()
