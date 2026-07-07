# @nextflow-os/extension-sdk

SDK chính thức để phát triển Extensions nhúng vào Nextflow OS.

## Cài đặt

```bash
npm install @nextflow-os/extension-sdk
```

## Quickstart

```tsx
import { NextflowSDK } from '@nextflow-os/extension-sdk';

const sdk = new NextflowSDK('com.yourcompany.yourext');

// 1. Kết nối với Host (handshake)
const context = await sdk.connect();
console.log('Tenant ID:', context.tenant.id);

// 2. Lắng nghe Work Item được chọn (real-time via BroadcastChannel)
sdk.on('WORK_ITEM_SELECTED', (workItem) => {
  console.log('Work item:', workItem.title);
});

// 3. Kiểm tra quyền
if (sdk.hasPermission('work_item:write')) {
  await sdk.executeAction('UPDATE_WORK_ITEM_METADATA', {
    id: workItem.id,
    metadata: { custom_field: 'value' }
  });
}

// 4. Hiện toast notification
sdk.showToast('Cập nhật thành công!', 'SUCCESS');
```

## Luồng bảo mật

```
Extension (iframe)          Host (Nextflow Core)
─────────────────           ──────────────────────
HANDSHAKE_INIT ─────────────────────────────────→
               ←──────────────── HANDSHAKE_ACK
               
BroadcastChannel('nextflow_context_{tenantId}'):
               ←──────── WORK_ITEM_SELECTED event

postMessage:
EXTENSION_ACTION ────────────────────────────────→
```

## Manifest (nextflow-manifest.json)

```json
{
  "manifest_version": "1.0",
  "id": "com.yourcompany.ext",
  "name": "My Extension",
  "version": "1.0.0",
  "entry_points": {
    "panel": {
      "target_surface": "WORK_ITEM_DETAILS_SIDE_PANEL",
      "url": "https://yourext.com/panel"
    }
  },
  "required_permissions": ["work_item:read"],
  "security_policy": {
    "sandbox_flags": "allow-scripts",
    "csp_connect_src": ["https://yourapi.com"]
  }
}
```

## API Reference

| Method | Description |
|---|---|
| `sdk.connect()` | Handshake với Host, returns `TenantContext` |
| `sdk.on(event, handler)` | Subscribe BroadcastChannel event |
| `sdk.off(event, handler)` | Unsubscribe |
| `sdk.hasPermission(perm)` | Check permission |
| `sdk.executeAction(action, payload)` | Gửi action lên Host |
| `sdk.showToast(msg, type)` | Hiện toast notification |
| `sdk.destroy()` | Cleanup resources |

## Events

| Event | Payload |
|---|---|
| `WORK_ITEM_SELECTED` | `WorkItemContext` |
| `WORK_ITEM_UPDATED` | `WorkItemContext` |
| `CONTEXT_RESET` | none |

## Security Model

- Extension chạy trong `<iframe sandbox>` — hoàn toàn cô lập với Host DOM
- CSP header ngăn kết nối tới domains ngoài whitelist
- Permissions được grant bởi Host tại thời điểm handshake
- Không thể cross-tenant access — `tenantId` được scope theo BroadcastChannel name
