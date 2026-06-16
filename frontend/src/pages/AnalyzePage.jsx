import AudioAnalyzer from '../components/AudioAnalyzer';
import { FileAudio } from 'lucide-react';

export default function AnalyzePage({ setResult }) {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Cry Analyzer</h1>
        <p>Upload an audio file or record directly from your microphone for AI analysis.</p>
      </div>
      <AudioAnalyzer setResult={setResult} />
    </div>
  );
}
