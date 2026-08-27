import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.api import auth, documents, chat, admin, feedback
from app.services.document_service import document_service

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


async def seed_initial_users():
    """Create default Admin and Student accounts if not already created."""
    async with AsyncSessionLocal() as session:
        # Check admin
        res = await session.execute(select(User).where(User.email == "admin@college.edu"))
        admin_user = res.scalars().first()
        if not admin_user:
            admin_user = User(
                name="College Administrator",
                email="admin@college.edu",
                password_hash=get_password_hash("Admin@123"),
                role="ADMIN",
            )
            session.add(admin_user)
            logger.info("Created default Admin account: admin@college.edu / Admin@123")

        # Check student
        res_stud = await session.execute(select(User).where(User.email == "student@college.edu"))
        student_user = res_stud.scalars().first()
        if not student_user:
            student_user = User(
                name="Alex Sharma",
                email="student@college.edu",
                password_hash=get_password_hash("Student@123"),
                role="STUDENT",
            )
            session.add(student_user)
            logger.info("Created default Student account: student@college.edu / Student@123")

        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to handle startup and shutdown."""
    logger.info(f"Starting {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode...")
    
    # 1. Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized.")

    # 2. Seed initial users
    await seed_initial_users()

    # 3. Refresh BM25 search index from existing chunks
    async with AsyncSessionLocal() as session:
        await document_service.refresh_bm25_index(session)

    yield

    logger.info(f"Shutting down {settings.PROJECT_NAME}...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise RAG-Based College Information Assistant Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
    }
