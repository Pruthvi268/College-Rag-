import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import {
  GraduationCap,
  Sparkles,
  ShieldAlert,
  LogOut,
  User,
  MessageSquare,
  LayoutDashboard,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
                CollegeRAG
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Assistant
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              Grounded Campus Knowledge Base
            </p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/chat"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/chat'
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin Portal</span>
                </Link>
              )}

              {/* User Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
                <div className="flex items-center gap-2 py-1 px-2.5 rounded-lg bg-gray-900/90 border border-gray-800">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAdmin
                        ? 'bg-purple-600/30 text-purple-400 border border-purple-500/40'
                        : 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                    }`}
                  >
                    {isAdmin ? 'A' : 'S'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-semibold text-gray-200 leading-tight">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {user?.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
