# 🚀 CollegeRAG Deployment Guide

Complete step-by-step instructions to push **CollegeRAG** to **GitHub**, deploy the **FastAPI Backend on Render**, and deploy the **React Frontend on Vercel**.

---

## 📑 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Step 1: Push Code to GitHub](#step-1-push-code-to-github)
3. [Step 2: Deploy Backend to Render](#step-2-deploy-backend-to-render)
4. [Step 3: Deploy Frontend to Vercel](#step-3-deploy-frontend-to-vercel)
5. [Step 4: Verification & Testing Checklist](#step-4-verification--testing-checklist)
6. [Troubleshooting & Common Issues](#troubleshooting--common-issues)

---

## 1. Prerequisites

Before starting, ensure you have:
- A free [GitHub Account](https://github.com/)
- A free [Render Account](https://render.com/)
- A free [Vercel Account](https://vercel.com/)
- *(Optional)* A [Google Gemini API Key](https://aistudio.google.com/) for online LLM generation.

---

## Step 1: Push Code to GitHub

Open **PowerShell** or **Command Prompt** in the project root (`c:\Users\pruth\OneDrive\Desktop\RAG AGNTI AI\`):

### 1.1. Check Git Status
```powershell
git status
```
*(Verify that `.env`, `collegerag.db`, and `node_modules` are ignored by `.gitignore`).*

### 1.2. Add & Commit Files
```powershell
git add .
git commit -m "feat: complete CollegeRAG system ready for Render and Vercel deployment"
```

### 1.3. Create a Remote Repository & Push
1. Open [GitHub New Repository](https://github.com/new).
2. Set repository name to: **`CollegeRAG`** (or `collegerag-assistant`).
3. Set to **Public** or **Private**.
4. Leave *"Add a README file"* **unchecked**.
5. Click **Create repository**.
6. Run the following commands in your terminal (replace `YOUR_USERNAME` with your GitHub username):

```powershell
# Set default branch name to main
git branch -M main

# Link your local repository to GitHub
git remote add origin https://github.com/YOUR_USERNAME/CollegeRAG.git

# Push your code
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1. Create a New Web Service
1. Log in to the [Render Dashboard](https://dashboard.render.com/).
2. Click the blue **New +** button at top right -> Select **Web Service**.
3. Under *Connect a repository*, choose your **`CollegeRAG`** GitHub repository.

### 2.2. Configure Service Settings

| Setting | Value | Notes |
|---|---|---|
| **Name** | `collegerag-backend` | *(or any name you prefer)* |
| **Region** | `Singapore` or `Oregon` | Choose region closest to you |
| **Branch** | `main` | Default branch |
| **Root Directory** | `backend` | **Important:** Must be set to `backend` |
| **Runtime** | `Python 3` | Python runtime |
| **Build Command** | `pip install -r requirements.txt && python ingest_samples.py` | Installs dependencies & pre-indexes sample documents |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` | Starts the FastAPI server |
| **Instance Type** | `Free` | Free tier |

---

### 2.3. Add Environment Variables on Render
Scroll down to **Environment Variables** and click **Add Environment Variable** for each:

| Key | Value | Description |
|---|---|---|
| `PYTHON_VERSION` | `3.11.9` | Recommended Python version |
| `ENVIRONMENT` | `production` | Production mode |
| `SECRET_KEY` | *(Click Generate or type a random string)* | JWT signing secret |
| `GEMINI_API_KEY` | `AIzaSy...` *(Your Gemini API key)* | Google Gemini LLM & Embeddings |
| `GEMINI_MODEL` | `gemini-1.5-flash` | LLM model |
| `GEMINI_EMBEDDING_MODEL` | `models/text-embedding-004` | Embeddings model |
| `CORS_ORIGINS` | `["*"]` | Allows requests from your Vercel frontend |
| `DATABASE_URL` | `sqlite+aiosqlite:///./collegerag.db` | Default SQLite storage *(or PostgreSQL)* |

---

### 2.4. Deploy & Get Backend URL
1. Click **Create Web Service** (at the bottom).
2. Wait 2–3 minutes for the build and sample ingestion to complete.
3. Once live, Render displays your Backend URL at the top left, e.g.:
   ```
   https://collegerag-backend.onrender.com
   ```
4. Verify backend is active:
   - Visit: `https://collegerag-backend.onrender.com/api/health`
   - Expected Output: `{"status": "healthy", "environment": "production"}`
   - Interactive Swagger Docs: `https://collegerag-backend.onrender.com/docs`

---

## Step 3: Deploy Frontend to Vercel

### 3.1. Import Project to Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> Select **Project**.
3. Find your **`CollegeRAG`** GitHub repository and click **Import**.

### 3.2. Configure Build Settings

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | Click *Edit* -> select **`frontend`** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

---

### 3.3. Add Environment Variable
Under **Environment Variables**, add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://collegerag-backend.onrender.com` *(your Render backend URL from Step 2)* |

> [!WARNING]
> Do NOT add a trailing slash `/` or `/api` to `VITE_API_URL`.  
> Example: `https://collegerag-backend.onrender.com`

---

### 3.4. Deploy Frontend
1. Click **Deploy**.
2. Vercel will build and deploy your React application in ~30 seconds.
3. Your live frontend domain will be ready, e.g.:
   ```
   https://collegerag.vercel.app
   ```

---

## Step 4: Verification & Testing Checklist

Once both Render and Vercel are deployed:

1. **Open Live App**: Visit `https://your-collegerag-app.vercel.app`.
2. **Test 1-Click Demo Logins**:
   - Click **`Launch Student Assistant (1-Click Demo)`**
   - Or sign in manually with:
     - Student: `student@college.edu` / `Student@123`
     - Admin: `admin@college.edu` / `Admin@123`
3. **Ask Student Questions**:
   - *"What is the eligibility criteria and fees for MCA admission?"* -> Verify accurate grounded answer with citations.
   - *"What is the principal's office phone number and email?"* -> Verify Principal directory citations (`Principal_Office_and_Administration_Directory_2026.pdf`).
   - *"What is the hostel fee and mess charges?"* -> Verify hostel citations.
4. **Test Unknown Query Fallback**:
   - *"What is the secret home address of the president of France?"* -> Verify the grounded fallback message without hallucination.
5. **Admin Portal**:
   - Log in as Admin -> Navigate to `/admin`.
   - View Analytics metrics, Document Manager, Chunk Inspector, and Knowledge Gaps log.

---

## 🛠️ Troubleshooting & Common Issues

- **Render Free Tier Spin-Down**: Free instances on Render spin down after 15 minutes of inactivity. The first request after spin-down may take ~30–45 seconds to wake up.
- **CORS Error in Browser**: Make sure `CORS_ORIGINS` on Render is set to `["*"]` or includes your Vercel URL `["https://your-app.vercel.app"]`.
- **404 on Page Refresh on Vercel**: The included `frontend/vercel.json` automatically rewrites all single-page React routes (`/chat`, `/admin`, `/login`) to `index.html`.
- **Document Reprocessing**: You can upload new college circulars anytime via the Admin Dashboard (`/admin`), and they will be automatically chunked and indexed into the Qdrant vector database.
