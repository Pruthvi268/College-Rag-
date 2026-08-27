from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.message import Message
from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("", response_model=FeedbackResponse)
async def submit_feedback(
    payload: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Submit student feedback (rating: +1 / -1 and optional comment) for a chatbot response."""
    # Check if message exists
    res = await db.execute(select(Message).where(Message.id == payload.message_id))
    msg = res.scalars().first()
    if not msg:
        raise HTTPException(status_code=404, detail="Target message not found")

    # Check if feedback already exists for this message
    fb_res = await db.execute(select(Feedback).where(Feedback.message_id == payload.message_id))
    existing_fb = fb_res.scalars().first()

    if existing_fb:
        existing_fb.rating = payload.rating
        existing_fb.comment = payload.comment
        await db.commit()
        await db.refresh(existing_fb)
        return FeedbackResponse.model_validate(existing_fb)

    new_fb = Feedback(
        message_id=payload.message_id,
        user_id=current_user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(new_fb)
    await db.commit()
    await db.refresh(new_fb)
    return FeedbackResponse.model_validate(new_fb)
