import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  Send,
  Phone,
  Check,
  CheckCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  Shield,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Camera,
  Video,
  Key,
  Copy,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
  FileCheck,
  Zap,
  Activity,
  Maximize2,
  Lock,
  Edit2,
  Play,
  Square,
  UserPlus,
  UserX,
  UserCheck,
  ListOrdered,
  ShieldAlert,
  Database,
  ArrowUpDown,
  Info,
  Globe,
  Smartphone,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

import { whatsappService } from "../services/whatsappService";
import {
  WhatsAppConfig,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppTemplate,
  WhatsAppWebhookLog,
  WhatsAppApiLog,
  WhatsAppEvidence,
  WhatsAppChecklistItem,
  WhatsAppAuditLog,
  WhatsAppContact,
  WhatsAppDeliveryLog,
  WhatsAppHealthCheck,
  WhatsAppErrorGuide,
  WhatsAppSecurityPosture,
} from "../types/whatsapp";

const EVIDENCE_CATEGORIES = [
  "WhatsApp account connection",
  "Actual outbound test message",
  "Recipient-side message receipt",
  "Actual inbound message",
  "Webhook event processing",
  "Message status update",
  "Template approval",
  "Privacy policy and public business information",
  "Permission-specific user journey",
  "Meta App Review screencast",
  "API errors and troubleshooting",
  "WhatsApp Business Management features",
] as const;

