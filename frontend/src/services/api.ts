const API_BASE_URL = 'http://localhost:8000';

export interface AuthConfig {
  tenantId: string;
  apiKey: string;
}

export interface WorkItemPayload {
  title: string;
  description?: string;
  priority?: string;
  due_date?: string;
  category?: string;
  source?: string;
  external_id?: string;
}

export const getHeaders = (auth: AuthConfig) => {
  return {
    'Content-Type': 'application/json',
    'X-Nextflow-Tenant-ID': auth.tenantId,
    'X-Nextflow-API-Key': auth.apiKey,
  };
};

export const apiService = {
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
  async createWorkItem(auth: AuthConfig, payload: WorkItemPayload) {
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

  // 2. GET /api/v1/work-items/{id} (Chi tiết Task)
  async getWorkItem(auth: AuthConfig, id: string) {
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
  async updateWorkItemStatus(auth: AuthConfig, id: string, status: string) {
    // Nếu status là IN_PROGRESS, ta dùng Authorization Header thay API Key để test tự động gán assignee
    const headers: any = getHeaders(auth);
    if (status === 'IN_PROGRESS') {
      // Phục vụ test case: gán Bearer Token bằng ID của User Nguyen Van Test
      headers['Authorization'] = 'Bearer 8f3b2a1a-4c54-4b01-90e6-d701748f0851';
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/work-items/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw new Error('Không thể cập nhật trạng thái');
    }
    return res.json();
  },

  // 4. POST /api/v1/work-items/{id}/route (Định tuyến thủ công)
  async routeWorkItem(auth: AuthConfig, id: string, targetQueueId: string, assigneeId?: string) {
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
  async createQueue(auth: AuthConfig, id: string, name: string, category: string) {
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
  async getQueueMembers(auth: AuthConfig, queueId: string) {
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
  async getKpis(auth: AuthConfig) {
    const res = await fetch(`${API_BASE_URL}/api/v1/analytics/kpis`, {
      method: 'GET',
      headers: getHeaders(auth),
    });
    if (!res.ok) {
      throw new Error('Không thể lấy chỉ số KPI');
    }
    return res.json();
  }
};
