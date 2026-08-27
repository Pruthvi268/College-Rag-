import React, { useState } from 'react';
import {
  GraduationCap,
  User,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  FileText,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { feedbackApi } from '../services/api';

const ChatMessage = ({ message, onOpenSource }) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(message.feedback_rating || null);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (rating) => {
    if (!message.id || submittingFeedback) return;
    try {
      setSubmittingFeedback(true);
      await feedbackApi.submit(message.id, rating);
      setFeedbackRating(rating);
    } catch (err) {
      console.error('Failed to submit feedback', err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const confidencePct = message.confidence ? Math.round(message.confidence * 100) : 88;

  return (
    <div
      className={`py-5 px-4 sm:px-6 transition-colors ${
        isAssistant
          ? 'bg-gray-900/40 border-y border-gray-800/40'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-300">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-200">
                {isAssistant ? 'CollegeRAG Assistant' : 'You'}
              </span>
              {isAssistant && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  Verified Context
                </span>
              )}
            </div>

            {isAssistant && (
              <div className="flex items-center gap-2">
                {message.confidence !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      confidencePct >= 50
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {confidencePct}% Confidence
                  </span>
                )}
                <button
                  onClick={handleCopy}
                  title="Copy text"
                  className="p-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Text Message */}
          <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed prose-chat">
            {message.content}
          </div>

          {/* Source Citations */}
          {isAssistant && message.sources && message.sources.length > 0 && (
            <div className="pt-2 border-t border-gray-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Grounding Sources ({message.sources.length}):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {message.sources.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOpenSource && onOpenSource(src)}
                    className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-950/80 hover:bg-gray-800 border border-gray-800 hover:border-blue-500/40 text-xs text-gray-300 hover:text-white transition-all shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-medium truncate max-w-[200px]">
                      {src.document}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      (p.{src.page})
                    </span>
                    <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar (Assistant Only) */}
          {isAssistant && (
            <div className="flex items-center justify-between pt-1 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-[11px]">Was this answer helpful?</span>
                <button
                  onClick={() => handleFeedback(1)}
                  disabled={submittingFeedback}
                  className={`p-1.5 rounded-lg transition-colors ${
                    feedbackRating === 1
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'hover:text-gray-300 hover:bg-gray-800'
                  }`}
                  title="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback(-1)}
                  disabled={submittingFeedback}
                  className={`p-1.5 rounded-lg transition-colors ${
                    feedbackRating === -1
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'hover:text-gray-300 hover:bg-gray-800'
                  }`}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {message.latency_ms && (
                <span className="text-[10px] font-mono text-gray-500">
                  {message.latency_ms}ms response
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
