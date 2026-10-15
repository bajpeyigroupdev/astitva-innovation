import { authService } from "../auth/authService";
import { getErrorMessage } from "../lib/errors";

export interface FounderProfile {
  id: string;
  name: string;
  position: string;
  roleBadge: string;
  bio: string;
  portfolioSummary: string;
  keySkills: string[];
  photoUrl: string;
  linkedin: string;
  instagram: string;
  email: string;
  phone: string;
  order?: number;
  enabled?: boolean;
}

const getApiBase = () => import.meta.env.VITE_API_URL || "";

export const foundersService = {
  async getFounders(): Promise<FounderProfile[]> {
    const token = authService.getToken();
    const endpoint = token ? `${getApiBase()}/api/founders/all` : `${getApiBase()}/api/founders`;
    try {
      const res = await fetch(endpoint, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/json"
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch founders:", e);
    }
    return [];
  },

  async createFounder(founder: Partial<FounderProfile>): Promise<{ success: boolean; data?: FounderProfile; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/founders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(founder)
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return { success: false, error: getErrorMessage(e, "Failed to add founder") };
    }
  },

  async updateFounder(id: string, founder: Partial<FounderProfile>): Promise<{ success: boolean; data?: FounderProfile; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/founders/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(founder)
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return { success: false, error: getErrorMessage(e, "Failed to update founder") };
    }
  },

  async deleteFounder(id: string): Promise<boolean> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/founders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async toggleFounder(id: string): Promise<boolean> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/founders/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }
};
