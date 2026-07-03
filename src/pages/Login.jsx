import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert.js';
import { useAuth } from '../hooks/useAuth.js';

const initialForm = {
  email: '',
  password: '',
  role: 'student',
};

function Login() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const errorShownRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam && !errorShownRef.current) {
      errorShownRef.current = true;
      showAlert({ type: 'error', title: 'Authentication failed', message: errorParam });
      // Remove error from URL to prevent it from showing on refresh
      navigate('/login', { replace: true });
    }
  }, [location.search, navigate, showAlert]);

  const redirectAfterAuth = () => {
    const fallback = '/';
    navigate(location.state?.from?.pathname || fallback, { replace: true });
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await login(form);
      showAlert({ type: 'success', title: 'Welcome back!', message: `Signed in as ${result.user.name}.` });
      redirectAfterAuth(result.user.role);
    } catch (err) {
      showAlert({ type: 'error', title: 'Sign-in failed', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle(form.role);
      if (result) {
        showAlert({ type: 'success', title: 'Welcome!', message: `Signed in with Google as ${result.user.name}.` });
        redirectAfterAuth(result.user.role);
      }
    } catch {
      showAlert({ type: 'error', title: 'Google sign-in failed', message: 'Google login could not be started.' });
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <section className="auth-layout">
      <div className="auth-shell split">
        <div className="auth-visual">
          {/* Animated background elements */}
          <div className="av-bg-mesh" aria-hidden="true" />
          <div className="av-orb av-orb-1" aria-hidden="true" />
          <div className="av-orb av-orb-2" aria-hidden="true" />
          <div className="av-orb av-orb-3" aria-hidden="true" />
          <div className="av-orb av-orb-4" aria-hidden="true" />
          <svg className="av-constellation" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="60" cy="80" r="3" fill="rgba(255,255,255,0.55)" />
            <circle cx="180" cy="40" r="2" fill="rgba(255,255,255,0.4)" />
            <circle cx="300" cy="100" r="2.5" fill="rgba(255,255,255,0.5)" />
            <circle cx="340" cy="200" r="2" fill="rgba(255,255,255,0.35)" />
            <circle cx="260" cy="300" r="3" fill="rgba(255,255,255,0.45)" />
            <circle cx="80" cy="340" r="2" fill="rgba(255,255,255,0.4)" />
            <circle cx="150" cy="420" r="2.5" fill="rgba(255,255,255,0.3)" />
            <circle cx="360" cy="380" r="2" fill="rgba(255,255,255,0.38)" />
            <circle cx="200" cy="200" r="1.5" fill="rgba(255,255,255,0.55)" />
            <circle cx="120" cy="180" r="1.5" fill="rgba(255,255,255,0.3)" />
            <line x1="60" y1="80" x2="180" y2="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1="180" y1="40" x2="300" y2="100" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="300" y1="100" x2="340" y2="200" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="340" y1="200" x2="260" y2="300" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="260" y1="300" x2="80" y2="340" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="80" y1="340" x2="150" y2="420" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="60" y1="80" x2="120" y2="180" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <line x1="120" y1="180" x2="200" y2="200" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="200" y1="200" x2="260" y2="300" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          </svg>
          <div className="av-ring av-ring-1" aria-hidden="true" />
          <div className="av-ring av-ring-2" aria-hidden="true" />
          <div className="av-glow" aria-hidden="true" />

          <div className="visual-inner">
            <span className="visual-tag">ProjectSphere workspace</span>
            <h1>Welcome back!</h1>
            <p className="visual-sub">Sign in to continue to your projects and reviews.</p>
          </div>
          <div className="visual-panel">
            <div className="visual-panel-item">
              <span>Secure login</span>
              <strong>Access your workspace instantly</strong>
            </div>
            <div className="visual-panel-item small">
              <span>Built for students and recruiters</span>
              <strong>Keep projects and feedback organized</strong>
            </div>
          </div>
        </div>

        <div className="panel auth-card split-card">
          <div className="auth-card-top">
            <div className="auth-brand">
              <div className="brand-mark">PS</div>
              <div className="brand">ProjectSphere</div>
            </div>
            <h2 className="section-title">Sign In</h2>
            <p className="page-copy">Use your account to access ProjectSphere.</p>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={updateField}
                required
              />
            </div>

            <div className="form-actions-row">
              <div>
                <label className="field-hint"><input type="checkbox" /> Remember me</label>
              </div>
              <div className="forgot-password-wrap">
                <a
                  href="/forgot-password"
                  className="forgot-password-action"
                  onClick={(event) => {
                    event.preventDefault();
                    handleForgotPassword();
                  }}
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="divider">or</div>

            <button className="button button-google" type="button" onClick={handleGoogleLogin}>
              <svg className="google-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 533.5 544.3" width="18" height="18" aria-hidden="true">
                <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.5-36.3-4.3-53.6H272v101.5h146.9c-6.3 34-25 62.8-53.4 82v68.1h86.3c50.6-46.6 79.7-115.2 79.7-198.0z"/>
                <path fill="#34A853" d="M272 544.3c72.3 0 133-23.9 177.3-64.8l-86.3-68.1c-24 16.1-54.8 25.6-91 25.6-69.9 0-129.2-47.1-150.4-110.5H35.1v69.4C79.9 479.9 168.7 544.3 272 544.3z"/>
                <path fill="#FBBC05" d="M121.6 325.4c-10.9-32.8-10.9-68 0-100.8V155.2H35.1c-39.3 78.6-39.3 169.9 0 248.5l86.5-78.3z"/>
                <path fill="#EA4335" d="M272 107.6c39.2 0 74.4 13.5 102.2 39.9l76.6-76.6C405 24.1 346.3 0 272 0 168.7 0 79.9 64.4 35.1 155.2l86.5 69.7C142.8 154.7 202.1 107.6 272 107.6z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>

          <p className="auth-switch">
            New to ProjectSphere? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Login;
