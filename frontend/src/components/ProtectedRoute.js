import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 12 }}>
          403 — Access Denied
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          You don't have permission to view this page.
        </p>
        <a href="/" className="btn btn-primary">Go Home</a>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
