import React from 'react';
import { Colaborador, DiaProgramacao } from '../types';
import { UserCheck, Users, ShieldAlert, Award } from 'lucide-react';

interface WorkloadSummaryProps {
  dias: DiaProgramacao[];
  filtroColaborador: Colaborador | null;
  onSelecionarFiltro: (colaborador: Colaborador | null) => void;
  temFeriasNoMes: boolean;
}

export const WorkloadSummary: React.FC<WorkloadSummaryProps> = ({
  dias,
  filtroColaborador,
  onSelecionarFiltro,
  temFeriasNoMes
}) => {
  // Contabiliza total de tarefas por colaborador no mês
  const contagem: Record<Colaborador, number> = {
    Leto: 0,
    Duda: 0,
    Adri: 0,
    Girlene: 0
  };

  let totalTarefas = 0;

  dias.forEach(d => {
    if (!d.ehFeriado) {
      const v = d.valores;
      const colaboradoresDoDia = [
        v.email,
        v.retorno,
        v.fieldglass,
        v.fup,
        v.service,
        v.v360,
        v.spot,
        v.encerramento
      ];

      colaboradoresDoDia.forEach(c => {
        if (contagem[c] !== undefined) {
          contagem[c]++;
          totalTarefas++;
        }
      });
    }
  });

  const colaboradoresConfig: {
    nome: Colaborador;
    cor: string;
    bg: string;
    border: string;
    cargo: string;
  }[] = [
    {
      nome: 'Leto',
      cor: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800/60',
      cargo: 'Tratativas E-mail, V360 & Escala'
    },
    {
      nome: 'Duda',
      cor: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800/60',
      cargo: 'Retorno, Spot, Encerramento & Apoio'
    },
    {
      nome: 'Adri',
      cor: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      cargo: temFeriasNoMes ? 'Férias (13/10 a 27/10)' : 'Fieldglass, FUP & Escala'
    },
    {
      nome: 'Girlene',
      cor: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-200 dark:border-purple-800/60',
      cargo: 'Fixa Service Now (Exclusivo)'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Equilíbrio Operacional do Mês
            </h3>
            <p className="text-[11px] text-muted/80">
              Distribuição de demandas com regra E-mail ⇄ V360 e cobertura de férias
            </p>
          </div>
        </div>

        {filtroColaborador && (
          <button
            onClick={() => onSelecionarFiltro(null)}
            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            ✕ Limpar filtro ({filtroColaborador})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {colaboradoresConfig.map(colab => {
          const total = contagem[colab.nome];
          const porcentagem = totalTarefas > 0 ? Math.round((total / totalTarefas) * 100) : 0;
          const isAtivo = filtroColaborador === colab.nome;

          return (
            <div
              key={colab.nome}
              onClick={() => onSelecionarFiltro(isAtivo ? null : colab.nome)}
              className={`p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isAtivo
                  ? 'ring-2 ring-primary shadow-md scale-[1.02]'
                  : 'hover:shadow-sm hover:border-primary/40'
              } ${colab.bg} ${colab.border}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-extrabold ${colab.cor}`}>
                  {colab.nome}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-black/40 text-muted">
                  {porcentagem}%
                </span>
              </div>

              <div className="flex items-baseline gap-1.5 mb-1.5">
                <span className="text-xl font-black text-text">
                  {total}
                </span>
                <span className="text-[10px] text-muted font-medium">
                  tarefas no mês
                </span>
              </div>

              <div className="w-full bg-border/60 rounded-full h-1.5 overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.min(porcentagem * 2.2, 100)}%` }}
                />
              </div>

              <p className="text-[9.5px] text-muted truncate">
                {colab.cargo}
              </p>

              {colab.nome === 'Girlene' && (
                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-purple-600 dark:text-purple-300">
                  <ShieldAlert className="w-3 h-3 inline" /> 100% Service Now
                </div>
              )}

              {colab.nome === 'Adri' && temFeriasNoMes && (
                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-300">
                  <Award className="w-3 h-3 inline" /> Coberta por Leto & Duda
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
