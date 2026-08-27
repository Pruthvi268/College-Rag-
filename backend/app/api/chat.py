import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ConversationSummary,
    ConversationDetail,
    MessageResponse,
    SourceReference,
)
from app.services.chat_service import chat_service

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
async def ask_question(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Process a student natural language query through the RAG pipeline."""
    response = await chat_service.process_chat(
        user_id=current_user.id,
        question=payload.question,
        conversation_id=payload.conversation_id,
        category=payload.category,
        department=payload.department,
        db=db,
    )
    return response


@router.get("/conversations", response_model=List[ConversationSummary])
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all conversation sessions for the current user."""
    # Subquery for message count
    msg_counts = (
        select(Message.conversation_id, func.count(Message.id).label("cnt"))
        .group_by(Message.conversation_id)
        .subquery()
    )

    query = (
        select(Conversation, func.coalesce(msg_counts.c.cnt, 0))
        .outerjoin(msg_counts, Conversation.id == msg_counts.c.conversation_id)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )

    res = await db.execute(query)
    rows = res.all()

    summaries = []
    for conv, count in rows:
        summaries.append(
            ConversationSummary(
                id=conv.id,
                title=conv.title,
                created_at=conv.created_at,
                updated_at=conv.updated_at,
                message_count=count,
            )
        )
    return summaries


@router.get("/conversations/{conv_id}", response_model=ConversationDetail)
async def get_conversation(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get complete conversation history with messages and sources."""
    res = await db.execute(
        select(Conversation).where(
            Conversation.id == conv_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    msg_res = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at.asc())
    )
    messages = msg_res.scalars().all()

    formatted_msgs = []
    for m in messages:
        sources_list = []
        if m.sources_json:
            try:
                raw_s = json.loads(m.sources_json)
                sources_list = [SourceReference(**s) for s in raw_s]
            except Exception:
                sources_list = []

        rating = m.feedback.rating if m.feedback else None

        formatted_msgs.append(
            MessageResponse(
                id=m.id,
                conversation_id=m.conversation_id,
                role=m.role,
                content=m.content,
                sources=sources_list,
                confidence=m.confidence,
                latency_ms=m.latency_ms,
                created_at=m.created_at,
                feedback_rating=rating,
            )
        )

    return ConversationDetail(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=formatted_msgs,
    )


@router.delete("/conversations/{conv_id}")
async def delete_conversation(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversation and all its messages."""
    res = await db.execute(
        select(Conversation).where(
            Conversation.id == conv_id,
            Conversation.user_id == current_user.id,
        )
    )
    conv = res.scalars().first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await db.delete(conv)
    await db.commit()
    return {"message": "Conversation successfully deleted"}
