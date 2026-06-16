import { supabase } from '../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

/** Get the current session token */
async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

/** Build Authorization headers */
async function authHeaders() {
  const token = await getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Analyze audio with upload progress tracking.
 * Sends the audio file to the backend /analyze endpoint with auth.
 */
export function analyzeAudioWithProgress(fileOrBlob, onProgress = () => {}) {
  const formData = new FormData();
  const filename = fileOrBlob.name ?? `recording-${Date.now()}.webm`;
  formData.append('file', fileOrBlob, filename);

  return new Promise(async (resolve, reject) => {
    const token = await getToken();
    const request = new XMLHttpRequest();
    request.open('POST', `${API_BASE_URL}/analyze`);

    if (token) {
      request.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      try {
        const payload = JSON.parse(request.responseText || '{}');
        if (request.status >= 200 && request.status < 300) {
          resolve(payload);
        } else if (request.status === 401) {
          reject(new Error('Session expired. Please log in again.'));
        } else {
          reject(new Error(payload.detail ?? 'Analysis failed.'));
        }
      } catch {
        reject(new Error('Failed to parse server response.'));
      }
    };

    request.onerror = () => reject(new Error('Network error while sending audio to CrySense API.'));
    request.send(formData);
  });
}

export async function analyzeAudio(fileOrBlob) {
  return analyzeAudioWithProgress(fileOrBlob);
}

/** Fetch user's prediction history */
export async function fetchPredictions(limit = 20, offset = 0) {
  const headers = await authHeaders();
  const res = await fetch(
    `${API_BASE_URL}/predictions?limit=${limit}&offset=${offset}`,
    { headers }
  );
  if (!res.ok) throw new Error('Failed to fetch predictions.');
  return res.json();
}

/** Fetch user's prediction stats */
export async function fetchPredictionStats() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/predictions/stats`, { headers });
  if (!res.ok) throw new Error('Failed to fetch stats.');
  return res.json();
}

/** Delete a prediction by ID */
export async function deletePredictionApi(predictionId) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/predictions/${predictionId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete prediction.');
  return res.json();
}

/** Submit contact form */
export async function submitContactForm(data) {
  const headers = await authHeaders();
  headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? 'Failed to send message.');
  }
  return res.json();
}

/** Check backend health */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
