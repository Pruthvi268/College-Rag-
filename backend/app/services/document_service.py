import os
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.core.config import settings
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.rag.loader import DocumentLoader
from app.rag.cleaner import TextCleaner
from app.rag.chunker import TextChunker
from app.rag.embeddings import embedding_service
from app.rag.vector_store import vector_store
from app.rag.retriever import retriever

logger = logging.getLogger(__name__)


class DocumentService:
    """Handles document upload, parsing, chunking, vector indexing, and lifecycle."""

    @staticmethod
    async def process_document_sync(doc_id: int, db: AsyncSession) -> Document:
        """Execute text extraction, chunking, embedding, and vector upsert for a document."""
        # 1. Fetch document record
        result = await db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        try:
            doc.status = "PROCESSING"
            await db.commit()

            # 2. Extract text page by page
            pages_data = DocumentLoader.load_file(doc.file_path)
            if not pages_data:
                raise ValueError("No text content could be extracted from the document.")

            # 3. Clean text on all pages
            for p in pages_data:
                p["text"] = TextCleaner.clean(p["text"])

            # 4. Chunk text with page preservation
            chunker = TextChunker(chunk_size=settings.CHUNK_SIZE, chunk_overlap=settings.CHUNK_OVERLAP)
            chunks_data = chunker.process_document_pages(
                pages_data=pages_data,
                doc_metadata={
                    "document_id": doc.id,
                    "title": doc.title,
                    "filename": doc.filename,
                    "category": doc.category,
                    "department": doc.department,
                    "academic_year": doc.academic_year,
                    "version": doc.version,
                }
            )

            if not chunks_data:
                raise ValueError("Document yielded 0 valid chunks after processing.")

            # 5. Generate Vector Embeddings
            chunk_texts = [c["content"] for c in chunks_data]
            embeddings = embedding_service.get_embeddings_batch(chunk_texts)

            # 6. Upsert into Qdrant Vector Store
            point_ids = vector_store.upsert_chunks(chunks_data, embeddings)

            # 7. Delete previous chunks in SQL if reprocessing
            await db.execute(delete(DocumentChunk).where(DocumentChunk.document_id == doc.id))

            # 8. Save chunks in relational database
            for i, c in enumerate(chunks_data):
                point_id = point_ids[i] if i < len(point_ids) else None
                chunk_obj = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=c["chunk_index"],
                    content=c["content"],
                    page_number=c["page_number"],
                    token_count=c["token_count"],
                    metadata_json=json.dumps({
                        "category": c["category"],
                        "department": c["department"],
                        "academic_year": c["academic_year"],
                        "version": c["version"],
                    }),
                    qdrant_point_id=point_id,
                )
                db.add(chunk_obj)

            doc.status = "COMPLETED"
            doc.chunk_count = len(chunks_data)
            doc.error_message = None
            await db.commit()
            await db.refresh(doc)

            # 9. Refresh BM25 index in retriever
            await DocumentService.refresh_bm25_index(db)
            return doc

        except Exception as e:
            logger.error(f"Error processing document {doc.id}: {e}", exc_info=True)
            doc.status = "FAILED"
            doc.error_message = str(e)
            await db.commit()
            await db.refresh(doc)
            return doc

    @staticmethod
    async def upload_document(
        file: UploadFile,
        title: str,
        category: str,
        department: str,
        academic_year: str,
        version: str,
        user_id: int,
        db: AsyncSession,
    ) -> Document:
        """Save uploaded file and trigger processing."""
        # Sanitize filename
        safe_filename = os.path.basename(file.filename or "document.pdf").replace(" ", "_")
        target_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

        # Handle duplicate filename
        counter = 1
        name_part, ext_part = os.path.splitext(safe_filename)
        while os.path.exists(target_path):
            safe_filename = f"{name_part}_{counter}{ext_part}"
            target_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
            counter += 1

        # Write file content to disk
        contents = await file.read()
        file_size = len(contents)
        with open(target_path, "wb") as f:
            f.write(contents)

        # Create database record
        doc = Document(
            title=title or name_part.replace("_", " "),
            filename=safe_filename,
            file_path=target_path,
            category=category or "General",
            department=department or "All",
            academic_year=academic_year or "2026-27",
            version=version or "1.0",
            status="UPLOADED",
            file_size=file_size,
            uploaded_by=user_id,
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)

        # Process immediately
        processed_doc = await DocumentService.process_document_sync(doc.id, db)
        return processed_doc

    @staticmethod
    async def delete_document(doc_id: int, db: AsyncSession) -> bool:
        """Delete document from database, remove file from storage, and delete Qdrant vectors."""
        result = await db.execute(select(Document).where(Document.id == doc_id))
        doc = result.scalars().first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # 1. Delete vectors from Qdrant
        vector_store.delete_document_vectors(doc_id)

        # 2. Delete file from disk
        if os.path.exists(doc.file_path):
            try:
                os.remove(doc.file_path)
            except Exception as e:
                logger.warning(f"Could not remove file {doc.file_path}: {e}")

        # 3. Delete from DB (cascade deletes chunks)
        await db.delete(doc)
        await db.commit()

        # 4. Refresh BM25
        await DocumentService.refresh_bm25_index(db)
        return True

    @staticmethod
    async def refresh_bm25_index(db: AsyncSession):
        """Fetch all chunks from DB and update the hybrid BM25 index."""
        result = await db.execute(select(DocumentChunk, Document).join(Document, DocumentChunk.document_id == Document.id))
        rows = result.all()
        
        all_chunks = []
        for chunk, doc in rows:
            all_chunks.append({
                "document_id": chunk.document_id,
                "chunk_index": chunk.chunk_index,
                "content": chunk.content,
                "page_number": chunk.page_number,
                "title": doc.title,
                "filename": doc.filename,
                "category": doc.category,
                "department": doc.department,
            })
        retriever.update_bm25_corpus(all_chunks)


document_service = DocumentService()
