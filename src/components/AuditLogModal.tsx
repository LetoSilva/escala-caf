import React from 'react';
import { SubstituicoesMapa, Atividade } from '../types';
import { NOMES_ATIVIDADES } from '../utils/scheduler';
import { History, Trash2, RotateCcw, X, AlertCircle } from 'lucide-react';

interface AuditLogModalProps {
  aberto: boolean;
  substituicoes: SubstituicoesMapa;
  onFechar: () => void;
  onRestaurarChave: (chave: string) => void;
  onLimparTodas: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  aberto,
  substituicoes,
  onFechar,
  onRestaurarChave,
  onLimparTodas
}) => {
  if (!aberto) return null;

  const chaves = Object.keys(substituicoes);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-text max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary text-white">
              <History className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-primary">
                Auditoria & Histórico
              </span>
              <h2 className="text-lg font-bold">Substituições Manuais ({chaves.length})</h2>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-muted cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {chaves.length === 0 ? (
            <div className="text-center py-10 text-muted space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto opacity-40" />
              <p className="text-sm font-semibold">Nenhuma alteração manual registrada.</p>
              <p className="text-xs">A escala está operando 100% no rodízio automatizado.</p>
            </div>
          ) : (
            chaves.map(chave => {
              const item = substituicoes[chave];
              const [dataStr, atividade] = chave.split('_');
              const nomeAtividade = NOMES_ATIVIDADES[atividade as Atividade] || atividade;

              return (
                <div
                  key={chave}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-text">
                        {dataStr}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {nomeAtividade}
                      </span>
                      {item.sincronizadoAutomaticamente && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          Sincronizado Auto
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      Colaborador definido: <strong className="text-text">{item.colaborador}</strong>
                      <span className="text-[10px] ml-2 text-muted/70">({item.dataModificacao})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRestaurarChave(chave)}
                    title="Restaurar escala padrão nesta célula"
                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {chaves.length > 0 && (
          <div className="px-6 py-3 border-t border-border flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
            <button
              onClick={onLimparTodas}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Restaurar todas as alterações salvas
            </button>
            <button
              onClick={onFechar}
              className="px-4 py-1.5 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 text-text hover:bg-slate-300 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
