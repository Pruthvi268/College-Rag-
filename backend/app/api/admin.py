from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import User
from app.models.unanswered import UnansweredQuery
from app.schemas.admin import DashboardStats, UnansweredQueryResponse
from app.services.admin_service import admin_service

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_metrics(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve high-level system usage, documents status, chunk counts, and performance metrics."""
    return await admin_service.get_dashboard_stats(db)


@router.get("/unanswered", response_model=List[UnansweredQueryResponse])
async def get_unanswered_questions(
    current_admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve recent queries that had low retrieval confidence or triggered fallback."""
    res = await db.execute(select(UnansweredQuery).order_by(UnansweredQuery.created_at.desc()).limit(100))
    records = res.scalars().all()
    return [UnansweredQueryResponse.model_validate(r) for r in records]
