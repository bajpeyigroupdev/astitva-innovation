import { storageAdapter } from "@/shared/utils/storage";
import { WebsiteLeadInput } from "../types/website";
import { Inquiry } from "@/shared/types/inquiry";

export const inquiryService = {
  /**
   * Submit a client inquiry from the public website contact form or project calculator.
   */
  async submitLead(input: WebsiteLeadInput): Promise<{ success: boolean; data?: Inquiry; error?: string }> {
    try {
      const created = storageAdapter.saveInquiry({
        name: input.name,
        email: input.email,
        phone: input.phone || "Not provided",
        service: input.service,
        budget: input.budget,
        message: input.message,
      });

      return { success: true, data: created };
    } catch (err: any) {
      console.error("Failed to submit inquiry:", err);
      return { success: false, error: err?.message || "Failed to submit inquiry" };
    }
  },
};
