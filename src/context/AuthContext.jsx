import { useMemo, useState, useEffect } from 'react';
import AuthContext from './auth-context.js';
import * as authService from '../services/authService.js';

const STORAGE_KEY = 'projectsphere_auth';

const dashboardPaths = {
  Student: '/dashboard/student',
  Lecturer: '/dashboard/lecturer',
  Recruiter: '/dashboard/recruiter',
  Admin: '/dashboard/lecturer',
};

const roleLabels = {
  Student: 'Student',
  Lecturer: 'Lecturer',
  Recruiter: 'Recruiter',
  Admin: 'Admin',
};

const getStoredAuth = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const saveAuth = (payload) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verify token and load user data on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedAuth = getStoredAuth();
      if (storedAuth && storedAuth.token && !storedAuth.token.startsWith('session-token-')) {
        try {
          const response = await authService.getMe();
          if (response.success && response.user) {
            const updatedAuth = {
              token: storedAuth.token,
              user: response.user
            };
            setAuth(updatedAuth);
            saveAuth(updatedAuth);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          clearAuth();
          setAuth(null);
        }
      }
    };

    verifyAuth();
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      
      if (response.success && response.token && response.user) {
        const payload = {
          token: response.token,
          user: response.user,
        };

        setAuth(payload);
        saveAuth(payload);
        return payload;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Login failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Use OTP registration flow
      const response = await authService.registerWithOTP(formData);
      
      if (response.success) {
        // Return OTP sent confirmation
        return {
          success: true,
          message: response.message,
          email: formData.email,
          requiresOTP: true
        };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Registration failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email, otp) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.verifyOTP(email, otp);
      
      if (response.success && response.token && response.user) {
        const payload = {
          token: response.token,
          user: response.user,
        };

        setAuth(payload);
        saveAuth(payload);
        return payload;
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'OTP verification failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.resendOTP(email);
      return response;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Failed to resend OTP');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    // Redirect to backend Google OAuth
    authService.loginWithGoogle();
  };

  const completeGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.handleGoogleCallback();

      if (response.token && response.user) {
        const payload = {
          token: response.token,
          user: response.user,
        };

        setAuth(payload);
        saveAuth(payload);
        return payload;
      }

      throw new Error('Google authentication failed');
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Google authentication failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.updateProfile(profileData);
      
      if (response.success && response.user) {
        const updatedAuth = {
          ...auth,
          user: response.user
        };
        setAuth(updatedAuth);
        saveAuth(updatedAuth);
        return response;
      }
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Update failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Password change failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async (imageFile) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.updateProfilePicture(imageFile);

      if (response.success && response.user) {
        const updatedAuth = {
          ...auth,
          user: response.user,
        };
        setAuth(updatedAuth);
        saveAuth(updatedAuth);
        return response;
      }
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Profile picture update failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const removeProfilePicture = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.removeProfilePicture();

      if (response.success && response.user) {
        const updatedAuth = {
          ...auth,
          user: response.user,
        };
        setAuth(updatedAuth);
        saveAuth(updatedAuth);
        return response;
      }

      return response;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Profile picture removal failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.deleteAccount();
      clearAuth();
      setAuth(null);
      return response;
    } catch (err) {
      const errorMsg = typeof err === 'string' ? err : (err.response?.data?.error || err.message || 'Account deletion failed');
      setError(errorMsg);
      throw new Error(errorMsg, { cause: err });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (auth?.token && !auth.token.startsWith('session-token-')) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      setAuth(null);
    }
  };

  const value = useMemo(() => ({
    user: auth?.user || null,
    token: auth?.token || null,
    isAuthenticated: Boolean(auth?.token),
    loading,
    error,
    roleLabels,
    dashboardPaths,
    login,
    register,
    verifyOTP,
    resendOTP,
    loginWithGoogle,
    completeGoogleLogin,
    updateUserProfile,
    changePassword,
    updateProfilePicture,
    removeProfilePicture,
    deleteAccount,
    logout,
    clearError: () => setError(null),
  }), [auth, loading, error]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
