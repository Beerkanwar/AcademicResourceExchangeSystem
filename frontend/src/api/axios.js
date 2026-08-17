import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let refreshPromise = null;

const clearSessionAndRedirect = () => {
  localStorage.removeItem('nitj_token');
  localStorage.removeItem('nitj_refresh_token');
  localStorage.removeItem('nitj_user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const persistTokens = ({ accessToken, refreshToken, user }) => {
  if (accessToken) {
    localStorage.setItem('nitj_token', accessToken);
  }
  if (refreshToken) {
    localStorage.setItem('nitj_refresh_token', refreshToken);
  }
  if (user) {
    localStorage.setItem('nitj_user', JSON.stringify(user));
  }
};

/**
 * Exchange the stored refresh token for a new access/refresh pair.
 * Concurrent 401s share a single in-flight refresh request.
 */
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('nitj_refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  const data = response.data?.data || {};
  const accessToken = data.accessToken || data.token;
  persistTokens({
    accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  });
  return accessToken;
};

// Request interceptor — attach JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nitj_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — refresh on 401, then retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout');

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const accessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        clearSessionAndRedirect();
        return Promise.reject(error);
      }
    }

    if (status === 401 && isAuthEndpoint && !url.includes('/auth/logout')) {
      clearSessionAndRedirect();
    }

    return Promise.reject(error);
  }
);

/**
 * Fetch a file from /uploads with JWT (img/iframe cannot send Authorization).
 */
export const fetchUploadBlob = async (storedFilename) => {
  const token = localStorage.getItem('nitj_token');
  try {
    const response = await axios.get(
      `/uploads/${encodeURIComponent(storedFilename)}`,
      {
        responseType: 'blob',
        timeout: 60000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const accessToken = await refreshPromise;
        const retry = await axios.get(
          `/uploads/${encodeURIComponent(storedFilename)}`,
          {
            responseType: 'blob',
            timeout: 60000,
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        return retry.data;
      } catch {
        clearSessionAndRedirect();
      }
    }
    throw error;
  }
};

export default api;
