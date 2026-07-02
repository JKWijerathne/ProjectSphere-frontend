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

// Upload profile picture
export const updateProfilePicture = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await api.patch('/auth/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
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
