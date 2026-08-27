from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, default=1, nullable=False)
    token_count = Column(Integer, default=0, nullable=False)
    metadata_json = Column(Text, nullable=True)  # Store JSON string of metadata
    qdrant_point_id = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    document = relationship("Document", back_populates="chunks")
