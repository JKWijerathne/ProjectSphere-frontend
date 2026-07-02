// API Configuration and Axios Instance
import axios from 'axios';

// Base API URL from environment variable with a safe local fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('projectsphere_auth');

    if (authData) {
      try {
        const { token } = JSON.parse(authData);
        if (token && !token.startsWith('session-token-')) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - Clear auth and redirect to login
        localStorage.removeItem('projectsphere_auth');
        // Do not force a page reload if the user is already trying to log in
        if (!error.config.url.includes('/auth/login') && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // Forbidden - User doesn't have permission
        console.error('Access denied:', data.error || 'Permission denied');
      } else if (status === 404) {
        // Not found
        console.error('Resource not found:', data.error);
      } else if (status === 429) {
        // Rate limit exceeded
        console.error('Too many requests:', data.error);
      } else if (status >= 500) {
        // Server error
        console.error('Server error:', data.error || 'Internal server error');
      }

      // Return the error message from backend
      return Promise.reject(data.error || error.message);
    } else if (error.request) {
      // Request made but no response
      console.error('Network error:', error.message);
      return Promise.reject('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error.message);
    }
  }
);

export default api;
