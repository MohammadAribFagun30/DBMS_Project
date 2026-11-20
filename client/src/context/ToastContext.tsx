import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const success = (msg: string) => showToast(msg, 'success');
  const error = (msg: string) => showToast(msg, 'error');
  const info = (msg: string) => showToast(msg, 'info');

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-[6px] border transition-all duration-150 ${
              toast.type === 'success'
                ? 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]'
                : toast.type === 'error'
                ? 'bg-[var(--surface)] border-[var(--status-rejected-text)] text-[var(--text)]'
                : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[var(--status-approved-text)] shrink-0" strokeWidth={1.5} />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[var(--status-rejected-text)] shrink-0" strokeWidth={1.5} />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[var(--status-completed-text)] shrink-0" strokeWidth={1.5} />}
              <p className="text-xs font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--muted)] hover:text-[var(--text)] ml-2 p-1 rounded-[4px] hover:bg-[var(--surface-alt)] transition-colors"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

