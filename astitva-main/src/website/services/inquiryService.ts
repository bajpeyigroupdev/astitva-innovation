import { storageAdapter } from "@/shared/utils/storage";
import { WebsiteLeadInput } from "../types/website";
import { Inquiry } from "@/shared/types/inquiry";

export const inquiryService = {
  /**
   * Submit a client inquiry from the public website contact form or project calculator.
   * Sends to server-side /api/inquiries with graceful local fallback if offline.
   */
  async submitLead(input: WebsiteLeadInput): Promise<{ success: boolean; data?: Inquiry; error?: string }> {
    const payload = {
      name: input.name,
      email: input.email,
      phone: input.phone || "Not provided",
      service: input.service,
      budget: input.budget,
      message: input.message,
    };

    // 1. Attempt server-side API persistence
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const endpoint = `${apiBase}/api/inquiries`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          return { success: true, data: result.data };
        }
      }
    } catch (apiErr) {
      console.warn("Backend API unavailable, falling back to local adapter:", apiErr);
    }

    // 2. Offline / local development fallback
    try {
      const created = storageAdapter.saveInquiry(payload);
      return { success: true, data: created };
    } catch (err: any) {
      console.error("Failed to submit inquiry:", err);
      return { success: false, error: err?.message || "Failed to submit inquiry" };
    }
  },
};
