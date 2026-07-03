import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert.js';
import { useAuth } from '../hooks/useAuth.js';

function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { completeGoogleLogin, dashboardPaths } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const finishGoogleLogin = async () => {
      const error = searchParams.get('error');
      const token = searchParams.get('token');

      if (error) {
        showAlert({ type: 'error', title: 'Google sign-in failed', message: error });
        navigate('/login', { replace: true });
        return;
      }

      if (!token) {
        showAlert({
          type: 'error',
          title: 'Google sign-in failed',
          message: 'Google did not return a login token.',
        });
        navigate('/login', { replace: true });
        return;
      }

      try {
        const result = await completeGoogleLogin();
        showAlert({
          type: 'success',
          title: 'Welcome!',
          message: `Signed in with Google as ${result.user.name}.`,
        });
        navigate(dashboardPaths[result.user.role] || '/dashboard', { replace: true });
      } catch (err) {
        showAlert({
          type: 'error',
          title: 'Google sign-in failed',
          message: err.message,
        });
        navigate('/login', { replace: true });
      }
    };

    finishGoogleLogin();
  }, [completeGoogleLogin, dashboardPaths, navigate, searchParams, showAlert]);

  return (
    <section className="auth-layout">
      <div className="panel auth-card google-callback-card">
        <div className="auth-card-top">
          <div className="auth-brand">
            <div className="brand-mark">PS</div>
            <div className="brand">ProjectSphere</div>
          </div>
          <h2 className="section-title">Completing Google sign-in</h2>
          <p className="page-copy">Please wait while we finish securing your session.</p>
        </div>
      </div>
    </section>
  );
}

export default GoogleCallback;
