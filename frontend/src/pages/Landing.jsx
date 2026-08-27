import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import {
  GraduationCap,
  Sparkles,
  Search,
  FileCheck2,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';

const Landing = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (role) => {
    try {
      if (role === 'admin') {
        await login('admin@college.edu', 'Admin@123');
        navigate('/admin');
      } else {
        await login('student@college.edu', 'Student@123');
        navigate('/chat');
      }
    } catch (err) {
      console.error('Quick login failed', err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -top-40 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 relative z-10 flex-1 flex flex-col justify-center">
        {/* Top Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-inner">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Campus Intelligence & RAG Retrieval Engine</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            AI-Powered Knowledge Assistant Grounded in{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Verified College Data
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate conflicting rumors and fragmented PDFs. Instant, hallucination-free answers on admissions, hostel fees, academic calendars, and placement policies with exact page citations.
          </p>
        </div>

        {/* 1-Click Evaluation CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleQuickLogin('student')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Launch Student Assistant (1-Click Demo)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleQuickLogin('admin')}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 text-gray-200 font-semibold text-sm shadow-lg transition-all hover:scale-105"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Admin Knowledge Portal (Demo)</span>
          </button>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-3 hover:border-blue-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Hybrid Retrieval Engine</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Combines Qdrant dense semantic vector embeddings with BM25 keyword matching (Reciprocal Rank Fusion) to capture both semantic queries and exact tokens like ₹85,000 or Regulation 12.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-3 hover:border-purple-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Zero-Hallucination Grounding</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Answers strictly using approved college notices. If an answer cannot be verified with sufficient similarity confidence, the system falls back gracefully and alerts administrators.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800/80 backdrop-blur-md space-y-3 hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interactive Page Citations</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every fact displays clickable source cards with official PDF filenames, exact page numbers, and verified text excerpts to give students 100% confidence in answers.
            </p>
          </div>
        </div>

        {/* Technology Highlights */}
        <div className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-blue-950/20 via-purple-950/20 to-gray-900/40 border border-gray-800 flex flex-wrap items-center justify-around gap-6 text-center">
          <div>
            <p className="text-lg font-bold text-white">FastAPI + Qdrant</p>
            <p className="text-xs text-gray-400">Vector Search Core</p>
          </div>
          <div className="w-px h-8 bg-gray-800 hidden sm:block" />
          <div>
            <p className="text-lg font-bold text-white">Google Gemini</p>
            <p className="text-xs text-gray-400">Contextual Reasoning</p>
          </div>
          <div className="w-px h-8 bg-gray-800 hidden sm:block" />
          <div>
            <p className="text-lg font-bold text-white">PyMuPDF + BM25</p>
            <p className="text-xs text-gray-400">Page-Aware Chunking</p>
          </div>
          <div className="w-px h-8 bg-gray-800 hidden sm:block" />
          <div>
            <p className="text-lg font-bold text-white">React + Tailwind</p>
            <p className="text-xs text-gray-400">Modern Glassmorphic UI</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/80 py-6 text-center text-xs text-gray-500 bg-gray-950/80">
        <p>CollegeRAG — Enterprise Campus Knowledge Retrieval System</p>
      </footer>
    </div>
  );
};

export default Landing;
