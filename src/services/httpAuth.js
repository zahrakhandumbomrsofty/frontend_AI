// src/services/httpAuth.js
import axios from 'axios';

// Local auth service base URL (Flask default from task.py runs on 8080)
const httpAuth = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Attach tokens if present (useful for profile/logout/refresh)
httpAuth.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  const sessionToken = localStorage.getItem('sessionToken');
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (sessionToken) config.headers['X-Session-Token'] = sessionToken;
  return config;
});

httpAuth.interceptors.response.use(
  (res) => res,
  (error) => {
    const code = error?.response?.data?.code;
    if (
      error?.response?.status === 401 &&
      (code === 'TOKEN_EXPIRED' || code === 'SESSION_INVALID' || code === 'MISSING_TOKEN')
    ) {
      localStorage.clear();
      // Avoid infinite loops: if already on /login keep it
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default httpAuth;
