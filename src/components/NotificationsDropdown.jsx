import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCircle2, Heart, MessageSquare, Sparkles, XCircle } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '../services/notificationService.js';
import { useAuth } from '../hooks/useAuth.js';

const ICONS_BY_TYPE = {
  ProjectApproved: <CheckCircle2 className="w-4 h-4 text-emerald-600" />, 
  ProjectRejected: <XCircle className="w-4 h-4 text-rose-600" />, 
  ProjectLiked: <Heart className="w-4 h-4 text-pink-600" />, 
  ProjectCommented: <MessageSquare className="w-4 h-4 text-slate-700" />, 
  ProjectCreated: <Sparkles className="w-4 h-4 text-cyan-600" />, 
};

function getTimeLabel(createdAt) {
  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsDropdown() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');

    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
      setNotifications((prev) => prev.map((item) => (
        item._id === notification._id ? { ...item, isRead: true } : item
      )));
    }

    if (notification.relatedProject?._id) {
      setOpen(false);
      navigate(`/projects/${notification.relatedProject._id}`);
      return;
    }

    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.isRead).map((notification) =>
      markNotificationAsRead(notification._id).catch(() => null)
    ));
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="notification-dropdown" ref={containerRef}>
      <button
        type="button"
        className="notification-button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open notifications"
        onClick={handleToggle}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <div>
              <p className="notification-panel-title">Notifications</p>
              <p className="notification-panel-subtitle">Recent activity and approval updates</p>
            </div>
            <button
              type="button"
              className="notification-mark-all"
              disabled={unreadCount === 0}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </button>
          </div>

          {loading ? (
            <div className="notification-empty">Loading notifications…</div>
          ) : error ? (
            <div className="notification-empty notification-error">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">No notifications yet.</div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  className={`notification-item ${notification.isRead ? '' : 'notification-item-unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {ICONS_BY_TYPE[notification.type] || <Sparkles className="w-4 h-4 text-slate-500" />}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-meta">
                      <span>{notification.sender?.name || 'System'}</span>
                      <span className="notification-time">{getTimeLabel(notification.createdAt)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
          <Link className="notification-view-all" to="/notifications" onClick={() => setOpen(false)}>
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
