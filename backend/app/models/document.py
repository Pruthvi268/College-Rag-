from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    category = Column(String(100), default="General", nullable=False)  # Admissions, Academics, Fees, Exams, Hostel, etc.
    department = Column(String(100), default="All", nullable=False)
    academic_year = Column(String(50), default="2026-27", nullable=False)
    version = Column(String(20), default="1.0", nullable=False)
    status = Column(String(50), default="UPLOADED", nullable=False)  # UPLOADED, PROCESSING, COMPLETED, FAILED
    error_message = Column(Text, nullable=True)
    chunk_count = Column(Integer, default=0, nullable=False)
    file_size = Column(Integer, default=0, nullable=False)
    
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    uploader = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
