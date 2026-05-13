'use client';
import { create } from 'zustand';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastStore {
  toasts: Toast[];
  add: (type: Toast['type'], message: string) => void;
  remove: (id: string) => void;
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, type, message }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (msg: string) => useToast.getState().add('success', msg),
  error: (msg: string) => useToast.getState().add('error', msg),
  info: (msg: string) => useToast.getState().add('info', msg),
  warning: (msg: string) => useToast.getState().add('warning', msg),
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error: 'border-red-500/30 bg-red-500/10 text-red-400',
  info: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
};

export function ToastContainer() {
  const { toasts, remove } = useToast();
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-xs',
              'bg-white',
              colors[t.type]
            )}
            style={{ animation: 'slideInRight 300ms ease' }}
          >
            <Icon size={16} className="shrink-0" />
            <span className="text-slate-700 flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="shrink-0 hover:opacity-70 transition-opacity">
              <X size={14} />
            </button>
          </div>
        );
      })}
      <style>{`@keyframes slideInRight { from { opacity:0; transform: translateX(100%); } to { opacity:1; transform: translateX(0); } }`}</style>
    </div>
  );
}
