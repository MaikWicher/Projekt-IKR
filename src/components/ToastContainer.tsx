import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import type { ToastMessage } from '../types';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--emerald)" />;
      case 'error':
        return <XCircle size={18} color="var(--rose)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--amber)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--primary)" />;
    }
  };

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${t.type}`}>
          <div style={{ marginTop: '2px' }}>{getIcon(t.type)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
              {t.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {t.message}
            </div>
          </div>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
            onClick={() => onDismiss(t.id)}
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
};
