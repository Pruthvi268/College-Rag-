import os
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_admin, get_current_user
from app.models.user import User
from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.schemas.document import DocumentResponse, DocumentUpdate, ChunkResponse
from app.services.document_service import document_service

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    category: Optional[str] = Form("General"),
    department: Optional[str] = Form("All"),
    academic_year: Optional[str] = Form("2026-27"),
    version: Optional[str] = Form("1.0"),
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new PDF, DOCX, or TXT document and process it for vector search (Admin only)."""
    # Validate extension
    allowed_exts = [".pdf", ".docx", ".doc", ".txt", ".md"]
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format: {ext}. Allowed: PDF, DOCX, TXT",
        )

    doc = await document_service.upload_document(
        file=file,
        title=title or (file.filename or "Document").rsplit(".", 1)[0],
        category=category or "General",
        department=department or "All",
        academic_year=academic_year or "2026-27",
        version=version or "1.0",
        user_id=current_admin.id,
        db=db,
    )
    return DocumentResponse.model_validate(doc)


@router.get("", response_model=List[DocumentResponse])
async def list_documents(
    category: Optional[str] = None,
    department: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all documents in the knowledge base."""
    stmt = select(Document).order_by(Document.created_at.desc())
    if category and category.lower() != "all":
        stmt = stmt.where(Document.category == category)
    if department and department.lower() != "all":
        stmt = stmt.where(Document.department == department)

    res = await db.execute(stmt)
    docs = res.scalars().all()
    return [DocumentResponse.model_validate(d) for d in docs]


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get single document details."""
    res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentResponse.model_validate(doc)


@router.get("/{doc_id}/chunks", response_model=List[ChunkResponse])
async def get_document_chunks(
    doc_id: int,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Inspect chunks extracted from a document (Admin only)."""
    res = await db.execute(
        select(DocumentChunk)
        .where(DocumentChunk.document_id == doc_id)
        .order_by(DocumentChunk.chunk_index.asc())
    )
    chunks = res.scalars().all()
    return [ChunkResponse.model_validate(c) for c in chunks]


@router.put("/{doc_id}", response_model=DocumentResponse)
async def update_document_metadata(
    doc_id: int,
    payload: DocumentUpdate,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update document metadata fields (Admin only)."""
    res = await db.execute(select(Document).where(Document.id == doc_id))
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if payload.title is not None:
        doc.title = payload.title
    if payload.category is not None:
        doc.category = payload.category
    if payload.department is not None:
        doc.department = payload.department
    if payload.academic_year is not None:
        doc.academic_year = payload.academic_year
    if payload.version is not None:
        doc.version = payload.version

    await db.commit()
    await db.refresh(doc)
    return DocumentResponse.model_validate(doc)


@router.post("/{doc_id}/reprocess", response_model=DocumentResponse)
async def reprocess_document(
    doc_id: int,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Trigger re-extraction, re-chunking, and re-indexing for a document (Admin only)."""
    doc = await document_service.process_document_sync(doc_id, db)
    return DocumentResponse.model_validate(doc)


@router.delete("/{doc_id}")
async def delete_document(
    doc_id: int,
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete document, its disk file, chunks, and Qdrant vectors (Admin only)."""
    await document_service.delete_document(doc_id, db)
    return {"message": f"Document {doc_id} and associated vectors successfully deleted"}
