/**
 * useToast Hook
 * 
 * Simple toast notification hook
 * Uses sonner for toast notifications
 */

import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
    duration?: number;
}

export function useToast() {
    return {
        toast: (options: ToastOptions) => {
            const { title, description, variant = 'default', duration } = options;

            switch (variant) {
                case 'destructive':
                    sonnerToast.error(title || 'Error', {
                        description,
                        duration,
                    });
                    break;
                case 'success':
                    sonnerToast.success(title || 'Éxito', {
                        description,
                        duration,
                    });
                    break;
                case 'warning':
                    sonnerToast.warning(title || 'Advertencia', {
                        description,
                        duration,
                    });
                    break;
                case 'info':
                    sonnerToast.info(title || 'Información', {
                        description,
                        duration,
                    });
                    break;
                default:
                    sonnerToast(title || 'Notificación', {
                        description,
                        duration,
                    });
            }
        },
    };
}
