/**
 * Formatters
 * 
 * Utility functions for formatting data
 */

import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';

/**
 * Format date to Spanish format
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error('[Formatter] Error formatting date:', error);
    return '';
  }
}

/**
 * Format currency to Spanish format
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number to Spanish format
 */
export function formatNumber(number: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number);
}
