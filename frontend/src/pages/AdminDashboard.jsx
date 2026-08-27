import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  UploadCloud,
  Layers,
  Sparkles,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import AnalyticsCards from '../components/AnalyticsCards';
import DocumentUploader from '../components/DocumentUploader';
import DocumentTable from '../components/DocumentTable';
import ChunkModal from '../components/ChunkModal';
import UnansweredTable from '../components/UnansweredTable';
import { adminApi, documentApi } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'documents' | 'unanswered'
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inspectChunkDoc, setInspectChunkDoc] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, docsRes, unansweredRes] = await Promise.all([
        adminApi.getStats(),
        documentApi.list(),
        adminApi.getUnanswered(),
      ]);
      setStats(statsRes.data);
      setDocuments(docsRes.data);
      setUnanswered(unansweredRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUploaded = (newDoc) => {
    fetchDashboardData();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#090d16] text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Admin Knowledge & Analytics Portal
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Manage official college circulars, monitor Qdrant vector store, and analyze knowledge gaps
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-xs font-medium text-gray-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Portal</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-800 pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'documents'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Knowledge Documents ({documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('unanswered')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'unanswered'
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Knowledge Gaps ({unanswered.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview & Analytics */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <AnalyticsCards stats={stats} />

            {/* Category Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-xl space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Knowledge Category Distribution
                </h3>
                <div className="space-y-3">
                  {stats?.category_distribution && stats.category_distribution.length > 0 ? (
                    stats.category_distribution.map((cat, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-300 font-medium">{cat.category}</span>
                          <span className="text-gray-400 font-mono">{cat.count} documents</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (cat.count / (stats.total_documents || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No category data available</p>
                  )}
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="p-6 rounded-2xl bg-gray-900/90 border border-gray-800 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Knowledge Base Status
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Official documents are parsed page-by-page, split into chunks, and embedded into Qdrant Vector Store with BM25 hybrid ranking.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Vector DB Engine:</span>
                    <span className="text-emerald-400 font-mono">Qdrant Active</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>LLM Grounding:</span>
                    <span className="text-blue-400 font-mono">Gemini 1.5 Grounded</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Search Mode:</span>
                    <span className="text-purple-400 font-mono">Dense + BM25 Hybrid (RRF)</span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('documents')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md"
                >
                  Upload New Document Circular
                </button>
              </div>
            </div>

            {/* Recent Unanswered Questions */}
            <UnansweredTable queries={unanswered.slice(0, 5)} />
          </div>
        )}

        {/* Tab 2: Document Management */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentUploader onUploadSuccess={handleDocumentUploaded} />
            <DocumentTable
              documents={documents}
              onRefresh={fetchDashboardData}
              onInspectChunks={(docId, docTitle) =>
                setInspectChunkDoc({ id: docId, title: docTitle })
              }
            />
          </div>
        )}

        {/* Tab 3: Knowledge Gaps & Unanswered */}
        {activeTab === 'unanswered' && (
          <div className="space-y-6">
            <UnansweredTable queries={unanswered} />
          </div>
        )}
      </div>

      {/* Chunks Inspector Modal */}
      {inspectChunkDoc && (
        <ChunkModal
          documentId={inspectChunkDoc.id}
          documentTitle={inspectChunkDoc.title}
          onClose={() => setInspectChunkDoc(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
