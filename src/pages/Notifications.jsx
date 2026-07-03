import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, MessageSquare, Heart, XCircle, Loader2 } from 'lucide-react';
import { getNotifications, markNotificationAsRead } from '../services/notificationService.js';
import { useAlert } from '../hooks/useAlert.js';

const ICONS_BY_TYPE = {
  ProjectApproved: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  ProjectRejected: <XCircle className="w-5 h-5 text-rose-600" />,
  ProjectLiked: <Heart className="w-5 h-5 text-pink-600" />,
  ProjectCommented: <MessageSquare className="w-5 h-5 text-slate-700" />,
  ProjectCreated: <Bell className="w-5 h-5 text-cyan-600" />,
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

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showAlert } = useAlert();

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      const message = typeof err === 'string' ? err : err?.message || 'Failed to load your notifications.';
      setError(message);
      showAlert({ type: 'error', title: 'Notifications failed', message });
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((notification) => (
        notification._id === notificationId ? { ...notification, isRead: true } : notification
      )));
    } catch (err) {
      showAlert({ type: 'error', title: 'Unable to mark read', message: err?.message || 'Something went wrong.' });
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((notification) => !notification.isRead);
    await Promise.all(unread.map((notification) => markNotificationAsRead(notification._id).catch(() => null)));
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  return (
    <section className="page-section bg-slate-50 min-h-screen py-10">
      <div className="container max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <span className="badge blue mb-2 inline-block">Student updates</span>
            <h1 className="section-title text-3xl font-extrabold text-slate-900 flex items-center gap-2">
              <Bell className="w-8 h-8 text-blue-600" /> Notifications
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Real-time updates about approvals, likes, comments, and project status changes.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="button button-secondary"
              onClick={loadNotifications}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={handleMarkAllRead}
              disabled={notifications.every((notification) => notification.isRead) || loading}
            >
              Mark all read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="panel bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center">
            <Loader2 className="w-10 h-10 mx-auto text-blue-500 animate-spin mb-4" />
            <p className="text-slate-500">Loading your notifications…</p>
          </div>
        ) : error ? (
          <div className="panel bg-rose-50 border border-rose-100 rounded-2xl p-8 shadow-sm text-center text-rose-700">
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="panel bg-white border border-slate-200 rounded-2xl p-12 shadow-sm text-center">
            <p className="text-slate-600 text-lg font-semibold mb-2">No notifications yet</p>
            <p className="text-slate-500 text-sm">You’ll receive updates here as your projects are reviewed and liked.</p>
            <Link className="button button-primary mt-6 inline-flex" to="/projects">Browse projects</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <article
                key={notification._id}
                className={`panel bg-white border rounded-2xl p-5 shadow-sm transition ${notification.isRead ? 'border-slate-200' : 'border-blue-300 ring-1 ring-blue-100'}`}
              >
                <div className="flex flex-wrap items-start gap-4">
                  <div className="notification-card-icon">
                    {ICONS_BY_TYPE[notification.type] || <Bell className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-slate-800 font-semibold leading-snug">{notification.message}</p>
                      <button
                        type="button"
                        className="button button-secondary text-xs px-3 py-1"
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={notification.isRead}
                      >
                        {notification.isRead ? 'Read' : 'Mark read'}
                      </button>
                    </div>
                    <div className="text-slate-500 text-sm mt-2 flex flex-wrap items-center gap-2">
                      <span>{notification.sender?.name || 'System'}</span>
                      <span className="text-slate-300">•</span>
                      <span>{getTimeLabel(notification.createdAt)}</span>
                      {notification.relatedProject?.title && (
                        <Link className="text-blue-600 hover:underline" to={`/projects/${notification.relatedProject._id}`}>
                          View project
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
