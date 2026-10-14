import React, { useState } from 'react';
import { RegraFerias } from '../types';
import { Palmtree, ShieldCheck, CheckCircle2, UserCheck, Zap, X, Info } from 'lucide-react';

interface VacationModalProps {
  aberto: boolean;
  regraAtual: RegraFerias;
  onFechar: () => void;
  onAtualizarRegra: (novaRegra: RegraFerias) => void;
}

export const VacationModal: React.FC<VacationModalProps> = ({
  aberto,
  regraAtual,
  onFechar,
  onAtualizarRegra
}) => {
  const [ativa, setAtiva] = useState(regraAtual.ativa);
  const [dataInicio, setDataInicio] = useState(regraAtual.dataInicio);
  const [dataFim, setDataFim] = useState(regraAtual.dataFim);

  if (!aberto) return null;

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    onAtualizarRegra({
      ...regraAtual,
      ativa,
      dataInicio,
      dataFim
    });
    onFechar();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-text max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Palmtree className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Lógica Operacional & Ausências
              </span>
              <h2 className="text-lg font-bold">Férias da Adri & Redistribuição</h2>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-muted cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status e Resumo da Regra */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Regra Automatizada em Vigor
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                13/10 a 27/10
              </span>
            </div>
            <p className="text-xs text-text leading-relaxed">
              Durante o período de <strong>13/10 a 27/10</strong>, Adri está em período de férias regulamentares.
              O sistema remove Adri da escala do período e redistribui automaticamente todas as demandas para <strong>Leto</strong> e <strong>Duda</strong> de maneira matematicamente equilibrada, enquanto <strong>Girlene permanece 100% fixa no Service Now</strong>.
            </p>
          </div>

          {/* Comparativo de Papéis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                <Palmtree className="w-4 h-4" /> Adri (Férias)
              </div>
              <p className="text-[11px] text-muted">
                Zero tarefas no intervalo de 13 a 27 de Outubro.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                <UserCheck className="w-4 h-4" /> Leto & Duda
              </div>
              <p className="text-[11px] text-muted">
                Assumem Fieldglass, FUP, Spot, Encerramento e o par E-mail ⇄ V360 em rodízio justo (saldo médio 3~4 tarefas/dia cada).
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/60 dark:bg-purple-950/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">
                <ShieldCheck className="w-4 h-4" /> Girlene (Fixa)
              </div>
              <p className="text-[11px] text-muted">
                Mantida estritamente no <strong>Service Now</strong> sem alterações ou sobrecarga.
              </p>
            </div>
          </div>

          {/* Matriz de Redistribuição do Rodízio */}
          <div className="border border-border rounded-xl p-4 bg-slate-50/50 dark:bg-slate-900/20 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" /> Matriz de Rodízio nas Férias da Adri
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <strong className="block text-primary font-bold text-xs mb-1">Ciclo 1 (Dia A)</strong>
                <ul className="space-y-0.5 text-muted">
                  <li>• E-mail & V360: <strong className="text-amber-600">Leto</strong></li>
                  <li>• Fieldglass: <strong className="text-amber-600">Leto</strong> (ex-Adri)</li>
                  <li>• FUP: <strong className="text-blue-600">Duda</strong> (ex-Adri)</li>
                  <li>• Retorno, Spot, Encerramento: <strong className="text-blue-600">Duda</strong></li>
                  <li>• Service Now: <strong className="text-purple-600">Girlene</strong></li>
                </ul>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-card">
                <strong className="block text-primary font-bold text-xs mb-1">Ciclo 2 (Dia B)</strong>
                <ul className="space-y-0.5 text-muted">
                  <li>• E-mail & V360: <strong className="text-blue-600">Duda</strong> (ex-Adri)</li>
                  <li>• Fieldglass & FUP: <strong className="text-blue-600">Duda</strong></li>
                  <li>• Retorno, Spot, Encerramento: <strong className="text-amber-600">Leto</strong></li>
                  <li>• Service Now: <strong className="text-purple-600">Girlene</strong></li>
                </ul>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-card">
                <strong className="block text-primary font-bold text-xs mb-1">Ciclo 3 (Dia C)</strong>
                <ul className="space-y-0.5 text-muted">
                  <li>• E-mail & V360: <strong className="text-blue-600">Duda</strong></li>
                  <li>• Fieldglass & FUP: <strong className="text-amber-600">Leto</strong></li>
                  <li>• Retorno & Spot: <strong className="text-amber-600">Leto</strong> (ex-Adri)</li>
                  <li>• Encerramento: <strong className="text-blue-600">Duda</strong> (ex-Adri)</li>
                  <li>• Service Now: <strong className="text-purple-600">Girlene</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Configurações da Regra */}
          <form onSubmit={handleSalvar} className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
              <div>
                <label className="text-xs font-bold text-text block">Ativar Redistribuição Automática</label>
                <span className="text-[11px] text-muted">Habilita a cobertura automática de 13/10 a 27/10</span>
              </div>
              <input
                type="checkbox"
                checked={ativa}
                onChange={e => setAtiva(e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-muted uppercase mb-1">
                  Início (Mês-Dia)
                </label>
                <input
                  type="text"
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  placeholder="10-13"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-table text-text font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted uppercase mb-1">
                  Fim (Mês-Dia)
                </label>
                <input
                  type="text"
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  placeholder="10-27"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-table text-text font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onFechar}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
              >
                Salvar Configuração
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
