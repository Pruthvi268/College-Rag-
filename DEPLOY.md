# Deployment Guide (Render + Vercel)

Please refer to the complete deployment guide in [DEPLOY.md](file:///c:/Users/pruth/OneDrive/Desktop/RAG%20AGNTI%20AI/DEPLOY.md).

### Quick Summary

#### 1. Push to GitHub:
```bash
git init
git add .
git commit -m "feat: complete CollegeRAG application"
git branch -M main
git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

#### 2. Backend (Render):
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt && python ingest_samples.py`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Env Vars**: `GEMINI_API_KEY`, `SECRET_KEY`, `ENVIRONMENT=production`, `CORS_ORIGINS=["*"]`

#### 3. Frontend (Vercel):
- **Root Directory**: `frontend`
- **Framework**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Env Var**: `VITE_API_URL=https://<YOUR_RENDER_BACKEND_URL>`

For full details, see [DEPLOY.md](file:///c:/Users/pruth/OneDrive/Desktop/RAG%20AGNTI%20AI/DEPLOY.md).
