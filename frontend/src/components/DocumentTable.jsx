import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  RefreshCw,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react';
import { documentApi } from '../services/api';

const DocumentTable = ({
  documents,
  onRefresh,
  onInspectChunks,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [actionLoading, setActionLoading] = useState({});

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This will remove its vectors from Qdrant.`)) {
      return;
    }
    try {
      setActionLoading((prev) => ({ ...prev, [docId]: 'delete' }));
      await documentApi.delete(docId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete document');
    } finally {
      setActionLoading((prev) => ({ ...prev, [docId]: null }));
    }
  };

  const handleReprocess = async (docId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [docId]: 'reprocess' }));
      await documentApi.reprocess(docId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Reprocess failed', err);
      alert('Failed to reprocess document');
    } finally {
      setActionLoading((prev) => ({ ...prev, [docId]: null }));
    }
  };

  const categories = ['All', ...new Set(documents.map((d) => d.category || 'General'))];

  const filteredDocs = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCat === 'All' || doc.category === selectedCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Table Controls */}
      <div className="p-4 sm:p-6 border-b border-gray-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2 bg-gray-950/80 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="bg-gray-950/80 border border-gray-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRefresh}
            className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
            <tr>
              <th className="px-6 py-3.5">Document Details</th>
              <th className="px-4 py-3.5">Category</th>
              <th className="px-4 py-3.5">Department</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Chunks</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => {
                const isLoading = !!actionLoading[doc.id];
                return (
                  <tr key={doc.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-100 truncate max-w-xs sm:max-w-md">
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-gray-400 font-mono truncate max-w-xs">
                            {doc.filename} • {(doc.file_size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {doc.category}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-gray-300 font-mono">
                      {doc.department}
                    </td>

                    <td className="px-4 py-4">
                      {doc.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      ) : doc.status === 'PROCESSING' || doc.status === 'UPLOADED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3 h-3 animate-spin" />
                          Processing
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium text-[11px] bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          title={doc.error_message}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-gray-300 font-mono font-semibold">
                      {doc.chunk_count}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInspectChunks(doc.id, doc.title)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                          title="Inspect chunks"
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReprocess(doc.id)}
                          disabled={isLoading}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors disabled:opacity-50"
                          title="Reprocess document"
                        >
                          <RefreshCw className={`w-4 h-4 ${actionLoading[doc.id] === 'reprocess' ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.title)}
                          disabled={isLoading}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No documents found matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentTable;
