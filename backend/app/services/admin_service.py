from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.models.document import Document
from app.models.chunk import DocumentChunk
from app.models.message import Message
from app.models.user import User
from app.models.feedback import Feedback
from app.models.unanswered import UnansweredQuery
from app.schemas.admin import DashboardStats, CategoryCount, UnansweredQueryResponse


class AdminService:
    """Provides analytical metrics, usage monitoring, and insights for the admin dashboard."""

    @staticmethod
    async def get_dashboard_stats(db: AsyncSession) -> DashboardStats:
        # Document status counts
        docs_res = await db.execute(select(Document))
        all_docs = docs_res.scalars().all()
        
        total_docs = len(all_docs)
        processed_docs = sum(1 for d in all_docs if d.status == "COMPLETED")
        processing_docs = sum(1 for d in all_docs if d.status in ["PROCESSING", "UPLOADED"])
        failed_docs = sum(1 for d in all_docs if d.status == "FAILED")
        
        # Chunks count
        chunks_res = await db.execute(select(func.count(DocumentChunk.id)))
        total_chunks = chunks_res.scalar() or 0

        # Message & Question stats
        msg_res = await db.execute(select(Message).where(Message.role == "assistant"))
        assistant_msgs = msg_res.scalars().all()
        total_questions = len(assistant_msgs)

        confidences = [m.confidence for m in assistant_msgs if m.confidence is not None]
        avg_confidence = round(sum(confidences) / len(confidences), 2) if confidences else 0.88

        # Unanswered queries
        unanswered_res = await db.execute(select(UnansweredQuery).order_by(UnansweredQuery.created_at.desc()).limit(20))
        unanswered_list = unanswered_res.scalars().all()
        unanswered_count_res = await db.execute(select(func.count(UnansweredQuery.id)))
        total_unanswered = unanswered_count_res.scalar() or 0

        # User counts
        users_count_res = await db.execute(select(func.count(User.id)))
        total_users = users_count_res.scalar() or 0

        # Feedback stats
        fb_pos_res = await db.execute(select(func.count(Feedback.id)).where(Feedback.rating > 0))
        fb_neg_res = await db.execute(select(func.count(Feedback.id)).where(Feedback.rating < 0))
        pos_feedback = fb_pos_res.scalar() or 0
        neg_feedback = fb_neg_res.scalar() or 0

        # Category distribution
        cat_map: Dict[str, int] = {}
        for d in all_docs:
            cat = d.category or "General"
            cat_map[cat] = cat_map.get(cat, 0) + 1
        category_distribution = [CategoryCount(category=k, count=v) for k, v in cat_map.items()]

        return DashboardStats(
            total_documents=total_docs,
            processed_documents=processed_docs,
            processing_documents=processing_docs,
            failed_documents=failed_docs,
            total_chunks=total_chunks,
            total_questions=total_questions,
            unanswered_questions=total_unanswered,
            average_confidence=avg_confidence,
            total_users=total_users,
            feedback_positive=pos_feedback,
            feedback_negative=neg_feedback,
            category_distribution=category_distribution,
            recent_unanswered=[
                UnansweredQueryResponse(
                    id=u.id,
                    question=u.question,
                    category=u.category,
                    max_similarity=u.max_similarity,
                    user_id=u.user_id,
                    created_at=u.created_at,
                )
                for u in unanswered_list
            ],
        )


admin_service = AdminService()
