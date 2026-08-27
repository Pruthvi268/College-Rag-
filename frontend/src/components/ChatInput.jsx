import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Filter, CornerDownLeft } from 'lucide-react';

const CATEGORIES = [
  { id: 'All', label: 'All Knowledge' },
  { id: 'Admissions', label: 'Admissions' },
  { id: 'Hostel', label: 'Hostel & Mess' },
  { id: 'Academics', label: 'Calendar & Academics' },
  { id: 'Examinations', label: 'Exams & Grading' },
  { id: 'Placements', label: 'Placements & Jobs' },
];

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('All');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim(), category === 'All' ? null : category);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2.5 scrollbar-none">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 pl-1 pr-2 shrink-0">
          <Filter className="w-3 h-3 text-blue-400" />
          <span>Scope:</span>
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
              category === cat.id
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm shadow-blue-500/20'
                : 'bg-gray-900/60 text-gray-400 hover:text-gray-200 border border-gray-800 hover:border-gray-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 p-2.5 rounded-2xl bg-gray-900/90 border border-gray-800 focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-2xl transition-all"
      >
        <div className="pl-2.5 pb-2 text-blue-400">
          <Sparkles className="w-4 h-4" />
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about admissions, hostel fees, exams, syllabus, or placement rules..."
          disabled={disabled}
          className="flex-1 bg-transparent border-0 text-sm text-gray-100 placeholder-gray-500 focus:ring-0 focus:outline-none resize-none max-h-44 py-1.5 px-2"
        />

        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className={`p-2.5 rounded-xl text-white font-medium transition-all ${
            input.trim() && !disabled
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/25 scale-100'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Keyboard Helper */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 px-2 pt-2">
        <span className="flex items-center gap-1">
          <CornerDownLeft className="w-3 h-3 text-gray-400" />
          <span className="font-mono text-gray-300">Enter</span> to send, <span className="font-mono text-gray-300">Shift + Enter</span> for new line
        </span>
        <span className="text-gray-400 hidden sm:inline font-mono">
          Strict RAG Grounding Enabled
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
