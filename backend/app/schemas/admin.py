from datetime import datetime
from typing import List, Optional, Dict
from pydantic import BaseModel


class CategoryCount(BaseModel):
    category: str
    count: int


class UnansweredQueryResponse(BaseModel):
    id: int
    question: str
    category: str
    max_similarity: float
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_documents: int
    processed_documents: int
    processing_documents: int
    failed_documents: int
    total_chunks: int
    total_questions: int
    unanswered_questions: int
    average_confidence: float
    total_users: int
    feedback_positive: int
    feedback_negative: int
    category_distribution: List[CategoryCount]
    recent_unanswered: List[UnansweredQueryResponse]
