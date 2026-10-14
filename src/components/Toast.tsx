import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
  mensagem: string | null;
  tipo?: 'success' | 'warning' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ mensagem, tipo = 'success' }) => {
  if (!mensagem) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-slide-up">
      <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-slate-700/80 shadow-2xl text-xs font-semibold">
        {tipo === 'warning' ? (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        ) : tipo === 'info' ? (
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="leading-snug">{mensagem}</span>
      </div>
    </div>
  );
};
