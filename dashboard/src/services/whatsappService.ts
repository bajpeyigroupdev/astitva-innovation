import { authService } from '../auth/authService';
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
} from '../types/whatsapp';

const getApiBase = () => import.meta.env.VITE_API_URL || '';

const EMPTY_CHECKLIST_SUMMARY = {
  total: 14,
  verifiedCount: 0,
  progressPercent: 0,
  isReadyForSubmission: false,
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authService.getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const url = `${getApiBase()}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/markdown') || contentType.includes('text/plain') || contentType.includes('text/csv')) {
    const text = await response.text();
    return text as unknown as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed with status ${response.status}`;
    const err: any = new Error(message);
    err.status = response.status;
    err.details = data;
    throw err;
  }

  return data;
}

export const whatsappService = {
  // 1. Overview & Real Health Check
  async getHealthCheck(): Promise<WhatsAppHealthCheck> {
    const res = await request<{ success: boolean; data: WhatsAppHealthCheck }>('/api/whatsapp/health-check');
    return res.data;
  },

  async connectivityTest(): Promise<any> {
    return request('/api/whatsapp/connectivity-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // 2. Connection & Configuration
  async getConfig(): Promise<WhatsAppConfig> {
    const res = await request<{ success: boolean; data: WhatsAppConfig }>('/api/whatsapp/config');
    return res.data;
  },

  async updateConfig(payload: Partial<WhatsAppConfig & { token?: string; appSecret?: string; embeddedSignupConfigId?: string }>): Promise<any> {
    return request('/api/whatsapp/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async syncAccount(): Promise<{ success: boolean; message: string; data: WhatsAppConfig }> {
    return request('/api/whatsapp/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async disconnectAccount(): Promise<{ success: boolean; message: string }> {
    return request('/api/whatsapp/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async exchangeEmbeddedSignup(payload: { code: string; wabaId?: string; phoneNumberId?: string }): Promise<any> {
    return request('/api/whatsapp/embedded-signup/exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // 3. Chats & Messaging
  async getConversations(): Promise<WhatsAppConversation[]> {
    const res = await request<{ success: boolean; data: WhatsAppConversation[] }>('/api/whatsapp/conversations');
    return asArray<WhatsAppConversation>(res?.data);
  },

  async getMessages(params?: { conversationId?: string; status?: string; direction?: string; search?: string; page?: number; limit?: number }): Promise<{
    data: WhatsAppMessage[];
    pagination?: { total: number; page: number; limit: number; pages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.conversationId) query.set('conversationId', params.conversationId);
    if (params?.status) query.set('status', params.status);
    if (params?.direction) query.set('direction', params.direction);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ success: boolean; data: WhatsAppMessage[]; pagination: any }>(`/api/whatsapp/messages${queryString}`);
    return { data: asArray<WhatsAppMessage>(res?.data), pagination: res?.pagination };
  },

  async sendTextMessage(payload: { to: string; text: string; previewUrl?: boolean }): Promise<any> {
    return request('/api/whatsapp/messages/send-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async sendTemplateMessage(payload: { to: string; templateName: string; languageCode?: string; components?: any[] }): Promise<any> {
    return request('/api/whatsapp/messages/send-template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async retryMessage(id: string): Promise<any> {
    return request(`/api/whatsapp/messages/retry/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async sendTestRecipientMessage(payload: { to: string; text?: string; templateName?: string }): Promise<any> {
    return request('/api/whatsapp/test-recipient-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // 4. Message Templates
  async getTemplates(): Promise<WhatsAppTemplate[]> {
    const res = await request<{ success: boolean; data: WhatsAppTemplate[] }>('/api/whatsapp/templates');
    return asArray<WhatsAppTemplate>(res?.data);
  },

  async syncTemplates(): Promise<{ success: boolean; count: number; data: WhatsAppTemplate[] }> {
    return request('/api/whatsapp/templates/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async createTemplate(templateData: any): Promise<any> {
    return request('/api/whatsapp/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    });
  },

  // 5. Contacts & Opt-in
  async getContacts(params?: { search?: string; consentStatus?: string; page?: number; limit?: number }): Promise<{
    data: WhatsAppContact[];
    pagination?: { total: number; page: number; limit: number; pages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.consentStatus) query.set('consentStatus', params.consentStatus);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ success: boolean; data: WhatsAppContact[]; pagination: any }>(`/api/whatsapp/contacts${queryString}`);
    return { data: asArray<WhatsAppContact>(res?.data), pagination: res?.pagination };
  },

  async createContact(payload: { phone: string; name?: string; consentStatus?: string; consentSource?: string; notes?: string; tags?: string[] }): Promise<any> {
    return request('/api/whatsapp/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async updateContact(id: string, payload: Partial<WhatsAppContact>): Promise<any> {
    return request(`/api/whatsapp/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async optOutContact(id: string): Promise<any> {
    return request(`/api/whatsapp/contacts/${id}/opt-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async optInContact(id: string): Promise<any> {
    return request(`/api/whatsapp/contacts/${id}/opt-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async deleteContact(id: string): Promise<any> {
    return request(`/api/whatsapp/contacts/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Webhooks & Events
  async getWebhookLogs(): Promise<WhatsAppWebhookLog[]> {
    const res = await request<{ success: boolean; data: WhatsAppWebhookLog[] }>('/api/whatsapp/webhooks/logs');
    return asArray<WhatsAppWebhookLog>(res?.data);
  },

  async testWebhookChallenge(): Promise<any> {
    return request('/api/whatsapp/webhooks/test-challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // 7. Delivery Logs
  async getDeliveryLogs(params?: { operationType?: string; success?: string; search?: string; page?: number; limit?: number }): Promise<{
    data: WhatsAppDeliveryLog[];
    pagination?: { total: number; page: number; limit: number; pages: number };
  }> {
    const query = new URLSearchParams();
    if (params?.operationType) query.set('operationType', params.operationType);
    if (params?.success) query.set('success', params.success);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ success: boolean; data: WhatsAppDeliveryLog[]; pagination: any }>(`/api/whatsapp/delivery-logs${queryString}`);
    return { data: asArray<WhatsAppDeliveryLog>(res?.data), pagination: res?.pagination };
  },

  getDeliveryLogsExportUrl(): string {
    const token = authService.getToken();
    return `${getApiBase()}/api/whatsapp/delivery-logs/export?token=${encodeURIComponent(token || '')}`;
  },

  // 8. Evidence & Screencast
  async getEvidence(params?: { category?: string; search?: string }): Promise<WhatsAppEvidence[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await request<{ success: boolean; data: WhatsAppEvidence[] }>(`/api/whatsapp/evidence${queryString}`);
    return asArray<WhatsAppEvidence>(res?.data);
  },

  async uploadEvidence(payload: {
    fileName: string;
    mimeType: string;
    fileData: string; // base64 string
    category: string;
    notes?: string;
    isRedacted?: boolean;
    relatedIntegrationId?: string;
    testRunId?: string;
  }): Promise<{ success: boolean; message: string; data: WhatsAppEvidence }> {
    return request('/api/whatsapp/evidence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async updateEvidence(id: string, updates: Partial<WhatsAppEvidence>): Promise<any> {
    return request(`/api/whatsapp/evidence/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async deleteEvidence(id: string): Promise<any> {
    return request(`/api/whatsapp/evidence/${id}`, {
      method: 'DELETE',
    });
  },

  getEvidenceFileUrl(id: string): string {
    const token = authService.getToken();
    return `${getApiBase()}/api/whatsapp/evidence/${id}/file?token=${encodeURIComponent(token || '')}`;
  },

  // 9. App Review Readiness Checklist
  async getChecklist(): Promise<{
    data: WhatsAppChecklistItem[];
    summary: { total: number; verifiedCount: number; progressPercent: number; isReadyForSubmission: boolean };
  }> {
    const res = await request<{
      success: boolean;
      data: WhatsAppChecklistItem[];
      summary: { total: number; verifiedCount: number; progressPercent: number; isReadyForSubmission: boolean };
    }>('/api/whatsapp/checklist');
    const summary = res?.summary;
    return {
      data: asArray<WhatsAppChecklistItem>(res?.data),
      summary: summary && typeof summary === 'object'
        ? { ...EMPTY_CHECKLIST_SUMMARY, ...summary }
        : EMPTY_CHECKLIST_SUMMARY,
    };
  },

  async runVerificationScan(): Promise<WhatsAppChecklistItem[]> {
    const res = await request<{ success: boolean; message: string; data: WhatsAppChecklistItem[] }>(
      '/api/whatsapp/checklist/verify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return res.data || [];
  },

  async updateChecklistItem(id: string, updates: { manuallyVerified?: boolean; notes?: string }): Promise<any> {
    return request(`/api/whatsapp/checklist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  },

  async exportChecklistDossier(): Promise<string> {
    return request<string>('/api/whatsapp/checklist/export');
  },

  // 10. Diagnostics & API Logs
  async getApiLogs(): Promise<WhatsAppApiLog[]> {
    const res = await request<{ success: boolean; data: WhatsAppApiLog[] }>('/api/whatsapp/logs');
    return asArray<WhatsAppApiLog>(res?.data);
  },

  async getErrorDictionary(): Promise<WhatsAppErrorGuide[]> {
    const res = await request<{ success: boolean; data: WhatsAppErrorGuide[] }>('/api/whatsapp/diagnostics/errors');
    return asArray<WhatsAppErrorGuide>(res?.data);
  },

  // 11. Security & Permissions
  async getSecurityPosture(): Promise<WhatsAppSecurityPosture> {
    const res = await request<{ success: boolean; data: WhatsAppSecurityPosture }>('/api/whatsapp/security/posture');
    return res.data;
  },

  async getAuditLogs(): Promise<WhatsAppAuditLog[]> {
    const res = await request<{ success: boolean; data: WhatsAppAuditLog[] }>('/api/whatsapp/audit-logs');
    return asArray<WhatsAppAuditLog>(res?.data);
  },
};
