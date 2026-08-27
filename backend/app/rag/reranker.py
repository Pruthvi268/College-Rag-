import re
from typing import List, Dict, Any


class RelevanceReranker:
    """Reranks retrieved candidate chunks based on query term coverage and context density."""

    @staticmethod
    def rerank(query: str, chunks: List[Dict[str, Any]], top_n: int = 5) -> List[Dict[str, Any]]:
        if not chunks:
            return []

        query_terms = set(re.findall(r"\w+", query.lower()))
        
        scored_chunks = []
        for chunk in chunks:
            content = chunk.get("content", "").lower()
            term_matches = sum(1 for term in query_terms if term in content)
            term_ratio = term_matches / max(len(query_terms), 1)

            base_relevance = chunk.get("relevance", chunk.get("score", 0.5))
            
            # Combine semantic similarity and exact term density
            final_score = (0.7 * base_relevance) + (0.3 * term_ratio)
            
            updated_chunk = dict(chunk)
            updated_chunk["relevance"] = round(min(0.99, max(0.10, final_score)), 2)
            scored_chunks.append(updated_chunk)

        scored_chunks.sort(key=lambda x: x["relevance"], reverse=True)
        return scored_chunks[:top_n]


reranker = RelevanceReranker()
