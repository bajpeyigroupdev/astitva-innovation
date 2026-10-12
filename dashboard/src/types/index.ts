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
  status: "Captured" | "Pending" | "Failed";
  date: string;
  ref: string;
  isSimulated?: boolean;
}

export interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
}

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  startingPrice: string;
  turnaround: string;
  active: boolean;
  icon: any;
}
