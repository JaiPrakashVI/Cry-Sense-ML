import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePredictions } from '../hooks/usePredictions';
import { User, Mail, Calendar, Save, Loader, AlertCircle, CheckCircle, Shield, Trash2 } from 'lucide-react';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { stats, statsLoading, fetchStats } = usePredictions();

  const loadStats = useCallback(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const initial = (profile?.full_name || user?.email || 'U').charAt(0).toUpperCase();
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setSaving(true);
    try {
      const { error } = await updateProfile({ full_name: fullName.trim() });
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="profile-layout">
        {/* Profile card */}
        <div className="card profile-info-card">
          <div className="profile-avatar-large">{initial}</div>
          <h2 className="profile-name">{profile?.full_name || 'User'}</h2>
          <p className="profile-email">
            <Mail size={14} />
            {user?.email}
          </p>
          <p className="profile-date">
            <Calendar size={14} />
            Member since {memberSince}
          </p>

          <div className="profile-stats-row">
            {statsLoading ? (
              <LoadingSkeleton variant="rect" height={60} count={2} />
            ) : (
              <>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats?.total_predictions ?? 0}</span>
                  <span className="profile-stat-label">Analyses</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats?.most_common_emotion ?? '—'}</span>
                  <span className="profile-stat-label">Top Emotion</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Edit form */}
        <div className="profile-forms">
          <div className="card">
            <div className="card-header">
              <User size={20} />
              <h3>Personal Information</h3>
            </div>
            <div className="card-body">
              {message.text && (
              <div className={`alert ${message.type === 'error' ? 'alert-error' : 'alert-success'}`}>
                  {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label" htmlFor="profile-name">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    className="input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={user?.email || ''}
                    disabled
                  />
                  <p className="form-hint">Email cannot be changed.</p>
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader size={16} className="spin" /> : <Save size={16} />}
                  <span>Save Changes</span>
                </button>
              </form>
            </div>
          </div>

          {/* Security */}
          <div className="card">
            <div className="card-header">
              <Shield size={20} />
              <h3>Security</h3>
            </div>
            <div className="card-body">
              <p className="text-muted">Password management is handled through Supabase. Use the &quot;Forgot Password&quot; flow to change your password.</p>
            </div>
          </div>

          {/* Danger zone */}
          <div className="card card-danger">
            <div className="card-header">
              <Trash2 size={20} />
              <h3>Danger Zone</h3>
            </div>
            <div className="card-body">
              <p className="text-muted">Deleting your account will permanently remove all your data including analysis history. This action cannot be undone.</p>

              {!showDeleteConfirm ? (
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </button>
              ) : (
                <div className="delete-confirm">
                  <p><strong>Are you sure?</strong> This is irreversible.</p>
                  <div className="delete-confirm-actions">
                    <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </button>
                    <button className="btn btn-danger" onClick={signOut}>
                      Yes, Delete My Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
