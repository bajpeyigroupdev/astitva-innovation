import { authService } from "../auth/authService";

export interface JobItem {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: "Active" | "Closed";
  enabled: boolean;
  applicantCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  currentCompany?: string;
  resumeUrl: string;
  portfolioUrl?: string;
  coverNote?: string;
  status: "Applied" | "Under Review" | "Shortlisted" | "Interview Scheduled" | "Hired" | "Rejected";
  adminNotes?: string;
  appliedAt: string;
  updatedAt?: string;
}

const getApiBase = () => import.meta.env.VITE_API_URL || "";

export const careersService = {
  // Admin: Get all jobs
  async getAdminJobs(): Promise<JobItem[]> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/admin/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      console.warn("Failed to fetch admin jobs:", e);
    }
    return [];
  },

  // Admin: Create job
  async createJob(job: Partial<JobItem>): Promise<{ success: boolean; data?: JobItem; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/admin/jobs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(job)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to create job" };
    }
  },

  // Admin: Update job
  async updateJob(id: string, job: Partial<JobItem>): Promise<{ success: boolean; data?: JobItem; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/admin/jobs/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(job)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to update job" };
    }
  },

  // Admin: Toggle job status
  async toggleJobStatus(id: string): Promise<{ success: boolean; data?: JobItem; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/admin/jobs/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to toggle status" };
    }
  },

  // Admin: Delete job
  async deleteJob(id: string): Promise<{ success: boolean; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/admin/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to delete job" };
    }
  },

  // Admin: Get applications
  async getApplications(jobId?: string, status?: string): Promise<JobApplicationItem[]> {
    const token = authService.getToken();
    const params = new URLSearchParams();
    if (jobId && jobId !== "all") params.append("jobId", jobId);
    if (status && status !== "All") params.append("status", status);

    try {
      const res = await fetch(`${getApiBase()}/api/admin/job-applications?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      console.warn("Failed to fetch applications:", e);
    }
    return [];
  },

  // Admin: Update application status and notes
  async updateApplicationStatus(id: string, status: string, adminNotes?: string): Promise<{ success: boolean; data?: JobApplicationItem; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/admin/job-applications/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status, adminNotes })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to update application" };
    }
  },

  // Admin: Delete application
  async deleteApplication(id: string): Promise<{ success: boolean; error?: string }> {
    const token = authService.getToken();
    try {
      const res = await fetch(`${getApiBase()}/api/admin/job-applications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to delete application" };
    }
  }
};
