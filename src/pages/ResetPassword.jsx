import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert.js';
import { resetPassword } from '../services/authService.js';

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password !== form.confirmPassword) {
      showAlert({
        type: 'error',
        title: 'Passwords do not match',
        message: 'Please make sure both password fields are the same.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      showAlert({
        type: 'success',
        title: 'Password updated',
        message: response.message,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      const message = typeof err === 'string'
        ? err
        : err.message || 'Unable to reset your password. Please try again.';

      showAlert({
        type: 'error',
        title: 'Reset failed',
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
          <h2 className="section-title">Create new password</h2>
          <p className="page-copy">Choose a strong password for your ProjectSphere account.</p>
        </div>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="reset-password">New password</label>
            <input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={updateField}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="reset-confirm-password">Confirm password</label>
            <input
              id="reset-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter your new password"
              value={form.confirmPassword}
              onChange={updateField}
              required
            />
          </div>

          <p className="field-hint">
            Use at least one uppercase letter, one lowercase letter, and one number.
          </p>

          <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p className="auth-switch">
          Back to <Link to="/login">sign in</Link>
        </p>
      </div>
    </section>
  );
}

export default ResetPassword;
