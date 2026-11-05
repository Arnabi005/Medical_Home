import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/**
 * Pre-configured Axios instance for MediCore API communication
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach authentication token if present
apiClient.interceptors.request.use(
  (config) => {
    // Only store non-sensitive JWT token in sessionStorage or memory (Never passwords or sensitive patient PHI)
    const token = sessionStorage.getItem('medicore_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error formatting and handle auth expiry
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const formattedError = {
      message:
        error.response?.data?.message ||
        error.message ||
        'An unexpected error occurred while communicating with MediCore server.',
      status: error.response?.status || 500,
      details: error.response?.data?.details || null,
      raw: error,
    };

    // If 401 Unauthorized, notify or clear session if appropriate
    if (error.response?.status === 401) {
      sessionStorage.removeItem('medicore_auth_token');
    }

    return Promise.reject(formattedError);
  }
);

/**
 * Health check API service call
 */
export async function fetchHealthStatus() {
  return apiClient.get('/health');
}

export default apiClient;

