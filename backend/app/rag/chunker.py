from typing import List, Dict, Any
import re
from app.core.config import settings


class TextChunker:
    """Recursive token-aware chunker that preserves page boundaries and rich metadata."""

    def __init__(self, chunk_size: int = None, chunk_overlap: int = None):
        self.chunk_size = chunk_size or settings.CHUNK_SIZE
        self.chunk_overlap = chunk_overlap or settings.CHUNK_OVERLAP

    def estimate_tokens(self, text: str) -> int:
        """Simple, fast token approximation (~4 chars per token)."""
        return max(1, len(text) // 4)

    def split_text_into_chunks(self, text: str) -> List[str]:
        """Split a body of text recursively into chunks bounded by chunk_size and chunk_overlap."""
        if not text:
            return []

        # Target character limits based on token configuration
        max_chars = self.chunk_size * 4
        overlap_chars = self.chunk_overlap * 4

        if len(text) <= max_chars:
            return [text]

        # Splitting delimiters in order of structural priority
        separators = ["\n\n", "\n", ". ", "; ", ", ", " "]
        
        chunks = []
        start = 0
        text_len = len(text)

        while start < text_len:
            end = min(start + max_chars, text_len)
            
            if end < text_len:
                # Find best splitting point near end
                best_split = -1
                for sep in separators:
                    pos = text.rfind(sep, start + overlap_chars, end)
                    if pos != -1:
                        best_split = pos + len(sep)
                        break
                
                if best_split != -1 and best_split > start:
                    end = best_split

            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append(chunk_text)

            if end >= text_len:
                break

            # Advance start by keeping overlap
            start = max(end - overlap_chars, start + 1)

        return chunks

    def process_document_pages(
        self,
        pages_data: List[Dict[str, Any]],
        doc_metadata: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Processes all pages of a document and generates chunk records with complete metadata."""
        all_chunks = []
        global_chunk_index = 0

        for page in pages_data:
            page_num = page.get("page_number", 1)
            page_text = page.get("text", "")

            page_chunks = self.split_text_into_chunks(page_text)

            for c_text in page_chunks:
                chunk_record = {
                    "chunk_index": global_chunk_index,
                    "content": c_text,
                    "page_number": page_num,
                    "token_count": self.estimate_tokens(c_text),
                    "document_id": doc_metadata.get("document_id"),
                    "title": doc_metadata.get("title", ""),
                    "filename": doc_metadata.get("filename", ""),
                    "category": doc_metadata.get("category", "General"),
                    "department": doc_metadata.get("department", "All"),
                    "academic_year": doc_metadata.get("academic_year", "2026-27"),
                    "version": doc_metadata.get("version", "1.0"),
                }
                all_chunks.append(chunk_record)
                global_chunk_index += 1

        return all_chunks
