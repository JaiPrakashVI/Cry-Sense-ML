import { Link } from 'react-router-dom';
import { Server, Brain, Database, Rocket, Code, ArrowLeft } from 'lucide-react';

const techStack = [
  { icon: Code, title: 'Frontend', desc: 'React 19, Vite 7, React Router, Supabase Auth', color: 'var(--primary)' },
  { icon: Server, title: 'Backend', desc: 'FastAPI, Uvicorn, Pydantic, JWT Auth', color: 'var(--success)' },
  { icon: Brain, title: 'ML Pipeline', desc: 'TensorFlow, Librosa, Mel Spectrograms, CNN Classifier', color: 'var(--info)' },
  { icon: Database, title: 'Data Layer', desc: 'Supabase (PostgreSQL), Row Level Security', color: 'var(--warning)' },
  { icon: Rocket, title: 'Deployment', desc: 'Docker, Vercel (Frontend), Railway/HF Spaces (Backend)', color: 'var(--danger)' },
];

export default function DocumentationPage() {
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
          <h1>Documentation</h1>
          <p>System architecture and technical overview</p>
        </div>

        {/* Architecture */}
        <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
          <h2>Architecture Overview</h2>
          <p style={{ marginBottom: '16px' }}>
            CrySense follows a clean three-layer architecture: a React SPA frontend communicates
            with a FastAPI backend over REST, which in turn runs an ML inference pipeline.
            User data is stored in Supabase (PostgreSQL) with Row Level Security.
          </p>
          <div className="arch-flow">
            <div className="arch-node">React SPA</div>
            <span className="arch-arrow">→</span>
            <div className="arch-node">FastAPI</div>
            <span className="arch-arrow">→</span>
            <div className="arch-node">CNN Model</div>
            <span className="arch-arrow">→</span>
            <div className="arch-node">Supabase DB</div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="section-header" style={{ textAlign: 'left' }}>
          <h2>Technology Stack</h2>
        </div>
        <div className="features-grid">
          {techStack.map((t) => (
            <div key={t.title} className="feature-card">
              <div className="feature-icon" style={{ background: `${t.color}15`, color: t.color }}>
                <t.icon size={24} />
              </div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
          ))}
        </div>

        {/* API Reference */}
        <div className="card" style={{ padding: '32px', marginTop: '32px' }}>
          <h2>API Endpoints</h2>
          <div className="api-table">
            <table>
              <thead>
                <tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><span className="badge badge-success">GET</span></td><td>/health</td><td>No</td><td>Service health check</td></tr>
                <tr><td><span className="badge badge-success">GET</span></td><td>/model-info</td><td>No</td><td>Model metadata</td></tr>
                <tr><td><span className="badge badge-info">POST</span></td><td>/analyze</td><td>Yes</td><td>Analyze audio file</td></tr>
                <tr><td><span className="badge badge-success">GET</span></td><td>/predictions</td><td>Yes</td><td>User prediction history</td></tr>
                <tr><td><span className="badge badge-success">GET</span></td><td>/predictions/stats</td><td>Yes</td><td>User statistics</td></tr>
                <tr><td><span className="badge badge-danger">DELETE</span></td><td>/predictions/:id</td><td>Yes</td><td>Delete a prediction</td></tr>
                <tr><td><span className="badge badge-info">POST</span></td><td>/contact</td><td>Yes</td><td>Submit contact form</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
