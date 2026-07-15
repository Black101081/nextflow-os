import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#e2e8f0',
      fontFamily: '"Inter", sans-serif'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '24px', borderRadius: '50%', boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)' }}>
            <ShieldAlert size={64} className="text-red-400" />
          </div>
        </div>
        
        <h1 style={{ fontSize: '48px', fontWeight: 800, margin: '0 0 12px 0', background: 'linear-gradient(to right, #f87171, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          404
        </h1>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: '0 0 16px 0' }}>
          Lạc đường rồi Sếp ơi!
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
          Màn hình hoặc dữ liệu Sếp đang tìm kiếm không tồn tại trên hệ thống NextFlow OS, hoặc Sếp đã gõ sai đường dẫn.
        </p>
        
        <button 
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff',
            border: 'none', padding: '14px 28px', borderRadius: '12px',
            fontSize: '15px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5)',
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <ArrowLeft size={18} /> Quay về Trang Chủ (Dashboard)
        </button>
      </motion.div>
    </div>
  );
}
