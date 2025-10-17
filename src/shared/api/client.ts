// shared/api/client.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login (you can customize this)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Parse error message
    const errorMessage = 
      error.response?.data?.error || 
      error.response?.data?.detail || 
      error.response?.data?.message || 
      error.message || 
      'An error occurred';

    return Promise.reject(new Error(errorMessage));
  }
);

// Helper function to get full media URL
export function getMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  // If already absolute URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // If relative path, prepend BASE_URL
  if (path.startsWith('/')) {
    return `${BASE_URL}${path}`;
  }
  
  // If no leading slash, add it
  return `${BASE_URL}/${path}`;
}

// Export BASE_URL for other uses
export { BASE_URL };