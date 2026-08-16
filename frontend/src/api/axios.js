import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

const clearSessionAndRedirect = () => {
  localStorage.removeItem('nitj_token');
  localStorage.removeItem('nitj_user');
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Request interceptor — attach JWT token
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

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
      clearSessionAndRedirect();
    }
    throw error;
  }
};

export default api;
