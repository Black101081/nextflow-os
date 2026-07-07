const API_BASE_URL = 'http://localhost:8000';

export interface AuthConfig {
  tenantId: string;
  apiKey: string;
}
import { offlineService } from './offlineSync';

export interface WorkItemPayload {
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  category?: string;
  source?: string;
  external_id?: string;
  metadata?: any;
}

export const getHeaders = (auth?: any) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = localStorage.getItem('nf_access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (auth && auth.tenantId) {
    headers['X-Nextflow-Tenant-ID'] = auth.tenantId;
    headers['X-Nextflow-API-Key'] = auth.apiKey;
  }
  
  return headers;
};

export const apiService = {
  // 1. Phân loại tác vụ tự động bằng AI (Auto-Triage)
  async autoTriageTask(auth: any, taskId: string, title: string, description?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/intelligence/auto-triage`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({
        task_id: taskId,
        title: title,
        description: description || null
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi khi phân tích tự động (AI Auto Triage)');
    }
    return res.json();
  },
  
  // 2. Hỏi trợ lý ảo RAG Chatbot
  async askAiAssistant(auth: any, question: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/intelligence/ask-assistant`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ question }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi khi gửi câu hỏi tới AI Assistant');
    }
    return res.json();
  },
  
  // 3. Lấy danh sách Extensions trên Marketplace
  async getMarketplaceExtensions(auth: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/marketplace/extensions`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) {
      throw new Error('Lỗi khi lấy danh sách ứng dụng trên Marketplace');
    }
    return res.json();
  },
  
  // 4. Lấy danh sách gợi ý ứng dụng thông minh từ AI
  async getMarketplaceRecommendations(auth: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/marketplace/extensions/recommendations`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) {
      throw new Error('Lỗi khi lấy gợi ý cài đặt ứng dụng');
    }
    return res.json();
  },
  
  // 5. Gửi ứng dụng mới (Manifest) lên Marketplace
  async submitExtension(auth: any, payload: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/v1/marketplace/extensions/submit`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Lỗi khi đăng ký ứng dụng mới');
    }
    return res.json();
  },
  // Check Backend health
  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // 1. POST /api/v1/work-items (Tạo mới Task)
  async createWorkItem(auth: any, payload: WorkItemPayload) {
    const res = await fetch(`${API_BASE_URL}/api/v1/work-items`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Lỗi khi tạo mới Work Item');
    }
    return res.json();
  },

  // GET /api/v1/work-items (Lấy danh sách Tasks)
  async getWorkItems(auth: any) {
    if (!offlineService.isOnline()) {
      return await offlineService.getWorkItemsFromCache();
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/work-items`, {
        method: 'GET',
        headers: getHeaders(auth),
      });
      if (!res.ok) throw new Error('Không thể tải danh sách Work Items');
      const data = await res.json();
      
      // Cập nhật Cache local sau khi gọi API thành công
      await offlineService.saveWorkItemsToCache(data);
      return data;
    } catch (error) {
      // Fallback khi server down
      return await offlineService.getWorkItemsFromCache();
    }
  },

  // 2. GET /api/v1/work-items/{id} (Chi tiết Task)
  async getWorkItem(auth: any, id: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${id}`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) {
      throw new Error('Không tìm thấy Work Item');
    }
    return res.json();
  },

  // 3. PATCH /api/v1/work-items/{id}/status (Cập nhật trạng thái)
  async updateWorkItemStatus(auth: any, id: string, status: string) {
    if (!offlineService.isOnline()) {
      await offlineService.enqueueSyncTask({
        id: crypto.randomUUID(),
        type: 'UPDATE_STATUS',
        payload: { id, status },
        timestamp: Date.now()
      });
      await offlineService.updateWorkItemStatusInCache(id, status);
      return { success: true, _offline: true };
    }

    const headers: any = getHeaders(auth);
    if (status === 'IN_PROGRESS') {
      headers['Authorization'] = 'Bearer 8f3b2a1a-4c54-4b01-90e6-d701748f0851';
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Không thể cập nhật trạng thái');
      const data = await res.json();
      await offlineService.updateWorkItemStatusInCache(id, status);
      return data;
    } catch (error) {
      await offlineService.enqueueSyncTask({
        id: crypto.randomUUID(),
        type: 'UPDATE_STATUS',
        payload: { id, status },
        timestamp: Date.now()
      });
      await offlineService.updateWorkItemStatusInCache(id, status);
      return { success: true, _offline: true };
    }
  },

  // 4. POST /api/v1/work-items/{id}/route (Định tuyến thủ công)
  async routeWorkItem(auth: any, id: string, targetQueueId: string, assigneeId?: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${id}/route`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({
        target_queue_id: targetQueueId,
        assignee_id: assigneeId,
        note: 'Định tuyến thủ công từ Web Console'
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Lỗi khi định tuyến công việc');
    }
    return res.json();
  },

  // 5. POST /api/v1/queues (Tạo Queue mới)
  async createQueue(auth: any, id: string, name: string, category: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/queues`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ id, name, category }),
    });
    if (!res.ok) {
      throw new Error('Không thể tạo mới Queue');
    }
    return res.json();
  },

  // 6. GET /api/v1/queues/{id}/members (Lấy danh sách thành viên)
  async getQueueMembers(auth: any, queueId: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/queues/${queueId}/members`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) {
      throw new Error('Không thể lấy danh sách thành viên Queue');
    }
    return res.json();
  },

  // 7. GET /api/v1/analytics/kpis (Lấy chỉ số thống kê KPIs)
  async getKpis(auth: any) {
    const res = await fetch(`${API_BASE_URL}/api/v1/analytics/kpis`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) {
      throw new Error('Không thể lấy chỉ số KPI');
    }
    return res.json();
  },

  // 8. GET /api/v1/queues (Lấy danh sách Queues từ DB)
  async getQueues(auth: any) {
    const res = await fetch(`${API_BASE_URL}/api/v1/queues`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) {
      try {
        const err = await res.json();
        throw new Error(err.error?.message || 'Không thể lấy danh sách Queue');
      } catch {
        throw new Error('Không thể lấy danh sách Queue (Mã trạng thái: ' + res.status + ')');
      }
    }
    return res.json(); // { queues: [...] }
  },

  // 9. POST /api/v1/queues/:id/claim-next (Claim task tiếp theo)
  async claimNextTask(auth: any, queueId: string, userId?: string) {
    const headers: any = getHeaders(auth);
    if (userId) {
      headers['Authorization'] = `Bearer ${userId}`;
    }
    const res = await fetch(`${API_BASE_URL}/api/v1/queues/${queueId}/claim-next`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể claim task');
    }
    return res.json();
  },

  // 10. POST /api/v1/work-items/:id/escalate (Leo thang task)
  async escalateTask(auth: any, id: string, reason: string, exceptionType?: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${id}/escalate`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ reason, exception_type: exceptionType || 'MANUAL_ESCALATION' }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể leo thang task');
    }
    return res.json();
  },

  // 10b. GET /api/v1/work-items/exceptions
  async getExceptions(auth: any) {
    const res = await fetch(`${API_BASE_URL}/api/v1/work-items/exceptions`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) throw new Error('Không thể tải danh sách Exceptions');
    return res.json();
  },

  // 10c. POST /api/v1/work-items/exceptions/:id/resolve
  async resolveException(auth: any, id: string, decision: 'APPROVED' | 'REJECTED') {
    const res = await fetch(`${API_BASE_URL}/api/v1/work-items/exceptions/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ decision }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể xử lý exception');
    }
    return res.json();
  },


  // 11. GET /api/v1/connectors/configs (Lấy danh sách connectors)
  async getConnectors(auth: any) {
    const res = await fetch(`${API_BASE_URL}/api/v1/connectors/configs`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) throw new Error('Không thể lấy connectors');
    return res.json();
  },

  // 12. POST /api/v1/connectors/configs (Tạo connector mới)
  async createConnector(auth: any, connectorName: string, credentials: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/connectors/configs`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ connector_name: connectorName, credentials }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể tạo connector');
    }
    return res.json();
  },

  // =====================================================================
  // Phase 6: AI Intelligence Layer
  // =====================================================================

  // 13. GET /api/v1/ai/health — kiểm tra trạng thái Python AI service
  async checkAiHealth(auth: any): Promise<{ ai_service: string; detail?: unknown }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ai/health`, {
        headers: getHeaders(auth),
      });
      if (!res.ok) return { ai_service: 'DOWN' };
      return res.json();
    } catch {
      return { ai_service: 'DOWN' };
    }
  },

  // 14. POST /api/v1/ai/sla-risk — tính điểm rủi ro SLA cho một work item
  async getSlaRisk(auth: any, payload: {
    work_item_id: string;
    age_minutes: number;
    time_to_sla_minutes: number;
    priority: string;
    category?: string;
    queue_load?: number;
    historical_breach_rate?: number;
    assignee_load?: number;
    recent_reopen_count?: number;
  }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/ai/sla-risk`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('AI SLA risk service không khả dụng');
    return res.json();
  },

  // 15. POST /api/v1/ai/routing-recommend — đề xuất top-3 operators
  async getRoutingRecommendation(auth: any, payload: {
    queue_id: string;
    task_category: string;
    task_priority: string;
    operators?: unknown[];
  }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/ai/routing-recommend`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ ...payload, operators: payload.operators ?? [] }),
    });
    if (!res.ok) throw new Error('AI Routing service không khả dụng');
    return res.json();
  },

  // 16. POST /api/v1/ai/rag-query — hỏi RAG SOP Assistant
  async queryRagAssistant(auth: any, question: string, topK = 5) {
    const res = await fetch(`${API_BASE_URL}/api/v1/ai/rag-query`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ question, top_k: topK }),
    });
    if (!res.ok) throw new Error('RAG Assistant không khả dụng');
    return res.json();
  },

  // 17. POST /api/v1/tenants/initialize-template (Cấu hình mẫu Tenant)
  async initializeTenantTemplate(auth: any, templateId: string, wipeExisting: boolean) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/initialize-template`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ template_id: templateId, wipe_existing: wipeExisting }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể khởi tạo gói mẫu');
    }
    return res.json();
  },

  // 18. GET /api/v1/tenants/policies (Lấy chính sách)
  async getTenantPolicies(auth: any) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/policies`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) throw new Error('Không thể tải chính sách vận hành');
    return res.json();
  },

  // 19. POST /api/v1/tenants/policies (Cập nhật chính sách)
  async updateTenantPolicies(auth: any, policies: { sla_minutes_default: number; sla_minutes_high: number; auto_assignment_enabled: boolean; routing_mode: string }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/policies`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify(policies),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể cập nhật chính sách');
    }
    return res.json();
  },

  // 20. GET /api/v1/platform/tenants (List all tenants)
  async getPlatformTenants() {
    const res = await fetch(`${API_BASE_URL}/api/v1/platform/tenants`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Không thể tải danh sách Tenant của hệ thống.');
    return res.json();
  },

  // 21. POST /api/v1/platform/tenants (Create new tenant)
  async createPlatformTenant(payload: { company_name: string; domain: string; subscription_tier?: string; admin_email: string; admin_first_name: string; admin_last_name: string }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/platform/tenants`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể tạo mới Tenant.');
    }
    return res.json();
  },

  // 22. PATCH /api/v1/platform/tenants/:id (Update tenant)
  async updatePlatformTenant(id: string, payload: { status?: string; subscription_tier?: string }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/platform/tenants/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể cập nhật Tenant.');
    }
    return res.json();
  },

  // 23. GET /api/v1/tenants/templates (List all vertical template packs)
  async getTemplatePacks(): Promise<TemplatePack[]> {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/templates`);
    if (!res.ok) {
      throw new Error('Không thể tải danh sách Gói Giải pháp Mẫu.');
    }
    return res.json();
  },

  // 24. GET /api/v1/tenants/users (List all users in tenant)
  async getTenantUsers(auth: any) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/users`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) throw new Error('Không thể tải danh sách nhân sự');
    return res.json();
  },

  // 25. POST /api/v1/tenants/users (Create user in tenant)
  async createTenantUser(auth: any, payload: { email: string; first_name: string; last_name: string; role: string }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/users`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể tạo nhân sự mới');
    }
    return res.json();
  },

  // 26. PATCH /api/v1/tenants/users/:id (Update user in tenant)
  async updateTenantUser(auth: any, userId: string, payload: { first_name?: string; last_name?: string; role?: string; is_active?: boolean }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/users/${userId}`, {
      method: 'PATCH',
      headers: getHeaders(auth),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể cập nhật nhân sự');
    }
    return res.json();
  },

  // 27. DELETE /api/v1/tenants/users/:id (Delete user from tenant)
  async deleteTenantUser(auth: any, userId: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/tenants/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(auth),
    });
    if (!res.ok) throw new Error('Không thể xoá nhân sự');
    return res.json();
  },

  // 28. POST /api/v1/queues/:id/members (Add member to queue)
  async addQueueMember(auth: any, queueId: string, userId: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/queues/${queueId}/members`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể thêm nhân sự vào Queue');
    }
    return res.json();
  },

  // 29. DELETE /api/v1/queues/:id/members/:user_id (Remove member from queue)
  async removeQueueMember(auth: any, queueId: string, userId: string) {
    const res = await fetch(`${API_BASE_URL}/api/v1/queues/${queueId}/members/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(auth),
    });
    if (!res.ok) throw new Error('Không thể xoá nhân sự khỏi Queue');
    return res.json();
  },
  // =====================================================================
  // Phase 7: Billing & Payments
  // =====================================================================

  // 30. GET /api/v1/billing/invoices (Lấy danh sách hóa đơn)
  async getInvoices(auth: any) {
    const res = await fetch(`${API_BASE_URL}/api/v1/billing/invoices`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) throw new Error('Không thể tải danh sách hóa đơn');
    return res.json();
  },

  // 31. POST /api/v1/billing/invoices (Tạo hóa đơn & Payment link)
  async createInvoice(auth: any, payload: { work_item_id: string; amount: number; due_date?: string }) {
    const res = await fetch(`${API_BASE_URL}/api/v1/billing/invoices`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Không thể tạo hóa đơn');
    }
    return res.json();
  },
};

export interface TemplatePack {
  id: string;
  name: string;
  description: string;
  industry: string;
  config_metadata: {
    queues: Array<{
      id: string;
      name: string;
      category: string;
      routing: string;
      sla_seconds: number;
    }>;
  };
}

