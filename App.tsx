import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { Dashboard } from './pages/Dashboard';
import { TransitionScreen } from './pages/TransitionScreen';
import { PreferenceModal } from './components/auth/PreferenceModal';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center animate-zoom-in shadow-lg shadow-emerald-100">
            <span className="text-white font-black text-lg">PG</span>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center animate-fade-in">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center animate-zoom-in shadow-lg shadow-emerald-100">
            <span className="text-white font-black text-lg">PG</span>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <>
      <PreferenceModal />
      <Routes>
        {/* Public Routes */}
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
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transition"
          element={
            <ProtectedRoute>
              <TransitionScreen />
            </ProtectedRoute>
          }
        />
        
        {/* Default Redirects */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        {/* Animated Logo */}
        <div className="w-12 h-12 bg-emerald-600 rounded-[18px] flex items-center justify-center mb-6 animate-zoom-in shadow-xl shadow-emerald-100">
          <span className="text-white font-black text-2xl">PG</span>
        </div>
        
        {/* Brand Name with Fade In */}
        <h1 className="text-xl font-bold text-gray-900 tracking-tight mb-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Potato Guru AI
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] animate-fade-in" style={{ animationDelay: '0.4s' }}>
          Modern AI, Better Storage
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
