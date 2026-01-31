import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';
import { ApiError } from './api.error';
import { getInternalJwtToken, clearAuthStorage } from './token.helper';

/**
 * Configuration for the HTTP client
 */
export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Base HTTP Client using Axios
 * Provides centralized configuration and error handling
 */
export class HttpClient {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor(config: HttpClientConfig) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000, // 30 seconds default
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      this.handleRequest.bind(this),
      this.handleRequestError.bind(this)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      this.handleResponse.bind(this),
      this.handleResponseError.bind(this)
    );
  }

  /**
   * Request interceptor - add authentication token
   */
  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // Add authorization token if available
    if (!config.headers.Authorization) {
      // Priority: instance token > internal JWT token > localStorage > sessionStorage
      const token = this.authToken || this.getInternalJwtTokenFromStorage() || this.getStoredToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Log token presence in development (but not the actual token for security)
        if (import.meta.env.DEV) {
          console.log(`[HTTP] Authorization header set for ${config.method?.toUpperCase()} ${config.url}`, {
            hasToken: true,
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + '...',
          });
        }
      } else {
        // Log missing token in development
        if (import.meta.env.DEV) {
          console.warn(`[HTTP] No authorization token available for ${config.method?.toUpperCase()} ${config.url}`);
        }
      }
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`[HTTP] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        hasAuth: !!config.headers.Authorization,
      });
    }

    return config;
  }

  /**
   * Request error interceptor
   */
  private handleRequestError(error: any): Promise<never> {
    console.error('[HTTP] Request error:', error);
    return Promise.reject(error);
  }

  /**
   * Response interceptor - handle successful responses and unwrap backend { success, data }
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    // Check if response is HTML instead of JSON (common when server returns error page)
    const contentType = response.headers['content-type'] || '';
    const isHTML = typeof response.data === 'string' && (
      response.data.trim().startsWith('<!doctype') ||
      response.data.trim().startsWith('<!DOCTYPE') ||
      response.data.trim().startsWith('<html')
    );

    if (isHTML || (contentType.includes('text/html') && response.status === 200)) {
      // This is likely a 404 page or error page, not a valid API response
      const error = new Error('El servidor devolvió una respuesta HTML en lugar de JSON. Verifica que la URL de la API esté configurada correctamente.');
      const apiError = new ApiError(
        error.message,
        500,
        undefined,
        { originalResponse: response.data }
      );
      return Promise.reject(apiError) as any;
    }

    // Unwrap backend format { success: true, data: T } so callers receive T directly
    if (response.data && typeof response.data === 'object' && 'success' in response.data && response.data.success === true && 'data' in response.data) {
      response.data = (response.data as { data: unknown }).data;
    }

    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`, {
        data: response.data,
      });
    }

    return response;
  }

  /**
   * Response error interceptor - handle errors globally
   */
  private handleResponseError(error: unknown): Promise<never> {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status || 500;

    // Log error
    console.error(`[HTTP] Error ${statusCode}:`, {
      url: axiosError.config?.url,
      method: axiosError.config?.method,
      message: axiosError.message,
      data: axiosError.response?.data,
    });

    // Handle authentication errors (401/403)
    // Only redirect to login if it's a 401 (Unauthorized), not 403 (Forbidden)
    // 403 means the user is authenticated but doesn't have permission
    if (statusCode === 401) {
      this.handleAuthError(statusCode);
    }

    // Convert to ApiError
    const apiError = ApiError.fromAxiosError(axiosError);
    return Promise.reject(apiError);
  }

  /**
   * Handle authentication errors
   * Only redirects on 401 (Unauthorized), not on 403 (Forbidden)
   */
  private handleAuthError(statusCode: number): void {
    // Only redirect on 401 (Unauthorized), not on 403 (Forbidden)
    // 403 means the user is authenticated but doesn't have permission
    if (statusCode === 401) {
      console.warn(`[HTTP] Authentication error (401). User is not authenticated. Redirecting to login...`);
      
      clearAuthStorage();
      this.authToken = null;

      // Redirect to login page
      // Using window.location to ensure full page reload and state reset
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const loginUrl = '/login';
        
        // Don't redirect if already on login page
        if (currentPath !== loginUrl) {
          window.location.href = loginUrl;
        }
      }
    } else if (statusCode === 403) {
      // 403 Forbidden - user is authenticated but doesn't have permission
      // Don't redirect, just log the error
      console.warn(`[HTTP] Permission denied (403). User is authenticated but doesn't have permission.`);
    }
  }

  /**
   * Get internal JWT token from auth storage
   */
  private getInternalJwtTokenFromStorage(): string | null {
    try {
      return getInternalJwtToken();
    } catch (error) {
      console.error('[HTTP] Error reading internal JWT token:', error);
      return null;
    }
  }

  /**
   * Get token from storage (legacy - for backward compatibility)
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    } catch (error) {
      console.error('[HTTP] Error reading token from storage:', error);
      return null;
    }
  }

  /**
   * Set authentication token for all requests
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
    
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Get the underlying Axios instance
   */
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Generic GET request
   */
  async get<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  async post<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(url: string, config?: any): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }
}

/**
 * Create default HTTP client instance
 */
export function createHttpClient(config?: Partial<HttpClientConfig>): HttpClient {
  const baseURL = config?.baseURL || import.meta.env.VITE_PUBLIC_API_URL || '';

  if (!baseURL && import.meta.env.PROD) {
    console.warn('[HTTP] No API URL configured. Set VITE_PUBLIC_API_URL environment variable.');
  }

  return new HttpClient({
    baseURL,
    timeout: config?.timeout,
    headers: config?.headers,
  });
}

/**
 * Default HTTP client instance (for general API calls)
 */
export const httpClient = createHttpClient();
