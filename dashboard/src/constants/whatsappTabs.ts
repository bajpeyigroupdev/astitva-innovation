export const WHATSAPP_TABS = [
  "overview",
  "connection",
  "chats",
  "templates",
  "contacts",
  "webhooks",
  "delivery-logs",
  "evidence",
  "checklist",
  "diagnostics",
  "security",
] as const;

export type WhatsAppTab = (typeof WHATSAPP_TABS)[number];

const TAB_ALIASES: Record<string, WhatsAppTab> = {
  messages: "chats",
  account: "connection",
  settings: "connection",
  logs: "diagnostics",
};

export const normalizeWhatsAppTab = (value: string | null | undefined): WhatsAppTab | null => {
  if (!value) return "overview";
  const canonical = TAB_ALIASES[value] || value;
  return WHATSAPP_TABS.includes(canonical as WhatsAppTab) ? canonical as WhatsAppTab : null;
};
