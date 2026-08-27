import React, { useEffect, useState } from 'react';
import { Layers, X, Bookmark, Hash, FileCode, Loader2 } from 'lucide-react';
import { documentApi } from '../services/api';

const ChunkModal = ({ documentId, documentTitle, onClose }) => {
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChunks = async () => {
      if (!documentId) return;
      try {
        setLoading(true);
        const res = await documentApi.getChunks(documentId);
        setChunks(res.data);
      } catch (err) {
        console.error('Failed to load chunks', err);
        setError('Failed to load document chunks');
      } finally {
        setLoading(false);
      }
    };
    fetchChunks();
  }, [documentId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white truncate max-w-lg">
                {documentTitle || 'Document Chunks'}
              </h3>
              <p className="text-xs text-gray-400">
                Vector DB Ingested Chunks ({chunks.length} total)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-400">Loading vector chunks...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 text-rose-400 text-sm">
              {error}
            </div>
          ) : chunks.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No chunks indexed for this document.
            </div>
          ) : (
            chunks.map((chunk, idx) => (
              <div
                key={chunk.id || idx}
                className="p-4 rounded-xl bg-gray-950/80 border border-gray-800/80 space-y-2 hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800/60 pb-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-purple-400 font-mono font-semibold">
                      <Hash className="w-3.5 h-3.5" />
                      Chunk #{chunk.chunk_index + 1}
                    </span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <Bookmark className="w-3.5 h-3.5" />
                      Page {chunk.page_number}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400">
                    ~{chunk.token_count} tokens
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {chunk.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-800 bg-gray-950/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChunkModal;
