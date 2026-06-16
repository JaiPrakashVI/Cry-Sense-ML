import { useState } from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../components/DarkModeToggle';
import {
  Shield, Brain, Clock, FileAudio, Lock,
  ChevronDown, ChevronUp, Mic,
  ArrowRight, Star, Menu, X,
} from 'lucide-react';

const features = [
  { icon: Mic, title: 'Real-time Analysis', desc: 'Record directly from your browser or upload audio files for instant cry classification.' },
  { icon: Brain, title: 'AI-Powered', desc: 'Deep learning CNN model trained on baby cry patterns for accurate emotional state detection.' },
  { icon: Lock, title: 'Privacy First', desc: 'Audio files are processed temporarily and never stored. Your data stays yours.' },
  { icon: Clock, title: 'History Tracking', desc: 'Keep track of all analyses over time to identify patterns in your baby\'s needs.' },
  { icon: FileAudio, title: 'Multiple Formats', desc: 'Supports WAV, MP3, FLAC, M4A, WebM, OGG — record or upload any way you prefer.' },
  { icon: Shield, title: 'Clinical Grade', desc: 'Built with evidence-based audio signal processing and validated ML techniques.' },
];

const steps = [
  { num: 'STEP 01', title: 'Record or Upload', desc: 'Capture audio directly or upload a file from your device.' },
  { num: 'STEP 02', title: 'AI Analyzes', desc: 'Our CNN model extracts spectrogram features and classifies the cry pattern.' },
  { num: 'STEP 03', title: 'Get Insights', desc: 'Receive a detailed report with emotion, distress score, and care recommendations.' },
];

const testimonials = [
  { quote: 'CrySense helped me understand my newborn\'s different cries. The hunger vs. discomfort distinction was a game changer.', name: 'Priya S.', role: 'First-time Parent' },
  { quote: 'As a pediatric nurse, I appreciate the clinical approach. The distress scoring gives objective data points for assessment.', name: 'Dr. Meera K.', role: 'Pediatric Nurse' },
  { quote: 'Finally an app that doesn\'t just tell me my baby is crying — it tells me why. The AI accuracy is impressive.', name: 'Arjun R.', role: 'Parent of Twins' },
];

const faqs = [
  { q: 'What is CrySense?', a: 'CrySense is an AI-powered platform that analyzes baby cry audio to identify emotional states like hunger, pain, sleepiness, and discomfort. It provides distress scores and care recommendations.' },
  { q: 'How accurate is the analysis?', a: 'Our CNN model is trained on classified baby cry datasets and blends spectrogram-based deep learning with acoustic signal processing for robust predictions. Accuracy improves with clear audio recordings.' },
  { q: 'Is my baby\'s audio data safe?', a: 'Absolutely. Audio files are processed in memory and deleted immediately after analysis. We never store raw audio. Only the analysis results are saved to your secure account.' },
  { q: 'What audio formats are supported?', a: 'CrySense supports WAV, MP3, FLAC, M4A, WebM, and OGG. You can also record directly from your browser microphone.' },
  { q: 'Is CrySense free to use?', a: 'Yes! CrySense is currently free for all users. Create an account to start analyzing and tracking your baby\'s cry patterns.' },
];

const BrandIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"/></svg>
);

export default function LandingPage() {
  const [mobileNav, setMobileNav] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="landing-page">
      <nav className="landing-navbar">
        <div className="landing-navbar-inner">
          <Link to="/" className="nav-brand">
            <BrandIcon />
            <span>CrySense</span>
          </Link>

          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="landing-nav-right">
            <DarkModeToggle />
            <Link to="/login" className="btn btn-ghost">Log In</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>

          <button className="nav-mobile-toggle" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu">
            {mobileNav ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileNav && (
          <div className="landing-mobile-menu">
            <a href="#features" onClick={() => setMobileNav(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setMobileNav(false)}>How it Works</a>
            <a href="#faq" onClick={() => setMobileNav(false)}>FAQ</a>
            <div className="landing-mobile-actions">
              <Link to="/login" className="btn btn-outline btn-block">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-block">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1" />
          <div className="hero-shape hero-shape-2" />
          <div className="hero-shape hero-shape-3" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <Star size={14} />
            <span>AI-Powered Baby Wellness</span>
          </div>
          <h1 className="hero-title">
            Understanding Every Cry,<br />
            <span className="gradient-text">One Sound at a Time</span>
          </h1>
          <p className="hero-subtitle">
            CrySense uses advanced deep learning to analyze your baby&apos;s cry patterns,
            identify emotional states, and provide actionable care insights — all in seconds.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-lg">Learn More</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">5</span>
              <span className="hero-stat-label">Baby States Detected</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">Real-time</span>
              <span className="hero-stat-label">Analysis Speed</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">100%</span>
              <span className="hero-stat-label">Privacy Focused</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2>Everything you need to understand your baby</h2>
            <p>Powerful AI technology wrapped in a simple, caring interface.</p>
          </div>
          <div className="features-grid">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon"><f.icon size={22} /></div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section section-alt" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">How it Works</span>
            <h2>Three simple steps</h2>
            <p>From audio to insights in under a minute.</p>
          </div>
          <div className="steps-grid">
            {steps.map((s) => (
              <div key={s.num} className="step-card">
                <span className="step-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Testimonials</span>
            <h2>Trusted by caring parents</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t) => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-stars">
                  {[1,2,3,4,5].map((i) => <Star key={i} size={14} fill="var(--warning)" stroke="var(--warning)" />)}
                </div>
                <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt" id="faq">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span>{f.q}</span>
                  {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openFaq === i && <p className="faq-answer">{f.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card">
            <h2>Start understanding your baby today</h2>
            <p>Create a free account and get AI-powered cry analysis in seconds.</p>
            <Link to="/signup" className="btn btn-lg">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <Link to="/" className="nav-brand">
              <BrandIcon />
              <span>CrySense</span>
            </Link>
            <p>AI-powered infant wellness. Understanding every cry, one sound at a time.</p>
          </div>
          <div className="landing-footer-links">
            <div>
              <h4>Product</h4>
              <Link to="/about">About</Link>
              <Link to="/docs">Documentation</Link>
              <Link to="/contact">Contact</Link>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/login">Log In</Link>
              <Link to="/signup">Sign Up</Link>
            </div>
          </div>
        </div>
        <div className="landing-footer-bottom">
          <p>&copy; {new Date().getFullYear()} CrySense. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
