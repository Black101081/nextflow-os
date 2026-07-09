import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
  return (
    <div style={{
      background: '#1e293b',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '2px solid #8b5cf6', // Purple
      boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)',
      width: '200px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: '#8b5cf6', width: '10px', height: '10px' }} />
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Globe size={16} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8b5cf6' }}>Webhook</div>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>{data.label || 'HTTP Request'}</div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ background: '#8b5cf6', width: '10px', height: '10px' }} />
    </div>
  );
});
