import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Loader, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      const { error: authError } = await resetPassword(email.trim());
      if (authError) { setError(authError.message || 'Failed to send reset email.'); }
      else { setSuccess(true); }
    } catch { setError('An unexpected error occurred.'); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-success-icon"><CheckCircle size={48} /></div>
          <h1>Email sent</h1>
          <p className="auth-subtitle">Check your inbox at <strong>{email}</strong> for a password reset link.</p>
          <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop: '1.5rem' }}>Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>
            <span>CrySense</span>
          </Link>
          <h1>Reset your password</h1>
          <p className="auth-subtitle">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">Email address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input id="reset-email" type="email" className="input has-icon" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? <Loader size={18} className="spin" /> : 'Send Reset Link'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem' }}>
          <Link to="/login" className="auth-back-link">
            <ArrowLeft size={16} />
            <span>Back to login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
