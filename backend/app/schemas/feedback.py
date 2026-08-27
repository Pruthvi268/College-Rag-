from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FeedbackCreate(BaseModel):
    message_id: int
    rating: int = Field(..., description="1 for thumbs up, -1 for thumbs down")
    comment: Optional[str] = Field(None, max_length=1000)


class FeedbackResponse(BaseModel):
    id: int
    message_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
