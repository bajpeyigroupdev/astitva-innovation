import type { LucideIcon } from "lucide-react";

export interface WebsiteLeadInput {
  name: string;
  email: string;
  phone?: string;
  service: string;
  budget: string;
  message: string;
}

export interface ServiceItem {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  highlight?: string;
}
