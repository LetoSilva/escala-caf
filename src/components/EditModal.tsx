import React, { useState, useEffect } from 'react';
import { Atividade, Colaborador } from '../types';
import { COLABORADORES, NOMES_ATIVIDADES, DESCRICOES_ATIVIDADES } from '../utils/scheduler';
import { RefreshCw, CheckCircle2, AlertCircle, Sparkles, X } from 'lucide-react';

interface EditModalProps {
  aberto: boolean;
  contexto: {
    ano: number;
    mes: number;
    dia: number;
    atividade: Atividade;
    nomeAtual: Colaborador;
    dataIso: string;
    parSincronizadoAtual?: Colaborador;
  } | null;
  onFechar: () => void;
  onSalvar: (novoNome: Colaborador, sincronizarPar: boolean) => void;
  onRestaurar: (restaurarPar: boolean) => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  aberto,
  contexto,
  onFechar,
  onSalvar,
  onRestaurar
}) => {
  const [novoColaborador, setNovoColaborador] = useState<Colaborador | ''>('');
  const [sincronizarPar, setSincronizarPar] = useState(true);

  useEffect(() => {
    if (contexto) {
      setNovoColaborador(contexto.nomeAtual);
      setSincronizarPar(true);
    }
  }, [contexto]);

  if (!aberto || !contexto) return null;

  const ehParEmailV360 = contexto.atividade === 'email' || contexto.atividade === 'v360';
  const atividadePar: Atividade | null =
    contexto.atividade === 'email'
      ? 'v360'
      : contexto.atividade === 'v360'
      ? 'email'
      : null;

  const dataFormatada = new Date(contexto.ano, contexto.mes, contexto.dia).toLocaleDateString('pt-BR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoColaborador) return;
    onSalvar(novoColaborador, ehParEmailV360 && sincronizarPar);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up text-text">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-primary/5">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              Gestão Inteligente de Escala
            </div>
            <h2 className="text-lg font-bold">Substituir Colaborador</h2>
          </div>
          <button
            onClick={onFechar}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors text-muted cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações da escala */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50">
              <span className="block text-[10px] font-bold text-muted uppercase">Data</span>
              <strong className="text-xs font-extrabold">{dataFormatada}</strong>
            </div>

            <div className="p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50">
              <span className="block text-[10px] font-bold text-muted uppercase">Atividade</span>
              <strong className="text-xs font-extrabold text-primary">
                {NOMES_ATIVIDADES[contexto.atividade]}
              </strong>
            </div>

            <div className="p-3 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/50">
              <span className="block text-[10px] font-bold text-muted uppercase">Atual</span>
              <strong className="text-xs font-extrabold">{contexto.nomeAtual}</strong>
            </div>
          </div>

          <div className="text-[11px] text-muted italic px-1">
            {DESCRICOES_ATIVIDADES[contexto.atividade]}
          </div>

          {/* Destaque para Sincronização Automática E-MAIL ⇄ V360 */}
          {ehParEmailV360 && atividadePar && (
            <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs">
                <RefreshCw className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: '6s' }} />
                <span>Sincronização Automática Ativa (E-mail ⇄ V360)</span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                Conforme a regra do sistema, as tratativas de <strong>E-MAIL</strong> e <strong>V360</strong> são conduzidas pelo mesmo colaborador. Ao salvar, <strong>{NOMES_ATIVIDADES[atividadePar]}</strong> também será ajustado automaticamente.
              </p>
              <label className="flex items-center gap-2 text-xs font-semibold text-text cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={sincronizarPar}
                  onChange={e => setSincronizarPar(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span>Sincronizar automaticamente {NOMES_ATIVIDADES[atividadePar]} para o mesmo colaborador</span>
              </label>
            </div>
          )}

          {/* Aviso especial de Girlene (Service Now fixa) */}
          {contexto.atividade === 'service' && (
            <div className="p-3 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/80 dark:bg-purple-950/40 text-[11px] text-purple-800 dark:text-purple-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-purple-600" />
              <span>
                <strong>Atenção:</strong> Girlene é a responsável fixa padrão do Service Now. Altere apenas em caso de cobertura emergencial.
              </span>
            </div>
          )}

          {/* Seleção de novo colaborador */}
          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
              Selecione o Novo Colaborador
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COLABORADORES.map(colab => {
                const selecionado = novoColaborador === colab;
                return (
                  <button
                    type="button"
                    key={colab}
                    onClick={() => setNovoColaborador(colab)}
                    className={`p-3 rounded-xl border font-bold text-sm flex items-center justify-between transition-all cursor-pointer ${
                      selecionado
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-border bg-table hover:bg-slate-100 dark:hover:bg-slate-800 text-text'
                    }`}
                  >
                    <span>{colab}</span>
                    {selecionado ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <span className="text-[10px] text-muted font-normal">Selecionar</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => onRestaurar(ehParEmailV360 && sincronizarPar)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-colors cursor-pointer"
            >
              Restaurar Original
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onFechar}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border text-muted hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:brightness-110 shadow-md shadow-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvar Alteração
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
