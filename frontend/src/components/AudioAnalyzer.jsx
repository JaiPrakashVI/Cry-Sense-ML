import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecorder } from '../hooks/useRecorder';
import { analyzeAudioWithProgress } from '../services/api';
import {
  Upload, Mic, MicOff, FileAudio, Loader,
  CheckCircle, AlertCircle, X, Play, Square,
} from 'lucide-react';

function mapPrediction(raw) {
  return {
    distressScore: raw.distress_score ?? raw.distressScore ?? 0,
    confidenceScore: raw.confidence_score ?? raw.confidenceScore ?? 0,
    emotion: raw.emotion ?? '',
    riskCategory: raw.risk_category ?? raw.riskCategory ?? '',
    summary: raw.summary ?? '',
    emotionDistribution: raw.emotion_distribution ?? raw.emotionDistribution ?? {},
    audioDetails: raw.audio_details ?? raw.audioDetails ?? {},
  };
}

export default function AudioAnalyzer({ setResult }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState('upload'); // 'upload' | 'record'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const {
    recording,
    recordedBlob,
    durationSeconds,
    error: recorderError,
    startRecording,
    stopRecording,
  } = useRecorder();

  // Clean up preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Auto-set file when recording completes
  useEffect(() => {
    if (recordedBlob) {
      setFile(recordedBlob);
      setPreview(URL.createObjectURL(recordedBlob));
    }
  }, [recordedBlob]);

  const handleFile = useCallback((f) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStatus('idle');
    setError('');
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file) return;
    setStatus('loading');
    setProgress(0);
    setError('');

    try {
      const raw = await analyzeAudioWithProgress(file, setProgress);
      const result = mapPrediction(raw);
      setResult(result);
      setStatus('success');
      setTimeout(() => navigate('/results'), 700);
    } catch (err) {
      setError(err.message || 'Analysis failed.');
      setStatus('error');
    }
  };

  const reset = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setStatus('idle');
    setProgress(0);
    setError('');
  };

  return (
    <div className="analyzer-container">
      {/* Mode tabs */}
      <div className="analyzer-tabs">
        <button
          className={`analyzer-tab ${mode === 'upload' ? 'active' : ''}`}
          onClick={() => { setMode('upload'); reset(); }}
        >
          <Upload size={18} />
          Upload File
        </button>
        <button
          className={`analyzer-tab ${mode === 'record' ? 'active' : ''}`}
          onClick={() => { setMode('record'); reset(); }}
        >
          <Mic size={18} />
          Record
        </button>
      </div>

      {/* Upload mode */}
      {mode === 'upload' && !file && (
        <div
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="dropzone-icon">
            <FileAudio size={40} strokeWidth={1.5} />
          </div>
          <p className="dropzone-title">Drop your audio file here</p>
          <p className="dropzone-hint">or click to browse — WAV, MP3, FLAC, M4A, WebM, OGG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {/* Record mode */}
      {mode === 'record' && !file && (
        <div className="recorder-panel">
          {!recording ? (
            <button className="recorder-start" onClick={startRecording}>
              <div className="recorder-circle">
                <Mic size={32} />
              </div>
              <span>Tap to start recording</span>
            </button>
          ) : (
            <div className="recorder-active">
              <div className="recorder-pulse">
                <MicOff size={32} />
              </div>
              <span className="recorder-timer">{durationSeconds}s</span>
              <button className="btn btn-danger" onClick={stopRecording}>
                <Square size={16} />
                Stop Recording
              </button>
            </div>
          )}
          {recorderError && (
            <p className="text-danger" style={{ marginTop: '12px' }}>{recorderError}</p>
          )}
        </div>
      )}

      {/* File preview */}
      {file && status !== 'loading' && (
        <div className="audio-preview card">
          <div className="audio-preview-info">
            <FileAudio size={20} />
            <div>
              <p className="audio-filename">{file.name || 'Recorded audio'}</p>
              <p className="audio-size">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={reset} title="Remove">
              <X size={16} />
            </button>
          </div>
          {preview && (
            <audio controls src={preview} className="audio-player" />
          )}
          <button
            className="btn btn-primary btn-block"
            onClick={handleAnalyze}
            disabled={status === 'loading'}
          >
            <Play size={18} />
            Analyze Audio
          </button>
        </div>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="analyzer-loading card">
          <Loader size={32} className="spin" />
          <h3>Analyzing audio...</h3>
          <p>Processing spectrogram and running inference</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{progress}%</span>
        </div>
      )}

      {/* Success toast */}
      {status === 'success' && (
        <div className="toast toast-success">
          <CheckCircle size={18} />
          <span>Analysis complete! Redirecting to results...</span>
        </div>
      )}

      {/* Error toast */}
      {status === 'error' && (
        <div className="toast toast-error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setStatus('idle')}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
