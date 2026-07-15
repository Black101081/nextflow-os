import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ShieldCheck } from 'lucide-react';

export default memo(({ data, isConnectable }: any) => {
  return (
    <div style={{
      background: '#431407', // Deep orange/amber background
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '2px solid rgba(249, 115, 22, 0.5)',
      boxShadow: '0 0 15px rgba(249, 115, 22, 0.4), inset 0 0 10px rgba(249, 115, 22, 0.2)',
      width: '220px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backdropFilter: 'blur(10px)'
    }}>
      <Handle type="target" position={Position.Left} isConnectable={isConnectable} style={{ background: '#f97316', width: '12px', height: '12px', border: '2px solid #fff' }} />
      <div style={{ background: 'rgba(249, 115, 22, 0.2)', padding: '8px', borderRadius: '8px' }}>
        <ShieldCheck size={20} color="#fdba74" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#fed7aa', fontWeight: 'bold' }}>U2U Network</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f4f6' }}>{data.label || 'Web3 Smart Contract'}</div>
      </div>
      <Handle type="source" position={Position.Right} isConnectable={isConnectable} style={{ background: '#f97316', width: '12px', height: '12px', border: '2px solid #fff' }} />
    </div>
  );
});
