import { useNavigate } from 'react-router-dom';
import ResultPanel from '../components/ResultPanel';
import EmptyState from '../components/EmptyState';
import { FileAudio } from 'lucide-react';

export default function ResultsPage({ result }) {
  const navigate = useNavigate();

  if (!result) {
    return (
      <div className="page-container">
        <EmptyState
          icon={FileAudio}
          title="No results to display"
          description="Analyze an audio file first to see your results here."
          action={
            <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
              Go to Analyzer
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Analysis Results</h1>
        <p>AI-powered cry pattern classification</p>
      </div>
      <ResultPanel result={result} />
      <div className="results-actions">
        <button className="btn btn-primary" onClick={() => navigate('/analyze')}>
          Analyze Another
        </button>
        <button className="btn btn-ghost" onClick={() => navigate('/history')}>
          View History
        </button>
      </div>
    </div>
  );
}
