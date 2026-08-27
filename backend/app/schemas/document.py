from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DocumentResponse(BaseModel):
    id: int
    title: str
    filename: str
    category: str
    department: str
    academic_year: str
    version: str
    status: str
    error_message: Optional[str] = None
    chunk_count: int
    file_size: int
    uploaded_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None
    academic_year: Optional[str] = None
    version: Optional[str] = None


class ChunkResponse(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    content: str
    page_number: int
    token_count: int
    created_at: datetime

    class Config:
        from_attributes = True
