from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new student or administrator."""
    # Check if email already exists
    res = await db.execute(select(User).where(User.email == payload.email.lower()))
    existing = res.scalars().first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    # Enforce valid role
    role = payload.role.upper() if payload.role else "STUDENT"
    if role not in ["ADMIN", "STUDENT"]:
        role = "STUDENT"

    hashed_pw = get_password_hash(payload.password)
    user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=hashed_pw,
        role=role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Log in and retrieve JWT bearer token."""
    res = await db.execute(select(User).where(User.email == payload.email.lower().strip()))
    user = res.scalars().first()
    
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(subject=user.id, role=user.role)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently logged in user."""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout():
    """Client-side token invalidation confirmation."""
    return {"message": "Successfully logged out"}
