import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useAlert } from '../../hooks/useAlert.js';
import {
  getPasswordRuleStatus,
  validatePasswordForm,
  validateProfileImage,
} from '../../utils/passwordValidation.js';
import {
  formatAuthProviders,
  formatMemberSince,
  getRoleAccess,
} from '../../utils/roleAccess.js';

function ProfileAvatar({ user, previewUrl }) {
  const src = previewUrl || user.profilePicture;
  const initial = user.name?.charAt(0)?.toUpperCase() || '?';

  if (src) {
    return <img src={src} alt="" className="profile-avatar-image" />;
  }

  return <span className="profile-avatar-initial">{initial}</span>;
}

export default function DashboardSidebarProfile({ navLinks }) {
  const { user, roleLabels, changePassword, updateProfilePicture, removeProfilePicture, deleteAccount } = useAuth();
  const { showAlert, showConfirm } = useAlert();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [submittingImage, setSubmittingImage] = useState(false);
  const [removingImage, setRemovingImage] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const hasLocalAuth = user.authProviders?.includes('local');
  const access = getRoleAccess(user.role);
  const passwordRules = getPasswordRuleStatus(passwordForm.newPassword);

  const updatePasswordField = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => ({ ...current, [name]: '' }));
  };

  useEffect(() => () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  }, [imagePreview]);

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    setImageError('');

    if (!file) {
      clearSelectedImage();
      return;
    }

    const validationError = validateProfileImage(file);
    if (validationError) {
      setImageError(validationError);
      setSelectedImage(null);
      setImagePreview(null);
      event.target.value = '';
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageSubmit = async (event) => {
    event.preventDefault();
    if (!selectedImage) {
      setImageError('Please select an image file');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Update profile picture?',
      message: 'Your new profile picture will be visible across the platform.',
      confirmLabel: 'Update picture',
    });

    if (!confirmed) return;

    setSubmittingImage(true);
    try {
      await updateProfilePicture(selectedImage);
      clearSelectedImage();
      showAlert({
        type: 'success',
        title: 'Profile picture updated',
        message: 'Your new profile picture is now live.',
      });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Update failed',
        message: err.message,
      });
    } finally {
      setSubmittingImage(false);
    }
  };

  const handleImageRemove = async () => {
    const confirmed = await showConfirm({
      title: 'Remove profile picture?',
      message: 'Your profile will show your initials until you upload another picture.',
      confirmLabel: 'Remove picture',
      variant: 'danger',
    });

    if (!confirmed) return;

    setRemovingImage(true);
    try {
      await removeProfilePicture();
      clearSelectedImage();
      showAlert({
        type: 'success',
        title: 'Profile picture removed',
        message: 'Your profile now uses your initials.',
      });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Remove failed',
        message: err.message,
      });
    } finally {
      setRemovingImage(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const errors = validatePasswordForm(passwordForm);
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const confirmed = await showConfirm({
      title: 'Change password?',
      message: 'You will need to use your new password the next time you sign in.',
      confirmLabel: 'Change password',
    });

    if (!confirmed) return;

    setSubmittingPassword(true);
    try {
      await changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showAlert({
        type: 'success',
        title: 'Password changed',
        message: 'Your password has been updated successfully.',
      });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Password change failed',
        message: err.message,
      });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handleAccountDelete = async () => {
    const confirmed = await showConfirm({
      title: 'Delete account?',
      message: 'This permanently deletes your account and removes every project you uploaded.',
      confirmLabel: 'Delete account',
      variant: 'danger',
    });

    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      await deleteAccount();
      showAlert({
        type: 'success',
        title: 'Account deleted',
        message: 'Your account and uploaded projects were removed.',
      });
      navigate('/login', { replace: true });
    } catch (err) {
      showAlert({
        type: 'error',
        title: 'Delete failed',
        message: err.message,
      });
    } finally {
      setDeletingAccount(false);
    }
  };

  const readOnlyValues = {
    email: user.email,
    role: roleLabels[user.role] || user.role,
    authProviders: formatAuthProviders(user.authProviders),
    createdAt: formatMemberSince(user.createdAt),
  };

  return (
    <>
      <div className="sidebar-profile-header">
        <div className="profile-avatar-wrap">
          <ProfileAvatar user={user} previewUrl={imagePreview} />
        </div>
        <span className="badge blue">{roleLabels[user.role] || user.role}</span>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>

      <nav className="dashboard-menu" aria-label="Dashboard navigation">
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to}>{link.label}</Link>
        ))}
      </nav>

      <section className="sidebar-section" aria-labelledby="credentials-heading">
        <h3 id="credentials-heading" className="sidebar-section-title">Account credentials</h3>
        <dl className="credentials-list">
          {access.readOnly.map((item) => (
            <div className="credentials-item" key={item.value}>
              <dt>{item.label}</dt>
              <dd>{readOnlyValues[item.value]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sidebar-section" aria-labelledby="picture-heading">
        <h3 id="picture-heading" className="sidebar-section-title">Profile picture</h3>
        <form className="sidebar-form" onSubmit={handleImageSubmit}>
          <input
            ref={fileInputRef}
            id="profile-picture-input"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            className="profile-picture-file-input"
            aria-label="Choose profile picture"
          />
          <div className="profile-picture-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={submittingImage || removingImage}
            >
              {user.profilePicture ? 'Change picture' : 'Choose picture'}
            </button>
            {selectedImage ? (
              <button
                type="button"
                className="button button-secondary"
                onClick={clearSelectedImage}
                disabled={submittingImage || removingImage}
              >
                Clear selection
              </button>
            ) : user.profilePicture ? (
              <button
                type="button"
                className="button button-danger"
                onClick={handleImageRemove}
                disabled={removingImage || submittingImage}
              >
                {removingImage ? 'Removing…' : 'Remove picture'}
              </button>
            ) : null}
          </div>
          <p className="field-hint">
            {selectedImage ? `Ready to upload: ${selectedImage.name}` : 'JPEG, PNG, GIF, or WebP. Max 5 MB.'}
          </p>
          {imageError && <p className="field-error" role="alert">{imageError}</p>}
          <button
            type="submit"
            className="button button-primary sidebar-submit"
            disabled={!selectedImage || submittingImage || removingImage}
          >
            {submittingImage ? 'Uploading…' : 'Save new picture'}
          </button>
        </form>
      </section>

      {hasLocalAuth && (
        <section className="sidebar-section" aria-labelledby="password-heading">
          <h3 id="password-heading" className="sidebar-section-title">Change password</h3>
          <form className="sidebar-form" onSubmit={handlePasswordSubmit}>
            <label className="sidebar-field">
              <span>Current password</span>
              <input
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={updatePasswordField}
                autoComplete="current-password"
              />
              {passwordErrors.currentPassword && (
                <span className="field-error" role="alert">{passwordErrors.currentPassword}</span>
              )}
            </label>

            <label className="sidebar-field">
              <span>New password</span>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={updatePasswordField}
                autoComplete="new-password"
              />
              {passwordErrors.newPassword && (
                <span className="field-error" role="alert">{passwordErrors.newPassword}</span>
              )}
            </label>

            <label className="sidebar-field">
              <span>Confirm new password</span>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={updatePasswordField}
                autoComplete="new-password"
              />
              {passwordErrors.confirmPassword && (
                <span className="field-error" role="alert">{passwordErrors.confirmPassword}</span>
              )}
            </label>

            <ul className="password-rules" aria-label="Password requirements">
              {passwordRules.map((rule) => (
                <li key={rule.id} className={rule.passed ? 'rule-passed' : 'rule-pending'}>
                  {rule.label}
                </li>
              ))}
            </ul>

            <button
              type="submit"
              className="button button-primary sidebar-submit"
              disabled={submittingPassword}
            >
              {submittingPassword ? 'Saving…' : 'Change password'}
            </button>
          </form>
        </section>
      )}

      {!hasLocalAuth && (
        <section className="sidebar-section">
          <p className="field-hint">
            This account uses Google Sign-In. Password changes are managed through your Google account.
          </p>
        </section>
      )}

      <section className="sidebar-section" aria-labelledby="danger-zone-heading">
        <h3 id="danger-zone-heading" className="sidebar-section-title">Account removal</h3>
        <p className="field-hint">
          Delete your account and remove the projects you uploaded from ProjectSphere.
        </p>
        <button
          type="button"
          className="button button-danger sidebar-submit"
          onClick={handleAccountDelete}
          disabled={deletingAccount}
        >
          {deletingAccount ? 'Deleting…' : 'Delete account'}
        </button>
      </section>
    </>
  );
}
