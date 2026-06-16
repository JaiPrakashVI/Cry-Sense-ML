import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitContactForm } from '../services/api';
import { Send, Mail, Clock, Loader, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', text: '' });

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    setLoading(true);
    try {
      await submitContactForm({ name: name.trim(), email: email.trim(), message: message.trim() });
      setStatus({ type: 'success', text: 'Message sent successfully! We\'ll get back to you soon.' });
      setName('');
      setMessage('');
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Failed to send message. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">
      <nav className="landing-navbar">
        <div className="landing-navbar-inner">
          <Link to="/" className="nav-brand">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>
            <span>CrySense</span>
          </Link>
          <div className="landing-nav-right">
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="page-container" style={{ paddingTop: '100px' }}>
        <Link to="/" className="auth-back-link" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="page-header">
          <h1>Contact Us</h1>
          <p>Have a question or feedback? We&apos;d love to hear from you.</p>
        </div>

        <div className="contact-layout">
          <div className="card contact-form-card">
            {status.text && (
              <div className={`alert ${status.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                <span>{status.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Name</label>
                <input
                  id="contact-name"
                  type="text"
                  className="input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  className="input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  className="input textarea"
                  placeholder="How can we help?"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <Loader size={16} className="spin" /> : <Send size={16} />}
                <span>Send Message</span>
              </button>
            </form>
          </div>

          <div className="contact-info">
            <div className="card contact-info-card">
              <Mail size={24} color="var(--primary)" />
              <h3>Email</h3>
              <p>support@crysense.app</p>
            </div>
            <div className="card contact-info-card">
              <Clock size={24} color="var(--primary)" />
              <h3>Response Time</h3>
              <p>We typically respond within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
