/**
 * Token Helper
 * 
 * Helper functions to get internal JWT token from storage
 */

/**
 * Get internal JWT token from storage
 * 
 * @returns Internal JWT token or null if not found
 */
export function getInternalJwtToken(): string | null {
    try {
        // TODO: Implementar según el sistema de autenticación que se use
        // Por ahora retorna null, se implementará cuando se agregue el módulo de auth
        return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token') || null;
    } catch (error) {
        console.error('[TokenHelper] Error getting internal JWT token:', error);
        return null;
    }
}
