export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  message: string;
  date: string;
  status: "New" | "Contacted" | "In Review" | "Closed";
}

export interface PaymentLog {
  id: string;
  gateway: string;
  method: string;
  amount: string;
  status: "Captured" | "Pending";
  date: string;
  ref: string;
}

export type AdminTab = "overview" | "inquiries" | "fintech" | "settings";
