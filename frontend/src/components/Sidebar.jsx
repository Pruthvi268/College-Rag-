import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  BookOpen,
  Calendar,
  DollarSign,
  Briefcase,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

const PROMPT_SUGGESTIONS = [
  { icon: BookOpen, text: 'What is the eligibility criteria for MCA admission?', cat: 'Admissions' },
  { icon: DollarSign, text: 'What is the hostel fee and mess charge structure?', cat: 'Hostel' },
  { icon: Calendar, text: 'When do Odd Semester examinations commence?', cat: 'Academics' },
  { icon: HelpCircle, text: 'Explain the 75% attendance rule and condonation.', cat: 'Examinations' },
  { icon: Briefcase, text: 'What is the highest package and Dream Job policy?', cat: 'Placements' },
];

const Sidebar = ({
  conversations,
  currentConvId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onSelectPrompt,
  isOpen,
  onClose,
}) => {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 w-72 bg-gray-950/95 border-r border-gray-800/80 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-800/80 space-y-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Suggested Starter Questions */}
      <div className="p-3 border-b border-gray-800/60">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-2 mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-blue-400" />
          Quick Topics
        </p>
        <div className="space-y-1">
          {PROMPT_SUGGESTIONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => onSelectPrompt && onSelectPrompt(item.text, item.cat)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-900/80 flex items-center gap-2 transition-colors group truncate"
                title={item.text}
              >
                <Icon className="w-3.5 h-3.5 text-gray-500 group-hover:text-blue-400 shrink-0" />
                <span className="truncate">{item.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-gray-400" />
            Recent Chats
          </span>
          <span className="text-[10px] text-gray-600 font-mono">
            {conversations?.length || 0}
          </span>
        </div>

        {conversations && conversations.length > 0 ? (
          conversations.map((conv) => {
            const isActive = currentConvId === conv.id;
            return (
              <div
                key={conv.id}
                className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-center gap-2 truncate flex-1 mr-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'
                    }`}
                  />
                  <span className="truncate">{conv.title || 'Untitled Chat'}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-rose-400 rounded transition-opacity"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center px-4">
            <MessageSquare className="w-6 h-6 text-gray-600 mx-auto mb-2 opacity-60" />
            <p className="text-xs text-gray-500">No chat history yet</p>
            <p className="text-[10px] text-gray-600 mt-0.5">
              Ask your first college question to begin!
            </p>
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-gray-800/80 bg-gray-950/60 text-center">
        <p className="text-[10px] text-gray-500 font-mono">
          Qdrant Vector DB • Gemini 1.5
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
