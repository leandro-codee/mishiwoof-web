import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/iniciar-sesion';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// File upload client (multipart/form-data)
export const apiClientUpload: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s for file uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add auth token to upload client
apiClientUpload.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;

// Error handler helper
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    
    if (axiosError.response?.data) {
      return {
        message: axiosError.response.data.message || axiosError.response.data.error || 'Error en el servidor',
        code: axiosError.response.status?.toString(),
        details: axiosError.response.data as Record<string, unknown>,
      };
    }
    
    if (axiosError.request) {
      return {
        message: 'No se pudo conectar con el servidor',
        code: 'NETWORK_ERROR',
      };
    }
  }

  return {
    message: error instanceof Error ? error.message : 'Error desconocido',
    code: 'UNKNOWN_ERROR',
  };
};
