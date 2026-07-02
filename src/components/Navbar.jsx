import { useEffect, useState } from 'react';
import { LogOut, Moon, Sun } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useAlert } from '../hooks/useAlert.js';

const THEME_STORAGE_KEY = 'projectsphere_theme';

const roleQuickActions = {
  Student: [
    { label: 'My projects', to: '/student/projects', variant: 'secondary' },
    { label: 'Create project', to: '/student/projects/create', variant: 'primary' },
  ],
  Lecturer: [
    { label: 'Approvals', to: '/lecturer/approvals', variant: 'secondary' },
    { label: 'Approved projects', to: '/lecturer/approved-projects', variant: 'primary' },
  ],
  Admin: [
    { label: 'Approvals', to: '/lecturer/approvals', variant: 'secondary' },
    { label: 'Approved projects', to: '/lecturer/approved-projects', variant: 'primary' },
  ],
  Recruiter: [
    { label: 'Saved projects', to: '/recruiter/saved', variant: 'primary' },
  ],
};

function HamburgerIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <>
          <line x1="4" y1="4" x2="18" y2="18" />
          <line x1="18" y1="4" x2="4" y2="18" />
        </>
      ) : (
        <>
          <line x1="3" y1="6" x2="19" y2="6" />
          <line x1="3" y1="11" x2="19" y2="11" />
          <line x1="3" y1="16" x2="19" y2="16" />
        </>
      )}
    </svg>
  );
}

function getInitials(name = '', email = '') {
  const source = name.trim() || email.trim() || 'User';
  const words = source
    .replace(/@.*/, '')
    .split(/\s+/)
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

function getPreferredTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
  } catch {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function Navbar() {
  const { dashboardPaths, isAuthenticated, logout, roleLabels, user } = useAuth();
  const { showConfirm } = useAlert();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(getPreferredTheme);

  const currentRole = user?.role;
  const dashboardPath = dashboardPaths[currentRole] || '/dashboard';
  const primaryLinks = [
    { label: 'Home', to: '/' },
    { label: 'Projects', to: '/projects' },
    ...(isAuthenticated ? [{ label: 'Dashboard', to: dashboardPath }] : []),
  ];
  const quickActions = isAuthenticated ? roleQuickActions[currentRole] || [] : [];
  const displayName = user?.name || user?.email || 'ProjectSphere user';
  const roleLabel = roleLabels[currentRole] || currentRole;
  const profilePicture = user?.profilePicture;
  const initials = getInitials(user?.name, user?.email);

  const handleLogout = async () => {
    const confirmed = await showConfirm({
      title: 'Log out?',
      message: 'Are you sure you want to log out of ProjectSphere?',
      confirmLabel: 'Log out',
      variant: 'danger',
    });

    if (!confirmed) return;

    await logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const close = () => setMenuOpen(false);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures; the current session still gets the theme.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const getRoleChipClass = (role) => {
    switch (role) {
      case 'Student': return 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200';
      case 'Lecturer': return 'bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200';
      case 'Admin': return 'bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200';
      case 'Recruiter': return 'bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200';
      default: return 'role-chip';
    }
  };

  const accountSummary = (
    <div className="nav-profile" title={displayName}>
      <span className="nav-avatar" aria-hidden="true">
        {profilePicture ? (
          <img src={profilePicture} alt="" />
        ) : (
          <span>{initials}</span>
        )}
      </span>
      <span className="nav-profile-details">
        <span className="nav-profile-name">{displayName}</span>
        {roleLabel && (
          <span className={getRoleChipClass(currentRole)}>{roleLabel}</span>
        )}
      </span>
    </div>
  );

  const renderThemeToggle = () => (
    <button
      className="theme-toggle"
      type="button"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggleTheme}
    >
      {isDarkMode ? <Sun size={18} strokeWidth={2.4} /> : <Moon size={18} strokeWidth={2.4} />}
    </button>
  );

  const renderLogoutButton = () => (
    <button
      className="logout-icon-button"
      type="button"
      aria-label="Log out"
      title="Log out"
      onClick={handleLogout}
    >
      <LogOut size={18} strokeWidth={2.4} />
    </button>
  );

  const getMainLinkClass = ({ isActive }) => (
    `nav-link nav-main-link${isActive ? ' nav-main-link-active' : ''}`
  );

  const getActionLinkClass = (variant) => ({ isActive }) => (
    [
      'nav-action-pill',
      variant === 'primary' ? 'nav-action-pill-primary' : 'nav-action-pill-secondary',
      isActive ? 'nav-action-pill-active' : '',
    ].filter(Boolean).join(' ')
  );

  return (
    <header className="site-header">
      <nav className="container navbar" aria-label="Main navigation">
        {/* Brand */}
        <NavLink className="brand" to="/" onClick={close}>
          <span className="brand-mark">PS</span>
          ProjectSphere
        </NavLink>

        {/* Desktop nav */}
        <div className="nav-links nav-primary-links nav-desktop">
          {primaryLinks.map((link) => (
            <NavLink className={getMainLinkClass} key={link.to} to={link.to} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-actions nav-desktop">
          {quickActions.length > 0 && (
            <div className="nav-quick-actions">
              {quickActions.map((link) => (
                <NavLink className={getActionLinkClass(link.variant)} key={link.to} to={link.to}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          )}

          {renderThemeToggle()}

          {isAuthenticated && <NotificationsDropdown />}

          {isAuthenticated ? (
            <>
              <span className="nav-divider" aria-hidden="true" />
              <div className="nav-account">
                {accountSummary}
                {renderLogoutButton()}
              </div>
            </>
          ) : (
            <>
              <NavLink className={getMainLinkClass} to="/login">Sign in</NavLink>
              <NavLink className="button button-primary nav-button" to="/register">Register</NavLink>
            </>
          )}
        </div>

        {/* Hamburger toggle (mobile only) */}
        <button
          className="nav-hamburger"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <HamburgerIcon open={menuOpen} />
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="nav-mobile">
          {primaryLinks.map((link) => (
            <NavLink className="nav-link nav-mobile-link" key={link.to} to={link.to} onClick={close}>
              {link.label}
            </NavLink>
          ))}

          {quickActions.map((link) => (
            <NavLink className="nav-link nav-mobile-link" key={link.to} to={link.to} onClick={close}>
              {link.label}
            </NavLink>
          ))}

          {renderThemeToggle()}

          {isAuthenticated ? (
            <>
              <NavLink className="nav-link nav-mobile-link" to="/notifications" onClick={close}>Notifications</NavLink>
              <div className="nav-mobile-account">
                {accountSummary}
                {renderLogoutButton()}
              </div>
            </>
          ) : (
            <div className="nav-mobile-account">
              <NavLink className="nav-link nav-mobile-link" to="/login" onClick={close}>Sign in</NavLink>
              <NavLink className="button button-primary nav-button" to="/register" onClick={close}>Register</NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
