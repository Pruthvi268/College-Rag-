import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.unanswered import UnansweredQuery
from app.rag.pipeline import rag_pipeline
from app.schemas.chat import ChatResponse, SourceReference

logger = logging.getLogger(__name__)


class ChatService:
    """Manages chat conversations, message persistence, RAG pipeline querying, and history."""

    @staticmethod
    async def process_chat(
        user_id: int,
        question: str,
        conversation_id: Optional[int],
        category: Optional[str],
        department: Optional[str],
        db: AsyncSession,
    ) -> ChatResponse:
        # 1. Retrieve or Create Conversation
        conversation = None
        if conversation_id:
            res = await db.execute(
                select(Conversation)
                .where(Conversation.id == conversation_id, Conversation.user_id == user_id)
                .options(selectinload(Conversation.messages))
            )
            conversation = res.scalars().first()

        if not conversation:
            # Generate a title from the first 5-6 words of the question
            words = question.strip().split()
            title = " ".join(words[:6]) + ("..." if len(words) > 6 else "")
            conversation = Conversation(
                user_id=user_id,
                title=title or "New Chat",
            )
            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)

        # 2. Fetch recent conversation context (last 6 messages)
        msg_query = (
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
            .limit(6)
        )
        msg_res = await db.execute(msg_query)
        recent_messages = list(reversed(msg_res.scalars().all()))

        history_context = [
            {"role": m.role, "content": m.content}
            for m in recent_messages
        ]

        # 3. Execute RAG Pipeline
        rag_result = await rag_pipeline.generate_answer(
            question=question,
            conversation_history=history_context,
            filter_category=category,
            filter_dept=department,
        )

        answer = rag_result["answer"]
        sources = rag_result["sources"]
        confidence = rag_result["confidence"]
        latency_ms = rag_result["latency_ms"]
        is_unknown = rag_result["is_unknown"]

        # 4. Save User Message
        user_msg = Message(
            conversation_id=conversation.id,
            role="user",
            content=question,
        )
        db.add(user_msg)

        # 5. Save Assistant Message with Citations & Confidence
        assistant_msg = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=answer,
            sources_json=json.dumps(sources),
            confidence=confidence,
            latency_ms=latency_ms,
        )
        db.add(assistant_msg)

        # 6. Log to Unanswered Queries table if unknown or low confidence
        if is_unknown or confidence < 0.30:
            unanswered_entry = UnansweredQuery(
                question=question,
                user_id=user_id,
                max_similarity=confidence,
                category=category or "General",
            )
            db.add(unanswered_entry)

        await db.commit()
        await db.refresh(assistant_msg)

        # Format sources for response
        formatted_sources = [
            SourceReference(
                document=s.get("document", ""),
                title=s.get("title", ""),
                page=s.get("page", 1),
                category=s.get("category", "General"),
                department=s.get("department", "All"),
                relevance=s.get("relevance", 0.8),
                snippet=s.get("snippet", ""),
            )
            for s in sources
        ]

        return ChatResponse(
            conversation_id=conversation.id,
            message_id=assistant_msg.id,
            question=question,
            answer=answer,
            sources=formatted_sources,
            confidence=confidence,
            latency_ms=latency_ms,
            is_unknown=is_unknown,
        )


chat_service = ChatService()
