import os
import time
import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.rag.retriever import retriever
from app.rag.reranker import reranker
from app.rag.prompt import build_rag_prompt

logger = logging.getLogger(__name__)


class RAGPipeline:
    """End-to-End Retrieval-Augmented Generation Pipeline for CollegeRAG."""

    def __init__(self):
        self.retriever = retriever
        self.reranker = reranker
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.model_name = settings.GEMINI_MODEL
        self._genai_client = None
        self._init_llm()

    def _init_llm(self):
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai_client = genai.GenerativeModel(self.model_name)
                logger.info(f"Initialized Gemini GenerativeModel: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini GenerativeModel: {e}")
                self._genai_client = None

    def _generate_fallback_answer(self, question: str, chunks: List[Dict[str, Any]]) -> str:
        """Heuristic answer generator when Gemini API key is not configured."""
        if not chunks:
            return (
                "I couldn't find reliable information about this in the college knowledge base. "
                "Please contact the college administration or respective department office for official guidance."
            )

        top_chunk = chunks[0]
        text_snippet = top_chunk["content"][:400]
        doc_name = top_chunk.get("filename") or top_chunk.get("title", "Official Notice")
        page = top_chunk.get("page_number", 1)

        return (
            f"Based on the official college records ({doc_name}, Page {page}):\n\n"
            f"{text_snippet}...\n\n"
            f"*(For complete details, please refer to the cited official documents below).* "
        )

    async def generate_answer(
        self,
        question: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        filter_category: Optional[str] = None,
        filter_dept: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Runs full RAG pipeline: Query -> Hybrid Search -> Rerank -> Grounded LLM Generation -> Sources."""
        start_time = time.time()
        
        # 1. Retrieve Candidate Chunks (Hybrid BM25 + Qdrant Dense Vector)
        raw_chunks = self.retriever.retrieve(
            query=question,
            top_k=settings.TOP_K_RETRIEVAL * 2,
            filter_category=filter_category,
            filter_dept=filter_dept,
            hybrid=True,
        )

        # 2. Re-rank Candidates
        reranked_chunks = self.reranker.rerank(
            query=question,
            chunks=raw_chunks,
            top_n=settings.TOP_K_RETRIEVAL,
        )

        # 3. Check Confidence / Unknown Question Thresholding
        max_similarity = reranked_chunks[0]["relevance"] if reranked_chunks else 0.0
        is_unknown = max_similarity < settings.SIMILARITY_THRESHOLD or not reranked_chunks

        if is_unknown:
            latency = int((time.time() - start_time) * 1000)
            return {
                "answer": (
                    "I couldn't find reliable information about this in the college knowledge base. "
                    "Please contact the college administration or the respective department for the latest verified information."
                ),
                "sources": [],
                "confidence": round(max_similarity, 2),
                "is_unknown": True,
                "latency_ms": latency,
            }

        # 4. Extract Clean Sources for UI
        sources = []
        seen_sources = set()
        for c in reranked_chunks:
            source_key = f"{c.get('filename')}_{c.get('page_number')}"
            if source_key not in seen_sources:
                seen_sources.add(source_key)
                sources.append({
                    "document": c.get("filename") or c.get("title", "Official Notice"),
                    "title": c.get("title", ""),
                    "page": c.get("page_number", 1),
                    "category": c.get("category", "General"),
                    "department": c.get("department", "All"),
                    "relevance": c.get("relevance", 0.75),
                    "snippet": c.get("content", "")[:250] + "...",
                })

        # 5. LLM Prompt Construction
        prompt = build_rag_prompt(
            question=question,
            context_chunks=reranked_chunks,
            conversation_history=conversation_history,
        )

        # 6. LLM Generation via Google Gemini
        answer = ""
        if self._genai_client and self.api_key:
            try:
                response = self._genai_client.generate_content(prompt)
                if response and response.text:
                    answer = response.text.strip()
            except Exception as e:
                logger.error(f"Gemini generation error: {e}")
                answer = self._generate_fallback_answer(question, reranked_chunks)
        else:
            # Smart contextual fallback generator
            answer = self._generate_fallback_answer(question, reranked_chunks)

        latency = int((time.time() - start_time) * 1000)

        return {
            "answer": answer,
            "sources": sources,
            "confidence": round(max_similarity, 2),
            "is_unknown": False,
            "latency_ms": latency,
        }


rag_pipeline = RAGPipeline()
