// =============================================================================
// @nextflow-os/extension-sdk — Types (Doc 149 §3)
// =============================================================================

/** Context về tenant hiện tại, inject bởi Host sau handshake */
export interface TenantContext {
  id: string;           // e.g. "t-998"
  name: string;
  locale: string;       // e.g. "vi-VN"
  timezone: string;
}

/** Context về work item đang được chọn trên Host UI */
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

/** Payload handshake INIT — Extension → Host */
export interface HandshakeInitPayload {
  type: 'HANDSHAKE_INIT';
  extensionId: string;
  sdkVersion: string;
}

/** Payload handshake ACK — Host → Extension */
export interface HandshakeAckPayload {
  type: 'HANDSHAKE_ACK';
  tenantId: string;
  permissions: string[];
  context: {
    tenant: TenantContext;
    currentWorkItem?: WorkItemContext;
  };
}

/** BroadcastChannel events từ Host */
export type HostEvent =
  | { type: 'WORK_ITEM_SELECTED'; payload: WorkItemContext }
  | { type: 'WORK_ITEM_UPDATED'; payload: WorkItemContext }
  | { type: 'CONTEXT_RESET' };

/** Actions Extension có thể gọi ngược lên Host */
export type ExtensionAction =
  | 'UPDATE_WORK_ITEM_METADATA'
  | 'SHOW_TOAST'
  | 'REQUEST_DATA';

export interface ToastOptions {
  message: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
}

export type EventHandler<T = unknown> = (payload: T) => void;

/** Manifest structure (nextflow-manifest.json) */
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
}
