import { Inquiry, PaymentLog } from "@/shared/types/inquiry";

export type { Inquiry, PaymentLog };

export interface AdminSession {
  token: string;
  username: string;
  expiresAt: number;
}

export interface AdminProposalInput {
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  totalCost: string;
  timelineWeeks: string;
  scopeDetails: string;
}

export interface ServiceConfiguration {
  id: string;
  name: string;
  category: string;
  startingPrice: string;
  turnaround: string;
  active: boolean;
}
