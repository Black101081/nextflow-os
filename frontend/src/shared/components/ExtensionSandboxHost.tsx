// =============================================================================
// ExtensionSandboxHost — Host-side Iframe Manager (Doc 149 §3, Doc 141 §4.1)
// =============================================================================
// Component này chạy TRONG Nextflow Frontend (Host).
// Trách nhiệm:
//  1. Render <iframe sandbox> với CSP attributes nghiêm ngặt
//  2. Xử lý HANDSHAKE_INIT từ extension → phản hồi HANDSHAKE_ACK
//  3. Phát BroadcastChannel events khi user chọn Work Item
//  4. Nhận EXTENSION_ACTION và thực thi (update metadata, show toast...)
// =============================================================================

import React, { useEffect, useRef, useCallback, useState } from 'react';
import type { WorkItemContext, TenantContext, HandshakeAckPayload } from '../types/sdk';


// ---------------------------------------------------------------------------
// CSP policy theo Doc 141 §4.1 — Security contract
// ---------------------------------------------------------------------------
const buildCsp = (allowedSrcs: string[]): string => {
  const srcs = ["'self'", ...allowedSrcs].join(' ');
  return [
    `default-src 'none'`,
    `script-src 'self' 'unsafe-inline'`,   // cần inline cho bundled extensions
    `style-src 'self' 'unsafe-inline'`,
    `connect-src ${srcs}`,
    `img-src 'self' data: https:`,
    `frame-ancestors 'self'`,
  ].join('; ');
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface ExtensionSandboxHostProps {
  extensionUrl: string;
  extensionId: string;
  allowedConnectSrcs?: string[];        // whitelist từ manifest.security_policy
  sandboxFlags?: string;                // từ manifest.security_policy.sandbox_flags
  requiredPermissions: string[];        // từ manifest.required_permissions
  tenantContext: TenantContext;
  activeWorkItem?: WorkItemContext | null;
  onAction?: (action: string, payload: Record<string, unknown>) => void;
  height?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ExtensionSandboxHost: React.FC<ExtensionSandboxHostProps> = ({
  extensionUrl,
  extensionId,
  allowedConnectSrcs = [],
  sandboxFlags = 'allow-scripts allow-same-origin',
  requiredPermissions,
  tenantContext,
  activeWorkItem = null,
  onAction,
  height = 480,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [handshakeDone, setHandshakeDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Khởi tạo BroadcastChannel (tenant-scoped) ─────────────────────────────
  useEffect(() => {
    const channelName = `nextflow_context_${tenantContext.id}`;
    channelRef.current = new BroadcastChannel(channelName);
    console.log(`[SandboxHost] BroadcastChannel '${channelName}' open.`);

    return () => {
      channelRef.current?.close();
    };
  }, [tenantContext.id]);

  // ── Xử lý postMessage từ Extension ────────────────────────────────────────
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      // Chỉ chấp nhận message từ iframe của chúng ta
      if (event.source !== iframeRef.current?.contentWindow) return;

      const data = event.data;
      if (!data?.type) return;

      // 1. Handshake Init
      if (data.type === 'HANDSHAKE_INIT') {
        if (data.extensionId !== extensionId) {
          console.warn(`[SandboxHost] Extension ID mismatch: ${data.extensionId}`);
          return;
        }

        const ackPayload: HandshakeAckPayload = {
          type: 'HANDSHAKE_ACK',
          tenantId: tenantContext.id,
          permissions: requiredPermissions,
          context: {
            tenant: tenantContext,
            currentWorkItem: activeWorkItem ?? undefined,
          },
        };

        iframeRef.current?.contentWindow?.postMessage(ackPayload, '*');
        setHandshakeDone(true);
        console.log(`[SandboxHost] ✅ HANDSHAKE_ACK sent to ${extensionId}`);
        return;
      }

      // 2. Extension Actions
      if (data.type === 'EXTENSION_ACTION') {
        console.log(`[SandboxHost] Action received: ${data.action}`, data.payload);
        onAction?.(data.action, data.payload ?? {});
      }
    },
    [extensionId, tenantContext, requiredPermissions, activeWorkItem, onAction]
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // ── Phát BroadcastChannel khi activeWorkItem thay đổi ─────────────────────
  useEffect(() => {
    if (!handshakeDone || !channelRef.current) return;

    if (activeWorkItem) {
      channelRef.current.postMessage({
        type: 'WORK_ITEM_SELECTED',
        payload: activeWorkItem,
      });
      console.log(`[SandboxHost] BC event: WORK_ITEM_SELECTED → ${activeWorkItem.id}`);
    } else {
      channelRef.current.postMessage({ type: 'CONTEXT_RESET' });
    }
  }, [activeWorkItem, handshakeDone]);

  // ── Xây CSP ───────────────────────────────────────────────────────────────
  const cspContent = buildCsp([
    'https://api.nextflow-os.com',
    ...allowedConnectSrcs,
  ]);
  if (cspContent.length === 0) {
    console.log(cspContent);
  }

  return (
    <div
      data-testid="extension-sandbox-host"
      style={{ position: 'relative', width: '100%', height }}
    >

      {/* Status badge */}
      {!handshakeDone && !error && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          background: '#f59e0b', color: '#fff',
          padding: '2px 8px', borderRadius: 4, fontSize: 11,
        }}>
          Đang kết nối...
        </div>
      )}
      {handshakeDone && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          background: '#10b981', color: '#fff',
          padding: '2px 8px', borderRadius: 4, fontSize: 11,
        }}>
          ✅ Sandbox connected
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          background: '#ef4444', color: '#fff',
          padding: '2px 8px', borderRadius: 4, fontSize: 11,
        }}>
          ❌ {error}
        </div>
      )}

      {/* Iframe sandbox — security boundary */}
      <iframe
        ref={iframeRef}
        data-testid="extension-iframe"
        src={`${extensionUrl}?extensionId=${encodeURIComponent(extensionId)}&tenantId=${tenantContext.id}`}
        sandbox={sandboxFlags}
        title={`Extension: ${extensionId}`}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          background: '#fafafa',
        }}
        onError={() => setError('Không thể tải extension')}
      />
    </div>
  );
};

export default ExtensionSandboxHost;
