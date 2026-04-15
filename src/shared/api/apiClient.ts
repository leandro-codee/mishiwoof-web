import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { getInternalJwtToken, clearAuthStorage } from '@shared/infrastructure/http/token.helper';
import {
  refreshSessionWithRotation,
  shouldSkipAuthRefreshForUrl,
} from '@shared/infrastructure/http/refresh-session';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_PUBLIC_API_URL ||
  'http://localhost:4800/api/v1'
).replace(/\/$/, '');

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token (mismo origen que HttpClient / authStore)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getInternalJwtToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

function attach401RefreshRetry(instance: AxiosInstance) {
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      if (error.response?.status !== 401 || !originalRequest) {
        return Promise.reject(error);
      }

      if (originalRequest._retry) {
        clearAuthStorage();
        if (typeof window !== 'undefined' && window.location.pathname !== '/iniciar-sesion') {
          window.location.href = '/iniciar-sesion';
        }
        return Promise.reject(error);
      }

      const reqUrl = originalRequest.url ?? '';
      const fullUrl = reqUrl.startsWith('http') ? reqUrl : `${API_BASE_URL}${reqUrl.startsWith('/') ? '' : '/'}${reqUrl}`;

      if (shouldSkipAuthRefreshForUrl(fullUrl) || shouldSkipAuthRefreshForUrl(reqUrl)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const { accessToken } = await refreshSessionWithRotation(API_BASE_URL);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return instance(originalRequest);
      } catch {
        clearAuthStorage();
        if (typeof window !== 'undefined' && window.location.pathname !== '/iniciar-sesion') {
          window.location.href = '/iniciar-sesion';
        }
        return Promise.reject(error);
      }
    },
  );
}

attach401RefreshRetry(apiClient);

// File upload client (multipart/form-data)
export const apiClientUpload: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

apiClientUpload.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getInternalJwtToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

attach401RefreshRetry(apiClientUpload);

export default apiClient;

// Error handler helper
export interface ApiErrorShape {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export const handleApiError = (error: unknown): ApiErrorShape => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    if (axiosError.response?.data) {
      return {
        message:
          axiosError.response.data.message ||
          axiosError.response.data.error ||
          'Error en el servidor',
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
