from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class SourceReference(BaseModel):
    document: str
    title: Optional[str] = ""
    page: int = 1
    category: str = "General"
    department: str = "All"
    relevance: float = 0.8
    snippet: Optional[str] = ""


class ChatRequest(BaseModel):
    conversation_id: Optional[int] = Field(None, description="Existing conversation ID or null for new")
    question: str = Field(..., min_length=1, max_length=2000)
    category: Optional[str] = Field(None, description="Optional category filter (e.g. Admissions, Hostel)")
    department: Optional[str] = Field(None, description="Optional department filter")


class ChatResponse(BaseModel):
    conversation_id: int
    message_id: int
    question: str
    answer: str
    sources: List[SourceReference] = []
    confidence: float = 0.0
    latency_ms: int = 0
    is_unknown: bool = False


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    sources: List[SourceReference] = []
    confidence: Optional[float] = None
    latency_ms: Optional[int] = None
    created_at: datetime
    feedback_rating: Optional[int] = None

    class Config:
        from_attributes = True


class ConversationSummary(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    class Config:
        from_attributes = True


class ConversationDetail(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
