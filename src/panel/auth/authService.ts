import { APP_CONFIG } from "@/shared/constants/config";
import { AdminSession } from "../types/panel";

const SESSION_KEY = APP_CONFIG.storageKeys.adminSession;
const SESSION_DURATION_MS = APP_CONFIG.sessionDurationHours * 60 * 60 * 1000;

export const authService = {
  /**
   * Authenticate against environment credentials.
   * Note: In production enterprise environments, this communicates with a secure server-side endpoint.
   */
  async login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; error?: string }> {
    // Artificial latency to mitigate rapid brute-force timing
    await new Promise((resolve) => setTimeout(resolve, 500));

    const configuredUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const configuredPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!configuredUsername || !configuredPassword) {
      console.warn("VITE_ADMIN_USERNAME or VITE_ADMIN_PASSWORD environment variables are not configured in .env.");
      return { success: false, error: "Authentication system not configured. Please define admin credentials in .env file." };
    }

    const trimmedUser = usernameInput.trim();
    const trimmedPass = passwordInput.trim();

    if (trimmedUser === configuredUsername && trimmedPass === configuredPassword) {
      const sessionToken = "ast_sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      const sessionData: AdminSession = {
        token: sessionToken,
        username: configuredUsername,
        expiresAt: Date.now() + SESSION_DURATION_MS,
      };

      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      } catch (e) {
        console.error("Failed to write admin session:", e);
      }

      return { success: true };
    }

    return { success: false, error: "Invalid Admin ID or password. Please verify credentials." };
  },

  /**
   * Verify if the current administrator session is valid and active.
   */
  isAuthenticated(): boolean {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return false;

      const session: AdminSession = JSON.parse(raw);
      if (!session.token || !session.expiresAt) return false;

      // Check session expiration (4 hours)
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
   * Get active admin username.
   */
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

  /**
   * Terminate admin session.
   */
  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
  },
};
