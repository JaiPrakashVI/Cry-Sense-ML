import {
  AlertTriangle, SmilePlus, Baby, Moon, Frown, Heart,
  Activity, ShieldCheck, Info,
} from 'lucide-react';

const EMOTION_CONFIG = {
  Hunger:     { icon: Baby,          color: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  Pain:       { icon: AlertTriangle, color: '#DC2626', bg: 'rgba(220,38,38,0.06)' },
  Sleepy:     { icon: Moon,          color: '#1B6B8A', bg: 'rgba(27,107,138,0.06)' },
  Discomfort: { icon: Frown,         color: '#EA580C', bg: 'rgba(234,88,12,0.06)' },
  Neutral:    { icon: SmilePlus,     color: '#059669', bg: 'rgba(5,150,105,0.08)' },
};

const RISK_STYLES = {
  High:     { className: 'badge-danger',  label: 'High Risk' },
  Elevated: { className: 'badge-warning', label: 'Elevated Risk' },
  Moderate: { className: 'badge-info',    label: 'Moderate Risk' },
  Low:      { className: 'badge-success', label: 'Low Risk' },
};

const CARE_TIPS = {
  Hunger:     ['Offer a feeding — breast or bottle', 'Check if the last feeding was more than 2–3 hours ago', 'Observe for rooting reflex or hand-to-mouth movements'],
  Pain:       ['Check for sources of discomfort (diaper, clothing, temperature)', 'Gently check for gas — try bicycle legs or tummy massage', 'If crying persists, consult your pediatrician'],
  Sleepy:     ['Create a calm, dim environment', 'Try gentle rocking or white noise', 'Establish a consistent bedtime routine'],
  Discomfort: ['Check diaper and clothing fit', 'Adjust room temperature (ideal: 68–72°F / 20–22°C)', 'Look for skin irritation or tags on clothing'],
  Neutral:    ['Baby appears content — great job!', 'Continue current care routine', 'Monitor for any changes in behavior'],
};

export default function ResultPanel({ result }) {
  if (!result) return null;

  const {
    emotion = 'Neutral',
    distressScore = 0,
    confidenceScore = 0,
    riskCategory = 'Low',
    summary = '',
    emotionDistribution = {},
  } = result;

  const emotionCfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.Neutral;
  const EmotionIcon = emotionCfg.icon;
  const riskStyle = RISK_STYLES[riskCategory] || RISK_STYLES.Low;
  const careTips = CARE_TIPS[emotion] || CARE_TIPS.Neutral;

  const distEntries = Object.entries(emotionDistribution)
    .sort(([, a], [, b]) => b - a);
  const maxDist = Math.max(...distEntries.map(([, v]) => v), 1);

  return (
    <div className="result-panel">
      {/* Header */}
      <div className="result-header card">
        <div className="result-emotion-circle" style={{ background: emotionCfg.bg }}>
          <EmotionIcon size={36} color={emotionCfg.color} />
        </div>
        <div className="result-header-text">
          <h2 style={{ color: emotionCfg.color }}>{emotion}</h2>
          <span className={`badge ${riskStyle.className}`}>{riskStyle.label}</span>
        </div>
      </div>

      {/* Gauges */}
      <div className="result-gauges">
        <div className="gauge-card card">
          <div className="gauge-ring" style={{ '--gauge-value': `${distressScore * 3.6}deg`, '--gauge-color': 'var(--danger)' }}>
            <span className="gauge-value">{Math.round(distressScore)}</span>
          </div>
          <span className="gauge-label">Distress Score</span>
        </div>
        <div className="gauge-card card">
          <div className="gauge-ring" style={{ '--gauge-value': `${confidenceScore * 3.6}deg`, '--gauge-color': 'var(--primary)' }}>
            <span className="gauge-value">{Math.round(confidenceScore)}</span>
          </div>
          <span className="gauge-label">Confidence</span>
        </div>
      </div>

      {/* Emotion Distribution */}
      {distEntries.length > 0 && (
        <div className="result-distribution card">
          <h3>
            <Activity size={18} />
            Emotion Distribution
          </h3>
          <div className="distribution-bars">
            {distEntries.map(([name, value]) => {
              const cfg = EMOTION_CONFIG[name] || { color: 'var(--text-muted)' };
              return (
                <div key={name} className="dist-row">
                  <span className="dist-label">{name}</span>
                  <div className="dist-bar-track">
                    <div
                      className="dist-bar-fill"
                      style={{ width: `${(value / maxDist) * 100}%`, background: cfg.color }}
                    />
                  </div>
                  <span className="dist-value">{Math.round(value)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Care Recommendations */}
      <div className="result-care card">
        <h3>
          <Heart size={18} />
          Care Recommendations
        </h3>
        <ul className="care-list">
          {careTips.map((tip, i) => (
            <li key={i}>
              <ShieldCheck size={16} color="var(--success)" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary */}
      {summary && (
        <div className="result-summary card">
          <h3>
            <Info size={18} />
            Analysis Summary
          </h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
