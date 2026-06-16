import { Link } from 'react-router-dom';
import { Shield, Brain, Heart, ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="landing-page">
      {/* Mini navbar for public page */}
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
          <h1>About CrySense</h1>
          <p>AI-powered infant wellness, built with care.</p>
        </div>

        <div className="about-content">
          <div className="card" style={{ padding: '32px' }}>
            <h2>Our Mission</h2>
            <p>
              CrySense is an AI decision-support platform designed to help parents and caregivers
              better understand their infant&apos;s needs through audio analysis. By combining deep
              learning with acoustic signal processing, we translate urgent audio signals into
              actionable, explainable insights.
            </p>
          </div>

          <div className="features-grid" style={{ marginTop: '32px' }}>
            <div className="feature-card">
              <div className="feature-icon"><Brain size={24} /></div>
              <h3>How it Works</h3>
              <p>
                Our CNN model processes mel spectrograms extracted from baby cry audio. Combined
                with DSP features like RMS energy and spectral centroid, it classifies cries
                into 5 baby states: Hunger, Pain, Sleepy, Discomfort, and Neutral.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Shield size={24} /></div>
              <h3>Privacy &amp; Security</h3>
              <p>
                Audio files are processed temporarily and deleted after analysis. We use Supabase
                for secure authentication, and all API endpoints are protected with JWT tokens.
                Your data belongs to you.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Heart size={24} /></div>
              <h3>Built with Care</h3>
              <p>
                CrySense is designed to be a supportive tool — not a replacement for medical
                advice. Always consult a healthcare professional for concerns about your child&apos;s health.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
