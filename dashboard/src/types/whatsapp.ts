export interface WhatsAppConfig {
  status: 'Connected' | 'Disconnected' | 'Pending' | 'Error';
  wabaId: string;
  phoneNumberId: string;
  businessPhoneNumber: string;
  displayName: string;
  qualityRating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
  codeVerificationStatus: 'VERIFIED' | 'NOT_VERIFIED';
  messagingLimitTier: string;
  webhookVerified: boolean;
  webhookSubscriptionStatus: string;
  lastSync: string | null;
  errorMessage: string | null;
  hasToken: boolean;
  tokenPreview?: string;
  appId?: string;
  hasAppSecret?: boolean;
  hasVerifyToken?: boolean;
  apiVersion: string;
  apiConnectivity?: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  accountReviewStatus?: string;
  templateApprovalStatus?: string;
  phoneRegistrationStatus?: string;
  nameStatus?: string;
  platformType?: string | null;
  approvedTemplatesCount?: number;
  totalTemplatesCount?: number;
  callbackUrl?: string;
  subscribedFields?: string[];
  embeddedSignup?: {
    appId: string;
    configId: string;
  };
  connectedAt?: string | null;
  connectionVerifiedAt?: string | null;
}

export interface WhatsAppConversation {
  id: string; // phone number digits
  contactName: string;
  phone: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  lastInboundTimestamp: string | null;
  unreadCount: number;
  status: 'active' | 'archived' | 'blocked';
  isWindowOpen: boolean;
  remainingMinutes?: number;
  windowExpiresAt?: string | null;
  createdAt?: string;
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  direction: 'outbound' | 'inbound';
  type: 'text' | 'template' | 'image' | 'video' | 'audio' | 'document' | 'interactive' | 'button';
  text: string;
  templateName?: string;
  templateLanguage?: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  statusTimestamp?: string;
  sender?: string;
  senderName?: string;
  errorCode?: number;
  errorMessage?: string;
  errorDetails?: string;
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  rawPayload?: unknown;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'LOCAL_DRAFT';
  components: Array<{
    type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
    format?: string;
    text?: string;
    buttons?: Array<{
      type: string;
      text: string;
      url?: string;
      phone_number?: string;
    }>;
  }>;
  lastSyncedAt?: string | null;
  createdAt?: string;
}

export interface WhatsAppContact {
  id: string;
  phone: string;
  name: string;
  consentStatus: 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';
  consentSource: string;
  consentTimestamp: string;
  optOutTimestamp: string | null;
  notes: string;
  tags: string[];
  updatedAt?: string;
}

export interface WhatsAppDeliveryLog {
  id: string;
  correlationId: string;
  timestamp: string;
  messageId: string | null;
  to: string;
  operationType: 'TEXT_SEND' | 'TEMPLATE_SEND' | 'STATUS_UPDATE' | 'INBOUND_RECEIVE' | 'RETRY';
  httpStatus: number;
  metaErrorCode: number | null;
  metaErrorSubcode?: number | null;
  metaErrorType?: string | null;
  metaErrorDetails?: string | null;
  metaErrorMessage: string | null;
  fbtraceId?: string | null;
  retryCount: number;
  durationMs: number;
  success: boolean;
  tenantId?: string;
}

export interface WhatsAppWebhookLog {
  id: string;
  timestamp: string;
  eventSummary: string;
  signatureVerified: boolean;
  remoteIp?: string;
  processedCount: number;
  payload: unknown;
}

export interface WhatsAppApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  endpoint: string;
  requestPayload: unknown;
  responseStatus: number;
  responseBody: unknown;
  latencyMs: number;
  success: boolean;
  errorMessage?: string;
  metaErrorCode?: number | null;
  metaErrorSubcode?: number | null;
  metaErrorType?: string | null;
  metaErrorDetails?: string | null;
  fbtraceId?: string | null;
}

export interface WhatsAppEvidence {
  id: string;
  fileName: string;
  storageFileName?: string;
  category: string;
  evidenceType?: 'SCREENSHOT' | 'SCREENCAST' | 'LOG_EXPORT' | 'DOCUMENT';
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploader: string;
  relatedIntegrationId: string;
  testRunId?: string | null;
  notes: string;
  isRedacted: boolean;
  url: string;
}

export interface WhatsAppChecklistItem {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredForReview: boolean;
  verified: boolean;
  detail: string;
  missingAction?: string;
  actionLocation?: 'CODE' | 'META_BUSINESS_MANAGER' | 'META_DEVELOPER_PORTAL';
  permissionKey?: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  notes: string;
  manuallyVerified?: boolean;
}

export interface WhatsAppAuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: unknown;
}

export interface WhatsAppHealthCheck {
  timestamp: string;
  overallStatus: 'Connected' | 'Disconnected' | 'Pending' | 'Error';
  stages: {
    credentialsConfigured: {
      status: 'PASS' | 'BLOCKED';
      detail: string;
      breakdown: {
        hasToken: boolean;
        hasPhoneId: boolean;
        hasWabaId: boolean;
        hasAppId: boolean;
        hasAppSecret: boolean;
        hasVerifyToken: boolean;
      };
    };
    apiAuthentication: {
      tested: boolean;
      status: 'PASS' | 'FAIL' | 'BLOCKED';
      detail: string;
      wabaName?: string;
      wabaId?: string;
      errorCode?: number;
    };
    phoneNumberAccessible: {
      tested: boolean;
      status: 'PASS' | 'FAIL' | 'BLOCKED';
      detail: string;
      displayPhoneNumber?: string;
      verifiedName?: string;
      qualityRating?: string;
      codeVerificationStatus?: string;
      errorCode?: number;
    };
    webhookConfigured: {
      tested: boolean;
      status: 'PASS' | 'PARTIAL' | 'NOT_TESTED';
      detail: string;
      lastEventTimestamp: string | null;
    };
    messagingTested: {
      tested: boolean;
      status: 'PASS' | 'PARTIAL' | 'NOT_TESTED';
      detail: string;
      lastOutboundTimestamp: string | null;
      lastInboundTimestamp: string | null;
    };
    appReviewApproved: {
      tested: boolean;
      status: 'PASS' | 'BLOCKED';
      detail: string;
      completionPercentage: number;
    };
  };
}

export interface WhatsAppErrorGuide {
  code: number;
  title: string;
  description: string;
  solution: string;
}

export interface WhatsAppSecurityPosture {
  tokenStorage: string;
  hasToken: boolean;
  tokenPreview: string;
  hasAppSecret: boolean;
  webhookSignatureVerification: string;
  dataRetentionPolicy: string;
  optOutHandling: string;
  rbacEnforcement: string;
  dataDeletionEndpoint: string;
  privacyPolicyUrl: string;
  currentAdmin: string;
}

export interface WhatsAppTenant {
  id: string;
  name: string;
  clientName?: string;
  clientEmail?: string;
  wabaId: string;
  phoneNumberId: string;
  businessPhoneNumber?: string;
  displayName?: string;
  status: 'Active' | 'Pending' | 'Disconnected';
  isDefault: boolean;
  createdAt: string;
  updatedAt?: string;
}
