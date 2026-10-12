import { Inquiry } from "../types";
import { APP_CONFIG } from "../constants/config";

const SEED_INQUIRIES: Inquiry[] = [
  {
    id: "INQ-101",
    name: "Vikram Malhotra",
    email: "vikram@malhotrafin.com",
    phone: "+91 98234 56789",
    service: "FinTech & Payment Gateway",
    budget: "₹5,00,000 - ₹15,00,000",
    message: "Need custom multi-gateway router (Razorpay + Cashfree fallback) with automated merchant split payout APIs.",
    date: "2026-09-18 19:45",
    status: "New",
  },
  {
    id: "INQ-102",
    name: "Aman Gupta",
    email: "aman@ecombrands.in",
    phone: "+91 99112 33445",
    service: "Mobile App (iOS & Android)",
    budget: "₹1,50,000 - ₹5,00,000",
    message: "Flutter mobile commerce application with UPI 1-click checkout and real-time tracking.",
    date: "2026-09-18 17:12",
    status: "Contacted",
  },
  {
    id: "INQ-103",
    name: "Elena Rostova",
    email: "elena@globaltech.co",
    phone: "+1 415 890 2314",
    service: "Custom Web & SaaS Platform",
    budget: "₹15,00,000+",
    message: "Enterprise multi-tenant subscription SaaS portal with international Stripe billing and AWS auto-scaling.",
    date: "2026-09-17 14:30",
    status: "In Review",
  },
];

export const storageAdapter = {
  getInquiries(): Inquiry[] {
    try {
      const data = localStorage.getItem(APP_CONFIG.storageKeys.inquiries);
      if (!data) {
        localStorage.setItem(APP_CONFIG.storageKeys.inquiries, JSON.stringify(SEED_INQUIRIES));
        return SEED_INQUIRIES;
      }
      return JSON.parse(data);
    } catch {
      return SEED_INQUIRIES;
    }
  },

  saveInquiry(inquiry: Omit<Inquiry, "id" | "date" | "status">): Inquiry {
    const list = this.getInquiries();
    const created: Inquiry = {
      ...inquiry,
      id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: "New",
    };
    const updated = [created, ...list];
    try {
      localStorage.setItem(APP_CONFIG.storageKeys.inquiries, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return created;
  },

  updateStatus(id: string, status: Inquiry["status"]): Inquiry[] {
    const list = this.getInquiries();
    const updated = list.map((item) => (item.id === id ? { ...item, status } : item));
    try {
      localStorage.setItem(APP_CONFIG.storageKeys.inquiries, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return updated;
  },

  deleteInquiry(id: string): Inquiry[] {
    const list = this.getInquiries();
    const updated = list.filter((item) => item.id !== id);
    try {
      localStorage.setItem(APP_CONFIG.storageKeys.inquiries, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return updated;
  },
};
