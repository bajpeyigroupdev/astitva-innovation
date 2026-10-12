import { APP_CONFIG } from "@/shared/constants/config";

export interface CompanySettings {
  brandName: string;
  phone: string;
  whatsappNumber: string;
  contactEmail: string;
  supportEmail: string;
  salesEmail: string;
  address: string;
  workingHours: string;
}

let cachedSettings: CompanySettings | null = null;

export const settingsService = {
  async getSettings(): Promise<CompanySettings> {
    if (cachedSettings) return cachedSettings;

    const fallback: CompanySettings = {
      brandName: APP_CONFIG.brandName,
      phone: APP_CONFIG.phone,
      whatsappNumber: APP_CONFIG.whatsappNumber,
      contactEmail: APP_CONFIG.emails.contact,
      supportEmail: APP_CONFIG.emails.sales,
      salesEmail: APP_CONFIG.emails.sales,
      address: "Global Software Engineering Hub • India & Remote",
      workingHours: "Mon - Sat: 9:30 AM - 7:30 PM IST",
    };

    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/settings`, {
        headers: { Accept: "application/json" }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          cachedSettings = {
            ...fallback,
            ...json.data
          };
          return cachedSettings;
        }
      }
    } catch (err) {
      console.warn("Using offline fallback company settings:", err);
    }

    return fallback;
  }
};
