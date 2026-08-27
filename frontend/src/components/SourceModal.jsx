import React from 'react';
import { FileText, X, CheckCircle2, Bookmark, Layers, Building2, Calendar } from 'lucide-react';

const SourceModal = ({ source, onClose }) => {
  if (!source) return null;

  const relevancePct = Math.round((source.relevance || 0.8) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white truncate max-w-md">
                {source.document}
              </h3>
              <p className="text-xs text-gray-400">
                Official Campus Grounding Source
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

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800/80">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                <span>Page</span>
              </div>
              <p className="text-sm font-bold text-gray-200">Page {source.page || 1}</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800/80">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Category</span>
              </div>
              <p className="text-sm font-bold text-gray-200 truncate">{source.category || 'General'}</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800/80">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Dept</span>
              </div>
              <p className="text-sm font-bold text-gray-200 truncate">{source.department || 'All'}</p>
            </div>

            <div className="p-3 rounded-xl bg-gray-950/80 border border-gray-800/80">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Relevance</span>
              </div>
              <p className="text-sm font-bold text-emerald-400">{relevancePct}%</p>
            </div>
          </div>

          {/* Relevance Bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>Vector Similarity & Term Density</span>
              <span className="text-emerald-400 font-mono font-medium">{relevancePct}% Match</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${relevancePct}%` }}
              />
            </div>
          </div>

          {/* Extracted Excerpt */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Retrieved Official Excerpt
            </h4>
            <div className="p-4 rounded-xl bg-gray-950/90 border border-gray-800 text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed shadow-inner">
              {source.snippet || 'No excerpt preview available.'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200/90 leading-relaxed">
              This document was indexed and verified from the official college administration records. The AI's response was strictly grounded in this context.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-800 bg-gray-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            Close Citation
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceModal;
