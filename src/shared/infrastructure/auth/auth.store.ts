/**
 * Auth Store - Zustand store for auth state (tokens + user)
 * Persists access_token in localStorage for HttpClient Authorization header
 */

const ACCESS_TOKEN_KEY = 'mishiwoof_access_token';
const REFRESH_TOKEN_KEY = 'mishiwoof_refresh_token';
const USER_KEY = 'mishiwoof_user';

export interface AuthUser {
  user_id: string;
  email: string;
  role: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setTokens: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  setSessionTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
}

function loadStored(): { accessToken: string | null; refreshToken: string | null; user: AuthUser | null } {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null, user: null };
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? (JSON.parse(userStr) as AuthUser) : null;
    return { accessToken, refreshToken, user };
  } catch {
    return { accessToken: null, refreshToken: null, user: null };
  }
}

const stored = loadStored();

export const authStore: AuthState = {
  accessToken: stored.accessToken,
  refreshToken: stored.refreshToken,
  user: stored.user,

  setTokens(accessToken: string, refreshToken: string, user: AuthUser) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  /**
   * Tras POST /auth/refresh: rotación estricta — guardar siempre el par nuevo (no reutilizar refresh viejo).
   */
  setSessionTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  setUser(user: AuthUser | null) {
    this.user = user;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  },

  clearAuth() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('auth_token');
  },

  getAccessToken() {
    return this.accessToken ?? localStorage.getItem(ACCESS_TOKEN_KEY) ?? localStorage.getItem('accessToken');
  },

  getRefreshToken() {
    return this.refreshToken ?? localStorage.getItem(REFRESH_TOKEN_KEY) ?? localStorage.getItem('refreshToken');
  },
};
