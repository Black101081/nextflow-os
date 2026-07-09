import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
  return (
    <div style={{
      background: 'var(--color-primary)',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '2px solid rgba(255,255,255,0.2)',
      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)',
      width: '200px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <Play size={20} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sự kiện bắt đầu</div>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>{data.label || 'Trigger'}</div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ background: '#fff', width: '10px', height: '10px' }} />
    </div>
  );
});
