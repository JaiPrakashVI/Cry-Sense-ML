import { useState } from 'react';
import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

/* Pages */
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DocumentationPage from './pages/DocumentationPage';

/** Layout for authenticated pages — includes Navbar + footer */
function AppLayout({ analysisResult, setResult }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-main">
        <Outlet context={{ analysisResult, setResult }} />
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} CrySense. AI-powered infant wellness.</p>
      </footer>
    </div>
  );
}

/** Redirect authenticated users away from auth pages */
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-loading-spinner" />
      </div>
    );
  }
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const [analysisResult, setResult] = useState(null);

  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Auth callback — handles OAuth + password reset redirects */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Auth routes — redirect if already logged in */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><SignupPage /></PublicOnlyRoute>} />
        <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />

        {/* Protected routes — with navbar layout */}
        <Route element={
          <ProtectedRoute>
            <AppLayout analysisResult={analysisResult} setResult={setResult} />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/analyze" element={<AnalyzePage setResult={setResult} />} />
          <Route path="/results" element={<ResultsPage result={analysisResult} />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
