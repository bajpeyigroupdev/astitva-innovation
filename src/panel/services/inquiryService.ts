import { storageAdapter } from "@/shared/utils/storage";
import { Inquiry } from "@/shared/types/inquiry";

export const panelInquiryService = {
  getInquiries(): Inquiry[] {
    return storageAdapter.getInquiries();
  },

  updateStatus(id: string, status: Inquiry["status"]): Inquiry[] {
    return storageAdapter.updateInquiryStatus(id, status);
  },

  deleteInquiry(id: string): Inquiry[] {
    return storageAdapter.deleteInquiry(id);
  },

  addManualInquiry(inquiryData: Omit<Inquiry, "id" | "date" | "status">): Inquiry {
    return storageAdapter.saveInquiry(inquiryData);
  },
};
