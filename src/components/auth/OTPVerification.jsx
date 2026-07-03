import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function OTPVerification({ email, onSuccess, onCancel }) {
  const [otp, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const { verifyOTP, resendOTP } = useAuth();

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOTP(email, otp);
      setSuccess('Account verified successfully!');
      
      // Log for debugging
      console.log('OTP Verification result:', result);
      console.log('User data:', result.user);
      
      // Call onSuccess callback with user data after a short delay
      setTimeout(() => {
        if (onSuccess && result.user) {
          onSuccess(result.user);
        }
      }, 1500); // Increased to 1.5 seconds to allow success message to show
    } catch (err) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await resendOTP(email);
      setSuccess('New OTP sent to your email!');
      setTimeLeft(120); // Reset timer
      setOTP(''); // Clear input
    } catch (err) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="auth-layout">
      <div className="auth-shell">
        <div className="panel auth-card">
          <div className="auth-card-top">
            <div className="auth-brand">
              <div className="brand-mark">PS</div>
              <div className="brand">ProjectSphere</div>
            </div>
            <h2 className="section-title">Verify Your Email</h2>
            <p className="page-copy">
              We've sent a 6-digit verification code to <strong>{email}</strong>
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="otp">Enter OTP Code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                value={otp}
                onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                disabled={loading || timeLeft <= 0}
                autoFocus
                required
              />
              {timeLeft > 0 ? (
                <small className="form-help">
                  Time remaining: <strong>{formatTime(timeLeft)}</strong>
                </small>
              ) : (
                <small className="form-help" style={{ color: 'var(--error)' }}>
                  Code expired! Please request a new one.
                </small>
              )}
            </div>

            <button
              type="submit"
              className="button button-primary button-full"
              disabled={loading || !otp || otp.length !== 6 || timeLeft <= 0}
            >
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="form-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={handleResend}
                className="button button-secondary"
                disabled={loading || timeLeft > 90}
                style={{ flex: 1 }}
              >
                {loading ? 'Sending...' : 'Resend OTP'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="button button-outline"
                disabled={loading}
                style={{ flex: 1 }}
              >
                ← Back
              </button>
            </div>
          </form>

          <div className="auth-info" style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
            <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Didn't receive the code?</p>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li>Check your spam/junk folder</li>
              <li>Verify the email address is correct</li>
              <li>Wait at least 30 seconds before requesting a new code</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
