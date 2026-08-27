import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/authContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, token, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export default ProtectedRoute;
