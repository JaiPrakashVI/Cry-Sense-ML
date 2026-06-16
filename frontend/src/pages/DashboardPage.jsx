import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../hooks/usePredictions';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import {
  BarChart3, Activity, Brain, Clock, FileAudio,
  ArrowRight,
} from 'lucide-react';

const RISK_COLORS = {
  High: 'badge-danger',
  Elevated: 'badge-warning',
  Moderate: 'badge-info',
  Low: 'badge-success',
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { predictions, stats, loading, statsLoading, fetchPredictions, fetchStats } = usePredictions();

  const loadData = useCallback(() => {
    fetchPredictions(5, 0);
    fetchStats();
  }, [fetchPredictions, fetchStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayName = profile?.full_name || 'there';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-container">
      {/* Welcome banner */}
      <div className="welcome-banner card">
        <div className="welcome-text">
          <h1>Welcome back, {displayName} 👋</h1>
          <p>{today}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
          <FileAudio size={18} />
          <span>New Analysis</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="dashboard-stats">
        {statsLoading ? (
          <LoadingSkeleton variant="card" height={100} count={4} />
        ) : (
          <>
            <div className="stat-card card">
              <div className="stat-icon" style={{ background: 'var(--primary-ghost)', color: 'var(--primary)' }}>
                <BarChart3 size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats?.total_predictions ?? 0}</span>
                <span className="stat-label">Total Analyses</span>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon" style={{ background: 'var(--success-ghost)', color: 'var(--success)' }}>
                <Brain size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">{stats?.most_common_emotion ?? '—'}</span>
                <span className="stat-label">Top State</span>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon" style={{ background: 'var(--warning-ghost)', color: 'var(--warning)' }}>
                <Activity size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">
                  {stats?.average_distress_score != null ? `${Math.round(stats.average_distress_score)}%` : '—'}
                </span>
                <span className="stat-label">Avg. Distress</span>
              </div>
            </div>
            <div className="stat-card card">
              <div className="stat-icon" style={{ background: 'var(--info-ghost)', color: 'var(--info)' }}>
                <Clock size={20} />
              </div>
              <div className="stat-content">
                <span className="stat-value">
                  {predictions.length > 0
                    ? new Date(predictions[0].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                </span>
                <span className="stat-label">Last Analysis</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent analyses */}
      <div className="dashboard-section">
        <div className="section-title-row">
          <h2>Recent Analyses</h2>
          {predictions.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
              View All <ArrowRight size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSkeleton variant="card" height={70} count={3} />
        ) : predictions.length === 0 ? (
          <EmptyState
            icon={FileAudio}
            title="No analyses yet"
            description="Upload or record your baby's audio to get started with AI-powered cry analysis."
            action={
              <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
                Start First Analysis
              </button>
            }
          />
        ) : (
          <div className="activity-list">
            {predictions.map((p) => (
              <div key={p.id} className="activity-item card">
                <div className="activity-emotion">
                  <span className="activity-emotion-name">{p.emotion}</span>
                  <span className={`badge ${RISK_COLORS[p.risk_category] || 'badge-info'}`}>
                    {p.risk_category}
                  </span>
                </div>
                <div className="activity-scores">
                  <span>Distress: <strong>{Math.round(p.distress_score)}%</strong></span>
                  <span>Confidence: <strong>{Math.round(p.confidence_score)}%</strong></span>
                </div>
                <span className="activity-time">{formatTime(p.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
