import os
from typing import List, Dict, Any
import pymupdf as fitz
import docx


class DocumentLoader:
    """Extracts text and metadata page-by-page or section-by-section from PDF, DOCX, and TXT files."""

    @staticmethod
    def load_pdf(file_path: str) -> List[Dict[str, Any]]:
        """Extract text from a PDF file preserving page numbers and formatting."""
        pages_data = []
        doc = fitz.open(file_path)
        try:
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")
                if text and text.strip():
                    pages_data.append({
                        "page_number": page_num + 1,
                        "text": text.strip(),
                        "total_pages": len(doc),
                    })
        finally:
            doc.close()
        return pages_data

    @staticmethod
    def load_docx(file_path: str) -> List[Dict[str, Any]]:
        """Extract text from a DOCX file."""
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text and para.text.strip():
                full_text.append(para.text.strip())
        
        text_content = "\n\n".join(full_text)
        return [{
            "page_number": 1,
            "text": text_content,
            "total_pages": 1,
        }]

    @staticmethod
    def load_txt(file_path: str) -> List[Dict[str, Any]]:
        """Extract text from a plain TXT file."""
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        return [{
            "page_number": 1,
            "text": content.strip(),
            "total_pages": 1,
        }]

    @classmethod
    def load_file(cls, file_path: str) -> List[Dict[str, Any]]:
        """Route to appropriate extractor based on file extension."""
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return cls.load_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return cls.load_docx(file_path)
        elif ext in [".txt", ".md", ".csv"]:
            return cls.load_txt(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}. Supported formats: PDF, DOCX, TXT")
