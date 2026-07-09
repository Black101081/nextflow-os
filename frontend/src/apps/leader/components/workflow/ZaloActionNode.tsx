import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageCircle } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
  return (
    <div style={{
      background: '#1e293b',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '2px solid #0068ff', // Zalo Blue
      boxShadow: '0 4px 10px rgba(0, 104, 255, 0.2)',
      width: '200px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: '#0068ff', width: '10px', height: '10px' }} />
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0068ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MessageCircle size={16} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0068ff' }}>Hành động</div>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>{data.label || 'Zalo ZNS'}</div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ background: '#0068ff', width: '10px', height: '10px' }} />
    </div>
  );
});
