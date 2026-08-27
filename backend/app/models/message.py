from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    sources_json = Column(Text, nullable=True)  # JSON string of source citations
    confidence = Column(Float, nullable=True)  # 0.0 to 1.0
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    feedback = relationship("Feedback", back_populates="message", cascade="all, delete-orphan", uselist=False)
