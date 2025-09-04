// src/services/http.js
import axios from 'axios';

const http = axios.create({
  baseURL: 'https://backend-21964697315.europe-west1.run.app/api',
});

http.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  const sessionToken = localStorage.getItem('sessionToken');
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (sessionToken) config.headers['X-Session-Token'] = sessionToken;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const code = error?.response?.data?.code;
    if (
      error?.response?.status === 401 &&
      (code === 'TOKEN_EXPIRED' || code === 'SESSION_INVALID' || code === 'MISSING_TOKEN')
    ) {
      localStorage.clear();
      window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export default http;
