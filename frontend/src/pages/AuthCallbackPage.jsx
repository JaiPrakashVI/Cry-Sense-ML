import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Handles OAuth and magic-link callbacks.
 * Supabase redirects here after Google sign-in or password reset.
 * The PKCE flow automatically exchanges the code for a session
 * via detectSessionInUrl, then we redirect to the dashboard.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // For PKCE flow, supabase-js detects the URL params automatically
        // and exchanges the code. We just need to wait for the session.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error.message);
          navigate('/login', { replace: true });
          return;
        }

        if (session) {
          navigate('/dashboard', { replace: true });
        } else {
          // If no session yet, listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, newSession) => {
              if (event === 'SIGNED_IN' && newSession) {
                subscription.unsubscribe();
                navigate('/dashboard', { replace: true });
              } else if (event === 'PASSWORD_RECOVERY') {
                subscription.unsubscribe();
                navigate('/profile', { replace: true });
              }
            }
          );

          // Timeout fallback — redirect to login after 10s
          setTimeout(() => {
            subscription.unsubscribe();
            navigate('/login', { replace: true });
          }, 10000);
        }
      } catch {
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-loading-spinner" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Completing sign in...
        </p>
      </div>
    </div>
  );
}
