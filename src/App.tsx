import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import ProviderDashboard from './pages/Provider/ProviderDashboard';
import PostJob from './pages/Provider/PostJob';
import SeekerDashboard from './pages/Seeker/SeekerDashboard';
import ApplyJob from './pages/Seeker/ApplyJob';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'provider' | 'seeker' }> = ({ 
  children, 
  role 
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Provider Routes */}
          <Route 
            path="/provider/dashboard" 
            element={
              <ProtectedRoute role="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/provider/post-job" 
            element={
              <ProtectedRoute role="provider">
                <PostJob />
              </ProtectedRoute>
            } 
          />

          {/* Seeker Routes */}
          <Route 
            path="/seeker/dashboard" 
            element={
              <ProtectedRoute role="seeker">
                <SeekerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/apply/:jobId" 
            element={
              <ProtectedRoute role="seeker">
                <ApplyJob />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;