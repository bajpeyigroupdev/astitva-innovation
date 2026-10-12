import { storageAdapter } from "../utils/storage";
import { Inquiry } from "../types";
import { authService } from "../auth/authService";

const getApiBase = () => import.meta.env.VITE_API_URL || "";

export const inquiryService = {
  /**
   * Return immediately available inquiries from local cache, then trigger background sync.
   */
  getInquiries(): Inquiry[] {
    return storageAdapter.getInquiries();
  },

  /**
   * Asynchronously fetch authoritative production inquiries from the backend API.
   * Updates local storage cache on success.
   */
  async fetchInquiries(): Promise<Inquiry[]> {
    const token = authService.getToken();
    if (!token) {
      return storageAdapter.getInquiries();
    }

    try {
      const response = await fetch(`${getApiBase()}/api/inquiries`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data)) {
          // Sync into local adapter for offline resiliency
          localStorage.setItem("astitva_inquiries", JSON.stringify(json.data));
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Could not reach API server, serving from local cache:", err);
    }

    return storageAdapter.getInquiries();
  },

  /**
   * Update inquiry status on server-side and update local cache.
   */
  async updateStatusAsync(id: string, status: Inquiry["status"]): Promise<Inquiry[]> {
    const token = authService.getToken();
    if (token) {
      try {
        await fetch(`${getApiBase()}/api/inquiries/${id}`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });
      } catch (err) {
        console.warn("Failed to patch status on server:", err);
      }
    }
    return storageAdapter.updateStatus(id, status);
  },

  updateStatus(id: string, status: Inquiry["status"]): Inquiry[] {
    this.updateStatusAsync(id, status);
    return storageAdapter.updateStatus(id, status);
  },

  /**
   * Delete inquiry on server-side and delete from local cache.
   */
  async deleteInquiryAsync(id: string): Promise<Inquiry[]> {
    const token = authService.getToken();
    if (token) {
      try {
        await fetch(`${getApiBase()}/api/inquiries/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn("Failed to delete inquiry on server:", err);
      }
    }
    return storageAdapter.deleteInquiry(id);
  },

  deleteInquiry(id: string): Inquiry[] {
    this.deleteInquiryAsync(id);
    return storageAdapter.deleteInquiry(id);
  },

  /**
   * Add a manual inquiry and sync to server.
   */
  async addManualLeadAsync(data: Omit<Inquiry, "id" | "date" | "status">): Promise<Inquiry> {
    try {
      const response = await fetch(`${getApiBase()}/api/inquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const current = storageAdapter.getInquiries();
          localStorage.setItem("astitva_inquiries", JSON.stringify([json.data, ...current]));
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Server unavailable for manual lead:", err);
    }

    return storageAdapter.saveInquiry(data);
  },

  addManualLead(data: Omit<Inquiry, "id" | "date" | "status">): Inquiry {
    const local = storageAdapter.saveInquiry(data);
    this.addManualLeadAsync(data);
    return local;
  },
};
