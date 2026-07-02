import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAlert } from '../hooks/useAlert.js';
import { useAuth } from '../hooks/useAuth.js';
import OTPVerification from '../components/auth/OTPVerification.jsx';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'Student',
  studentId: '',
  department: '',
  customDepartment: '',
  academicYear: '',
  staffId: '',
  company: '',
  jobTitle: '',
};

const departmentOptions = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Cyber Security',
  'Business Information Systems',
  'Other',
];

function Register() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert } = useAlert();
  const [showOTP, setShowOTP] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState('');
  const { dashboardPaths, register } = useAuth();
  const navigate = useNavigate();

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const updateRole = (event) => {
    const { value } = event.target;
    setForm((current) => ({ ...current, role: value }));
  };

  const updateDepartment = (event) => {
    const { value } = event.target;
    setForm((current) => ({
      ...current,
      department: value,
      customDepartment: value === 'Other' ? current.customDepartment : '',
    }));
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
      const result = await register({
        ...form,
        department: form.department === 'Other' ? form.customDepartment : form.department,
      });
      
      // Check if OTP verification is required
      if (result.requiresOTP) {
        setRegistrationEmail(form.email);
        setShowOTP(true);
      } else if (result.user && result.token) {
        // Direct login (no OTP required)
        showAlert({ type: 'success', title: 'Account created!', message: `Welcome to ProjectSphere, ${result.user.name}.` });
        navigate(dashboardPaths[result.user.role] || '/', { replace: true });
      }
    } catch (err) {
      showAlert({ type: 'error', title: 'Registration failed', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOTPSuccess = (user) => {
    // Navigate to dashboard after successful OTP verification
    navigate('/', { replace: true });
  };

  const handleOTPCancel = () => {
    setShowOTP(false);
    setRegistrationEmail('');
  };

  // Show OTP verification screen if needed
  if (showOTP) {
    return (
      <OTPVerification
        email={registrationEmail}
        onSuccess={handleOTPSuccess}
        onCancel={handleOTPCancel}
      />
    );
  }

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
            <span className="visual-tag">New space</span>
            <h1>Create an account</h1>
            <p className="visual-sub">Join ProjectSphere to manage and showcase projects.</p>
          </div>
          <div className="visual-panel">
            <div className="visual-panel-item">
              <span>Welcome aboard</span>
              <strong>Start building your profile</strong>
            </div>
            <div className="visual-panel-item small">
              <span>ProjectSphere is your hub</span>
              <strong>Showcase work with confidence</strong>
            </div>
          </div>
        </div>

        <div className="panel auth-card split-card">
          <div className="auth-card-top">
            <div className="auth-brand">
              <div className="brand-mark">PS</div>
              <div className="brand">ProjectSphere</div>
            </div>
            <h2 className="section-title">Register</h2>
            <p className="page-copy">Create your account and set up a profile.</p>
          </div>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="register-name">Full name</label>
                <input
                  id="register-name"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={updateField}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={updateField}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="register-confirm-password">Confirm password</label>
                <input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={updateField}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="register-role">Account type</label>
                <select id="register-role" name="role" value={form.role} onChange={updateRole}>
                  <option value="Student">Student</option>
                  <option value="Lecturer">Lecturer</option>
                  <option value="Recruiter">Recruiter</option>
                </select>
              </div>
            </div>

            <button className="button button-primary button-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in instead</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default Register;
