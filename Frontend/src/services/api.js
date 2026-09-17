import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied via Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Dispatch a custom event so the AuthContext can pick it up and update state
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    
    // Optional global toast error (can be configured per request or disabled if needed)
    // if (error.response && error.response.data && error.response.data.message) {
    //   toast.error(error.response.data.message);
    // }
    
    return Promise.reject(error);
  }
);

export default api;
