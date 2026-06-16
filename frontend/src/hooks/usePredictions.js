import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export function usePredictions() {
  const { session } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);

  const getHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
  }, [session]);

  const fetchPredictions = useCallback(async (limit = 10, offset = 0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/predictions?limit=${limit}&offset=${offset}`,
        { headers: getHeaders() }
      );
      if (!res.ok) throw new Error('Failed to fetch predictions');
      const data = await res.json();
      setPredictions(data.predictions ?? data.items ?? data);
      setTotalCount(data.total ?? data.count ?? (Array.isArray(data) ? data.length : 0));
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const deletePrediction = useCallback(async (id) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/predictions/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete prediction');
      setPredictions((prev) => prev.filter((p) => p.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [getHeaders]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/predictions/stats`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setStatsLoading(false);
    }
  }, [getHeaders]);

  return {
    predictions,
    loading,
    statsLoading,
    error,
    totalCount,
    stats,
    fetchPredictions,
    deletePrediction,
    fetchStats,
  };
}