export const WhatsAppPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get("tab") || "overview";

  // Normalize tab aliases
  const normalizeTab = (t: string) => {
    if (t === "messages") return "chats";
    if (t === "account") return "connection";
    if (t === "settings") return "connection";
    if (t === "logs") return "diagnostics";
    return t;
  };
  const activeTab = normalizeTab(rawTab);

  const { toast } = useToast();

  // Core State
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [healthCheck, setHealthCheck] = useState<WhatsAppHealthCheck | null>(null);
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string>("");
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WhatsAppWebhookLog[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<WhatsAppDeliveryLog[]>([]);
  const [apiLogs, setApiLogs] = useState<WhatsAppApiLog[]>([]);
  const [evidenceList, setEvidenceList] = useState<WhatsAppEvidence[]>([]);
  const [checklist, setChecklist] = useState<WhatsAppChecklistItem[]>([]);
  const [checklistSummary, setChecklistSummary] = useState<{ total: number; verifiedCount: number; progressPercent: number; isReadyForSubmission: boolean }>({
    total: 14,
    verifiedCount: 0,
    progressPercent: 0,
    isReadyForSubmission: false,
  });
  const [auditLogs, setAuditLogs] = useState<WhatsAppAuditLog[]>([]);
  const [securityPosture, setSecurityPosture] = useState<WhatsAppSecurityPosture | null>(null);
  const [errorDictionary, setErrorDictionary] = useState<WhatsAppErrorGuide[]>([]);

  // Loading States
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [testingHealth, setTestingHealth] = useState<boolean>(false);
  const [sendingMsg, setSendingMsg] = useState<boolean>(false);
  const [connectivityResult, setConnectivityResult] = useState<any>(null);

  // Chat State
  const [chatInput, setChatInput] = useState<string>("");
  const [convoSearch, setConvoSearch] = useState<string>("");
  const [convoFilter, setConvoFilter] = useState<"all" | "open" | "expired">("all");

  // Test Recipient Modal State
  const [isTestMessageOpen, setIsTestMessageOpen] = useState<boolean>(false);
  const [testRecipientPhone, setTestRecipientPhone] = useState<string>("+91 7233882089");
  const [testMessageText, setTestMessageText] = useState<string>("Astitva Innovation Meta Cloud API live verification ping.");
  const [testTemplateName, setTestTemplateName] = useState<string>("");
  const [sendingTest, setSendingTest] = useState<boolean>(false);

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>("");
  const [templateRecipient, setTemplateRecipient] = useState<string>("");
  const [templateVar1, setTemplateVar1] = useState<string>("");
  const [templateVar2, setTemplateVar2] = useState<string>("");
  const [templateVar3, setTemplateVar3] = useState<string>("");

  // Create Template Modal State
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>("");
  const [newTemplateCategory, setNewTemplateCategory] = useState<"UTILITY" | "MARKETING" | "AUTHENTICATION">("UTILITY");
  const [newTemplateBody, setNewTemplateBody] = useState<string>("");
  const [newTemplateFooter, setNewTemplateFooter] = useState<string>("Astitva Innovation");

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactName, setContactName] = useState<string>("");
  const [contactConsentStatus, setContactConsentStatus] = useState<string>("OPTED_IN");
  const [contactConsentSource, setContactConsentSource] = useState<string>("DIRECT_INBOUND_WHATSAPP");
  const [contactNotes, setContactNotes] = useState<string>("");
  const [contactSearch, setContactSearch] = useState<string>("");
  const [contactFilter, setContactFilter] = useState<string>("ALL");

  // Delivery Logs Filter State
  const [deliveryOpFilter, setDeliveryOpFilter] = useState<string>("ALL");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<string>("ALL");
  const [deliverySearch, setDeliverySearch] = useState<string>("");

  // Evidence State
  const [evidenceCategoryFilter, setEvidenceCategoryFilter] = useState<string>("all");
  const [isEvidenceUploadOpen, setIsEvidenceUploadOpen] = useState<boolean>(false);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceFileName, setEvidenceFileName] = useState<string>("");
  const [evidenceCategory, setEvidenceCategory] = useState<string>(EVIDENCE_CATEGORIES[0]);
  const [evidenceNotes, setEvidenceNotes] = useState<string>("");
  const [evidenceIsRedacted, setEvidenceIsRedacted] = useState<boolean>(true);
  const [uploadingEvidence, setUploadingEvidence] = useState<boolean>(false);
  const [previewEvidence, setPreviewEvidence] = useState<WhatsAppEvidence | null>(null);

  // Screen Recorder State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Connection Settings Form State
  const [settingsToken, setSettingsToken] = useState<string>("");
  const [settingsWabaId, setSettingsWabaId] = useState<string>("");
  const [settingsPhoneId, setSettingsPhoneId] = useState<string>("");
  const [settingsAppId, setSettingsAppId] = useState<string>("");
  const [settingsAppSecret, setSettingsAppSecret] = useState<string>("");
  const [settingsVerifyToken, setSettingsVerifyToken] = useState<string>("");
  const [settingsBusinessPhone, setSettingsBusinessPhone] = useState<string>("");
  const [settingsDisplayName, setSettingsDisplayName] = useState<string>("");
  const [savingSettings, setSavingSettings] = useState<boolean>(false);

  // Webhook Test Challenge State
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false);

  // Payload Inspector Drawer
  const [inspectedPayload, setInspectedPayload] = useState<{ title: string; data: any } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (val: string) => {
    setSearchParams({ tab: val });
  };

  // Initial Data Fetch
  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [
        cfg,
        hlth,
        convos,
        msgsRes,
        tmpls,
        cntsRes,
        whLogs,
        dlvLogsRes,
        aLogs,
        evd,
        chkRes,
        audit,
        sec,
        errs,
      ] = await Promise.all([
        whatsappService.getConfig().catch(() => null),
        whatsappService.getHealthCheck().catch(() => null),
        whatsappService.getConversations().catch(() => []),
        whatsappService.getMessages({ limit: 100 }).catch(() => ({ data: [] })),
        whatsappService.getTemplates().catch(() => []),
        whatsappService.getContacts().catch(() => ({ data: [] })),
        whatsappService.getWebhookLogs().catch(() => []),
        whatsappService.getDeliveryLogs({ limit: 100 }).catch(() => ({ data: [] })),
        whatsappService.getApiLogs().catch(() => []),
        whatsappService.getEvidence().catch(() => []),
        whatsappService.getChecklist().catch(() => ({ data: [], summary: { total: 14, verifiedCount: 0, progressPercent: 0, isReadyForSubmission: false } })),
        whatsappService.getAuditLogs().catch(() => []),
        whatsappService.getSecurityPosture().catch(() => null),
        whatsappService.getErrorDictionary().catch(() => []),
      ]);

      if (cfg) {
        setConfig(cfg);
        setSettingsWabaId(cfg.wabaId || "");
        setSettingsPhoneId(cfg.phoneNumberId || "");
        setSettingsAppId(cfg.appId || "");
        setSettingsVerifyToken(cfg.verifyToken || "");
        setSettingsBusinessPhone(cfg.businessPhoneNumber || "");
        setSettingsDisplayName(cfg.displayName || "");
      }
      if (hlth) setHealthCheck(hlth);
      setConversations(convos || []);
      if (convos && convos.length > 0 && !selectedConvoId) {
        setSelectedConvoId(convos[0].id);
      }
      setMessages(msgsRes?.data || []);
      setTemplates(tmpls || []);
      setContacts(cntsRes?.data || []);
      setWebhookLogs(whLogs || []);
      setDeliveryLogs(dlvLogsRes?.data || []);
      setApiLogs(aLogs || []);
      setEvidenceList(evd || []);
      if (chkRes) {
        setChecklist(chkRes.data || []);
        setChecklistSummary(chkRes.summary);
      }
      setAuditLogs(audit || []);
      setSecurityPosture(sec);
      setErrorDictionary(errs || []);
    } catch (err: any) {
      console.error("Failed to load WhatsApp Platform data:", err);
      toast({
        variant: "destructive",
        title: "Synchronization Issue",
        description: err.message || "Could not fetch platform data.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Poll for conversation & message updates every 8 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [convos, msgsRes] = await Promise.all([
          whatsappService.getConversations().catch(() => null),
          selectedConvoId
            ? whatsappService.getMessages({ conversationId: selectedConvoId }).catch(() => null)
            : whatsappService.getMessages({ limit: 50 }).catch(() => null),
        ]);
        if (convos) setConversations(convos);
        if (msgsRes?.data) setMessages(msgsRes.data);
      } catch (e) {
        // silent polling catch
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [selectedConvoId]);

  // Scroll to bottom of active chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConvoId]);

  // Select conversation and load thread
  const handleSelectConversation = async (convoId: string) => {
    setSelectedConvoId(convoId);
    try {
      const res = await whatsappService.getMessages({ conversationId: convoId });
      setMessages(res.data);
    } catch (e) {
      console.error("Failed to load messages for conversation:", e);
    }
  };

  // Run Real Health Check
  const handleRunHealthCheck = async () => {
    setTestingHealth(true);
    try {
      const result = await whatsappService.getHealthCheck();
      setHealthCheck(result);
      if (config) {
        setConfig({ ...config, status: result.overallStatus });
      }
      toast({
        title: `Health Check: ${result.overallStatus.toUpperCase()}`,
        description: `API Authentication: ${result.stages.apiAuthentication.status} • Phone: ${result.stages.phoneNumberAccessible.status}`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Health Check Failed",
        description: err.message || "Failed to execute API health check.",
      });
    } finally {
      setTestingHealth(false);
    }
  };

  // Run Safe Connectivity Test
  const handleRunConnectivityTest = async () => {
    try {
      const res = await whatsappService.connectivityTest();
      setConnectivityResult(res);
      toast({
        title: res.success ? "Connectivity Verified" : "Connectivity Issue",
        description: `Status: HTTP ${res.status} (Latency: ${res.latencyMs}ms)`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Connectivity Check Error",
        description: err.message || "Failed to reach Meta Cloud API.",
      });
    }
  };

  // Sync Account details from Meta Graph API
  const handleSyncAccount = async () => {
    setSyncing(true);
    try {
      const res = await whatsappService.syncAccount();
      setConfig(res.data);
      toast({
        title: "Account Synced Successfully",
        description: `Verified Display Name: ${res.data.displayName} • Quality: ${res.data.qualityRating}`,
      });
      loadInitialData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: err.message || "Failed to synchronize with Meta Graph API.",
      });
    } finally {
      setSyncing(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const payload: any = {
        wabaId: settingsWabaId,
        phoneNumberId: settingsPhoneId,
        appId: settingsAppId,
        verifyToken: settingsVerifyToken,
        businessPhoneNumber: settingsBusinessPhone,
        displayName: settingsDisplayName,
      };
      if (settingsToken.trim()) payload.token = settingsToken.trim();
      if (settingsAppSecret.trim()) payload.appSecret = settingsAppSecret.trim();

      await whatsappService.updateConfig(payload);
      toast({
        title: "Configuration Saved",
        description: "WhatsApp Business credentials and settings updated securely.",
      });
      setSettingsToken("");
      setSettingsAppSecret("");
      loadInitialData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "Failed to update configuration.",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Send Text Message
  const handleSendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedConvoId) return;

    setSendingMsg(true);
    try {
      const res = await whatsappService.sendTextMessage({
        to: selectedConvoId,
        text: chatInput.trim(),
      });
      setChatInput("");
      toast({
        title: "Message Dispatched",
        description: `Meta Message ID: ${res.messageId}`,
      });
      const updatedMsgs = await whatsappService.getMessages({ conversationId: selectedConvoId });
      setMessages(updatedMsgs.data);
      const updatedConvos = await whatsappService.getConversations();
      setConversations(updatedConvos);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err.optedOut ? "Recipient Suppressed" : "Dispatch Failed",
        description: err.message || "Could not send message.",
      });
    } finally {
      setSendingMsg(false);
    }
  };

  // Send Test Recipient Message Workflow
  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipientPhone.trim()) return;

    setSendingTest(true);
    try {
      await whatsappService.sendTestRecipientMessage({
        to: testRecipientPhone.trim(),
        text: testMessageText.trim(),
        templateName: testTemplateName || undefined,
      });
      toast({
        title: "Test Message Sent",
        description: `Dispatched to authorized test recipient ${testRecipientPhone}.`,
      });
      setIsTestMessageOpen(false);
      loadInitialData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Test Message Failed",
        description: err.message || "Failed to send test message.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  // Sync Templates from Meta
  const handleSyncTemplates = async () => {
    try {
      const res = await whatsappService.syncTemplates();
      setTemplates(res.data);
      toast({
        title: "Templates Synchronized",
        description: `Loaded ${res.count} templates directly from Meta Cloud API.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Template Sync Failed",
        description: err.message || "Failed to fetch approved templates from Meta.",
      });
    }
  };

  // Send Template Message
  const handleSendTemplateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateName || !templateRecipient) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a template and enter recipient phone number.",
      });
      return;
    }

    const components: any[] = [];
    const params: any[] = [];
    if (templateVar1.trim()) params.push({ type: "text", text: templateVar1.trim() });
    if (templateVar2.trim()) params.push({ type: "text", text: templateVar2.trim() });
    if (templateVar3.trim()) params.push({ type: "text", text: templateVar3.trim() });

    if (params.length > 0) {
      components.push({
        type: "body",
        parameters: params,
      });
    }

    try {
      await whatsappService.sendTemplateMessage({
        to: templateRecipient,
        templateName: selectedTemplateName,
        components,
      });
      toast({
        title: "Template Dispatched",
        description: `Template "${selectedTemplateName}" sent to ${templateRecipient}.`,
      });
      setIsTemplateModalOpen(false);
      setTemplateVar1("");
      setTemplateVar2("");
      setTemplateVar3("");
      loadInitialData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Template Dispatch Failed",
        description: err.message || "Failed to dispatch template message.",
      });
    }
  };

  // Create Template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim() || !newTemplateBody.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Template name and body content are required.",
      });
      return;
    }

    const components: any[] = [
      {
        type: "BODY",
        text: newTemplateBody.trim(),
      },
    ];
    if (newTemplateFooter.trim()) {
      components.push({
        type: "FOOTER",
        text: newTemplateFooter.trim(),
      });
    }

    try {
      await whatsappService.createTemplate({
        name: newTemplateName.trim(),
        category: newTemplateCategory,
        language: "en_US",
        components,
      });
      toast({
        title: "Template Submitted to Meta",
        description: `"${newTemplateName}" submitted for Meta review.`,
      });
      setIsNewTemplateModalOpen(false);
      setNewTemplateName("");
      setNewTemplateBody("");
      handleSyncTemplates();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Template Submission Failed",
        description: err.message || "Could not submit template to Meta.",
      });
    }
  };

  // Add Contact
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactPhone.trim()) return;

    try {
      await whatsappService.createContact({
        phone: contactPhone.trim(),
        name: contactName.trim(),
        consentStatus: contactConsentStatus,
        consentSource: contactConsentSource,
        notes: contactNotes.trim(),
      });
      toast({
        title: "Contact Saved",
        description: `Consent recorded for ${contactPhone}.`,
      });
      setIsContactModalOpen(false);
      setContactPhone("");
      setContactName("");
      setContactNotes("");
      const res = await whatsappService.getContacts();
      setContacts(res.data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to Add Contact",
        description: err.message || "Could not create contact.",
      });
    }
  };

  // Toggle Contact Opt-out
  const handleToggleOptOut = async (c: WhatsAppContact) => {
    try {
      if (c.consentStatus === "OPTED_OUT") {
        await whatsappService.optInContact(c.id);
        toast({ title: "Contact Opted In", description: `${c.phone} re-enabled for outbound messages.` });
      } else {
        await whatsappService.optOutContact(c.id);
        toast({ title: "Contact Suppressed", description: `${c.phone} marked OPTED_OUT. Outbound sending blocked.` });
      }
      const res = await whatsappService.getContacts();
      setContacts(res.data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Action Failed", description: err.message });
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to remove this contact and consent record?")) return;
    try {
      await whatsappService.deleteContact(id);
      toast({ title: "Contact Removed", description: "Record removed from database." });
      const res = await whatsappService.getContacts();
      setContacts(res.data);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to Delete", description: err.message });
    }
  };

  // Test Webhook Verification Challenge
  const handleTestWebhookChallenge = async () => {
    setTestingWebhook(true);
    try {
      const res = await whatsappService.testWebhookChallenge();
      setWebhookTestResult(res);
      toast({
        title: res.success ? "Webhook Challenge Verified" : "Challenge Check Failed",
        description: res.success ? "Verify token and HMAC validation verified successfully." : "Please verify your verifyToken in settings.",
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Webhook Test Error", description: err.message });
    } finally {
      setTestingWebhook(false);
    }
  };

  // Upload Evidence File
  const handleUploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceFile) {
      toast({ variant: "destructive", title: "File Required", description: "Please select a screenshot or video file." });
      return;
    }

    setUploadingEvidence(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await whatsappService.uploadEvidence({
            fileName: evidenceFileName || evidenceFile.name,
            mimeType: evidenceFile.type,
            fileData: base64Data,
            category: evidenceCategory,
            notes: evidenceNotes,
            isRedacted: evidenceIsRedacted,
          });
          toast({
            title: "Evidence Uploaded",
            description: `Saved "${res.data.fileName}" (${(res.data.fileSize / 1024).toFixed(1)} KB).`,
          });
          setIsEvidenceUploadOpen(false);
          setEvidenceFile(null);
          setEvidenceFileName("");
          setEvidenceNotes("");
          const updated = await whatsappService.getEvidence();
          setEvidenceList(updated);
        } catch (err: any) {
          toast({ variant: "destructive", title: "Upload Failed", description: err.message });
        } finally {
          setUploadingEvidence(false);
        }
      };
      reader.readAsDataURL(evidenceFile);
    } catch (err: any) {
      setUploadingEvidence(false);
      toast({ variant: "destructive", title: "File Read Error", description: err.message });
    }
  };

  // Delete Evidence
  const handleDeleteEvidence = async (id: string) => {
    if (!confirm("Are you sure you want to delete this evidence record?")) return;
    try {
      await whatsappService.deleteEvidence(id);
      toast({ title: "Evidence Deleted", description: "File and record removed." });
      const updated = await whatsappService.getEvidence();
      setEvidenceList(updated);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: err.message });
    }
  };

  // Real Browser Screen Recording
  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
      });

      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setRecordingSeconds(0);

        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const file = new File([blob], `astitva_screencast_${Date.now()}.webm`, { type: "video/webm" });
        setEvidenceFile(file);
        setEvidenceFileName(file.name);
        setEvidenceCategory("Meta App Review screencast");
        setEvidenceNotes("Recorded via in-browser screencast tool demonstrating WhatsApp messaging workflow.");
        setIsEvidenceUploadOpen(true);

        stream.getTracks().forEach((track) => track.stop());
        toast({
          title: "Screencast Recorded Successfully",
          description: "Recording captured! Click Upload to persist to official Meta App Review dossier.",
        });
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // 1s slice
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      toast({
        title: "Screen Recording Started",
        description: "Capturing your screen. Demonstrate the WhatsApp workflow and click Stop when finished.",
      });
    } catch (err: any) {
      console.warn("Screen recording error:", err);
      toast({
        variant: "destructive",
        title: "Screen Recording Cancelled or Unsupported",
        description: err.message || "Please use OBS or Quicktime to record your screencast and upload the MP4/WEBM file below.",
      });
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  // Run Checklist Verification Scan
  const handleRunChecklistScan = async () => {
    try {
      const updated = await whatsappService.runVerificationScan();
      setChecklist(updated);
      const passed = updated.filter((item) => item.verified).length;
      setChecklistSummary({
        total: updated.length,
        verifiedCount: passed,
        progressPercent: Math.round((passed / updated.length) * 100),
        isReadyForSubmission: passed === updated.length,
      });
      toast({
        title: "Verification Scan Completed",
        description: `${passed} of ${updated.length} App Review prerequisites verified.`,
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Scan Failed", description: err.message });
    }
  };

  // Toggle Checklist Manual Verification
  const handleToggleChecklistItem = async (item: WhatsAppChecklistItem) => {
    try {
      await whatsappService.updateChecklistItem(item.id, {
        manuallyVerified: !item.verified,
        notes: item.notes || "Audited and verified by system administrator.",
      });
      handleRunChecklistScan();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message });
    }
  };

  // Export Compliance Dossier
  const handleExportDossier = async () => {
    try {
      const markdown = await whatsappService.exportChecklistDossier();
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Astitva_WhatsApp_Meta_App_Review_Dossier_${Date.now()}.md`;
      link.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Dossier Exported",
        description: "Markdown compliance report downloaded successfully.",
      });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Export Failed", description: err.message });
    }
  };

  // Active Conversation Thread & Window
  const activeConvo = conversations.find((c) => c.id === selectedConvoId);
  const isWindowActive = activeConvo?.isWindowOpen ?? false;

  // Filtered Contacts
  const filteredContacts = contacts.filter((c) => {
    const matchStatus = contactFilter === "ALL" || c.consentStatus === contactFilter;
    const matchSearch =
      !contactSearch ||
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.phone.includes(contactSearch) ||
      c.notes.toLowerCase().includes(contactSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Filtered Delivery Logs
  const filteredDeliveryLogs = deliveryLogs.filter((l) => {
    const matchOp = deliveryOpFilter === "ALL" || l.operationType === deliveryOpFilter;
    const matchStatus =
      deliveryStatusFilter === "ALL" ||
      (deliveryStatusFilter === "SUCCESS" && l.success) ||
      (deliveryStatusFilter === "FAILED" && !l.success);
    const matchSearch =
      !deliverySearch ||
      l.to.includes(deliverySearch) ||
      (l.messageId && l.messageId.toLowerCase().includes(deliverySearch.toLowerCase())) ||
      (l.correlationId && l.correlationId.toLowerCase().includes(deliverySearch.toLowerCase()));
    return matchOp && matchStatus && matchSearch;
  });

  // Filtered Evidence
  const filteredEvidence = evidenceList.filter((e) => {
    if (evidenceCategoryFilter === "all") return true;
    return e.category === evidenceCategoryFilter;
  });

  // Statistics
  const totalOutbound = messages.filter((m) => m.direction === "outbound").length;
  const totalInbound = messages.filter((m) => m.direction === "inbound").length;
  const successfulOutbound = messages.filter((m) => m.direction === "outbound" && m.status !== "failed").length;
  const deliverySuccessRate = totalOutbound > 0 ? Math.round((successfulOutbound / totalOutbound) * 100) : 100;
  const lastInboundMsg = messages.filter((m) => m.direction === "inbound").slice(-1)[0];
  const lastOutboundMsg = messages.filter((m) => m.direction === "outbound").slice(-1)[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Platform Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/70 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2">
                WhatsApp Business Platform
                <Badge
                  variant="outline"
                  className={`text-[10px] font-mono uppercase ${
                    healthCheck?.overallStatus === "Connected"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : healthCheck?.overallStatus === "Pending"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      : "border-destructive/40 bg-destructive/10 text-destructive"
                  }`}
                >
                  {healthCheck?.overallStatus || config?.status || "Disconnected"}
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">
                Official Meta WhatsApp Cloud API v{config?.apiVersion || "20.0"} • Business Phone:{" "}
                <span className="font-mono text-foreground font-semibold">{config?.businessPhoneNumber || "+91 7233882089"}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunHealthCheck}
            disabled={testingHealth}
            className="text-xs h-9 border-border/80 hover:bg-card"
          >
            <Activity className={`w-3.5 h-3.5 mr-1.5 ${testingHealth ? "animate-spin text-primary" : "text-emerald-400"}`} />
            {testingHealth ? "Testing Health..." : "API Health Check"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncAccount}
            disabled={syncing}
            className="text-xs h-9 border-border/80 hover:bg-card"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${syncing ? "animate-spin text-primary" : ""}`} />
            {syncing ? "Syncing..." : "Sync Meta Account"}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsTestMessageOpen(true)}
            className="text-xs h-9 bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/20"
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Send Test Message
          </Button>
        </div>
      </div>

      {/* 11 Main Navigation Modules Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-card/70 border border-border/60 p-1.5 rounded-2xl flex flex-wrap gap-1 w-full max-w-full overflow-x-auto justify-start h-auto shadow-sm">
          <TabsTrigger value="overview" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Activity className="w-3.5 h-3.5 mr-1.5" /> 1. Overview
          </TabsTrigger>
          <TabsTrigger value="connection" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Key className="w-3.5 h-3.5 mr-1.5" /> 2. Connection & Config
          </TabsTrigger>
          <TabsTrigger value="chats" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> 3. Chats / Messages
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> 4. Message Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="contacts" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> 5. Contacts & Opt-in ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Zap className="w-3.5 h-3.5 mr-1.5" /> 6. Webhooks & Events ({webhookLogs.length})
          </TabsTrigger>
          <TabsTrigger value="delivery-logs" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <ListOrdered className="w-3.5 h-3.5 mr-1.5" /> 7. Delivery Logs ({deliveryLogs.length})
          </TabsTrigger>
          <TabsTrigger value="evidence" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Camera className="w-3.5 h-3.5 mr-1.5" /> 8. Evidence & Screencast ({evidenceList.length})
          </TabsTrigger>
          <TabsTrigger value="checklist" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <FileCheck className="w-3.5 h-3.5 mr-1.5" /> 9. App Review Checklist ({checklistSummary.verifiedCount}/{checklistSummary.total})
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Layers className="w-3.5 h-3.5 mr-1.5" /> 10. Diagnostics & API Logs ({apiLogs.length})
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Shield className="w-3.5 h-3.5 mr-1.5" /> 11. Security & RBAC
          </TabsTrigger>
        </TabsList>

        {/* ========================================================================= */}
        {/* MODULE 1: OVERVIEW DASHBOARD                                              */}
        {/* ========================================================================= */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card/60 border-border/70 backdrop-blur-sm shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium">Outbound Messages</CardDescription>
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                  <span>{totalOutbound}</span>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    {deliverySuccessRate}% Delivered
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
                Last send: {lastOutboundMsg?.timestamp ? new Date(lastOutboundMsg.timestamp).toLocaleTimeString() : "No messages sent yet"}
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/70 backdrop-blur-sm shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium">Inbound User Inquiries</CardDescription>
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                  <span>{totalInbound}</span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 bg-primary/10 text-primary">
                    24h Window
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
                Last inbound: {lastInboundMsg?.timestamp ? new Date(lastInboundMsg.timestamp).toLocaleTimeString() : "No inbound received yet"}
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/70 backdrop-blur-sm shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium">Phone Quality & Tier</CardDescription>
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                  <span className="text-emerald-400">{config?.qualityRating || "GREEN"}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-border">
                    {config?.messagingLimitTier || "TIER_1K"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 text-[11px] text-muted-foreground">
                Status: {config?.codeVerificationStatus || "NOT_VERIFIED"} • Display: {config?.displayName || "Astitva Innovation"}
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/70 backdrop-blur-sm shadow-md">
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs font-medium">Meta App Review Progress</CardDescription>
                <CardTitle className="text-2xl font-bold flex items-center justify-between">
                  <span>{checklistSummary.progressPercent}%</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      checklistSummary.isReadyForSubmission
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {checklistSummary.verifiedCount}/{checklistSummary.total} Ready
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-1">
                <Progress value={checklistSummary.progressPercent} className="h-1.5" />
              </CardContent>
            </Card>
          </div>

          {/* 6-Stage Real API Health Check Matrix */}
          <Card className="bg-card/60 border-border/70 shadow-lg">
            <CardHeader className="p-5 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Six-Stage Official Verification Health Matrix
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Live system state verification distinguishing credentials, API authentication, phone access, webhooks, messaging, and review status.
                  </CardDescription>
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Last Health Check: {healthCheck?.timestamp ? new Date(healthCheck.timestamp).toLocaleString() : "Not Tested"}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Stage 1: Credentials */}
                <div className="p-4 rounded-2xl bg-background/50 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-primary" /> 1. Credentials Configured
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        healthCheck?.stages?.credentialsConfigured?.status === "PASS"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {healthCheck?.stages?.credentialsConfigured?.status || (config?.hasToken ? "PASS" : "BLOCKED")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {healthCheck?.stages?.credentialsConfigured?.detail || (config?.hasToken ? "API Token & IDs present in environment." : "Missing API credentials.")}
                  </p>
                </div>

                {/* Stage 2: API Authentication */}
                <div className="p-4 rounded-2xl bg-background/50 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-primary" /> 2. API Authentication
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        healthCheck?.stages?.apiAuthentication?.status === "PASS"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : healthCheck?.stages?.apiAuthentication?.status === "BLOCKED"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {healthCheck?.stages?.apiAuthentication?.status || "NOT TESTED"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {healthCheck?.stages?.apiAuthentication?.detail || "Run API Health Check to verify live bearer token against Graph API."}
                  </p>
                </div>

                {/* Stage 3: Phone Accessibility */}
                <div className="p-4 rounded-2xl bg-background/50 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-primary" /> 3. Phone Number Accessible
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        healthCheck?.stages?.phoneNumberAccessible?.status === "PASS"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : healthCheck?.stages?.phoneNumberAccessible?.status === "BLOCKED"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {healthCheck?.stages?.phoneNumberAccessible?.status || "NOT TESTED"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {healthCheck?.stages?.phoneNumberAccessible?.detail || "Queries Phone Number ID on Graph API to inspect quality rating and name."}
                  </p>
                </div>

                {/* Stage 4: Webhook Configured */}
                <div className="p-4 rounded-2xl bg-background/50 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-primary" /> 4. Webhook Ingress
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        healthCheck?.stages?.webhookConfigured?.status === "PASS"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : healthCheck?.stages?.webhookConfigured?.status === "PARTIAL"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {healthCheck?.stages?.webhookConfigured?.status || (webhookLogs.length > 0 ? "PARTIAL" : "NOT TESTED")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {healthCheck?.stages?.webhookConfigured?.detail || `${webhookLogs.length} events logged. HMAC-SHA256 signature verification active.`}
                  </p>
                </div>

                {/* Stage 5: Messaging Tested */}
                <div className="p-4 rounded-2xl bg-background/50 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-primary" /> 5. Messaging Tested (E2E)
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        healthCheck?.stages?.messagingTested?.status === "PASS"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : healthCheck?.stages?.messagingTested?.status === "PARTIAL"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {healthCheck?.stages?.messagingTested?.status || (messages.length > 0 ? "PARTIAL" : "NOT TESTED")}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {healthCheck?.stages?.messagingTested?.detail || `Outbound: ${totalOutbound}, Inbound: ${totalInbound}.`}
                  </p>
                </div>

                {/* Stage 6: Meta App Review Approved */}
                <div className="p-4 rounded-2xl bg-background/50 border border-border/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-primary" /> 6. Meta App Review
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        healthCheck?.stages?.appReviewApproved?.status === "PASS"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {healthCheck?.stages?.appReviewApproved?.status || "BLOCKED"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {healthCheck?.stages?.appReviewApproved?.detail || "Pending human submission and approval in Meta Developer Portal."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 2: CONNECTION & CONFIGURATION                                      */}
        {/* ========================================================================= */}
        <TabsContent value="connection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card/60 border-border/70 shadow-lg">
              <CardHeader className="p-5 border-b border-border/60">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Meta WhatsApp Cloud API Configuration
                </CardTitle>
                <CardDescription className="text-xs">
                  Values are stored strictly on the server and never exposed in client bundles. Tokens are masked.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">WhatsApp Business Account ID (WABA ID)</label>
                      <Input
                        value={settingsWabaId}
                        onChange={(e) => setSettingsWabaId(e.target.value)}
                        placeholder="e.g. 102938475610293"
                        className="font-mono text-xs bg-background/60"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Phone Number ID</label>
                      <Input
                        value={settingsPhoneId}
                        onChange={(e) => setSettingsPhoneId(e.target.value)}
                        placeholder="e.g. 109283746501928"
                        className="font-mono text-xs bg-background/60"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold flex items-center justify-between">
                      <span>System User Access Token (Permanent / Long-Lived)</span>
                      {config?.hasToken && (
                        <span className="text-[10px] font-mono text-emerald-400">
                          Active: {config.tokenPreview}
                        </span>
                      )}
                    </label>
                    <Input
                      type="password"
                      value={settingsToken}
                      onChange={(e) => setSettingsToken(e.target.value)}
                      placeholder={config?.hasToken ? "Enter new token to rotate (leave blank to keep)" : "EAAG... paste Meta Access Token"}
                      className="font-mono text-xs bg-background/60"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Meta App ID</label>
                      <Input
                        value={settingsAppId}
                        onChange={(e) => setSettingsAppId(e.target.value)}
                        placeholder="e.g. 847291038472910"
                        className="font-mono text-xs bg-background/60"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold flex items-center justify-between">
                        <span>Meta App Secret</span>
                        {config?.hasAppSecret && (
                          <span className="text-[10px] text-emerald-400 font-mono">Configured</span>
                        )}
                      </label>
                      <Input
                        type="password"
                        value={settingsAppSecret}
                        onChange={(e) => setSettingsAppSecret(e.target.value)}
                        placeholder={config?.hasAppSecret ? "Enter new secret to update" : "Paste Meta App Secret for signature checks"}
                        className="font-mono text-xs bg-background/60"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Webhook Verify Token</label>
                      <Input
                        value={settingsVerifyToken}
                        onChange={(e) => setSettingsVerifyToken(e.target.value)}
                        placeholder="astitva_wa_verify_token_2026_secure"
                        className="font-mono text-xs bg-background/60"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold">Verified Display Name</label>
                      <Input
                        value={settingsDisplayName}
                        onChange={(e) => setSettingsDisplayName(e.target.value)}
                        placeholder="Astitva Innovation"
                        className="text-xs bg-background/60"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border/60">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRunConnectivityTest}
                      className="text-xs"
                    >
                      <Activity className="w-3.5 h-3.5 mr-1.5 text-primary" />
                      Test Connectivity Ping
                    </Button>

                    <Button
                      type="submit"
                      disabled={savingSettings}
                      className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold"
                    >
                      {savingSettings ? "Saving Settings..." : "Save Configuration"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Ingress Callback & Webhook Setup Card */}
            <div className="space-y-6">
              <Card className="bg-card/60 border-border/70 shadow-lg">
                <CardHeader className="p-4 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-primary" /> Official Ingress Callback URL
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-background/70 border border-border/60 font-mono text-[11px] break-all select-all flex items-center justify-between gap-2">
                    <span>https://astitvainnovation.in/api/whatsapp/webhook</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText("https://astitvainnovation.in/api/whatsapp/webhook");
                        toast({ title: "Copied Callback URL", description: "Ready to paste in Meta Developer Portal." });
                      }}
                      className="h-7 w-7 p-0 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                    <p className="font-semibold text-foreground">Required Subscribed Webhook Fields:</p>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li><code>messages</code> (Incoming messages, texts, media)</li>
                      <li><code>messaging_postbacks</code> (Interactive buttons & list replies)</li>
                      <li><code>message_template_status_update</code> (Template approvals/rejections)</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestWebhookChallenge}
                      disabled={testingWebhook}
                      className="w-full text-xs"
                    >
                      <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      {testingWebhook ? "Testing Challenge..." : "Test Webhook Challenge Token"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Data Deletion Endpoint Card */}
              <Card className="bg-card/60 border-border/70 shadow-lg">
                <CardHeader className="p-4 border-b border-border/60">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Meta User Data Deletion URL
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-background/70 border border-border/60 font-mono text-[11px] break-all select-all">
                    https://astitvainnovation.in/api/auth/data-deletion
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Complies with Meta Platform Terms. Validates HMAC signatures from signed_request, expunges contact records, and returns status confirmation code.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 3: CHATS & MESSAGES                                                */}
        {/* ========================================================================= */}
        <TabsContent value="chats" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[720px]">
            {/* Conversation List */}
            <Card className="bg-card/60 border-border/70 flex flex-col h-full shadow-lg overflow-hidden">
              <div className="p-3 border-b border-border/60 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Conversations</h3>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {conversations.length} Active
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    value={convoSearch}
                    onChange={(e) => setConvoSearch(e.target.value)}
                    placeholder="Search phone or name..."
                    className="pl-8 text-xs h-8 bg-background/60"
                  />
                </div>
              </div>

              <div className="flex-grow overflow-y-auto divide-y divide-border/50">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No conversations found. Outbound sends and inbound webhook messages will populate here automatically.
                  </div>
                ) : (
                  conversations
                    .filter((c) => !convoSearch || c.contactName.toLowerCase().includes(convoSearch.toLowerCase()) || c.phone.includes(convoSearch))
                    .map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectConversation(c.id)}
                        className={`p-3 cursor-pointer transition-colors text-xs ${
                          selectedConvoId === c.id ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-card/80"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-foreground truncate">{c.contactName || c.phone}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {c.lastMessageTimestamp ? new Date(c.lastMessageTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mb-1.5">{c.lastMessage}</p>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[9px] px-1.5 py-0 font-mono ${
                              c.isWindowOpen
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {c.isWindowOpen ? `24h Window Open (${c.remainingMinutes}m)` : "24h Expired (Template Req)"}
                          </Badge>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </Card>

            {/* Conversation Thread & Composer */}
            <Card className="lg:col-span-2 bg-card/60 border-border/70 flex flex-col h-full shadow-lg overflow-hidden">
              {/* Thread Header */}
              <div className="p-3.5 border-b border-border/60 flex items-center justify-between shrink-0 bg-card/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                    {(activeConvo?.contactName || selectedConvoId || "W")[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      {activeConvo?.contactName || selectedConvoId || "Select a Conversation"}
                      {selectedConvoId && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                          +{selectedConvoId}
                        </Badge>
                      )}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      {isWindowActive
                        ? `Customer Care Window Active • Expires in ${activeConvo?.remainingMinutes} minutes`
                        : "Window Closed • Meta Cloud API requires pre-approved Utility/Marketing template"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTemplateRecipient(selectedConvoId);
                      setIsTemplateModalOpen(true);
                    }}
                    className="text-xs h-8"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1 text-primary" /> Send Template
                  </Button>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-background/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-xs text-muted-foreground space-y-2">
                    <MessageSquare className="w-8 h-8 text-muted-foreground/40" />
                    <p>No messages recorded for this conversation thread yet.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isOutbound = m.direction === "outbound";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isOutbound ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] p-3 rounded-2xl text-xs shadow-sm ${
                            isOutbound
                              ? "bg-primary text-white rounded-br-none"
                              : "bg-card border border-border/80 text-foreground rounded-bl-none"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                          {m.errorMessage && (
                            <div className="mt-1.5 p-1.5 rounded bg-destructive/20 border border-destructive/40 text-[10px] text-destructive-foreground">
                              Error: {m.errorMessage} (Code {m.errorCode})
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground font-mono">
                          <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {isOutbound && (
                            <span className="flex items-center">
                              {m.status === "read" && <CheckCheck className="w-3 h-3 text-cyan-400" />}
                              {m.status === "delivered" && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                              {m.status === "sent" && <Check className="w-3 h-3 text-muted-foreground" />}
                              {m.status === "failed" && <AlertTriangle className="w-3 h-3 text-destructive" />}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-border/60 bg-card/40 shrink-0">
                {!isWindowActive && (
                  <div className="mb-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      24-hour customer window is closed. Free-form text cannot be delivered by Meta.
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setTemplateRecipient(selectedConvoId);
                        setIsTemplateModalOpen(true);
                      }}
                      className="text-[10px] h-6 px-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                    >
                      Use Template
                    </Button>
                  </div>
                )}

                <form onSubmit={handleSendTextMessage} className="flex items-center gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={
                      isWindowActive
                        ? "Type your message to customer..."
                        : "24h window closed — click 'Send Template' above"
                    }
                    disabled={!isWindowActive || !selectedConvoId || sendingMsg}
                    className="text-xs bg-background/60"
                  />
                  <Button
                    type="submit"
                    disabled={!isWindowActive || !chatInput.trim() || sendingMsg}
                    className="h-9 px-4 bg-primary hover:bg-primary/90 text-white font-semibold shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 4: MESSAGE TEMPLATES                                               */}
        {/* ========================================================================= */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card/50 border border-border/60">
            <div>
              <h3 className="text-sm font-bold">Approved Meta WhatsApp Templates</h3>
              <p className="text-xs text-muted-foreground">
                Required for business-initiated conversations outside the 24-hour customer care window.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSyncTemplates} className="text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1 text-primary" /> Sync from Meta
              </Button>
              <Button size="sm" onClick={() => setIsNewTemplateModalOpen(true)} className="text-xs bg-primary text-white">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Create Template
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tmpl) => (
              <Card key={tmpl.id} className="bg-card/60 border-border/70 flex flex-col justify-between shadow-md">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-foreground">{tmpl.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        tmpl.status === "APPROVED"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : tmpl.status === "PENDING"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : tmpl.status === "LOCAL_DRAFT"
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-destructive/40 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {tmpl.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {tmpl.category}
                    </Badge>
                    <span>{tmpl.language}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 text-xs text-muted-foreground space-y-2">
                  {tmpl.components?.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-background/50 border border-border/50 text-[11px] leading-relaxed">
                      <span className="font-semibold text-primary/80 uppercase text-[9px] block mb-0.5">{c.type}</span>
                      {c.text}
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {tmpl.lastSyncedAt ? `Synced ${new Date(tmpl.lastSyncedAt).toLocaleDateString()}` : "Local Draft"}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTemplateName(tmpl.name);
                        setIsTemplateModalOpen(true);
                      }}
                      className="text-xs h-7 bg-primary/10 text-primary hover:bg-primary hover:text-white"
                    >
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 5: CONTACTS & OPT-IN MANAGEMENT                                    */}
        {/* ========================================================================= */}
        <TabsContent value="contacts" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card/50 border border-border/60">
            <div>
              <h3 className="text-sm font-bold">Contacts &amp; Customer Consent Ledger</h3>
              <p className="text-xs text-muted-foreground">
                Tracks opt-in source and enforces suppression. Unsolicited sends to OPTED_OUT recipients are strictly blocked.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => setIsContactModalOpen(true)} className="text-xs bg-primary text-white">
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Verified Contact
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                placeholder="Search phone or name..."
                className="pl-8 text-xs h-9 bg-background/60"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={contactFilter} onValueChange={setContactFilter}>
                <SelectTrigger className="w-44 text-xs h-9 bg-background/60">
                  <SelectValue placeholder="Consent Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Consent States</SelectItem>
                  <SelectItem value="OPTED_IN">Opted-In (Verified)</SelectItem>
                  <SelectItem value="OPTED_OUT">Opted-Out (Suppressed)</SelectItem>
                  <SelectItem value="PENDING">Pending Consent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacts Table */}
          <Card className="bg-card/60 border-border/70 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-card/90 text-muted-foreground border-b border-border/60 font-mono text-[11px]">
                  <tr>
                    <th className="p-3.5">Contact Name</th>
                    <th className="p-3.5">WhatsApp Number</th>
                    <th className="p-3.5">Consent Status</th>
                    <th className="p-3.5">Opt-In Source</th>
                    <th className="p-3.5">Recorded At</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No contacts found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-card/80 transition-colors">
                        <td className="p-3.5 font-semibold text-foreground">{c.name}</td>
                        <td className="p-3.5 font-mono text-primary">+{c.phone}</td>
                        <td className="p-3.5">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              c.consentStatus === "OPTED_IN"
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : c.consentStatus === "OPTED_OUT"
                                ? "border-destructive/40 bg-destructive/10 text-destructive"
                                : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {c.consentStatus}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-muted-foreground font-mono text-[11px]">{c.consentSource}</td>
                        <td className="p-3.5 text-muted-foreground text-[11px]">
                          {new Date(c.consentTimestamp).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleOptOut(c)}
                            className="text-[10px] h-7 px-2"
                          >
                            {c.consentStatus === "OPTED_OUT" ? "Restore Opt-in" : "Suppress / Opt-Out"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteContact(c.id)}
                            className="text-destructive h-7 w-7 p-0 hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 6: WEBHOOKS & EVENTS                                               */}
        {/* ========================================================================= */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/60 border-border/70 p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Callback URL</span>
              <p className="font-mono text-xs text-foreground truncate">https://astitvainnovation.in/api/whatsapp/webhook</p>
            </Card>
            <Card className="bg-card/60 border-border/70 p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Signature Validation</span>
              <p className="font-mono text-xs text-emerald-400 font-semibold">HMAC-SHA256 Active</p>
            </Card>
            <Card className="bg-card/60 border-border/70 p-4 space-y-1">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">Events Processed</span>
              <p className="font-mono text-xs text-foreground font-semibold">{webhookLogs.length} Events Logged</p>
            </Card>
          </div>

          <Card className="bg-card/60 border-border/70 shadow-lg overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold">Meta Ingress Webhook Event Stream</CardTitle>
                <CardDescription className="text-xs">Real-time incoming message and status change webhooks received from Meta Cloud API.</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleTestWebhookChallenge} className="text-xs">
                Test Challenge
              </Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-card/90 text-muted-foreground border-b border-border/60 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Event Summary</th>
                    <th className="p-3">Signature Status</th>
                    <th className="p-3">Remote IP</th>
                    <th className="p-3 text-right">Payload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {webhookLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No webhook events received yet. Inbound customer messages will stream here live.
                      </td>
                    </tr>
                  ) : (
                    webhookLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-card/80 transition-colors">
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3 font-medium text-foreground">{log.eventSummary}</td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              log.signatureVerified
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-destructive/40 bg-destructive/10 text-destructive"
                            }`}
                          >
                            {log.signatureVerified ? "Signature Verified" : "Unverified"}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">{log.remoteIp || "Meta Ingress"}</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectedPayload({ title: "Webhook Event Payload", data: log.payload })}
                            className="text-xs h-7 px-2"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View JSON
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 7: DELIVERY LOGS                                                   */}
        {/* ========================================================================= */}
        <TabsContent value="delivery-logs" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card/50 border border-border/60">
            <div>
              <h3 className="text-sm font-bold">Comprehensive Delivery &amp; Operational Logs</h3>
              <p className="text-xs text-muted-foreground">
                Audit trail for all outbound dispatches, retries, and delivery transitions with correlation IDs and error codes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={whatsappService.getDeliveryLogsExportUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-card border border-border hover:bg-card/80 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
              </a>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                value={deliverySearch}
                onChange={(e) => setDeliverySearch(e.target.value)}
                placeholder="Search correlation ID or phone..."
                className="pl-8 text-xs h-9 bg-background/60"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Select value={deliveryOpFilter} onValueChange={setDeliveryOpFilter}>
                <SelectTrigger className="w-40 text-xs h-9 bg-background/60">
                  <SelectValue placeholder="Operation Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Operations</SelectItem>
                  <SelectItem value="TEXT_SEND">Text Send</SelectItem>
                  <SelectItem value="TEMPLATE_SEND">Template Send</SelectItem>
                  <SelectItem value="STATUS_UPDATE">Status Update</SelectItem>
                  <SelectItem value="INBOUND_RECEIVE">Inbound Receive</SelectItem>
                  <SelectItem value="RETRY">Retry</SelectItem>
                </SelectContent>
              </Select>

              <Select value={deliveryStatusFilter} onValueChange={setDeliveryStatusFilter}>
                <SelectTrigger className="w-32 text-xs h-9 bg-background/60">
                  <SelectValue placeholder="Result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Results</SelectItem>
                  <SelectItem value="SUCCESS">Success Only</SelectItem>
                  <SelectItem value="FAILED">Failed Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Delivery Logs Table */}
          <Card className="bg-card/60 border-border/70 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-card/90 text-muted-foreground border-b border-border/60 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Correlation ID</th>
                    <th className="p-3">Operation</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Result</th>
                    <th className="p-3">HTTP / Code</th>
                    <th className="p-3">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredDeliveryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No delivery events recorded matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDeliveryLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-card/80 transition-colors">
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">
                          {new Date(l.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-primary">{l.correlationId}</td>
                        <td className="p-3 font-semibold">{l.operationType}</td>
                        <td className="p-3 font-mono text-muted-foreground">{l.to ? `+${l.to}` : "—"}</td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              l.success
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-destructive/40 bg-destructive/10 text-destructive"
                            }`}
                          >
                            {l.success ? "SUCCESS" : "FAILED"}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          {l.httpStatus} {l.metaErrorCode ? `(Meta ${l.metaErrorCode})` : ""}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">{l.durationMs}ms</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 8: EVIDENCE & SCREENCAST                                           */}
        {/* ========================================================================= */}
        <TabsContent value="evidence" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card/50 border border-border/60">
            <div>
              <h3 className="text-sm font-bold">App Review Evidence &amp; Screencast Repository</h3>
              <p className="text-xs text-muted-foreground">
                Official screenshots and recorded video evidence for Meta App Review compliance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isRecording ? (
                <Button
                  size="sm"
                  onClick={stopScreenRecording}
                  className="text-xs bg-destructive hover:bg-destructive/90 text-white font-semibold animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 mr-1" /> Stop Recording ({recordingSeconds}s)
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={startScreenRecording}
                  variant="outline"
                  className="text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Video className="w-3.5 h-3.5 mr-1" /> Record Screencast
                </Button>
              )}
              <Button size="sm" onClick={() => setIsEvidenceUploadOpen(true)} className="text-xs bg-primary text-white">
                <Upload className="w-3.5 h-3.5 mr-1" /> Upload Evidence
              </Button>
            </div>
          </div>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvidence.map((e) => (
              <Card key={e.id} className="bg-card/60 border-border/70 overflow-hidden flex flex-col justify-between shadow-md">
                <div className="aspect-video bg-background/80 border-b border-border/50 relative overflow-hidden flex items-center justify-center">
                  {e.mimeType?.startsWith("image/") ? (
                    <img
                      src={whatsappService.getEvidenceFileUrl(e.id)}
                      alt={e.fileName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground space-y-1">
                      <Video className="w-8 h-8 text-primary/60" />
                      <span className="text-[10px] font-mono uppercase">Video Screencast ({e.mimeType})</span>
                    </div>
                  )}
                  <Badge
                    variant="outline"
                    className="absolute top-2 right-2 text-[9px] font-mono bg-background/80 backdrop-blur-md"
                  >
                    {(e.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground truncate">{e.fileName}</span>
                  </div>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">
                    {e.category}
                  </Badge>
                  {e.notes && <p className="text-[11px] text-muted-foreground line-clamp-2">{e.notes}</p>}
                  <div className="pt-2 flex items-center justify-between border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(e.uploadedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      <a
                        href={whatsappService.getEvidenceFileUrl(e.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-card"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvidence(e.id)}
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 9: APP REVIEW CHECKLIST & DOSSIER                                   */}
        {/* ========================================================================= */}
        <TabsContent value="checklist" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-card/50 border border-border/60">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary" />
                Meta App Review Compliance Checklist
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Technical prerequisites for whatsapp_business_messaging and whatsapp_business_management permissions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRunChecklistScan} className="text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Re-scan Prerequisites
              </Button>
              <Button size="sm" onClick={handleExportDossier} className="text-xs bg-primary text-white">
                <Download className="w-3.5 h-3.5 mr-1" /> Export Dossier (.MD)
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {checklist.map((item, idx) => (
              <Card key={item.id} className="bg-card/60 border-border/70 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-foreground">{item.title}</h4>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            item.verified
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {item.verified ? "VERIFIED" : "PENDING"}
                        </Badge>
                        {item.actionLocation && (
                          <Badge variant="outline" className="text-[9px] font-mono">
                            {item.actionLocation}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{item.description}</p>
                      <div className="text-[11px] text-primary/90 font-mono">
                        Verification Status: {item.detail}
                      </div>
                      {!item.verified && item.missingAction && (
                        <div className="text-[11px] text-amber-400">
                          Action Required: {item.missingAction}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleChecklistItem(item)}
                      className="text-[10px] h-7 px-2"
                    >
                      {item.verified ? "Mark Unverified" : "Mark Verified"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 10: DIAGNOSTICS & API LOGS                                         */}
        {/* ========================================================================= */}
        <TabsContent value="diagnostics" className="space-y-6">
          <Card className="bg-card/60 border-border/70 shadow-lg overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold">Meta Graph API Call Audit Log</CardTitle>
              <CardDescription className="text-xs">
                Raw HTTP requests dispatched from backend to Meta Cloud API endpoints. Tokens and secrets are redacted.
              </CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-card/90 text-muted-foreground border-b border-border/60 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Endpoint</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Latency</th>
                    <th className="p-3 text-right">Payload Inspector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {apiLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No Graph API calls logged yet.
                      </td>
                    </tr>
                  ) : (
                    apiLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-card/80 transition-colors">
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {log.method}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-foreground truncate max-w-xs">{log.endpoint}</td>
                        <td className="p-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              log.success
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : "border-destructive/40 bg-destructive/10 text-destructive"
                            }`}
                          >
                            {log.responseStatus}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">{log.latencyMs}ms</td>
                        <td className="p-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInspectedPayload({ title: `API Call ${log.endpoint}`, data: log.responseBody })}
                            className="text-xs h-7 px-2"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> Response
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Meta WhatsApp Error Dictionary */}
          <Card className="bg-card/60 border-border/70 shadow-lg">
            <CardHeader className="p-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-primary" />
                Meta WhatsApp Error Dictionary &amp; Actionable Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 divide-y divide-border/50 space-y-3">
              {errorDictionary.map((err) => (
                <div key={err.code} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] border-destructive/40 text-destructive">
                      Error {err.code}
                    </Badge>
                    <span className="font-bold text-xs text-foreground">{err.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{err.description}</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">Recommended Fix: {err.solution}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========================================================================= */}
        {/* MODULE 11: SECURITY & PERMISSIONS                                         */}
        {/* ========================================================================= */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border/70 p-4 space-y-3 shadow-md">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Cryptographic &amp; Secret Isolation
              </h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>Token Encryption &amp; Storage:</span>
                  <span className="font-mono font-semibold text-emerald-400">Environment Isolated</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Signature Validation:</span>
                  <span className="font-mono font-semibold text-emerald-400">HMAC-SHA256 Enforced</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Client Masking:</span>
                  <span className="font-mono font-semibold text-emerald-400">Never in Browser Bundle</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Private File Access:</span>
                  <span className="font-mono font-semibold text-emerald-400">JWT Token Guarded</span>
                </li>
              </ul>
            </Card>

            <Card className="bg-card/60 border-border/70 p-4 space-y-3 shadow-md">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" /> DPDP &amp; GDPR Data Compliance
              </h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex items-center justify-between">
                  <span>Opt-out Auto Suppression:</span>
                  <span className="font-mono font-semibold text-emerald-400">STOP Keyword Active</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Meta Data Deletion Callback:</span>
                  <span className="font-mono font-semibold text-emerald-400">/api/auth/data-deletion</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Role-Based Access (RBAC):</span>
                  <span className="font-mono font-semibold text-emerald-400">Admin Bearer Required</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>Privacy Policy Disclosures:</span>
                  <span className="font-mono font-semibold text-emerald-400">Live on Public Website</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Audit Logs Table */}
          <Card className="bg-card/60 border-border/70 shadow-lg overflow-hidden">
            <CardHeader className="p-4 border-b border-border/60">
              <CardTitle className="text-sm font-bold">Administrative Security Audit Trail</CardTitle>
              <CardDescription className="text-xs">Immutable record of administrator actions, token rotations, and configuration modifications.</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-card/90 text-muted-foreground border-b border-border/60 font-mono text-[11px]">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground">
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-card/80 transition-colors">
                        <td className="p-3 font-mono text-muted-foreground text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-3 font-semibold text-primary">{log.actor}</td>
                        <td className="p-3 font-mono text-[11px]">{log.action}</td>
                        <td className="p-3 font-mono text-[10px] text-muted-foreground truncate max-w-md">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========================================================================= */}
      {/* MODALS & DIALOGS                                                          */}
      {/* ========================================================================= */}

      {/* Authorized Test Message Dialog */}
      <Dialog open={isTestMessageOpen} onOpenChange={setIsTestMessageOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" /> Dispatch Authorized Live Test Message
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sends an authenticated live message via Meta Cloud API to a verified test recipient.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendTestMessage} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Test Recipient Phone Number</label>
              <Input
                value={testRecipientPhone}
                onChange={(e) => setTestRecipientPhone(e.target.value)}
                placeholder="+91 7233882089"
                className="text-xs font-mono bg-background/60"
              />
              <p className="text-[10px] text-muted-foreground">Must include international country code (digits only).</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Message Text</label>
              <Textarea
                value={testMessageText}
                onChange={(e) => setTestMessageText(e.target.value)}
                className="text-xs bg-background/60"
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTestMessageOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={sendingTest} className="bg-primary text-white">
                {sendingTest ? "Dispatching..." : "Send Live Test Message"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Template Dialog */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Send Approved WhatsApp Template
            </DialogTitle>
            <DialogDescription className="text-xs">
              Dispatches a pre-approved template message to reach clients outside the 24h service window.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendTemplateMessage} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Select Template</label>
              <Select value={selectedTemplateName} onValueChange={setSelectedTemplateName}>
                <SelectTrigger className="text-xs bg-background/60">
                  <SelectValue placeholder="Choose an approved template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name} ({t.category} - {t.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Recipient Phone Number</label>
              <Input
                value={templateRecipient}
                onChange={(e) => setTemplateRecipient(e.target.value)}
                placeholder="e.g. 917233882089"
                className="text-xs font-mono bg-background/60"
              />
            </div>

            <div className="space-y-2 p-3 rounded-xl bg-background/50 border border-border/60">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase">Template Variables Preview</label>
              <Input
                value={templateVar1}
                onChange={(e) => setTemplateVar1(e.target.value)}
                placeholder="Variable {{1}} (e.g. Client Name)"
                className="text-xs bg-background/70"
              />
              <Input
                value={templateVar2}
                onChange={(e) => setTemplateVar2(e.target.value)}
                placeholder="Variable {{2}} (e.g. Project Topic)"
                className="text-xs bg-background/70"
              />
              <Input
                value={templateVar3}
                onChange={(e) => setTemplateVar3(e.target.value)}
                placeholder="Variable {{3}} (e.g. Proposal Link)"
                className="text-xs bg-background/70"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white">
                Dispatch Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={isNewTemplateModalOpen} onOpenChange={setIsNewTemplateModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Submit Template to Meta for Review
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTemplate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Template Name</label>
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g. astitva_client_welcome"
                className="text-xs font-mono bg-background/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Category</label>
              <Select value={newTemplateCategory} onValueChange={(v: any) => setNewTemplateCategory(v)}>
                <SelectTrigger className="text-xs bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTILITY">UTILITY (Transactional / Inquiries)</SelectItem>
                  <SelectItem value="MARKETING">MARKETING (Offers / Announcements)</SelectItem>
                  <SelectItem value="AUTHENTICATION">AUTHENTICATION (OTP / Passwords)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Body Text (with variables)</label>
              <Textarea
                value={newTemplateBody}
                onChange={(e) => setNewTemplateBody(e.target.value)}
                placeholder="Hello {{1}}, your inquiry regarding {{2}} is confirmed."
                className="text-xs bg-background/60"
                rows={3}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNewTemplateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white">
                Submit to Meta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Contact Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" /> Add Contact &amp; Consent Record
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateContact} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">WhatsApp Number (with country code)</label>
              <Input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="e.g. 917233882089"
                className="text-xs font-mono bg-background/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Contact Name</label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className="text-xs bg-background/60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Consent Status</label>
                <Select value={contactConsentStatus} onValueChange={setContactConsentStatus}>
                  <SelectTrigger className="text-xs bg-background/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPTED_IN">OPTED_IN</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="OPTED_OUT">OPTED_OUT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Opt-in Source</label>
                <Input
                  value={contactConsentSource}
                  onChange={(e) => setContactConsentSource(e.target.value)}
                  className="text-xs bg-background/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Notes</label>
              <Input
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                placeholder="Corporate inquiry / architect consultation"
                className="text-xs bg-background/60"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsContactModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-white">
                Save Contact
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upload Evidence Dialog */}
      <Dialog open={isEvidenceUploadOpen} onOpenChange={setIsEvidenceUploadOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" /> Upload Meta App Review Evidence
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadEvidence} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Select File (PNG, JPEG, WEBP, MP4, WEBM max 50MB)</label>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setEvidenceFile(f);
                    if (!evidenceFileName) setEvidenceFileName(f.name);
                  }
                }}
                className="text-xs bg-background/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Evidence Title / Description</label>
              <Input
                value={evidenceFileName}
                onChange={(e) => setEvidenceFileName(e.target.value)}
                placeholder="e.g. outbound_test_message_delivery.png"
                className="text-xs bg-background/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Evidence Category</label>
              <Select value={evidenceCategory} onValueChange={setEvidenceCategory}>
                <SelectTrigger className="text-xs bg-background/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVIDENCE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Notes</label>
              <Textarea
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                placeholder="Details of what was verified in this test screencast..."
                className="text-xs bg-background/60"
                rows={2}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEvidenceUploadOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={uploadingEvidence} className="bg-primary text-white">
                {uploadingEvidence ? "Uploading..." : "Save Evidence"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* JSON Payload Inspector Dialog */}
      <Dialog open={Boolean(inspectedPayload)} onOpenChange={() => setInspectedPayload(null)}>
        <DialogContent className="sm:max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" /> {inspectedPayload?.title || "JSON Payload Inspector"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-3 rounded-2xl bg-background/90 border border-border/80 font-mono text-[11px] overflow-auto max-h-96">
            <pre>{JSON.stringify(inspectedPayload?.data, null, 2)}</pre>
          </div>
          <DialogFooter>
            <Button size="sm" variant="outline" onClick={() => setInspectedPayload(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppPage;
