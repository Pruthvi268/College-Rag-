from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class UnansweredQuery(Base):
    __tablename__ = "unanswered_queries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    question = Column(Text, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    max_similarity = Column(Float, default=0.0, nullable=False)
    category = Column(String(100), default="General", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User")
