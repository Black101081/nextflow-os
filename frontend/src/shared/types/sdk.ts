// Copy of SDK types for isolated Frontend Docker compilation

export interface TenantContext {
  id: string;
  name: string;
  locale: string;
  timezone: string;
}

export interface WorkItemContext {
  id: string;
  title: string;
  status: string;
  priority: string;
  externalId?: string;
  assigneeId?: string;
  queueId?: string;
  slaDeadline?: string;
  metadata?: Record<string, unknown>;
}

export interface HandshakeAckPayload {
  type: 'HANDSHAKE_ACK';
  tenantId: string;
  permissions: string[];
  context: {
    tenant: TenantContext;
    currentWorkItem?: WorkItemContext;
  };
}

export interface NextflowManifest {
  manifest_version: '1.0';
  id: string;
  name: string;
  version: string;
  description: string;
  developer: { name: string; website: string };
  entry_points: {
    panel?: { target_surface: string; url: string };
    settings?: { target_surface: string; url: string };
    [key: string]: { target_surface: string; url: string } | undefined;
  };
  required_permissions: string[];
  security_policy: {
    sandbox_flags: string;
    csp_connect_src: string[];
  };
  source_url?: string;
  code?: string;
}
