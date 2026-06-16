import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePredictions } from '../hooks/usePredictions';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Clock, Trash2, ChevronLeft, ChevronRight, Filter, FileAudio, AlertTriangle } from 'lucide-react';

const RISK_COLORS = {
  High: 'badge-danger',
  Elevated: 'badge-warning',
  Moderate: 'badge-info',
  Low: 'badge-success',
};

const EMOTIONS = ['All', 'Hunger', 'Pain', 'Sleepy', 'Discomfort', 'Neutral'];

export default function HistoryPage() {
  const navigate = useNavigate();
  const { predictions, loading, totalCount, fetchPredictions, deletePrediction } = usePredictions();

  const [page, setPage] = useState(0);
  const [emotionFilter, setEmotionFilter] = useState('All');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const limit = 10;

  const loadPage = useCallback(() => {
    fetchPredictions(limit, page * limit);
  }, [fetchPredictions, page]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const filtered = emotionFilter === 'All'
    ? predictions
    : predictions.filter((p) => p.emotion === emotionFilter);

  const totalPages = Math.ceil(totalCount / limit);

  const handleDelete = async (id) => {
    setDeleting(true);
    await deletePrediction(id);
    setDeleteId(null);
    setDeleting(false);
    fetchPredictions(limit, page * limit);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Analysis History</h1>
          <p>Review your past cry analyses</p>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <Filter size={16} />
          <select
            className="input filter-select"
            value={emotionFilter}
            onChange={(e) => setEmotionFilter(e.target.value)}
          >
            {EMOTIONS.map((em) => (
              <option key={em} value={em}>{em}</option>
            ))}
          </select>
        </div>
        <span className="history-count">{totalCount} total analyses</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="history-list">
          <LoadingSkeleton variant="card" height={80} count={5} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileAudio}
          title="No analyses yet"
          description="Upload or record audio to start analyzing your baby's cry patterns."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
              Start Analyzing
            </button>
          }
        />
      ) : (
        <>
          <div className="history-list">
            {filtered.map((pred) => (
              <div key={pred.id} className="history-item card">
                <div className="history-item-main">
                  <div className="history-emotion-badge">
                    <span className="history-emotion">{pred.emotion}</span>
                    <span className={`badge ${RISK_COLORS[pred.risk_category] || 'badge-info'}`}>
                      {pred.risk_category}
                    </span>
                  </div>
                  <div className="history-scores">
                    <div className="history-score">
                      <span className="history-score-label">Distress</span>
                      <span className="history-score-value">{Math.round(pred.distress_score)}%</span>
                    </div>
                    <div className="history-score">
                      <span className="history-score-label">Confidence</span>
                      <span className="history-score-value">{Math.round(pred.confidence_score)}%</span>
                    </div>
                  </div>
                </div>
                <div className="history-item-footer">
                  <span className="history-date">
                    <Clock size={14} />
                    {formatDate(pred.created_at)}
                  </span>
                  <div className="history-actions">
                    {deleteId === pred.id ? (
                      <div className="history-delete-confirm">
                        <span>Delete?</span>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(pred.id)}
                          disabled={deleting}
                        >
                          Yes
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDeleteId(null)}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setDeleteId(pred.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="pagination-info">
                Page {page + 1} of {totalPages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
