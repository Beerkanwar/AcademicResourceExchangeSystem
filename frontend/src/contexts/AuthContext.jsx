import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load persisted auth on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('nitj_token');
    const storedUser = localStorage.getItem('nitj_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('nitj_token');
        localStorage.removeItem('nitj_refresh_token');
        localStorage.removeItem('nitj_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data.data;
    const accessToken = data.accessToken || data.token;
    const refreshToken = data.refreshToken;

    setToken(accessToken);
    setUser(data.user);
    localStorage.setItem('nitj_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('nitj_refresh_token', refreshToken);
    }
    localStorage.setItem('nitj_user', JSON.stringify(data.user));
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('nitj_refresh_token');
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch {
      // Always clear local session even if revoke fails
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('nitj_token');
      localStorage.removeItem('nitj_refresh_token');
      localStorage.removeItem('nitj_user');
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('nitj_user', JSON.stringify(updatedUser));
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
