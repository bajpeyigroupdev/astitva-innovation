import { Inquiry, PaymentLog } from "./types";

export const DEFAULT_INQUIRIES: Inquiry[] = [
  {
    id: "INQ-101",
    name: "Vikram Malhotra",
    email: "vikram@malhotrafin.com",
    phone: "+91 98234 56789",
    service: "FinTech & Payment Gateway",
    budget: "₹5,00,000 - ₹15,00,000",
    message: "Need custom multi-gateway router (Razorpay + Cashfree fallback) with automated merchant split payout APIs.",
    date: "2026-09-18 19:45",
    status: "New"
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
    status: "Contacted"
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
    status: "In Review"
  }
];

export const DEFAULT_TRANSACTIONS: PaymentLog[] = [
  { id: "TX-901", gateway: "Razorpay", method: "UPI 2.0 (GPay)", amount: "₹2,499", status: "Captured", date: "2026-09-18 20:30", ref: "TXN_78291038" },
  { id: "TX-902", gateway: "Stripe", method: "Visa Card •••• 4242", amount: "₹4,999", status: "Captured", date: "2026-09-18 18:15", ref: "TXN_45892110" },
  { id: "TX-903", gateway: "Cashfree", method: "Instant QR Intent", amount: "₹1,499", status: "Captured", date: "2026-09-18 16:40", ref: "TXN_99182341" },
  { id: "TX-904", gateway: "PhonePe PG", method: "UPI DeepLink", amount: "₹3,200", status: "Captured", date: "2026-09-17 21:05", ref: "TXN_33109482" },
];
