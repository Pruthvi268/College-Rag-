import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, User, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = (role) => {
    if (role === 'admin') {
      setEmail('admin@college.edu');
      setPassword('Admin@123');
    } else {
      setEmail('student@college.edu');
      setPassword('Student@123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);
      const userData = await login(email, password);
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Login error', err);
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Welcome to CollegeRAG</h2>
          <p className="text-xs text-gray-400 mt-1">
            Sign in to access the official college information assistant
          </p>
        </div>

        {/* 1-Click Demo Fill Shortcuts */}
        <div className="mb-6 p-3 rounded-xl bg-gray-950/80 border border-gray-800 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center">
            ⚡ Quick Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('student')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs font-medium text-blue-300 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Demo</span>
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('admin')}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-xs font-medium text-purple-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-semibold">
            Create Student Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
