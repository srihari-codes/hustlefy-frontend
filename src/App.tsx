import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ProviderDashboard from "./pages/Provider/ProviderDashboard";
import PostJob from "./pages/Provider/PostJob";
import SeekerDashboard from "./pages/Seeker/SeekerDashboard";
import ApplyJob from "./pages/Seeker/ApplyJob";
import { isOnboardingComplete } from "./utils/onboarding";
import Onboarding from "./pages/Onboarding";
import Footer from "./components/Layout/Footer";

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  </div>
);

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  role?: "provider" | "seeker";
}> = ({ children, role }) => {
  const { isAuthenticated, user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Protected Dashboard Component
const ProtectedDashboard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isOnboardingComplete(user)) {
    return <Navigate to="/onboarding" />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    if (!isOnboardingComplete(user)) {
      return <Navigate to="/onboarding" replace />;
    }

    return (
      <Navigate
        to={
          user?.role === "provider"
            ? "/provider/dashboard"
            : "/seeker/dashboard"
        }
        replace
      />
    );
  }

  return <>{children}</>;
};

// App Routes Component
const AppRoutes: React.FC = () => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

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
              <ProtectedDashboard>
                <ProviderDashboard />
              </ProtectedDashboard>
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
              <ProtectedDashboard>
                <SeekerDashboard />
              </ProtectedDashboard>
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

          {/* Onboarding Route */}
          <Route
            path="/onboarding"
            element={
              user && !isOnboardingComplete(user) ? (
                <Onboarding />
              ) : (
                <Navigate
                  to={
                    user?.role === "provider"
                      ? "/provider/dashboard"
                      : "/seeker/dashboard"
                  }
                  replace
                />
              )
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
      <>
        <AppRoutes />
        <Footer />
      </>
    </AuthProvider>
  );
};

export default App;
