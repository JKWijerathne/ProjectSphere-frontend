import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert.js';
import { forgotPassword } from '../services/authService.js';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { showAlert } = useAlert();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(email);
      setSent(true);
      showAlert({
        type: 'success',
        title: 'Check your email',
        message: response.message,
      });
    } catch (err) {
      const message = typeof err === 'string'
        ? err
        : err.message || 'Unable to send the reset email. Please try again.';

      showAlert({
        type: 'error',
        title: 'Reset request failed',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-layout">
      <div className="panel auth-card auth-card-centered">
        <div className="auth-card-top">
          <div className="auth-brand">
            <div className="brand-mark">PS</div>
            <div className="brand">ProjectSphere</div>
          </div>
          <h2 className="section-title">Forgot password</h2>
          <p className="page-copy">Enter your email and we will send a secure reset link.</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {sent && (
            <p className="field-hint" role="status">
              If this email belongs to an email/password account, the reset link is on the way.
            </p>
          )}

          <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="auth-switch">
          Remembered your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPassword;
