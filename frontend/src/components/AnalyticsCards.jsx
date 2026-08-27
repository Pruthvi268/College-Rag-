import React from 'react';
import {
  FileText,
  Layers,
  MessageSquare,
  Sparkles,
  ThumbsUp,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

const AnalyticsCards = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: 'Knowledge Documents',
      value: stats.total_documents,
      subtitle: `${stats.processed_documents} active • ${stats.failed_documents || 0} failed`,
      icon: FileText,
      color: 'blue',
      glow: 'glow-blue',
    },
    {
      title: 'Vector Chunks Indexed',
      value: stats.total_chunks,
      subtitle: 'Qdrant Dense + BM25 hybrid index',
      icon: Layers,
      color: 'purple',
      glow: 'glow-indigo',
    },
    {
      title: 'Questions Answered',
      value: stats.total_questions,
      subtitle: 'Multi-turn conversational queries',
      icon: MessageSquare,
      color: 'indigo',
      glow: 'glow-indigo',
    },
    {
      title: 'Average Retrieval Confidence',
      value: `${Math.round((stats.average_confidence || 0.85) * 100)}%`,
      subtitle: 'Vector similarity + RRF density',
      icon: Sparkles,
      color: 'emerald',
      glow: 'glow-emerald',
    },
    {
      title: 'Student Satisfaction',
      value: `${stats.feedback_positive} / ${stats.feedback_positive + stats.feedback_negative || 0}`,
      subtitle: `${stats.feedback_positive} positive • ${stats.feedback_negative} negative`,
      icon: ThumbsUp,
      color: 'emerald',
      glow: 'glow-emerald',
    },
    {
      title: 'Unanswered / Knowledge Gaps',
      value: stats.unanswered_questions,
      subtitle: 'Requires official circular upload',
      icon: HelpCircle,
      color: 'amber',
      glow: '',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-5 rounded-2xl bg-gray-900/90 border border-gray-800/80 shadow-lg relative overflow-hidden group hover:border-gray-700 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-400">
                {c.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  c.color === 'blue'
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : c.color === 'purple'
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : c.color === 'emerald'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : c.color === 'amber'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {c.value}
              </span>
            </div>

            <p className="text-[11px] text-gray-400 mt-1 font-mono">
              {c.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsCards;
