import type { AxiosError } from 'axios';

/**
 * Custom API Error class for handling HTTP errors
 * Provides type-safe error handling and helpful utility methods
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly originalError?: AxiosError;
  public readonly errorData?: any;

  constructor(
    message: string,
    statusCode: number,
    originalError?: AxiosError,
    errorData?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.errorData = errorData;

    // Maintain proper stack trace for debugging (V8 only)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, ApiError);
    }
  }

  /**
   * Create ApiError from Axios error
   */
  static fromAxiosError(error: AxiosError): ApiError {
    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data as { error?: { message?: string; code?: string; details?: unknown } } | undefined;
    const message = errorData?.error?.message || (errorData as any)?.message || error.message || 'Unknown error';

    return new ApiError(message, statusCode, error, errorData);
  }

  /**
   * Check if error is a 404 Not Found
   */
  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if error is a 401 Unauthorized
   */
  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Check if error is a 403 Forbidden
   */
  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Check if error is a 5xx Server Error
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Check if error is a 4xx Client Error
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a 400 Bad Request
   */
  isBadRequest(): boolean {
    return this.statusCode === 400;
  }

  /**
   * Check if error is a 422 Unprocessable Entity (Validation Error)
   */
  isValidationError(): boolean {
    return this.statusCode === 422;
  }

  /**
   * Check if error is a 429 Too Many Requests (Rate Limit)
   */
  isRateLimitError(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Check if error is a 503 Service Unavailable
   */
  isServiceUnavailable(): boolean {
    return this.statusCode === 503;
  }

  /**
   * Get user-friendly error message in Spanish
   */
  getUserMessage(): string {
    if (this.isServerError()) {
      return 'El servidor no está disponible en este momento. Por favor, intenta más tarde.';
    }

    if (this.isUnauthorized()) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }

    if (this.isForbidden()) {
      return 'No tienes permisos para acceder a este recurso.';
    }

    if (this.isNotFound()) {
      return 'El recurso solicitado no existe.';
    }

    if (this.isValidationError()) {
      // Si hay errores de validación específicos, mostrarlos
      if (this.errorData?.errors) {
        const errors = Object.values(this.errorData.errors).flat();
        return errors.join(', ');
      }
      return this.message;
    }

    if (this.isRateLimitError()) {
      return 'Has excedido el límite de solicitudes. Por favor, espera un momento.';
    }

    if (this.isServiceUnavailable()) {
      return 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.';
    }

    return this.message;
  }

  /**
   * Get validation errors if available
   * Returns a map of field names to error messages
   */
  getValidationErrors(): Record<string, string[]> | null {
    const details = (this.errorData as any)?.error?.details ?? this.errorData?.errors;
    if (this.isValidationError() && details) {
      return details as Record<string, string[]>;
    }
    return null;
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorData: this.errorData,
      stack: this.stack,
    };
  }
}

/**
 * Type guard to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Get status code from any error
 * Returns 500 if error is not an ApiError
 */
export function getErrorStatusCode(error: unknown): number {
  if (isApiError(error)) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Get user-friendly error message from any error
 */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.getUserMessage();
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado';
}
