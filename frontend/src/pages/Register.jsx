import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { GraduationCap, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    try {
      setLoading(true);
      setError(null);
      const userData = await register(name, email, password, role);
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Registration error', err);
      setError(err.response?.data?.detail || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-2xl shadow-2xl p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/25">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Create Your Account</h2>
          <p className="text-xs text-gray-400 mt-1">
            Join CollegeRAG for instant official campus intelligence
          </p>
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
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Sharma"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

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
                placeholder="alex.sharma@college.edu"
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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  role === 'STUDENT'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  role === 'ADMIN'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                    : 'bg-gray-950/60 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Administrator</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
