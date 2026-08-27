import React from 'react';
import { HelpCircle, AlertCircle, Calendar, Tag, ShieldAlert } from 'lucide-react';

const UnansweredTable = ({ queries }) => {
  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            Knowledge Gaps & Unanswered Queries
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Student questions that returned below similarity threshold ({`< 30%`}) or were out-of-domain.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-950/60 text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
            <tr>
              <th className="px-6 py-3.5">Student Question</th>
              <th className="px-4 py-3.5">Category Scope</th>
              <th className="px-4 py-3.5">Max Similarity</th>
              <th className="px-6 py-3.5 text-right">Logged At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {queries && queries.length > 0 ? (
              queries.map((q) => {
                const confPct = Math.round(q.max_similarity * 100);
                const dateStr = new Date(q.created_at).toLocaleString();
                return (
                  <tr key={q.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2.5 max-w-md">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="font-medium text-gray-200">{q.question}</span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-gray-800 text-gray-300 border border-gray-700">
                        <Tag className="w-3 h-3 text-gray-400" />
                        {q.category || 'General'}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-mono font-semibold text-amber-400">
                      {confPct}% Match
                    </td>

                    <td className="px-6 py-4 text-right text-gray-400 font-mono text-[11px]">
                      {dateStr}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  No unanswered questions recorded yet. All queries have been grounded successfully!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UnansweredTable;
