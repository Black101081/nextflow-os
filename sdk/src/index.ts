// =============================================================================
// @nextflow-os/extension-sdk — NextflowSDK Class (Doc 149 §3-4)
// =============================================================================
// Gói SDK chạy bên trong iframe của Extension.
// Quản lý:
//  1. postMessage handshake với Host (HANDSHAKE_INIT → HANDSHAKE_ACK)
//  2. BroadcastChannel để nhận real-time events từ Host
//  3. Permission check & action execution
// =============================================================================

import type {
  TenantContext,
  WorkItemContext,
  HandshakeInitPayload,
  HandshakeAckPayload,
  HostEvent,
  ExtensionAction,
  ToastOptions,
  EventHandler,
} from './types';

export * from './types';

const SDK_VERSION = '1.0.0';
const HANDSHAKE_TIMEOUT_MS = 5000;

export class NextflowSDK {
  private extensionId: string;
  private tenantId: string | null = null;
  private permissions: Set<string> = new Set();
  private tenantContext: TenantContext | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();
  private connected = false;

  constructor(extensionId?: string) {
    // extensionId có thể được inject qua URL param hoặc meta tag
    this.extensionId =
      extensionId ||
      new URLSearchParams(window.location.search).get('extensionId') ||
      'unknown-extension';
  }

  // ---------------------------------------------------------------------------
  // 1. Handshake — Doc 149 §3 (postMessage protocol)
  // ---------------------------------------------------------------------------

  /**
   * Gọi khi Extension mount. Gửi HANDSHAKE_INIT lên Host và chờ HANDSHAKE_ACK.
   * Returns Promise với TenantContext sau khi handshake thành công.
   */
  connect(): Promise<HandshakeAckPayload['context']> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        window.removeEventListener('message', onAck);
        reject(new Error('[NextflowSDK] Handshake timeout — Host không phản hồi sau 5s.'));
      }, HANDSHAKE_TIMEOUT_MS);

      const onAck = (event: MessageEvent) => {
        // Chỉ chấp nhận message từ parent frame (Host)
        if (event.source !== window.parent) return;

        const data = event.data as HandshakeAckPayload;
        if (data?.type !== 'HANDSHAKE_ACK') return;

        clearTimeout(timeout);
        window.removeEventListener('message', onAck);

        // Lưu context
        this.tenantId = data.tenantId;
        this.permissions = new Set(data.permissions);
        this.tenantContext = data.context.tenant;
        this.connected = true;

        // Khởi động BroadcastChannel theo tenant_id (Doc 149 §3)
        this._initBroadcastChannel(data.tenantId);

        // Phát custom event để component trong Extension biết SDK ready
        window.dispatchEvent(
          new CustomEvent('NEXTFLOW_READY', { detail: data.context })
        );

        console.log(`[NextflowSDK] ✅ Connected. Tenant: ${data.tenantId}`);
        resolve(data.context);
      };

      window.addEventListener('message', onAck);

      // Gửi HANDSHAKE_INIT lên Host
      const initPayload: HandshakeInitPayload = {
        type: 'HANDSHAKE_INIT',
        extensionId: this.extensionId,
        sdkVersion: SDK_VERSION,
      };
      window.parent.postMessage(initPayload, '*');
    });
  }

  // ---------------------------------------------------------------------------
  // 2. BroadcastChannel — real-time events từ Host (Doc 149 §3)
  // ---------------------------------------------------------------------------

  private _initBroadcastChannel(tenantId: string): void {
    const channelName = `nextflow_context_${tenantId}`;
    this.broadcastChannel = new BroadcastChannel(channelName);

    this.broadcastChannel.onmessage = (event: MessageEvent) => {
      const hostEvent = event.data as HostEvent;
      if (!hostEvent?.type) return;

      const handlers = this.eventHandlers.get(hostEvent.type);
      if (handlers) {
        const payload = (hostEvent as { type: string; payload?: unknown }).payload;
        handlers.forEach((h) => h(payload));
      }
    };

    console.log(`[NextflowSDK] BroadcastChannel '${channelName}' open.`);
  }

  // ---------------------------------------------------------------------------
  // 3. Event API — on/off (Doc 149 §4)
  // ---------------------------------------------------------------------------

  on<T = unknown>(eventType: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler as EventHandler);
  }

  off<T = unknown>(eventType: string, handler: EventHandler<T>): void {
    this.eventHandlers.get(eventType)?.delete(handler as EventHandler);
  }

  // ---------------------------------------------------------------------------
  // 4. Permission API
  // ---------------------------------------------------------------------------

  hasPermission(permission: string): boolean {
    return this.permissions.has(permission);
  }

  getPermissions(): string[] {
    return Array.from(this.permissions);
  }

  // ---------------------------------------------------------------------------
  // 5. Action API — gửi actions ngược lên Host (Doc 149 §4)
  // ---------------------------------------------------------------------------

  async executeAction(
    action: ExtensionAction,
    payload: Record<string, unknown>
  ): Promise<void> {
    if (!this.connected) {
      throw new Error('[NextflowSDK] Chưa connect. Gọi sdk.connect() trước.');
    }
    window.parent.postMessage(
      { type: 'EXTENSION_ACTION', action, payload, tenantId: this.tenantId },
      '*'
    );
  }

  showToast(message: string, type: ToastOptions['type'] = 'INFO'): void {
    this.executeAction('SHOW_TOAST', { message, type }).catch(console.error);
  }

  // ---------------------------------------------------------------------------
  // 6. Getters
  // ---------------------------------------------------------------------------

  isConnected(): boolean { return this.connected; }
  getTenantContext(): TenantContext | null { return this.tenantContext; }
  getTenantId(): string | null { return this.tenantId; }

  destroy(): void {
    this.broadcastChannel?.close();
    this.eventHandlers.clear();
    this.connected = false;
  }
}
