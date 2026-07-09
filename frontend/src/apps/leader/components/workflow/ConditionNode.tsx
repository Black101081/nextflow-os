import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
  return (
    <div style={{
      background: '#1e293b',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '2px solid #f59e0b',
      boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)',
      width: '200px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: '#f59e0b', width: '10px', height: '10px' }} />
      <GitBranch size={20} color="#f59e0b" />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#f59e0b' }}>IF / ELSE</div>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>{data.label || 'Condition'}</div>
      </div>
      <Handle type="source" position={Position.Right} id="true" style={{ background: '#10b981', top: '30%', width: '10px', height: '10px' }} isConnectable={isConnectable} />
      <Handle type="source" position={Position.Right} id="false" style={{ background: '#ef4444', top: '70%', width: '10px', height: '10px' }} isConnectable={isConnectable} />
    </div>
  );
});
