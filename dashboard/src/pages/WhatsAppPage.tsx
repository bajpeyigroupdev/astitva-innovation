import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MessageSquare,
  ShieldCheck,
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
  FileSpreadsheet,
  Building2,
  Plus
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
import { getErrorMessage } from "../lib/errors";
import type { WhatsAppOperationResult } from "../services/whatsappService";
import { normalizeWhatsAppTab } from "../constants/whatsappTabs";
import { WhatsAppMessageComposer } from "../components/WhatsAppMessageComposer";
import { AddContactModal, EditContactModal, DeleteContactDialog } from "../components/WhatsAppContactModals";
import { normalizePhoneNumber } from "../lib/phoneUtils";
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
  WhatsAppTenant,
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
  const rawTab = searchParams.get("tab");
  const normalizedTab = normalizeWhatsAppTab(rawTab);
  const activeTab = normalizedTab || "overview";

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
  const [connectivityResult, setConnectivityResult] = useState<WhatsAppOperationResult | null>(null);

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

  // Manual Message Composer State
  const [isComposerOpen, setIsComposerOpen] = useState<boolean>(false);
  const [composerInitialContactId, setComposerInitialContactId] = useState<string | undefined>(undefined);
  const [composerInitialPhone, setComposerInitialPhone] = useState<string | undefined>(undefined);

  // Contact Modal States
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<WhatsAppContact | null>(null);
  const [isEditContactOpen, setIsEditContactOpen] = useState<boolean>(false);
  const [deletingContact, setDeletingContact] = useState<WhatsAppContact | null>(null);
  const [isDeleteContactOpen, setIsDeleteContactOpen] = useState<boolean>(false);
  const [contactSearch, setContactSearch] = useState<string>("");
  const [contactFilter, setContactFilter] = useState<string>("ALL");

  // Message Retry State
  const [retryingMsgId, setRetryingMsgId] = useState<string | null>(null);

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
  const recordingTimerRef = useRef<ReturnType<typeof window.setInterval> | null>(null);

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
  const [webhookTestResult, setWebhookTestResult] = useState<WhatsAppOperationResult | null>(null);
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false);

  // Payload Inspector Drawer
  const [inspectedPayload, setInspectedPayload] = useState<{ title: string; data: unknown } | null>(null);

  // Tenant State
  const [tenants, setTenants] = useState<WhatsAppTenant[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string>("default");
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState<boolean>(false);
  const [newTenantName, setNewTenantName] = useState<string>("");
  const [newTenantClient, setNewTenantClient] = useState<string>("");
  const [newTenantEmail, setNewTenantEmail] = useState<string>("");
  const [newTenantWabaId, setNewTenantWabaId] = useState<string>("");
  const [newTenantPhoneId, setNewTenantPhoneId] = useState<string>("");
  const [newTenantPhone, setNewTenantPhone] = useState<string>("");
  const [creatingTenant, setCreatingTenant] = useState<boolean>(false);

  // Embedded Signup Modal & Launch State
  const [isEmbeddedSignupModalOpen, setIsEmbeddedSignupModalOpen] = useState<boolean>(false);
  const [signupCodeInput, setSignupCodeInput] = useState<string>("");
  const [signupWabaIdInput, setSignupWabaIdInput] = useState<string>("");
  const [signupPhoneIdInput, setSignupPhoneIdInput] = useState<string>("");
  const [signupTenantNameInput, setSignupTenantNameInput] = useState<string>("");
  const [exchangingCode, setExchangingCode] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (val: string) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("tab", val);
      return next;
    });
  };

  useEffect(() => {
    if (!rawTab) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("tab", "overview");
        return next;
      }, { replace: true });
      return;
    }

    if (rawTab !== normalizedTab) {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set("tab", normalizedTab || "overview");
        return next;
      }, { replace: true });
    }
  }, [normalizedTab, rawTab, setSearchParams]);

  // Initial Data Fetch
  const selectedConvoIdRef = useRef(selectedConvoId);
  useEffect(() => {
    selectedConvoIdRef.current = selectedConvoId;
  }, [selectedConvoId]);

  const loadInitialData = useCallback(async () => {
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
        tenantsRes,
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
        whatsappService.getTenants().catch(() => ({ success: true, activeTenantId: "default", data: [] })),
      ]);

      if (cfg) {
        setConfig(cfg);
        setSettingsWabaId(cfg.wabaId || "");
        setSettingsPhoneId(cfg.phoneNumberId || "");
        setSettingsAppId(cfg.appId || "");
        setSettingsBusinessPhone(cfg.businessPhoneNumber || "");
        setSettingsDisplayName(cfg.displayName || "");
      }
      if (hlth) setHealthCheck(hlth);
      if (tenantsRes?.data) {
        setTenants(tenantsRes.data);
        setActiveTenantId(tenantsRes.activeTenantId || "default");
      }
      setConversations(convos || []);
      if (convos && convos.length > 0 && !selectedConvoIdRef.current) {
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
        setChecklist(Array.isArray(chkRes.data) ? chkRes.data : []);
        setChecklistSummary(chkRes.summary || {
          total: 14,
          verifiedCount: 0,
          progressPercent: 0,
          isReadyForSubmission: false,
        });
      }
      setAuditLogs(audit || []);
      setSecurityPosture(sec);
      setErrorDictionary(errs || []);
    } catch (err) {
      console.error("Failed to load WhatsApp Platform data:", err);
      toast({
        variant: "destructive",
        title: "Synchronization Issue",
        description: getErrorMessage(err, "Could not fetch platform data."),
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

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
        console.warn("WhatsApp conversation polling failed:", e);
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Health Check Failed",
        description: getErrorMessage(err, "Failed to execute API health check."),
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Connectivity Check Error",
        description: getErrorMessage(err, "Failed to reach Meta Cloud API."),
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: getErrorMessage(err, "Failed to synchronize with Meta Graph API."),
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
      const payload: {
        wabaId: string;
        phoneNumberId: string;
        appId: string;
        businessPhoneNumber: string;
        displayName: string;
        token?: string;
        appSecret?: string;
        verifyToken?: string;
      } = {
        wabaId: settingsWabaId,
        phoneNumberId: settingsPhoneId,
        appId: settingsAppId,
        businessPhoneNumber: settingsBusinessPhone,
        displayName: settingsDisplayName,
      };
      if (settingsToken.trim()) payload.token = settingsToken.trim();
      if (settingsAppSecret.trim()) payload.appSecret = settingsAppSecret.trim();
      if (settingsVerifyToken.trim()) payload.verifyToken = settingsVerifyToken.trim();

      await whatsappService.updateConfig(payload);
      toast({
        title: "Configuration Saved",
        description: "WhatsApp Business credentials and settings updated securely.",
      });
      setSettingsToken("");
      setSettingsAppSecret("");
      loadInitialData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: getErrorMessage(err, "Failed to update configuration."),
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // Tenant Handlers
  const handleSwitchTenant = async (id: string) => {
    try {
      const res = await whatsappService.activateTenant(id);
      setActiveTenantId(res.activeTenantId);
      toast({
        title: "Active Tenant Switched",
        description: res.message || `Switched context to tenant ${id}`,
      });
      loadInitialData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to switch tenant",
        description: getErrorMessage(err, "Unable to switch tenant context"),
      });
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "Tenant organization name is required." });
      return;
    }
    setCreatingTenant(true);
    try {
      await whatsappService.createTenant({
        name: newTenantName.trim(),
        clientName: newTenantClient.trim() || newTenantName.trim(),
        clientEmail: newTenantEmail.trim(),
        wabaId: newTenantWabaId.trim(),
        phoneNumberId: newTenantPhoneId.trim(),
        businessPhoneNumber: newTenantPhone.trim(),
      });
      toast({
        title: "Client Onboarded",
        description: `Tenant organization "${newTenantName}" registered successfully with isolated credentials.`,
      });
      setIsOnboardModalOpen(false);
      setNewTenantName("");
      setNewTenantClient("");
      setNewTenantEmail("");
      setNewTenantWabaId("");
      setNewTenantPhoneId("");
      setNewTenantPhone("");
      loadInitialData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Onboarding Failed",
        description: getErrorMessage(err, "Could not register new client tenant."),
      });
    } finally {
      setCreatingTenant(false);
    }
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove client organization "${name}"? Isolated credentials will be deleted.`)) return;
    try {
      await whatsappService.deleteTenant(id);
      toast({ title: "Tenant Removed", description: `Organization "${name}" removed.` });
      loadInitialData();
    } catch (err) {
      toast({ variant: "destructive", title: "Deletion Failed", description: getErrorMessage(err, "Failed to delete tenant.") });
    }
  };

  const handleExchangeEmbeddedSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupCodeInput.trim()) {
      toast({ variant: "destructive", title: "Validation Error", description: "OAuth authorization code is required." });
      return;
    }
    setExchangingCode(true);
    try {
      const res = await whatsappService.exchangeEmbeddedSignup({
        code: signupCodeInput.trim(),
        wabaId: signupWabaIdInput.trim() || undefined,
        phoneNumberId: signupPhoneIdInput.trim() || undefined,
        tenantName: signupTenantNameInput.trim() || undefined,
      });
      toast({
        title: "Meta OAuth Exchange Succeeded",
        description: res.message || "Meta authorization received. Sync account to complete verification.",
      });
      setIsEmbeddedSignupModalOpen(false);
      setSignupCodeInput("");
      setSignupWabaIdInput("");
      setSignupPhoneIdInput("");
      setSignupTenantNameInput("");
      loadInitialData();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Exchange Failed",
        description: getErrorMessage(err, "Failed to exchange OAuth code with Meta."),
      });
    } finally {
      setExchangingCode(false);
    }
  };

  const handleLaunchMetaSignup = () => {
    const w = window as unknown as { FB?: { login: (cb: (response: unknown) => void, opts: unknown) => void } };
    if (w.FB && typeof w.FB.login === "function" && config?.appId) {
      w.FB.login(
        (response: unknown) => {
          const res = response as { authResponse?: { code?: string } };
          if (res?.authResponse?.code) {
            setSignupCodeInput(res.authResponse.code);
            setIsEmbeddedSignupModalOpen(true);
          } else {
            setIsEmbeddedSignupModalOpen(true);
          }
        },
        {
          config_id: config.embeddedSignup?.configId || undefined,
          response_type: "code",
          override_default_response_type: true,
          extras: {
            setup: {},
            featureType: "",
            sessionInfoVersion: "2",
          },
        }
      );
    } else {
      setIsEmbeddedSignupModalOpen(true);
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
    } catch (err) {
      const optedOut = typeof err === "object" && err !== null && "optedOut" in err && err.optedOut === true;
      toast({
        variant: "destructive",
        title: optedOut ? "Recipient Suppressed" : "Dispatch Failed",
        description: getErrorMessage(err, "Could not send message."),
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Test Message Failed",
        description: getErrorMessage(err, "Failed to send test message."),
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Template Sync Failed",
        description: getErrorMessage(err, "Failed to fetch approved templates from Meta."),
      });
    }
  };

  // Resolve active template for modal dispatch
  const activeDispatchTemplate = useMemo(() => {
    return templates.find((t) => t.name === selectedTemplateName);
  }, [templates, selectedTemplateName]);

  const dispatchTemplateInspection = useMemo(() => {
    if (!activeDispatchTemplate?.components) {
      return {
        headerVars: [] as string[],
        bodyVars: [] as string[],
        urlButtonVars: [] as Array<{ index: number; text: string; url: string }>,
        totalVars: 0,
      };
    }
    const headerComp = activeDispatchTemplate.components.find((c) => c.type === "HEADER");
    const bodyComp = activeDispatchTemplate.components.find((c) => c.type === "BODY");
    const buttonsComp = activeDispatchTemplate.components.find((c) => c.type === "BUTTONS");

    let headerVars: string[] = [];
    if (headerComp?.format === "TEXT" && headerComp.text) {
      const matches = Array.from(headerComp.text.matchAll(/\{\{(\d+)\}\}/g));
      headerVars = Array.from(new Set(matches.map((m) => m[1]))).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    }

    let bodyVars: string[] = [];
    if (bodyComp?.text) {
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
    };
  }, [activeDispatchTemplate]);

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

    const components: unknown[] = [];

    // Header parameters (if any)
    if (dispatchTemplateInspection.headerVars.length > 0) {
      const headerParams = dispatchTemplateInspection.headerVars
        .map((k) => (k === "1" && templateVar1.trim() ? templateVar1.trim() : ""))
        .filter((t) => t !== "")
        .map((t) => ({ type: "text", text: t }));
      if (headerParams.length > 0) {
        components.push({
          type: "header",
          parameters: headerParams,
        });
      }
    }

    // Body parameters (if any)
    if (dispatchTemplateInspection.bodyVars.length > 0) {
      const bodyParams: Array<{ type: "text"; text: string }> = [];
      const varValues = [templateVar1, templateVar2, templateVar3];
      const offset = dispatchTemplateInspection.headerVars.length;
      for (let i = 0; i < dispatchTemplateInspection.bodyVars.length; i++) {
        const val = varValues[offset + i] || (i === 0 ? templateVar1 : i === 1 ? templateVar2 : templateVar3);
        if (val && val.trim()) {
          bodyParams.push({ type: "text", text: val.trim() });
        }
      }
      if (bodyParams.length > 0) {
        components.push({
          type: "body",
          parameters: bodyParams,
        });
      }
    }

    // URL Button parameters (if any)
    for (const btn of dispatchTemplateInspection.urlButtonVars) {
      const btnVal = templateVar3.trim() || "https://astitvainnovation.in/";
      components.push({
        type: "button",
        sub_type: "url",
        index: String(btn.index),
        parameters: [{ type: "text", text: btnVal }],
      });
    }

    try {
      await whatsappService.sendTemplateMessage({
        to: templateRecipient,
        templateName: selectedTemplateName,
        languageCode: activeDispatchTemplate?.language || "en_US",
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Template Dispatch Failed",
        description: getErrorMessage(err, "Failed to dispatch template message."),
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

    const components: Array<{ type: "BODY" | "FOOTER"; text: string }> = [
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
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Template Submission Failed",
        description: getErrorMessage(err, "Could not submit template to Meta."),
      });
    }
  };

  // Manual Message Composer Actions
  const handleOpenComposer = (contactId?: string, phone?: string) => {
    setComposerInitialContactId(contactId);
    setComposerInitialPhone(phone);
    setIsComposerOpen(true);
  };

  const handleMessageSentFromComposer = async (_result: WhatsAppOperationResult, recipientPhone: string) => {
    try {
      const [convos, msgs, dlv] = await Promise.all([
        whatsappService.getConversations(),
        whatsappService.getMessages({ conversationId: recipientPhone }),
        whatsappService.getDeliveryLogs({ limit: 100 }),
      ]);
      setConversations(convos);
      setSelectedConvoId(recipientPhone);
      setMessages(msgs.data);
      setDeliveryLogs(dlv.data);
      handleTabChange("chats");
    } catch (e) {
      console.warn("Failed to refresh state after composer dispatch:", e);
    }
  };

  // Contact Ledger Refresh Callback
  const handleContactActionSuccess = async () => {
    try {
      const res = await whatsappService.getContacts();
      setContacts(res.data);
    } catch (e) {
      console.warn("Failed to refresh contacts ledger:", e);
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
    } catch (err) {
      toast({ variant: "destructive", title: "Action Failed", description: getErrorMessage(err, "Could not update contact.") });
    }
  };

  // Retry Failed Outbound Message
  const handleRetryMessage = async (m: WhatsAppMessage) => {
    setRetryingMsgId(m.id);
    try {
      const res = await whatsappService.retryMessage(m.id);
      toast({
        title: "Message Retried",
        description: res.message || "Message re-dispatched to Meta successfully.",
      });
      if (selectedConvoId) {
        const msgs = await whatsappService.getMessages({ conversationId: selectedConvoId });
        setMessages(msgs.data);
      }
      const dlv = await whatsappService.getDeliveryLogs({ limit: 100 });
      setDeliveryLogs(dlv.data);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Retry Failed",
        description: getErrorMessage(err, "Failed to retry message."),
      });
    } finally {
      setRetryingMsgId(null);
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
    } catch (err) {
      toast({ variant: "destructive", title: "Webhook Test Error", description: getErrorMessage(err, "Webhook verification failed.") });
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
        } catch (err) {
          toast({ variant: "destructive", title: "Upload Failed", description: getErrorMessage(err, "Evidence upload failed.") });
        } finally {
          setUploadingEvidence(false);
        }
      };
      reader.readAsDataURL(evidenceFile);
    } catch (err) {
      setUploadingEvidence(false);
      toast({ variant: "destructive", title: "File Read Error", description: getErrorMessage(err, "Could not read the selected file.") });
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
    } catch (err) {
      toast({ variant: "destructive", title: "Deletion Failed", description: getErrorMessage(err, "Evidence deletion failed.") });
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
    } catch (err) {
      console.warn("Screen recording error:", err);
      toast({
        variant: "destructive",
        title: "Screen Recording Cancelled or Unsupported",
        description: getErrorMessage(err, "Please use OBS or Quicktime to record your screencast and upload the MP4/WEBM file below."),
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
    } catch (err) {
      toast({ variant: "destructive", title: "Scan Failed", description: getErrorMessage(err, "Checklist scan failed.") });
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
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: getErrorMessage(err, "Checklist update failed.") });
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
    } catch (err) {
      toast({ variant: "destructive", title: "Export Failed", description: getErrorMessage(err, "Checklist export failed.") });
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
          <TabsTrigger value="overview" onClick={() => handleTabChange("overview")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Activity className="w-3.5 h-3.5 mr-1.5" /> 1. Overview
          </TabsTrigger>
          <TabsTrigger value="connection" onClick={() => handleTabChange("connection")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Key className="w-3.5 h-3.5 mr-1.5" /> 2. Connection & Config
          </TabsTrigger>
          <TabsTrigger value="chats" onClick={() => handleTabChange("chats")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> 3. Chats / Messages
          </TabsTrigger>
          <TabsTrigger value="templates" onClick={() => handleTabChange("templates")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> 4. Message Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="contacts" onClick={() => handleTabChange("contacts")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> 5. Contacts & Opt-in ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="webhooks" onClick={() => handleTabChange("webhooks")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Zap className="w-3.5 h-3.5 mr-1.5" /> 6. Webhooks & Events ({webhookLogs.length})
          </TabsTrigger>
          <TabsTrigger value="delivery-logs" onClick={() => handleTabChange("delivery-logs")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <ListOrdered className="w-3.5 h-3.5 mr-1.5" /> 7. Delivery Logs ({deliveryLogs.length})
          </TabsTrigger>
          <TabsTrigger value="evidence" onClick={() => handleTabChange("evidence")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Camera className="w-3.5 h-3.5 mr-1.5" /> 8. Evidence & Screencast ({evidenceList.length})
          </TabsTrigger>
          <TabsTrigger value="checklist" onClick={() => handleTabChange("checklist")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <FileCheck className="w-3.5 h-3.5 mr-1.5" /> 9. App Review Checklist ({checklistSummary.verifiedCount}/{checklistSummary.total})
          </TabsTrigger>
          <TabsTrigger value="diagnostics" onClick={() => handleTabChange("diagnostics")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Layers className="w-3.5 h-3.5 mr-1.5" /> 10. Diagnostics & API Logs ({apiLogs.length})
          </TabsTrigger>
          <TabsTrigger value="security" onClick={() => handleTabChange("security")} className="text-xs px-3.5 py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
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
                  <span className="text-emerald-400">{config?.qualityRating || "UNKNOWN"}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-border">
                    {config?.messagingLimitTier || "UNKNOWN"}
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
          {/* Card A: Meta Embedded Signup & Onboarding */}
          <Card className="bg-card/60 border-border/70 shadow-lg overflow-hidden">
            <CardHeader className="p-5 border-b border-border/60 bg-gradient-to-r from-primary/10 via-background/40 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Meta Embedded Signup &amp; Client Onboarding
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Onboard client WhatsApp Business Accounts via official Meta OAuth or Embedded Signup. Existing numbers are protected from deregistration.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleLaunchMetaSignup}
                    className="text-xs bg-primary hover:bg-primary/90 text-white font-semibold shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    Launch Meta Embedded Signup
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEmbeddedSignupModalOpen(true)}
                    className="text-xs"
                  >
                    <Key className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    Manual OAuth Code Exchange
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Meta Permissions Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-background/60 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Embedded Signup Code</span>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                      Implemented
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Admin panel exchanges authorization code via Cloud API v20.0</p>
                </div>
                <div className="p-3 rounded-xl bg-background/60 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">whatsapp_business_management</span>
                    <Badge variant="outline" className="text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-400">
                      Pending Meta Review
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Advanced Access permission pending App Review submission</p>
                </div>
                <div className="p-3 rounded-xl bg-background/60 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">whatsapp_business_messaging</span>
                    <Badge variant="outline" className="text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-400">
                      Pending Meta Review
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Message dispatch permission pending App Review submission</p>
                </div>
                <div className="p-3 rounded-xl bg-background/60 border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">Business Verification</span>
                    <Badge variant="outline" className="text-[10px] border-blue-500/40 bg-blue-500/10 text-blue-400">
                      Meta Suite Flow
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Requires legal business documents verified in Meta Business Suite</p>
                </div>
              </div>

              {/* Protection Notice */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  <strong>Safety Commitment:</strong> The system never disconnects, migrates, or deregisters existing registered WhatsApp numbers automatically during onboarding or tenant switching.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card B: Tenant Isolation & Client Management */}
          <Card className="bg-card/60 border-border/70 shadow-lg">
            <CardHeader className="p-5 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Tenant Isolation &amp; Client Management ({tenants.length})
                </CardTitle>
                <CardDescription className="text-xs">
                  Maintain isolated WhatsApp credentials, contacts, and delivery records per client organization.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsOnboardModalOpen(true)}
                className="text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5 text-primary" />
                Onboard Client Organization
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tenants.map((t) => {
                  const isActive = t.id === activeTenantId;
                  return (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isActive
                          ? "border-primary/60 bg-primary/10 shadow-md ring-1 ring-primary/40"
                          : "border-border/60 bg-background/50 hover:bg-background/80"
                      } space-y-2.5`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                          <span>{t.name}</span>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-mono ${
                            isActive
                              ? "border-primary/50 bg-primary/20 text-primary"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {isActive ? "ACTIVE TENANT" : t.status}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground space-y-1 font-mono">
                        <div>WABA ID: {t.wabaId || "Pending"}</div>
                        <div>Phone ID: {t.phoneNumberId || "Pending"}</div>
                        {t.businessPhoneNumber && <div>Phone: {t.businessPhoneNumber}</div>}
                      </div>
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                        {!isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSwitchTenant(t.id)}
                            className="text-[11px] h-7"
                          >
                            Switch to Tenant
                          </Button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Currently Active Context
                          </span>
                        )}
                        {!t.isDefault && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTenant(t.id, t.name)}
                            className="text-[11px] h-7 text-destructive hover:bg-destructive/10"
                            title="Remove Tenant"
                            aria-label="Remove Tenant"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

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
                          Token stored
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
                      <label className="text-xs font-semibold flex items-center justify-between">
                        <span>Webhook Verify Token</span>
                        {config?.hasVerifyToken && (
                          <span className="text-[10px] text-emerald-400 font-mono">Configured</span>
                        )}
                      </label>
                      <Input
                        type="password"
                        value={settingsVerifyToken}
                        onChange={(e) => setSettingsVerifyToken(e.target.value)}
                        placeholder={config?.hasVerifyToken ? "Enter a new token to rotate (leave blank to keep)" : "Enter webhook verify token"}
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
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {conversations.length} Active
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleOpenComposer()}
                      className="text-[10px] h-6 px-2 bg-primary text-white font-semibold"
                    >
                      <Plus className="w-3 h-3 mr-1" /> New Message
                    </Button>
                  </div>
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
                    onClick={() => handleOpenComposer(undefined, selectedConvoId)}
                    className="text-xs h-8 border-primary/40 text-primary hover:bg-primary hover:text-white"
                  >
                    <Send className="w-3.5 h-3.5 mr-1" /> Compose
                  </Button>
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
                            <div className="mt-1.5 p-1.5 rounded bg-destructive/20 border border-destructive/40 text-[10px] text-destructive-foreground flex items-center justify-between gap-2">
                              <div>
                                <span className="font-semibold">Error:</span> {m.errorMessage} {m.errorCode ? `(Code ${m.errorCode})` : ""}
                              </div>
                              {isOutbound && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={retryingMsgId === m.id}
                                  onClick={() => handleRetryMessage(m)}
                                  className="h-5 px-2 text-[9px] bg-background/80 hover:bg-background border-destructive/40 text-foreground shrink-0"
                                >
                                  <RefreshCw className={`w-2.5 h-2.5 mr-1 ${retryingMsgId === m.id ? "animate-spin" : ""}`} />
                                  Retry
                                </Button>
                              )}
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
                        <td className="p-3.5 text-right space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenComposer(c.id)}
                            className="text-[10px] h-7 px-2 border-primary/40 text-primary hover:bg-primary hover:text-white"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" /> Message
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleOptOut(c)}
                            className="text-[10px] h-7 px-2"
                          >
                            {c.consentStatus === "OPTED_OUT" ? "Restore" : "Suppress"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Edit Contact"
                            onClick={() => {
                              setEditingContact(c);
                              setIsEditContactOpen(true);
                            }}
                            className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            aria-label="Delete Contact"
                            onClick={() => {
                              setDeletingContact(c);
                              setIsDeleteContactOpen(true);
                            }}
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

            {dispatchTemplateInspection.totalVars === 0 ? (
              <div className="p-3 rounded-xl bg-background/50 border border-border/60 text-xs space-y-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Static Approved Template ({activeDispatchTemplate?.language || "en_US"})
                </span>
                <p className="text-[11px] text-muted-foreground">
                  This template requires zero dynamic parameters. It will be dispatched with its official approved content.
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-3 rounded-xl bg-background/50 border border-border/60">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" /> Template Variables ({dispatchTemplateInspection.totalVars} parameter{dispatchTemplateInspection.totalVars > 1 ? "s" : ""})
                </label>
                {/* Header Variable */}
                {dispatchTemplateInspection.headerVars.length > 0 && (
                  <Input
                    value={templateVar1}
                    onChange={(e) => setTemplateVar1(e.target.value)}
                    placeholder="Header Variable {{1}} (e.g. Salutation / Name)"
                    className="text-xs bg-background/70 font-mono"
                  />
                )}
                {/* Body Variables */}
                {dispatchTemplateInspection.bodyVars.map((k, idx) => {
                  const val = idx === 0 && dispatchTemplateInspection.headerVars.length === 0 ? templateVar1 : idx === 1 ? templateVar2 : templateVar3;
                  const setVal = idx === 0 && dispatchTemplateInspection.headerVars.length === 0 ? setTemplateVar1 : idx === 1 ? setTemplateVar2 : setTemplateVar3;
                  return (
                    <Input
                      key={`body_${k}`}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      placeholder={`Body Variable {{${k}}} ${idx === 0 ? "(e.g. Client Name)" : idx === 1 ? "(e.g. Service / Topic)" : "(e.g. Detail)"}`}
                      className="text-xs bg-background/70 font-mono"
                    />
                  );
                })}
                {/* URL Button Variable */}
                {dispatchTemplateInspection.urlButtonVars.map((btn) => (
                  <Input
                    key={`btn_${btn.index}`}
                    value={templateVar3}
                    onChange={(e) => setTemplateVar3(e.target.value)}
                    placeholder={`URL Button Dynamic Parameter (${btn.text}) (e.g. https://astitvainnovation.in/ or token)`}
                    className="text-xs bg-background/70 font-mono"
                  />
                ))}
              </div>
            )}

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
              <Select value={newTemplateCategory} onValueChange={(value) => {
                if (value === "UTILITY" || value === "MARKETING" || value === "AUTHENTICATION") {
                  setNewTemplateCategory(value);
                }
              }}>
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

      {/* WhatsApp Manual Message Composer */}
      <WhatsAppMessageComposer
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        contacts={contacts}
        templates={templates}
        conversations={conversations}
        config={config}
        tenants={tenants}
        activeTenantId={activeTenantId}
        initialContactId={composerInitialContactId}
        initialPhoneNumber={composerInitialPhone}
        onMessageSent={handleMessageSentFromComposer}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        existingContacts={contacts}
        onContactCreated={handleContactActionSuccess}
      />

      {/* Edit Contact Modal */}
      <EditContactModal
        contact={editingContact}
        isOpen={isEditContactOpen}
        onClose={() => {
          setIsEditContactOpen(false);
          setEditingContact(null);
        }}
        onContactUpdated={handleContactActionSuccess}
      />

      {/* Delete Contact Dialog */}
      <DeleteContactDialog
        contact={deletingContact}
        isOpen={isDeleteContactOpen}
        onClose={() => {
          setIsDeleteContactOpen(false);
          setDeletingContact(null);
        }}
        onContactDeleted={handleContactActionSuccess}
      />

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

      {/* Meta Embedded Signup / OAuth Code Exchange Modal */}
      <Dialog open={isEmbeddedSignupModalOpen} onOpenChange={setIsEmbeddedSignupModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" /> Meta OAuth Code Exchange
            </DialogTitle>
            <DialogDescription className="text-xs">
              Exchange authorization code returned from Meta Embedded Signup popup for permanent access credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleExchangeEmbeddedSignup} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Meta Authorization Code</label>
              <Input
                value={signupCodeInput}
                onChange={(e) => setSignupCodeInput(e.target.value)}
                placeholder="AQD... OAuth Code from Meta popup"
                className="text-xs font-mono bg-background/60"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">WABA ID (Optional)</label>
                <Input
                  value={signupWabaIdInput}
                  onChange={(e) => setSignupWabaIdInput(e.target.value)}
                  placeholder="e.g. 1092837465"
                  className="text-xs font-mono bg-background/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Phone Number ID (Optional)</label>
                <Input
                  value={signupPhoneIdInput}
                  onChange={(e) => setSignupPhoneIdInput(e.target.value)}
                  placeholder="e.g. 1029384756"
                  className="text-xs font-mono bg-background/60"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Assign to Client Organization (Optional)</label>
              <Input
                value={signupTenantNameInput}
                onChange={(e) => setSignupTenantNameInput(e.target.value)}
                placeholder="Leave blank for Primary or enter Client Name"
                className="text-xs bg-background/60"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEmbeddedSignupModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={exchangingCode} className="bg-primary text-white">
                {exchangingCode ? "Exchanging..." : "Exchange & Save Token"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Onboard Client Organization Modal */}
      <Dialog open={isOnboardModalOpen} onOpenChange={setIsOnboardModalOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Onboard Client Organization
            </DialogTitle>
            <DialogDescription className="text-xs">
              Register a client company for isolated WhatsApp messaging, contacts, and delivery analytics.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTenant} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Organization Name *</label>
              <Input
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                placeholder="e.g. Acme Health Corp"
                className="text-xs bg-background/60"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Client Contact Name</label>
                <Input
                  value={newTenantClient}
                  onChange={(e) => setNewTenantClient(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="text-xs bg-background/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Client Email</label>
                <Input
                  type="email"
                  value={newTenantEmail}
                  onChange={(e) => setNewTenantEmail(e.target.value)}
                  placeholder="e.g. contact@acme.com"
                  className="text-xs bg-background/60"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Client WABA ID</label>
                <Input
                  value={newTenantWabaId}
                  onChange={(e) => setNewTenantWabaId(e.target.value)}
                  placeholder="e.g. 1029384756"
                  className="text-xs font-mono bg-background/60"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Client Phone Number ID</label>
                <Input
                  value={newTenantPhoneId}
                  onChange={(e) => setNewTenantPhoneId(e.target.value)}
                  placeholder="e.g. 1092837465"
                  className="text-xs font-mono bg-background/60"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Business Phone Number</label>
              <Input
                value={newTenantPhone}
                onChange={(e) => setNewTenantPhone(e.target.value)}
                placeholder="e.g. +1 555 123 4567"
                className="text-xs font-mono bg-background/60"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOnboardModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={creatingTenant} className="bg-primary text-white">
                {creatingTenant ? "Onboarding..." : "Register Client Organization"}
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
