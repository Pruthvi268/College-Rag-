# CollegeRAG — RAG-Based College Information Assistant 🎓🤖

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Qdrant](https://img.shields.io/badge/Qdrant_Vector_DB-DC2626?style=for-the-badge&logo=qdrant)](https://qdrant.tech)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Frontend_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://college-rag-gray.vercel.app/)
[![Render](https://img.shields.io/badge/Backend_Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://collegerag-backend-7lgx.onrender.com/)

> An enterprise-grade, full-stack AI college information system that allows students to ask questions in natural language and receive answers strictly grounded in official college circulars, notices, and handbooks with exact page citations and zero hallucination.

---

## 🌐 Live Deployments

- 🖥️ **Live Web Application (Vercel)**: [https://college-rag-gray.vercel.app/](https://college-rag-gray.vercel.app/)
- ⚙️ **Live Backend API (Render)**: [https://collegerag-backend-7lgx.onrender.com](https://collegerag-backend-7lgx.onrender.com)
- 📖 **Interactive Swagger Docs**: [https://collegerag-backend-7lgx.onrender.com/docs](https://collegerag-backend-7lgx.onrender.com/docs)

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Student** | `student@college.edu` | `Student@123` | Conversational Chat, Multi-turn Context, Source Citations, Feedback |
| **Admin** | `admin@college.edu` | `Admin@123` | Document Upload, Chunk Inspector, Analytics, Unanswered Knowledge Gaps |

*(You can also use the **1-Click Demo** buttons on the login screen for instant access).*

---

## 💡 Key Features

### 1. Hybrid Search & Retrieval (Dense + BM25)
- Combines **Qdrant Vector Database** (Dense Semantic Search) with **BM25 Lexical Keyword Search** using **Reciprocal Rank Fusion (RRF)**.
- Accurately captures both conceptual queries and exact college tokens (e.g. `MCA`, `₹85,000`, `Regulation 12`, `CET-2026`).

### 2. Zero-Hallucination Grounding with Page Citations
- Responses are generated strictly from retrieved official context using **Google Gemini**.
- Every response includes interactive **Source Reference Chips** displaying document name, exact page number, category, and verified excerpt snippet.

### 3. Unknown Question Fallback & Knowledge Gap Detection
- Implements similarity score thresholding (`< 30%`).
- Out-of-domain or unverified queries return an official fallback response without hallucination and are logged to the Admin Dashboard for administrative review.

### 4. Admin Knowledge Base Management
- Drag-and-drop upload for **PDF, DOCX, and TXT** documents.
- Automatic page-aware text extraction (**PyMuPDF**), cleaning, and recursive token chunking (500–800 tokens with overlap).
- Real-time processing status tracking (`UPLOADED` ➔ `PROCESSING` ➔ `COMPLETED` / `FAILED`).
- Chunk inspector modal to view raw vectors and token metadata.

### 5. Multi-Turn Conversation History
- Preserves context across follow-up questions within conversation sessions.
- Auto-generates intelligent conversation titles and provides chat history management.

---

## 🏛️ System Architecture

```
Student / Admin
      │
      ▼
React Frontend (Vite + Tailwind CSS + Lucide)
      │  REST API / JWT
      ▼
FastAPI Backend
      │
      ├── Authentication Service (JWT + bcrypt RBAC)
      ├── Document Ingestion Pipeline (PyMuPDF -> Recursive Chunker)
      ├── Vector & Hybrid Search Engine
      │     ├── Qdrant Vector Store (Cosine Similarity, 768-dim)
      │     └── BM25 Keyword Search (Reciprocal Rank Fusion)
      ├── LLM Reasoning & Prompt Grounding (Google Gemini 1.5)
      └── Database Storage (SQLAlchemy: SQLite / PostgreSQL)
```

---

## 📂 Repository Structure

```
College-Rag-/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI routers (auth, chat, documents, admin, feedback)
│   │   ├── core/         # Config, Database engine, JWT Security
│   │   ├── models/       # SQLAlchemy models (User, Document, Chunk, Message, Feedback)
│   │   ├── rag/          # Loader, Cleaner, Chunker, Embeddings, VectorStore, Retriever, Pipeline
│   │   ├── schemas/      # Pydantic v2 validation models
│   │   └── services/     # Business logic services
│   ├── uploads/          # Uploaded college documents
│   ├── Dockerfile        # Backend container configuration
│   ├── generate_sample_docs.py # Generator for official sample college PDFs
│   ├── ingest_samples.py # Pre-ingests sample knowledge into Qdrant & DB
│   ├── view_db.py        # CLI database table inspector
│   ├── requirements.txt  # Python backend dependencies
│   └── render.yaml       # Render cloud deployment blueprint
├── frontend/
│   ├── src/
│   │   ├── components/   # ChatWindow, ChatMessage, SourceModal, Sidebar, DocumentTable, etc.
│   │   ├── pages/        # Landing, Login, Register, Chat, AdminDashboard, NotFound
│   │   ├── services/     # Axios API client with JWT interceptors
│   │   └── store/        # Auth Context state
│   ├── vercel.json       # Vercel SPA routing configuration
│   └── package.json      # Frontend npm dependencies
├── sample_data/          # Official pre-generated college circulars (PDFs)
├── Dockerfile            # Root multi-stage Docker build
├── DEPLOY.md             # Complete Deployment Guide (Render + Vercel)
└── README.md             # Project documentation
```

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | SQLite / PostgreSQL via SQLAlchemy Async ORM |
| **Vector DB** | Qdrant Vector Database (`qdrant-client`) |
| **LLM & Embeddings** | Google Gemini (`gemini-1.5-flash` & `text-embedding-004`) |
| **Document Processing** | PyMuPDF (`fitz`), Python-docx, ReportLab |
| **Search Algorithm** | Dense Cosine Similarity + BM25 Okapi with Reciprocal Rank Fusion |
| **Authentication** | JWT (JSON Web Tokens) with bcrypt password hashing |
| **Deployment** | Frontend on **Vercel**, Backend on **Render**, Containerized via **Docker** |

---

## ⚡ Local Setup & Installation

### 1. Clone Repository
```bash
git clone https://github.com/Pruthvi268/College-Rag-.git
cd College-Rag-
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate     # On Windows
# source venv/bin/activate # On Linux/macOS

pip install -r requirements.txt
python generate_sample_docs.py
python ingest_samples.py
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

Open [http://127.0.0.1:5173/](http://127.0.0.1:5173/) in your browser.

---

## 🧪 Sample Questions to Test Grounding

1. **Admissions**: *"What is the eligibility criteria and seat matrix for MCA 2026?"*
2. **Administration Contact**: *"What is the principal's official phone number, email, and visiting hours?"*
3. **Hostel & Mess**: *"What are the hostel room rents and mess charges?"*
4. **Attendance Regulations**: *"Explain Regulation 12 regarding 75% mandatory attendance and condonation fee."*
5. **Placements**: *"What is the highest package and Dream Job eligibility policy?"*
6. **Zero-Hallucination Fallback**: *"What is the secret home address of the president?"* *(Demonstrates thresholding fallback).*

---

## 📜 License
This project is developed for educational and institutional college information management.
