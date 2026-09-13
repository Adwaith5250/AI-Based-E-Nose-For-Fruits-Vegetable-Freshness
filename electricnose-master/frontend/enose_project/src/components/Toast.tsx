import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl transition-all animate-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#f2f6fa] border-[#54759c]/45'
              : toast.type === 'error'
              ? 'bg-[#faf1f1] border-[#ad4242]/45'
              : 'bg-white border-slate-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#2c4a68] shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#8a3535] shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />}

          <div className="flex-1 text-sm">
            <h5 className={`font-bold text-base ${
              toast.type === 'success'
                ? 'text-[#1e3650]'
                : toast.type === 'error'
                ? 'text-[#6e2a2a]'
                : 'text-[#1c2733]'
            }`}>{toast.title}</h5>
            <p className="text-slate-500 mt-1 leading-relaxed">{toast.message}</p>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="text-slate-500 hover:text-slate-800 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
