import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

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

/**
 * Departments API calls
 */
export async function fetchDepartments(params = {}) {
  return apiClient.get('/departments', { params });
}

export async function createDepartment(departmentData) {
  return apiClient.post('/departments', departmentData);
}

/**
 * Patients API calls
 */
export async function fetchPatients(params = {}) {
  return apiClient.get('/patients', { params });
}

export async function fetchPatientById(id) {
  return apiClient.get(`/patients/${id}`);
}

export async function registerPatient(patientData) {
  return apiClient.post('/patients', patientData);
}

export async function deletePatient(id) {
  return apiClient.delete(`/patients/${id}`);
}

/**
 * Appointments API calls
 */
export async function fetchAppointments(params = {}) {
  return apiClient.get('/appointments', { params });
}

export async function bookAppointment(appointmentData) {
  return apiClient.post('/appointments', appointmentData);
}

export async function cancelAppointment(id, cancellationReason, cancelledBy) {
  return apiClient.patch(`/appointments/${id}/cancel`, { cancellationReason, cancelledBy });
}

export async function updateAppointmentStatus(id, status, doctorNotes) {
  return apiClient.patch(`/appointments/${id}/status`, { status, doctorNotes });
}

export async function approveAppointment(id, approvedBy) {
  return apiClient.patch(`/appointments/${id}/approve`, { approvedBy });
}

export async function deleteAppointment(id) {
  return apiClient.delete(`/appointments/${id}`);
}

/**
 * User login service call
 * @param {{ email: string, password: string, role?: string }} credentials
 */
export async function loginUser(credentials) {
  const response = await apiClient.post('/auth/login', credentials);
  if (response.data?.token) {
    sessionStorage.setItem('medicore_auth_token', response.data.token);
    sessionStorage.setItem('medicore_user', JSON.stringify(response.data.user));
  }
  return response;
}

/**
 * Clear user authentication session
 */
export function logoutUser() {
  sessionStorage.removeItem('medicore_auth_token');
  sessionStorage.removeItem('medicore_user');
}

/**
 * Get active session user from storage
 */
export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem('medicore_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default apiClient;

