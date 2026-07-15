import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Layers, Users, Activity, FileText, X, Globe, Terminal } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'PLATFORM_ADMIN' | 'SME_LEADER' | 'TENANT_STAFF' | 'CUSTOMER';
}

interface CommandItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  shortcut?: string;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, role }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Generate commands based on role
  const getCommands = (): CommandItem[] => {
    if (role === 'PLATFORM_ADMIN') {
      return [
        { id: 'p1', title: 'Dashboard & Tenants', icon: <Layers size={16} />, path: '/platform/admin', shortcut: 'G T' },
        { id: 'p2', title: 'Giám sát Sức khỏe', icon: <Activity size={16} />, path: '/platform/observability' },
        { id: 'p3', title: 'Quản lý Hệ sinh thái (Ecosystem)', icon: <Globe size={16} />, path: '/platform/ecosystem' },
        { id: 'p4', title: 'Người dùng & Phân quyền', icon: <Users size={16} />, path: '/platform/users' },
        { id: 'p5', title: 'Doanh thu & Thanh toán', icon: <FileText size={16} />, path: '/platform/billing' },
        { id: 'p6', title: 'Audit Logs', icon: <Terminal size={16} />, path: '/platform/audit' },
      ];
    }
    return []; // other roles can be added later
  };

  const commands = getCommands().filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (item: CommandItem) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
    onClose();
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              width: '100%',
              maxWidth: '600px',
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              position: 'relative',
              zIndex: 1
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Search size={20} color="var(--text-muted)" />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Tìm kiếm hoặc gõ phím tắt..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '16px',
                  fontFamily: '"Outfit", sans-serif'
                }}
              />
              <button 
                onClick={onClose}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: '4px', padding: '4px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '12px' }}>
              {commands.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600, padding: '8px 12px', textTransform: 'uppercase' }}>Kết quả</span>
                  {commands.map((cmd) => (
                    <motion.button
                      key={cmd.id}
                      onClick={() => handleSelect(cmd)}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px', borderRadius: '8px', border: 'none', background: 'transparent',
                        color: '#f1f5f9', cursor: 'pointer', textAlign: 'left', width: '100%',
                        transition: 'background 0.1s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ color: 'var(--text-muted)' }}>{cmd.icon}</div>
                        <span style={{ fontSize: '14px', fontWeight: 500 }}>{cmd.title}</span>
                      </div>
                      {cmd.shortcut && (
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '1px' }}>
                          {cmd.shortcut}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Search size={32} style={{ opacity: 0.2, marginBottom: '12px' }} />
                  <div>Không tìm thấy lệnh nào phù hợp</div>
                </div>
              )}
            </div>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--text-dim)' }}>
              <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>↑</kbd> <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>↓</kbd> để di chuyển</span>
              <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>Enter</kbd> để chọn</span>
              <span><kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 4px', borderRadius: '4px' }}>Esc</kbd> để đóng</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
