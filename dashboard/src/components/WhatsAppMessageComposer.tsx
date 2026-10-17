import React, { useState, useEffect, useMemo } from "react";
import {
  Send,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ShieldCheck,
  Building2,
  Lock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { normalizePhoneNumber } from "../lib/phoneUtils";
import { whatsappService } from "../services/whatsappService";
import { getErrorMessage } from "../lib/errors";
import type { WhatsAppOperationResult } from "../services/whatsappService";
import {
  WhatsAppConfig,
  WhatsAppContact,
  WhatsAppConversation,
  WhatsAppTemplate,
  WhatsAppTenant,
} from "../types/whatsapp";

interface WhatsAppMessageComposerProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: WhatsAppContact[];
  templates: WhatsAppTemplate[];
  conversations: WhatsAppConversation[];
  config: WhatsAppConfig | null;
  tenants: WhatsAppTenant[];
  activeTenantId: string;
  initialContactId?: string;
  initialPhoneNumber?: string;
  onMessageSent: (result: WhatsAppOperationResult, recipientPhone: string) => void;
}

export const WhatsAppMessageComposer: React.FC<WhatsAppMessageComposerProps> = ({
  isOpen,
  onClose,
  contacts,
  templates,
  conversations,
  config,
  tenants,
  activeTenantId,
  initialContactId,
  initialPhoneNumber,
  onMessageSent,
}) => {
  const { toast } = useToast();

  // Recipient Selection State
  const [recipientMode, setRecipientMode] = useState<"contact" | "manual">("contact");
  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [manualPhoneInput, setManualPhoneInput] = useState<string>("");

  // Message Type & Payload State
  const [messageType, setMessageType] = useState<"text" | "template" | "media">("text");
  const [textBody, setTextBody] = useState<string>("");
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [mediaType, setMediaType] = useState<"image" | "document">("image");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaCaption, setMediaCaption] = useState<string>("");

  // Confirmation & Dispatch State
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [policyConfirmed, setPolicyConfirmed] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Initialize from props
  useEffect(() => {
    if (initialContactId) {
      setRecipientMode("contact");
      setSelectedContactId(initialContactId);
    } else if (initialPhoneNumber) {
      setRecipientMode("manual");
      setManualPhoneInput(initialPhoneNumber);
    } else if (contacts.length > 0 && !selectedContactId) {
      setSelectedContactId(contacts[0].id);
    }
  }, [initialContactId, initialPhoneNumber, contacts, isOpen]);

  // Resolve Recipient Phone & Contact Info
  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId);
  }, [contacts, selectedContactId]);

  const normalizedPhone = useMemo(() => {
    if (recipientMode === "contact") {
      return selectedContact?.phone ? normalizePhoneNumber(selectedContact.phone) : null;
    }
    return manualPhoneInput ? normalizePhoneNumber(manualPhoneInput) : null;
  }, [recipientMode, selectedContact, manualPhoneInput]);

  const recipientDigits = normalizedPhone?.rawDigits || "";

  // Check 24-hour Customer Service Window
  const conversation = useMemo(() => {
    if (!recipientDigits) return null;
    return conversations.find((c) => c.id === recipientDigits || c.phone === recipientDigits);
  }, [conversations, recipientDigits]);

  const isWindowOpen = Boolean(conversation?.isWindowOpen);
  const remainingMinutes = conversation?.remainingMinutes || 0;

  // Consent Status Check
  const isOptedOut = useMemo(() => {
    if (selectedContact?.consentStatus === "OPTED_OUT") return true;
    const matched = contacts.find((c) => c.phone === recipientDigits);
    return matched?.consentStatus === "OPTED_OUT";
  }, [selectedContact, contacts, recipientDigits]);

  // Filter Approved Templates
  const availableTemplates = useMemo(() => {
    return templates.filter((t) => t.status === "APPROVED" || t.status === "LOCAL_DRAFT");
  }, [templates]);

  // Set default template if needed
  useEffect(() => {
    if (!isWindowOpen && messageType !== "template") {
      setMessageType("template");
    }
    if (availableTemplates.length > 0 && !selectedTemplateName) {
      setSelectedTemplateName(availableTemplates[0].name);
    }
  }, [isWindowOpen, messageType, availableTemplates, selectedTemplateName]);

  // Resolve Active Template & Extracted Variables
  const activeTemplate = useMemo(() => {
    return availableTemplates.find((t) => t.name === selectedTemplateName);
  }, [availableTemplates, selectedTemplateName]);

  const templateInspection = useMemo(() => {
    if (!activeTemplate?.components) {
      return {
        headerVars: [] as string[],
        bodyVars: [] as string[],
        urlButtonVars: [] as Array<{ index: number; text: string; url: string }>,
        totalVars: 0,
        headerText: "",
        bodyText: "",
      };
    }
    const headerComp = activeTemplate.components.find((c) => c.type === "HEADER");
    const bodyComp = activeTemplate.components.find((c) => c.type === "BODY");
    const buttonsComp = activeTemplate.components.find((c) => c.type === "BUTTONS");

    let headerVars: string[] = [];
    let headerText = "";
    if (headerComp?.format === "TEXT" && headerComp.text) {
      headerText = headerComp.text;
      const matches = Array.from(headerComp.text.matchAll(/\{\{(\d+)\}\}/g));
      headerVars = Array.from(new Set(matches.map((m) => m[1]))).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    }

    let bodyVars: string[] = [];
    let bodyText = "";
    if (bodyComp?.text) {
      bodyText = bodyComp.text;
      const matches = Array.from(bodyComp.text.matchAll(/\{\{(\d+)\}\}/g));
      bodyVars = Array.from(new Set(matches.map((m) => m[1]))).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    }

    const urlButtonVars: Array<{ index: number; text: string; url: string }> = [];
    if (buttonsComp?.buttons) {
      buttonsComp.buttons.forEach((btn, idx) => {
        if (btn.type === "URL" && btn.url && /\{\{(\d+)\}\}/.test(btn.url)) {
          urlButtonVars.push({ index: idx, text: btn.text || `Button ${idx + 1}`, url: btn.url });
        }
      });
    }

    return {
      headerVars,
      bodyVars,
      urlButtonVars,
      totalVars: headerVars.length + bodyVars.length + urlButtonVars.length,
      headerText,
      bodyText,
    };
  }, [activeTemplate]);

  // Formatted Preview Text
  const previewText = useMemo(() => {
    if (messageType === "text") {
      return textBody.trim() || "(Empty text message)";
    }
    if (messageType === "template") {
      if (!activeTemplate) return "(Select an approved template)";
      let result = "";
      if (templateInspection.headerText) {
        let h = templateInspection.headerText;
        for (const k of templateInspection.headerVars) {
          const val = templateVariables[`header_${k}`] || templateVariables[k] || `{{${k}}}`;
          h = h.replaceAll(`{{${k}}}`, val);
        }
        result += `*${h}*\n\n`;
      }
      if (templateInspection.bodyText) {
        let b = templateInspection.bodyText;
        for (const k of templateInspection.bodyVars) {
          const val = templateVariables[`body_${k}`] || templateVariables[k] || `{{${k}}}`;
          b = b.replaceAll(`{{${k}}}`, val);
        }
        result += b;
      }
      if (templateInspection.urlButtonVars.length > 0) {
        result += "\n\n--- Action Buttons ---";
        for (const btn of templateInspection.urlButtonVars) {
          const val = templateVariables[`button_${btn.index}`] || "https://astitvainnovation.in/";
          result += `\n🔗 [${btn.text}]: ${btn.url.replace(/\{\{\d+\}\}/, val)}`;
        }
      }
      return result || "(Approved static message with 0 parameters)";
    }
    if (messageType === "media") {
      return mediaCaption.trim()
        ? `[${mediaType.toUpperCase()}] ${mediaCaption.trim()}`
        : `[${mediaType.toUpperCase()} file attached]`;
    }
    return "";
  }, [messageType, textBody, activeTemplate, templateInspection, templateVariables, mediaType, mediaCaption]);

  // Active Sender Info
  const activeTenant = useMemo(() => {
    return tenants.find((t) => t.id === activeTenantId);
  }, [tenants, activeTenantId]);

  const senderPhone = activeTenant?.businessPhoneNumber || config?.businessPhoneNumber || "+91 7233882089";
  const senderDisplayName = activeTenant?.name || config?.displayName || "Astitva Innovation";

  // Handle Validation Before Confirmation
  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!normalizedPhone || !normalizedPhone.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Recipient Phone",
        description: normalizedPhone?.errorMessage || "Please enter a valid international phone number.",
      });
      return;
    }

    if (isOptedOut) {
      toast({
        variant: "destructive",
        title: "Recipient Opted Out",
        description: `Customer ${normalizedPhone.display} has opted out of WhatsApp notifications. Sending is suppressed under Meta policy.`,
      });
      return;
    }

    if (!isWindowOpen && messageType !== "template") {
      toast({
        variant: "destructive",
        title: "24-Hour Window Closed",
        description: "Meta WhatsApp Policy requires an approved template message when the customer service window is closed.",
      });
      return;
    }

    if (messageType === "text" && !textBody.trim()) {
      toast({
        variant: "destructive",
        title: "Message Text Required",
        description: "Please enter your message text.",
      });
      return;
    }

    if (messageType === "template" && !selectedTemplateName) {
      toast({
        variant: "destructive",
        title: "Template Required",
        description: "Please select an approved message template.",
      });
      return;
    }

    if (messageType === "media" && !mediaUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Media URL Required",
        description: "Please enter a valid public media link (https://).",
      });
      return;
    }

    setPolicyConfirmed(false);
    setIsConfirmOpen(true);
  };

  // Submit via Official Meta Cloud API
  const handleExecuteSend = async () => {
    if (!normalizedPhone?.isValid || isSending) return;

    setIsSending(true);
    try {
      let result: WhatsAppOperationResult;

      if (messageType === "text") {
        result = await whatsappService.sendTextMessage({
          to: normalizedPhone.rawDigits,
          text: textBody.trim(),
        });
      } else if (messageType === "template") {
        const components: unknown[] = [];

        if (templateInspection.headerVars.length > 0) {
          components.push({
            type: "header",
            parameters: templateInspection.headerVars.map((k) => ({
              type: "text",
              text: templateVariables[`header_${k}`] || templateVariables[k] || "N/A",
            })),
          });
        }

        if (templateInspection.bodyVars.length > 0) {
          components.push({
            type: "body",
            parameters: templateInspection.bodyVars.map((k) => ({
              type: "text",
              text: templateVariables[`body_${k}`] || templateVariables[k] || "N/A",
            })),
          });
        }

        for (const btn of templateInspection.urlButtonVars) {
          components.push({
            type: "button",
            sub_type: "url",
            index: String(btn.index),
            parameters: [
              {
                type: "text",
                text: templateVariables[`button_${btn.index}`] || "https://astitvainnovation.in/",
              },
            ],
          });
        }

        result = await whatsappService.sendTemplateMessage({
          to: normalizedPhone.rawDigits,
          templateName: selectedTemplateName,
          languageCode: activeTemplate?.language || "en_US",
          components,
        });
      } else {
        result = await whatsappService.sendMediaMessage({
          to: normalizedPhone.rawDigits,
          mediaType,
          mediaUrl: mediaUrl.trim(),
          caption: mediaCaption.trim() || undefined,
        });
      }

      toast({
        title: "Message Dispatched Successfully",
        description: `Meta Cloud API Message ID: ${result.messageId || "Dispatched"}`,
      });

      setIsConfirmOpen(false);
      onClose();
      onMessageSent(result, normalizedPhone.rawDigits);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Dispatch Failed",
        description: getErrorMessage(err, "Meta Cloud API rejected message delivery."),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Manual WhatsApp Message Composer
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                Meta Cloud API v20.0
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatch compliant messages to customers in adherence with Meta Business Messaging Policy.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleProceedToConfirm} className="space-y-4 pt-2">
            {/* Sender Account Card */}
            <div className="p-3 rounded-xl bg-background/50 border border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <div>
                  <span className="font-semibold block text-foreground">{senderDisplayName}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">Sender: {senderPhone}</span>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                Verified WABA
              </Badge>
            </div>

            {/* Recipient Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">Recipient Destination</label>
                <div className="flex items-center gap-1 bg-background/60 p-0.5 rounded-lg border border-border/50 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setRecipientMode("contact")}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                      recipientMode === "contact" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    From Contacts
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientMode("manual")}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors ${
                      recipientMode === "manual" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Manual Entry
                  </button>
                </div>
              </div>

              {recipientMode === "contact" ? (
                <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                  <SelectTrigger className="text-xs bg-background/60">
                    <SelectValue placeholder="Select a registered contact..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {contacts.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No contacts saved in ledger
                      </SelectItem>
                    ) : (
                      contacts.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-xs">
                          {c.name} ({normalizePhoneNumber(c.phone).display}) — {c.consentStatus}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={manualPhoneInput}
                  onChange={(e) => setManualPhoneInput(e.target.value)}
                  placeholder="e.g. +91 7233882089 or 917233882089"
                  className="text-xs font-mono bg-background/60"
                />
              )}

              {/* Normalized Phone Display & Consent Status */}
              {normalizedPhone && (
                <div className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-background/40 border border-border/40">
                  <span className="font-mono text-muted-foreground">
                    Normalized:{" "}
                    <strong className={normalizedPhone.isValid ? "text-primary" : "text-destructive"}>
                      {normalizedPhone.isValid ? normalizedPhone.display : "Invalid Number"}
                    </strong>
                  </span>
                  {isOptedOut ? (
                    <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10 text-[9px]">
                      OPTED_OUT (Suppressed)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[9px]">
                      Eligible for Send
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Customer Service Window Policy Notice */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                isWindowOpen
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              {isWindowOpen ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      Customer Service Window Active • {remainingMinutes} minutes remaining
                    </span>
                    <p className="text-[11px] text-emerald-300/80">
                      Inbound inquiry received within the last 24 hours. Free-form text replies, templates, and media are permitted.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      Customer Service Window Closed • Approved Template Required
                    </span>
                    <p className="text-[11px] text-amber-300/80">
                      Under Meta Policy, business-initiated messages outside the 24-hour window must use an approved template. Free-form text is disabled.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Message Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Message Type</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!isWindowOpen}
                  onClick={() => setMessageType("text")}
                  className={`text-xs h-9 justify-start ${
                    messageType === "text" ? "border-primary bg-primary/10 text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" /> Free-Form Text
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMessageType("template")}
                  className={`text-xs h-9 justify-start ${
                    messageType === "template" ? "border-primary bg-primary/10 text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" /> Approved Template
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={!isWindowOpen}
                  onClick={() => setMessageType("media")}
                  className={`text-xs h-9 justify-start ${
                    messageType === "media" ? "border-primary bg-primary/10 text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Media Attachment
                </Button>
              </div>
            </div>

            {/* Dynamic Content Inputs */}
            {messageType === "text" && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Text Message Content</label>
                <Textarea
                  value={textBody}
                  onChange={(e) => setTextBody(e.target.value)}
                  placeholder="Type your message to the customer..."
                  rows={4}
                  className="text-xs bg-background/60 leading-relaxed"
                />
                <span className="text-[10px] text-muted-foreground block text-right">
                  {textBody.length} characters
                </span>
              </div>
            )}

            {messageType === "template" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Select Approved Meta Template</label>
                  <Select value={selectedTemplateName} onValueChange={setSelectedTemplateName}>
                    <SelectTrigger className="text-xs bg-background/60 font-mono">
                      <SelectValue placeholder="Choose template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map((t) => (
                        <SelectItem key={t.id} value={t.name} className="text-xs font-mono">
                          {t.name} ({t.category} • {t.language})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Variable Parameter Inputs */}
                {templateInspection.totalVars === 0 ? (
                  <div className="p-3 rounded-xl bg-background/40 border border-border/50 text-xs text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Static approved template: Requires zero dynamic parameters. Dispatches with approved content.</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-background/40 border border-border/50 space-y-2.5">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary" /> Template Variable Parameters
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Header Variables */}
                      {templateInspection.headerVars.map((k) => (
                        <div key={`header_${k}`} className="space-y-1">
                          <label className="text-[10px] font-mono text-muted-foreground">Header {`{{${k}}}`}</label>
                          <Input
                            value={templateVariables[`header_${k}`] || ""}
                            onChange={(e) =>
                              setTemplateVariables((prev) => ({ ...prev, [`header_${k}`]: e.target.value }))
                            }
                            placeholder={`Header variable {{${k}}}`}
                            className="text-xs h-8 bg-background/60"
                          />
                        </div>
                      ))}

                      {/* Body Variables */}
                      {templateInspection.bodyVars.map((k) => (
                        <div key={`body_${k}`} className="space-y-1">
                          <label className="text-[10px] font-mono text-muted-foreground">Body {`{{${k}}}`}</label>
                          <Input
                            value={templateVariables[`body_${k}`] || templateVariables[k] || ""}
                            onChange={(e) =>
                              setTemplateVariables((prev) => ({ ...prev, [`body_${k}`]: e.target.value, [k]: e.target.value }))
                            }
                            placeholder={`Body variable {{${k}}}`}
                            className="text-xs h-8 bg-background/60"
                          />
                        </div>
                      ))}

                      {/* Action Button Variables */}
                      {templateInspection.urlButtonVars.map((btn) => (
                        <div key={`btn_${btn.index}`} className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-mono text-muted-foreground">
                            Button URL Dynamic Parameter ({btn.text})
                          </label>
                          <Input
                            value={templateVariables[`button_${btn.index}`] || ""}
                            onChange={(e) =>
                              setTemplateVariables((prev) => ({ ...prev, [`button_${btn.index}`]: e.target.value }))
                            }
                            placeholder="e.g. https://astitvainnovation.in/ or url-suffix"
                            className="text-xs h-8 bg-background/60 font-mono"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {messageType === "media" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Media Type</label>
                    <Select value={mediaType} onValueChange={(val: "image" | "document") => setMediaType(val)}>
                      <SelectTrigger className="text-xs bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">Image (PNG, JPEG)</SelectItem>
                        <SelectItem value="document">Document (PDF)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Caption</label>
                    <Input
                      value={mediaCaption}
                      onChange={(e) => setMediaCaption(e.target.value)}
                      placeholder="Optional caption..."
                      className="text-xs bg-background/60"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Public Media URL (HTTPS)</label>
                  <Input
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://astitvainnovation.in/assets/proposal.pdf"
                    className="text-xs font-mono bg-background/60"
                  />
                </div>
              </div>
            )}

            {/* Live Preview Card */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">
                Live Message Preview
              </label>
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-xs text-foreground shadow-sm">
                <p className="whitespace-pre-wrap leading-relaxed">{previewText}</p>
                <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground font-mono">
                  <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <CheckCircle2 className="w-3 h-3 text-primary/70" />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isOptedOut || !normalizedPhone?.isValid}
                className="bg-primary text-white font-semibold"
              >
                Review &amp; Confirm
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Confirm WhatsApp Message Send
            </DialogTitle>
            <DialogDescription className="text-xs">
              Confirm recipient and dispatch authorization through official Meta Cloud API.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="p-3 rounded-xl bg-background/60 border border-border/60 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-bold text-foreground">
                  {selectedContact?.name ? `${selectedContact.name} ` : ""}
                  ({normalizedPhone?.display})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sender:</span>
                <span className="text-foreground">{senderDisplayName} ({senderPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="text-primary font-bold uppercase">{messageType}</span>
              </div>
              {messageType === "template" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template:</span>
                  <span className="text-foreground">{selectedTemplateName}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1">
                Rendered Content:
              </span>
              <p className="whitespace-pre-wrap leading-relaxed text-foreground text-[11px]">{previewText}</p>
            </div>

            <div className="p-2.5 rounded-xl bg-background/40 border border-border/40 flex items-start gap-2">
              <input
                type="checkbox"
                id="policyConfirm"
                checked={policyConfirmed}
                onChange={(e) => setPolicyConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-border"
              />
              <label htmlFor="policyConfirm" className="text-[11px] text-muted-foreground cursor-pointer">
                I verify that this recipient has documented opt-in consent and that this transmission conforms to Meta WhatsApp Business Messaging Policy.
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSending}
              onClick={() => setIsConfirmOpen(false)}
            >
              Back to Edit
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!policyConfirmed || isSending}
              onClick={handleExecuteSend}
              className="bg-primary text-white font-semibold"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  Dispatching...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Dispatch via Meta API
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
