import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#090d16] text-center">
      <div className="space-y-4 max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <p className="text-sm text-gray-400">
          The campus page or resource you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
