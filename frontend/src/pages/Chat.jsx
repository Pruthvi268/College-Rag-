import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  DollarSign,
  Calendar,
  Briefcase,
  HelpCircle,
  Menu,
  X,
  Loader2,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import ChatInput from '../components/ChatInput';
import SourceModal from '../components/SourceModal';
import { chatApi } from '../services/api';

const STARTER_CARDS = [
  {
    icon: BookOpen,
    title: 'Admissions & Eligibility',
    desc: 'What is the eligibility criteria and seat matrix for MCA 2026?',
    category: 'Admissions',
  },
  {
    icon: DollarSign,
    title: 'Hostel Rent & Mess',
    desc: 'What are the 2-sharing hostel fees and curfew timings?',
    category: 'Hostel',
  },
  {
    icon: Calendar,
    title: 'Academic Calendar',
    desc: 'When do the Odd Semester exams and Dussehra break start?',
    category: 'Academics',
  },
  {
    icon: HelpCircle,
    title: '75% Attendance Rule',
    desc: 'What are the condonation fees and 10-point grading scales?',
    category: 'Examinations',
  },
  {
    icon: Briefcase,
    title: 'Placements & CTC',
    desc: 'What are the CGPA cutoffs and highest packages in 2026?',
    category: 'Placements',
  },
];

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeSource, setActiveSource] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await chatApi.getConversations();
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  // Load specific conversation messages
  const loadConversationMessages = async (convId) => {
    if (!convId) return;
    try {
      setLoading(true);
      setCurrentConvId(convId);
      const res = await chatApi.getConversation(convId);
      setMessages(res.data.messages || []);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to fetch conversation detail', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConvId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (convId) => {
    try {
      await chatApi.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (currentConvId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const handleSendMessage = async (questionText, category = null) => {
    if (!questionText.trim() || sending) return;

    // 1. Optimistic User Message
    const optimisticUserMsg = {
      id: Date.now(),
      role: 'user',
      content: questionText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setSending(true);

    try {
      const res = await chatApi.ask(questionText, currentConvId, category);
      const {
        conversation_id,
        message_id,
        answer,
        sources,
        confidence,
        latency_ms,
        is_unknown,
      } = res.data;

      // Update current conversation ID if newly created
      if (!currentConvId) {
        setCurrentConvId(conversation_id);
        loadConversations();
      }

      // 2. Append Assistant Message
      const assistantMsg = {
        id: message_id,
        conversation_id,
        role: 'assistant',
        content: answer,
        sources: sources || [],
        confidence,
        latency_ms,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to send question', err);
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content:
          '⚠️ Sorry, an error occurred while connecting to the college knowledge base. Please ensure backend services are active.',
        sources: [],
        confidence: 0.0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#090d16] text-gray-100 overflow-hidden relative">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        currentConvId={currentConvId}
        onSelectConversation={loadConversationMessages}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onSelectPrompt={(text, cat) => handleSendMessage(text, cat)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0f19] relative">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-gray-950/80">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-xs font-semibold text-gray-300">
            College Information Assistant
          </span>
          <button
            onClick={handleNewChat}
            className="text-xs text-blue-400 font-semibold px-2 py-1 rounded bg-blue-500/10"
          >
            + New
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : messages.length > 0 ? (
            <div className="py-4 space-y-1">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={msg.id || i}
                  message={msg}
                  onOpenSource={(src) => setActiveSource(src)}
                />
              ))}

              {/* Typing / Generating Animation */}
              {sending && (
                <div className="py-5 px-4 sm:px-6 bg-gray-900/40 border-y border-gray-800/40">
                  <div className="max-w-3xl mx-auto flex gap-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/20">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="space-y-2 pt-1 flex-1">
                      <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching official college documents & synthesizing grounded response...</span>
                      </div>
                      <div className="h-2 w-48 bg-gray-800 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Empty State Hero & Starter Prompts */
            <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-500/25">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  How can I help you today?
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
                  Ask any question about admissions, semester schedules, exam grading rules, hostel fees, or campus placements.
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {STARTER_CARDS.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(card.desc, card.category)}
                      className="p-4 rounded-2xl bg-gray-900/80 hover:bg-gray-850 border border-gray-800 hover:border-blue-500/40 text-left transition-all hover:scale-[1.01] group shadow-md"
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-200 group-hover:text-blue-300">
                          {card.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {card.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <ChatInput onSendMessage={handleSendMessage} disabled={sending} />
      </div>

      {/* Interactive Source Citation Modal */}
      {activeSource && (
        <SourceModal
          source={activeSource}
          onClose={() => setActiveSource(null)}
        />
      )}
    </div>
  );
};

export default Chat;
