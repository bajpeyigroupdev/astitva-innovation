import { authService } from "../auth/authService";
import { getErrorMessage } from "../lib/errors";

export interface SystemSettings {
  brandName?: string;
  phone?: string;
  whatsappNumber?: string;
  contactEmail?: string;
  supportEmail?: string;
  salesEmail?: string;
  address?: string;
  workingHours?: string;
  hasTelegramBotToken?: boolean;
  telegramBotToken?: string;
  clearTelegramBotToken?: boolean;
  telegramChatId?: string;
  notificationsEnabled?: boolean;
}

const getApiBase = () => import.meta.env.VITE_API_URL || "";

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/settings/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch settings from API:", e);
    }

    return {
      brandName: "Astitva Innovation",
      phone: "+91 7233882089",
      whatsappNumber: "917233882089",
      contactEmail: "contact@astitvainnovation.in",
      supportEmail: "support@astitvainnovation.in",
      salesEmail: "support@astitvainnovation.in",
      address: "Global Software Engineering Hub • India & Remote",
      workingHours: "Mon - Sat: 9:30 AM - 7:30 PM IST",
      notificationsEnabled: true
    };
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<{ success: boolean; data?: SystemSettings; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/settings`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return { success: false, error: getErrorMessage(e, "Failed to update settings") };
    }
  },

  async testTelegram(): Promise<{ success: boolean; message?: string; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/settings/test-telegram`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const json = await res.json();
      return json;
    } catch (e) {
      return { success: false, error: getErrorMessage(e, "Failed to send test alert") };
    }
  }
};
