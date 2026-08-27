import os
import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.models.user import User
from app.models.document import Document
from app.services.document_service import document_service
from app.main import seed_initial_users

SAMPLE_FILES = [
    {
        "filename": "MCA_Admission_Guidelines_2026.pdf",
        "title": "MCA Admission Guidelines 2026-27",
        "category": "Admissions",
        "department": "Computer Applications",
        "academic_year": "2026-27",
    },
    {
        "filename": "Hostel_Fee_Structure_2026.pdf",
        "title": "Campus Hostel Rules & Fee Structure 2026-27",
        "category": "Hostel",
        "department": "All",
        "academic_year": "2026-27",
    },
    {
        "filename": "Academic_Calendar_2026_27.pdf",
        "title": "Official Academic Calendar 2026-27",
        "category": "Academics",
        "department": "All",
        "academic_year": "2026-27",
    },
    {
        "filename": "Examination_Regulations_and_Grading_2026.pdf",
        "title": "Examination Regulations, 75% Attendance & Grading",
        "category": "Examinations",
        "department": "All",
        "academic_year": "2026-27",
    },
    {
        "filename": "Placement_Statistics_and_Policy_2026.pdf",
        "title": "Placement Policy & Statistics Report 2026",
        "category": "Placements",
        "department": "Placement Cell",
        "academic_year": "2026-27",
    },
]


async def ingest_samples():
    # 1. Initialize tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2. Ensure seed admin exists
    await seed_initial_users()

    async with AsyncSessionLocal() as session:
        # Get admin user ID
        res = await session.execute(select(User).where(User.email == "admin@college.edu"))
        admin = res.scalars().first()
        admin_id = admin.id if admin else 1

        for item in SAMPLE_FILES:
            src_path = os.path.join("sample_data", item["filename"])
            if not os.path.exists(src_path):
                src_path = os.path.join("..", "sample_data", item["filename"])
            if not os.path.exists(src_path):
                print(f"File not found: {src_path}")
                continue

            # Check if document is already ingested
            doc_res = await session.execute(select(Document).where(Document.filename == item["filename"]))
            existing_doc = doc_res.scalars().first()

            if existing_doc:
                print(f"Document already exists: {item['filename']} (Status: {existing_doc.status}, Chunks: {existing_doc.chunk_count})")
                continue

            print(f"Ingesting sample document: {item['filename']}...")
            # Copy file to uploads
            os.makedirs("uploads", exist_ok=True)
            dst_path = os.path.join("uploads", item["filename"])
            with open(src_path, "rb") as f_in, open(dst_path, "wb") as f_out:
                f_out.write(f_in.read())

            file_size = os.path.getsize(dst_path)

            doc = Document(
                title=item["title"],
                filename=item["filename"],
                file_path=dst_path,
                category=item["category"],
                department=item["department"],
                academic_year=item["academic_year"],
                version="1.0",
                status="UPLOADED",
                file_size=file_size,
                uploaded_by=admin_id,
            )
            session.add(doc)
            await session.commit()
            await session.refresh(doc)

            # Process extraction, chunking & Qdrant indexing
            await document_service.process_document_sync(doc.id, session)
            print(f"Successfully processed {item['filename']}: {doc.chunk_count} chunks indexed.")

    print("\nAll sample college documents successfully indexed into Qdrant & SQLite database!")


if __name__ == "__main__":
    asyncio.run(ingest_samples())
