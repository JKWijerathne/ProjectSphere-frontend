import api from '../config/api.js';

export async function getNotifications() {
  const { data } = await api.get('/notifications');
  return data.notifications || [];
}

export async function markNotificationAsRead(notificationId) {
  const { data } = await api.put(`/notifications/${notificationId}/read`);
  return data.notification;
}
