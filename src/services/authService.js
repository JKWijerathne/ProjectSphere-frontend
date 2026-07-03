// Authentication Service - API calls for auth operations
import api from '../config/api.js';

// Register with OTP verification
export const registerWithOTP = async (userData) => {
  const response = await api.post('/otp/register', {
    name: userData.fullName,
    email: userData.email,
    password: userData.password,
    confirmPassword: userData.confirmPassword,
    role: userData.role,
  });
  return response.data;
};

// Verify OTP and create account
export const verifyOTP = async (email, otp) => {
  const response = await api.post('/otp/verify', {
    email,
    otp,
  });
  return response.data;
};

// Resend OTP
export const resendOTP = async (email) => {
  const response = await api.post('/otp/resend', {
    email,
  });
  return response.data;
};

// Check pending registration status
export const checkPendingStatus = async (email) => {
  const response = await api.get(`/otp/status?email=${email}`);
  return response.data;
};

// Login with email and password
export const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

// Register without OTP (if direct registration is needed)
export const register = async (userData) => {
  const response = await api.post('/auth/register', {
    name: userData.fullName,
    email: userData.email,
    password: userData.password,
    confirmPassword: userData.confirmPassword,
    role: userData.role,
  });
  return response.data;
};

// Get current user profile
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const response = await api.put('/auth/profile', profileData);
  return response.data;
};

// Change password
export const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  const response = await api.put('/auth/password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return response.data;
};

// Request password reset email
export const forgotPassword = async (email) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
  const payload = { email, origin };
  const resetPaths = [
    '/auth/forgot-password',
    '/forgot-password',
    'http://localhost:5001/api/auth/forgot-password',
    'http://127.0.0.1:5001/api/auth/forgot-password',
  ];
  let lastError;

  for (const path of resetPaths) {
    try {
      const response = await api.post(path, payload);
      return response.data;
    } catch (error) {
      lastError = error;
      const message = typeof error === 'string' ? error : error?.message;
      if (!/route not found|network error/i.test(message || '')) {
        throw error;
      }
    }
  }

  throw lastError;
};

// Reset password with email token
export const resetPassword = async ({ token, password, confirmPassword }) => {
  const payload = { password, confirmPassword };
  const resetPaths = [
    `/auth/reset-password/${token}`,
    `/reset-password/${token}`,
    `http://localhost:5001/api/auth/reset-password/${token}`,
    `http://127.0.0.1:5001/api/auth/reset-password/${token}`,
  ];
  let lastError;

  for (const path of resetPaths) {
    try {
      const response = await api.put(path, payload);
      return response.data;
    } catch (error) {
      lastError = error;
      const message = typeof error === 'string' ? error : error?.message;
      if (!/route not found|network error/i.test(message || '')) {
        throw error;
      }
    }
  }

  throw lastError;
};

// Upload profile picture
export const updateProfilePicture = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.patch('/auth/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Remove profile picture
export const removeProfilePicture = async () => {
  const response = await api.delete('/auth/profile-picture');
  return response.data;
};

// Delete current account
export const deleteAccount = async () => {
  const response = await api.delete('/auth/account');
  return response.data;
};

// Logout
export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

// Google OAuth - Redirect to backend Google auth
export const loginWithGoogle = () => {
  const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL || 'http://localhost:5000/api/auth/google';
  const currentOrigin = window.location.origin;
  window.location.href = `${googleAuthUrl}?origin=${encodeURIComponent(currentOrigin)}`;
};

// Handle Google OAuth callback (called after redirect)
export const handleGoogleCallback = async () => {
  // Token should be in URL or passed by backend
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Fetch user data with token
    const response = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { token, user: response.data.user };
  }
  
  throw new Error('No token received from Google authentication');
};
