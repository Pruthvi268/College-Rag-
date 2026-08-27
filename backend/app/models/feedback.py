from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False, unique=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1: helpful / thumbs up, -1: unhelpful / thumbs down
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    message = relationship("Message", back_populates="feedback")
    user = relationship("User", back_populates="feedback")
