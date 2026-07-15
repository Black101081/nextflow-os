import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'warning' | 'error' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle className="text-emerald-400 shrink-0" size={18} />,
    warning: <AlertTriangle className="text-amber-400 shrink-0" size={18} />,
    error: <AlertCircle className="text-rose-400 shrink-0" size={18} />,
    info: <Info className="text-indigo-400 shrink-0" size={18} />,
  };

  const borders = {
    success: 'border-emerald-500/20 bg-[#12141c]/90 text-white',
    warning: 'border-amber-500/20 bg-[#12141c]/90 text-white',
    error: 'border-rose-500/20 bg-[#12141c]/90 text-white',
    info: 'border-indigo-500/20 bg-[#12141c]/90 text-white',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast List Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-md ${borders[toast.type]}`}
            >
              <div className="flex items-center gap-3">
                {icons[toast.type]}
                <span className="text-sm font-medium">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-white transition-colors duration-150 shrink-0"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
