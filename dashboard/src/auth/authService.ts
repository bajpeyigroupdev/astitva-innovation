import { APP_CONFIG } from "../constants/config";
import { AdminSession } from "../types";

const SESSION_KEY = APP_CONFIG.storageKeys.adminSession;
const SESSION_DURATION_MS = APP_CONFIG.sessionDurationHours * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 10_000;

const fetchWithTimeout = async (url: string, init: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeoutId);
  }
};

export const authService = {
  /**
   * Authenticate administrator against the server-side API.
   * Credentials are verified exclusively on the server using bcrypt hashing.
   * Never exposed in client code or bundle.
   */
  async login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> {
    const trimmedUser = usernameInput.trim();
    const password = passwordInput;

    if (!trimmedUser || !password) {
      return { success: false, error: "Please enter both Administrator ID and Password." };
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const response = await fetchWithTimeout(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUser,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success && data?.token) {
        const sessionData: AdminSession = {
          token: data.token,
          username: data.user?.username || trimmedUser,
          expiresAt: Date.now() + SESSION_DURATION_MS,
        };

        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        } catch {
          return {
            success: false,
            error: "Secure browser session storage is unavailable. Enable it and try again.",
          };
        }

        return { success: true };
      }

      return {
        success: false,
        error: data?.error || "Access Denied: Invalid Administrator ID or Password.",
      };
    } catch (networkErr) {
      console.warn("API authentication server unreachable:", networkErr);
      return {
        success: false,
        error: "Unable to reach the Authentication API server. Please check your network or server status.",
      };
    }
  },

  async verifySession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    const apiBase = import.meta.env.VITE_API_URL || "";
    const response = await fetchWithTimeout(`${apiBase}/api/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (response.status === 401 || response.status === 403) {
      this.logout();
      return false;
    }
    if (!response.ok) {
      throw new Error(`Session check failed (${response.status}).`);
    }

    const data = await response.json().catch(() => null);
    if (data?.valid === true) return true;
    this.logout();
    return false;
  },

  /**
   * Check if current session token is valid and not expired.
   */
  isAuthenticated(): boolean {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;

      const session: AdminSession = JSON.parse(raw);
      if (!session.token || !session.expiresAt) return false;

      if (Date.now() > session.expiresAt) {
        this.logout();
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get the current JWT Bearer token for authenticated API requests.
   */
  getToken(): string | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: AdminSession = JSON.parse(raw);
      return session.token || null;
    } catch {
      return null;
    }
  },

  getCurrentAdmin(): string | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session: AdminSession = JSON.parse(raw);
      return session.username || null;
    } catch {
      return null;
    }
  },

  logout(): void {
    const token = this.getToken();
    if (token) {
      const apiBase = import.meta.env.VITE_API_URL || "";
      fetch(`${apiBase}/api/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      }).catch(() => {});
    }
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.warn("Unable to clear the browser session:", error);
    }
  },
};
