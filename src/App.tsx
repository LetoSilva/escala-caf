import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Atividade,
  Colaborador,
  DiaProgramacao,
  EscalaDia,
  RegraFerias,
  SubstituicoesMapa,
  TemaMensal
} from './types';
import { Holidays } from './utils/holidays';
import {
  Scheduler,
  COLABORADORES,
  ATIVIDADES,
  NOMES_ATIVIDADES
} from './utils/scheduler';
import { ExportService } from './utils/export';
import { WorkloadSummary } from './components/WorkloadSummary';
import { EditModal } from './components/EditModal';
import { VacationModal } from './components/VacationModal';
import { AuditLogModal } from './components/AuditLogModal';
import { Toast } from './components/Toast';
import {
  Calendar,
  Sun,
  Moon,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Palmtree,
  History,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Mail,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

const ANOS = [2025, 2026, 2027, 2028, 2029, 2030];

const TEMAS_MENSAIS: TemaMensal[] = [
  {
    nome: 'Janeiro',
    principal: '#475569',
    secundario: '#475569',
    bg: '#f8fafc',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#f1f5f9',
    text: '#0f172a',
    border: '#cbd5e1',
    accent: '#475569'
  },
  {
    nome: 'Fevereiro',
    principal: '#7c3aed',
    secundario: '#7c3aed',
    bg: '#faf5ff',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#f3e8ff',
    text: '#2e1065',
    border: '#e9d5ff',
    accent: '#7c3aed'
  },
  {
    nome: 'Março',
    principal: '#2563eb',
    secundario: '#2563eb',
    bg: '#eff6ff',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#dbeafe',
    text: '#172554',
    border: '#bfdbfe',
    accent: '#2563eb'
  },
  {
    nome: 'Abril - Conscientização',
    principal: '#2563eb',
    secundario: '#facc15',
    bg: '#f8fafc',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#eff6ff',
    text: '#1e293b',
    border: '#bfdbfe',
    accent: '#2563eb'
  },
  {
    nome: 'Maio',
    principal: '#eab308',
    secundario: '#dc2626',
    bg: '#fffbeb',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#fef2f2',
    text: '#451a03',
    border: '#fde68a',
    accent: '#dc2626'
  },
  {
    nome: 'Junho',
    principal: '#dc2626',
    secundario: '#dc2626',
    bg: '#fef2f2',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#fee2e2',
    text: '#450a0a',
    border: '#fecaca',
    accent: '#dc2626'
  },
  {
    nome: 'Julho',
    principal: '#ea580c',
    secundario: '#ea580c',
    bg: '#fff7ed',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#ffedd5',
    text: '#431407',
    border: '#fed7aa',
    accent: '#ea580c'
  },
  {
    nome: 'Agosto',
    principal: '#d97706',
    secundario: '#d97706',
    bg: '#fffbeb',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#fef3c7',
    text: '#451a03',
    border: '#fde68a',
    accent: '#d97706'
  },
  {
    nome: 'Setembro',
    principal: '#059669',
    secundario: '#059669',
    bg: '#ecfdf5',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#d1fae5',
    text: '#064e3b',
    border: '#a7f3d0',
    accent: '#059669'
  },
  {
    nome: 'Outubro - Rosa',
    principal: '#db2777',
    secundario: '#db2777',
    bg: '#fdf2f8',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#fce7f3',
    text: '#500724',
    border: '#fbcfe8',
    accent: '#db2777'
  },
  {
    nome: 'Novembro - Azul',
    principal: '#0284c7',
    secundario: '#0284c7',
    bg: '#f0f9ff',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#e0f2fe',
    text: '#082f49',
    border: '#bae6fd',
    accent: '#0284c7'
  },
  {
    nome: 'Dezembro',
    principal: '#b91c1c',
    secundario: '#b91c1c',
    bg: '#fef2f2',
    card: '#ffffff',
    table: '#ffffff',
    hover: '#fee2e2',
    text: '#450a0a',
    border: '#fecaca',
    accent: '#b91c1c'
  }
];

const STORAGE_SUBSTITUICOES = 'CAF_ESCALA_SUBSTITUICOES_V2';
const STORAGE_FERIAS = 'CAF_ESCALA_FERIAS_REGRAS_V2';
const STORAGE_TEMA = 'CAF_TEMA_MODO';

export default function App() {
  const agora = useMemo(() => new Date(), []);

  const [mes, setMes] = useState<number>(() => {
    // Se estivermos perto de Outubro ou mês atual, inicializa no mês atual
    return agora.getMonth();
  });
  const [ano, setAno] = useState<number>(() => agora.getFullYear());
  const [modoEscuro, setModoEscuro] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_TEMA) === 'dark';
  });

  // Mapa de substituições personalizadas
  const [substituicoes, setSubstituicoes] = useState<SubstituicoesMapa>(() => {
    try {
      const v2 = localStorage.getItem(STORAGE_SUBSTITUICOES);
      if (v2) return JSON.parse(v2);

      // Migração compatível do V1 antigo se existir
      const v1 = localStorage.getItem('CAF_ESCALA_SUBSTITUICOES_V1');
      if (v1) {
        const parsed = JSON.parse(v1);
        const migrado: SubstituicoesMapa = {};
        Object.entries(parsed).forEach(([k, v]) => {
          migrado[k] = {
            colaborador: v as Colaborador,
            dataModificacao: new Date().toLocaleDateString('pt-BR')
          };
        });
        return migrado;
      }
    } catch {
      // Ignora erro
    }
    return {};
  });

  // Regra de férias (padrão Adri 13/10 a 27/10)
  const [regraFerias, setRegraFerias] = useState<RegraFerias>(() => {
    try {
      const salvas = localStorage.getItem(STORAGE_FERIAS);
      if (salvas) return JSON.parse(salvas);
    } catch {
      // Ignora erro
    }
    return Scheduler.regraFeriasAdriPadrao;
  });

  // Filtro interativo de colaborador
  const [filtroColaborador, setFiltroColaborador] = useState<Colaborador | null>(null);

  // Modais
  const [modalEdicao, setModalEdicao] = useState<{
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
  }>({ aberto: false, contexto: null });

  const [modalFeriasAberto, setModalFeriasAberto] = useState(false);
  const [modalAuditAberto, setModalAuditAberto] = useState(false);

  // Notificação Toast
  const [toast, setToast] = useState<{ mensagem: string; tipo: 'success' | 'warning' | 'info' } | null>(null);

  const mostrarToast = useCallback((mensagem: string, tipo: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ mensagem, tipo });
    const timer = setTimeout(() => {
      setToast(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  // Salvar substituições no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SUBSTITUICOES, JSON.stringify(substituicoes));
    } catch (err) {
      console.error('Erro ao salvar no localStorage:', err);
    }
  }, [substituicoes]);

  // Salvar regras de férias no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_FERIAS, JSON.stringify(regraFerias));
    } catch (err) {
      console.error('Erro ao salvar férias:', err);
    }
  }, [regraFerias]);

  // Gerenciar modo escuro no documento
  useEffect(() => {
    if (modoEscuro) {
      document.body.classList.add('dark');
      localStorage.setItem(STORAGE_TEMA, 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem(STORAGE_TEMA, 'light');
    }
  }, [modoEscuro]);

  // Aplicar variáveis do tema mensal
  useEffect(() => {
    const root = document.documentElement;
    const tema = TEMAS_MENSAIS[mes] || TEMAS_MENSAIS[0];
    root.style.setProperty('--primary', tema.principal);
    root.style.setProperty('--secondary', tema.secundario);
    root.style.setProperty('--accent', tema.accent);

    document.title = `CAF • ${MESES[mes]} ${ano} | Programação Inteligente`;
  }, [mes, ano]);

  // Cálculo da programação completa do mês
  const diasDoMes: DiaProgramacao[] = useMemo(() => {
    const feriados = Holidays.obter(ano);
    const feriadosDatas = Object.keys(feriados);
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const dias: DiaProgramacao[] = [];

    for (let dia = 1; dia <= ultimoDia; dia++) {
      const data = new Date(ano, mes, dia);
      const diaSemana = data.getDay();

      // Pula finais de semana
      if (diaSemana === 0 || diaSemana === 6) continue;

      const iso = Holidays.formatar(data);
      const ehFeriado = feriadosDatas.includes(iso);
      const ehHoje =
        data.getDate() === agora.getDate() &&
        data.getMonth() === agora.getMonth() &&
        data.getFullYear() === agora.getFullYear();

      const emFeriasAdri = Scheduler.estaEmFeriasAdri(data, regraFerias);

      // Escala base (já considerando redistribuição das férias da Adri se estiver no período 13/10 a 27/10)
      const escalaBase = Scheduler.gerarEscalaBase(data, ano, regraFerias);
      const valores: EscalaDia = { ...escalaBase };
      const substituicoesAtivas: Partial<Record<Atividade, any>> = {};

      // Aplica substituições manuais salvas no LocalStorage
      ATIVIDADES.forEach(atividade => {
        const chave = `${iso}_${atividade}`;
        if (substituicoes[chave]) {
          valores[atividade] = substituicoes[chave].colaborador;
          substituicoesAtivas[atividade] = substituicoes[chave];
        }
      });

      dias.push({
        data,
        iso,
        dia,
        mes,
        ano,
        diaSemana,
        ehFeriado,
        nomeFeriado: ehFeriado ? feriados[iso] : undefined,
        ehHoje,
        emFeriasAdri,
        valores,
        valoresOriginais: escalaBase,
        substituicoesAtivas
      });
    }

    return dias;
  }, [ano, mes, regraFerias, substituicoes, agora]);

  // Contadores
  const diasUteisCount = useMemo(() => diasDoMes.filter(d => !d.ehFeriado).length, [diasDoMes]);
  const feriadosCount = useMemo(() => diasDoMes.filter(d => d.ehFeriado).length, [diasDoMes]);

  // Quem está no E-mail e V360 hoje?
  const escalaHoje = useMemo(() => {
    const diaHoje = diasDoMes.find(d => d.ehHoje && !d.ehFeriado);
    if (!diaHoje) return null;
    return diaHoje.valores;
  }, [diasDoMes]);

  // Férias de Adri estão ativas neste mês visualizado?
  const temFeriasAdriNoMesAtual = useMemo(() => {
    return mes === 9 && regraFerias.ativa; // Outubro é índice 9
  }, [mes, regraFerias.ativa]);

  // Abertura do modal de edição com suporte à regra E-MAIL ⇄ V360
  const abrirModalEdicao = (
    ano: number,
    mes: number,
    dia: number,
    atividade: Atividade,
    nomeAtual: Colaborador,
    dataIso: string
  ) => {
    // Verifica o par sincronizado
    let parSincronizadoAtual: Colaborador | undefined;
    if (atividade === 'email') {
      const chavePar = `${dataIso}_v360`;
      parSincronizadoAtual = substituicoes[chavePar]?.colaborador;
    } else if (atividade === 'v360') {
      const chavePar = `${dataIso}_email`;
      parSincronizadoAtual = substituicoes[chavePar]?.colaborador;
    }

    setModalEdicao({
      aberto: true,
      contexto: {
        ano,
        mes,
        dia,
        atividade,
        nomeAtual,
        dataIso,
        parSincronizadoAtual
      }
    });
  };

  /**
   * Salva a substituição implementando a regra solicitada:
   * "sempre que eu alterar um colaborador exemplo hoje eu Leto estou nas tratativas de E-mail e V360
   * sempre que trocar o colaborador que está por exemplo no e-mail ele também alterar V360 automaticamente"
   */
  const handleSalvarSubstituicao = (novoNome: Colaborador, sincronizarPar: boolean) => {
    if (!modalEdicao.contexto) return;
    const { dataIso, atividade } = modalEdicao.contexto;
    const dataHoraStr = new Date().toLocaleString('pt-BR');

    const novasSubstituicoes = { ...substituicoes };
    const chavePrincipal = `${dataIso}_${atividade}`;

    novasSubstituicoes[chavePrincipal] = {
      colaborador: novoNome,
      dataModificacao: dataHoraStr
    };

    let mensagemToast = `${novoNome} definido em ${NOMES_ATIVIDADES[atividade]}.`;

    // Sincronização automática E-MAIL ⇄ V360
    if (sincronizarPar) {
      if (atividade === 'email') {
        const chaveV360 = `${dataIso}_v360`;
        novasSubstituicoes[chaveV360] = {
          colaborador: novoNome,
          dataModificacao: dataHoraStr,
          sincronizadoAutomaticamente: true
        };
        mensagemToast = `⚡ ${novoNome} atribuído em E-MAIL e automaticamente sincronizado em V360!`;
      } else if (atividade === 'v360') {
        const chaveEmail = `${dataIso}_email`;
        novasSubstituicoes[chaveEmail] = {
          colaborador: novoNome,
          dataModificacao: dataHoraStr,
          sincronizadoAutomaticamente: true
        };
        mensagemToast = `⚡ ${novoNome} atribuído em V360 e automaticamente sincronizado em E-MAIL!`;
      }
    }

    setSubstituicoes(novasSubstituicoes);
    setModalEdicao({ aberto: false, contexto: null });
    mostrarToast(mensagemToast, 'success');

    // Confetti comemorativo discreto
    try {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {
      // Ignora erro
    }
  };

  // Restaurar uma célula específica (e opcionalmente seu par sincronizado)
  const handleRestaurarCelula = (restaurarPar: boolean) => {
    if (!modalEdicao.contexto) return;
    const { dataIso, atividade } = modalEdicao.contexto;

    const novas = { ...substituicoes };
    delete novas[`${dataIso}_${atividade}`];

    if (restaurarPar) {
      if (atividade === 'email') {
        delete novas[`${dataIso}_v360`];
      } else if (atividade === 'v360') {
        delete novas[`${dataIso}_email`];
      }
    }

    setSubstituicoes(novas);
    setModalEdicao({ aberto: false, contexto: null });
    mostrarToast('Célula restaurada para o rodízio automático.', 'info');
  };

  // Restaurar todas as substituições do mês atual
  const handleRestaurarMes = () => {
    const prefixo = `${ano}-${String(mes + 1).padStart(2, '0')}-`;
    const chavesDoMes = Object.keys(substituicoes).filter(c => c.startsWith(prefixo));

    if (chavesDoMes.length === 0) {
      mostrarToast('Não existem substituições manuais neste mês.', 'info');
      return;
    }

    if (!confirm(`Deseja restaurar toda a escala de ${MESES[mes]} de ${ano}?\n\nTodas as ${chavesDoMes.length} alterações manuais deste mês serão removidas.`)) {
      return;
    }

    const novas = { ...substituicoes };
    chavesDoMes.forEach(c => delete novas[c]);
    setSubstituicoes(novas);
    mostrarToast(`Escala original de ${MESES[mes]} restaurada com sucesso!`, 'success');
  };

  // Restaurar uma chave específica no modal de histórico
  const handleRestaurarChave = (chave: string) => {
    const novas = { ...substituicoes };
    delete novas[chave];
    setSubstituicoes(novas);
    mostrarToast(`Alteração em ${chave} restaurada.`, 'info');
  };

  // Restaurar todas as substituições do sistema
  const handleLimparTodasSubstituicoes = () => {
    if (!confirm('Deseja apagar TODAS as alterações manuais já feitas em qualquer mês?')) return;
    setSubstituicoes({});
    mostrarToast('Todas as alterações manuais foram removidas.', 'info');
  };

  // Classes de cor e estilo por colaborador
  const getColaboradorEstilo = (nome: Colaborador) => {
    switch (nome) {
      case 'Leto':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/25 border-amber-300/40';
      case 'Duda':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/25 border-blue-300/40';
      case 'Adri':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/25 border-emerald-300/40';
      case 'Girlene':
        return 'text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/25 border-purple-300/40';
      default:
        return 'text-slate-700 dark:text-slate-200';
    }
  };

  return (
    <div className="min-h-screen text-text transition-colors duration-300 pb-12">
      {/* Background futurista e dinâmico com iluminação suave */}
      <div className="ai-background" aria-hidden="true">
        <div className="ai-grid"></div>
        <div className="ai-glow ai-glow-1"></div>
        <div className="ai-glow ai-glow-2"></div>
        <div className="ai-glow ai-glow-3"></div>
      </div>

      <main className="dashboard max-w-7xl mx-auto px-3 sm:px-5 pt-4">
        {/* Topbar */}
        <header className="topbar flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-2 border-b border-border/70">
          {/* Logo e Identidade */}
          <div className="logo flex items-center gap-3">
            <div className="logo-box w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-primary/20 tracking-wider">
              CAF
            </div>
            <div className="logo-info">
              <div className="system-status flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500"></span>
                Sistema Online & Conectado
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-1.5">
                Programação <span className="text-primary">Mensal</span>
              </h1>
              <p className="text-xs text-muted font-medium">
                Sistema Inteligente de Escala • Operações CAF
              </p>
            </div>
          </div>

          {/* Controles de navegação e ações */}
          <div className="controls flex flex-wrap items-center gap-2">
            {/* Seletor de Mês */}
            <div className="control-group flex flex-col gap-0.5">
              <label htmlFor="select-mes" className="text-[9px] font-extrabold uppercase text-muted tracking-wider">
                Mês
              </label>
              <select
                id="select-mes"
                value={mes}
                onChange={e => setMes(Number(e.target.value))}
                className="h-9 px-3 text-xs font-bold rounded-xl border border-border bg-card text-text shadow-sm cursor-pointer hover:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {MESES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Seletor de Ano */}
            <div className="control-group flex flex-col gap-0.5">
              <label htmlFor="select-ano" className="text-[9px] font-extrabold uppercase text-muted tracking-wider">
                Ano
              </label>
              <select
                id="select-ano"
                value={ano}
                onChange={e => setAno(Number(e.target.value))}
                className="h-9 px-3 text-xs font-bold rounded-xl border border-border bg-card text-text shadow-sm cursor-pointer hover:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {ANOS.map(a => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Botão Regras & Férias (Destaque para o pedido do usuário) */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-extrabold uppercase text-muted tracking-wider invisible">
                Férias
              </span>
              <button
                type="button"
                onClick={() => setModalFeriasAberto(true)}
                className={`h-9 px-3.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                  temFeriasAdriNoMesAtual
                    ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 ring-2 ring-emerald-400/30'
                    : 'bg-card text-text border-border hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Configurar regras de férias de Adri e rodízio"
              >
                <Palmtree className="w-3.5 h-3.5 shrink-0" />
                <span>Férias Adri {temFeriasAdriNoMesAtual ? '(Ativa)' : ''}</span>
              </button>
            </div>

            {/* Botão Alternar Tema */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-extrabold uppercase text-muted tracking-wider invisible">
                Tema
              </span>
              <button
                type="button"
                onClick={() => setModoEscuro(!modoEscuro)}
                className="h-9 px-3 text-xs font-bold rounded-xl border border-border bg-card text-text hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Alternar entre tema claro e escuro"
              >
                {modoEscuro ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                <span className="hidden sm:inline">{modoEscuro ? 'Claro' : 'Escuro'}</span>
              </button>
            </div>

            {/* Botão Exportar Excel */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-extrabold uppercase text-muted tracking-wider invisible">
                Excel
              </span>
              <button
                type="button"
                onClick={() => ExportService.exportarExcel(diasDoMes, MESES[mes], ano)}
                className="h-9 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar planilha Excel formatada"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>

            {/* Botão Exportar PDF */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-extrabold uppercase text-muted tracking-wider invisible">
                PDF
              </span>
              <button
                type="button"
                onClick={() => ExportService.exportarPDF(diasDoMes, MESES[mes], ano)}
                className="h-9 px-3 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Exportar relatório em PDF com layout limpo"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PDF</span>
              </button>
            </div>

            {/* Botão Histórico / Auditoria */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-extrabold uppercase text-muted tracking-wider invisible">
                Histórico
              </span>
              <button
                type="button"
                onClick={() => setModalAuditAberto(true)}
                className="h-9 px-3 text-xs font-bold rounded-xl border border-border bg-card text-text hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Ver alterações manuais salvas"
              >
                <History className="w-3.5 h-3.5 text-primary" />
                <span className="hidden sm:inline">Histórico</span>
              </button>
            </div>

            {/* Botão Restaurar Mês */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-extrabold uppercase text-muted tracking-wider invisible">
                Reset
              </span>
              <button
                type="button"
                onClick={handleRestaurarMes}
                className="h-9 px-3 text-xs font-bold rounded-xl border border-red-300 dark:border-red-900 bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
                title="Desfazer alterações manuais deste mês"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Restaurar Mês</span>
              </button>
            </div>
          </div>
        </header>

        {/* Banners Informativos Dinâmicos de Regras Ativas */}
        <div className="space-y-2 mb-4">
          {/* Banner 1: Férias da Adri (Especialmente quando for Outubro) */}
          {temFeriasAdriNoMesAtual && (
            <div className="p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5 sm:mt-0">
                  <Palmtree className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-emerald-800 dark:text-emerald-300">
                      Regra de Férias da Adri em Vigor (13/10 a 27/10)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Automático
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900/90 dark:text-emerald-200/90 mt-0.5 leading-snug">
                    Todas as demandas dos dias de Adri estão redistribuídas entre <strong>Leto</strong> e <strong>Duda</strong> com carga equilibrada. <strong>Girlene permanece 100% fixa no Service Now</strong>.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalFeriasAberto(true)}
                className="self-end sm:self-center px-3 py-1.5 text-xs font-extrabold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0 cursor-pointer"
              >
                Ver Detalhes do Rodízio
              </button>
            </div>
          )}

          {/* Banner 2: Regra de Sincronização E-mail ⇄ V360 */}
          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/30 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <RefreshCw className="w-3.5 h-3.5 text-primary shrink-0 animate-spin" style={{ animationDuration: '8s' }} />
              <span>
                <strong>Sincronização E-mail ⇄ V360 Ativa:</strong> Ao alterar o colaborador em E-mail, o V360 daquele dia acompanha automaticamente (e vice-versa).
              </span>
            </div>
            <div className="text-[11px] text-muted hidden md:flex items-center gap-1 font-semibold">
              <Sparkles className="w-3 h-3 text-amber-500" /> Clique no nome na tabela para editar
            </div>
          </div>
        </div>

        {/* Status Bar Cards */}
        <section className="status-bar grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Card Dias Úteis */}
          <article className="status-card bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                Dias Úteis ({MESES[mes]})
              </h2>
              <p className="text-2xl font-black text-text leading-tight">
                {diasUteisCount}
              </p>
            </div>
          </article>

          {/* Card Feriados */}
          <article className="status-card bg-card border border-border rounded-xl p-3.5 flex items-center gap-3 shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
              ◈
            </div>
            <div className="min-w-0">
              <h2 className="text-[10px] font-extrabold text-muted uppercase tracking-wider">
                Feriados no Mês
              </h2>
              <p className="text-2xl font-black text-text leading-tight">
                {feriadosCount}
              </p>
            </div>
          </article>

          {/* Card E-mail & V360 de Hoje */}
          <article className="status-card bg-card border border-primary/30 rounded-xl p-3.5 flex items-center gap-3 shadow-sm relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-primary/20">
              <Mail className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[10px] font-extrabold text-primary uppercase tracking-wider">
                E-MAIL & V360 DE HOJE
              </h2>
              <p className="text-xl font-black text-primary leading-tight truncate">
                {escalaHoje ? `${escalaHoje.email}` : 'Fim de Semana / Feriado'}
              </p>
              {escalaHoje && (
                <span className="text-[9.5px] text-muted font-bold block">
                  V360: {escalaHoje.v360} (Sincronizado)
                </span>
              )}
            </div>
          </article>
        </section>

        {/* Resumo de Equilíbrio Operacional do Mês (Workload Summary) */}
        <WorkloadSummary
          dias={diasDoMes}
          filtroColaborador={filtroColaborador}
          onSelecionarFiltro={setFiltroColaborador}
          temFeriasNoMes={temFeriasAdriNoMesAtual}
        />

        {/* Tabela de Programação Mensal */}
        <section className="card bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* Cabeçalho da Tabela */}
          <div className="table-header px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-900/50">
            <div className="table-heading">
              <h3 className="text-xs font-black uppercase tracking-wider text-muted">
                {MESES[mes]} de {ano} • Programação Operacional
              </h3>
              <p className="text-[11px] text-muted">
                {filtroColaborador
                  ? `Destacando tarefas de: ${filtroColaborador}`
                  : 'Clique em qualquer célula para alterar o colaborador com sincronização instantânea'}
              </p>
            </div>

            <div className="table-tools flex items-center gap-3">
              <div className="ai-animation flex items-center gap-1" title="Rodízio Inteligente Conectado">
                <span className="w-1 h-3 rounded-full bg-primary animate-pulse"></span>
                <span className="w-1 h-4 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-1 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.3s' }}></span>
              </div>
              <span className="text-[10px] font-bold text-muted bg-table px-2.5 py-1 rounded-lg border border-border">
                8 Demandas Operacionais
              </span>
            </div>
          </div>

          {/* Tabela Responsiva */}
          <div className="table-container overflow-x-auto max-h-[650px] scrollbar-thin">
            <table id="tabelaProgramacao" className="w-full text-center border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-primary text-white shadow-sm font-black text-[11px] tracking-wide">
                <tr>
                  <th className="py-2.5 px-3 border border-white/20">DATA</th>
                  <th className="py-2.5 px-3 border border-white/20" title="Tratativas de E-mail (Sincronizado com V360)">
                    E-MAIL ⇄
                  </th>
                  <th className="py-2.5 px-3 border border-white/20">RETORNO</th>
                  <th className="py-2.5 px-3 border border-white/20">FIELDGLASS</th>
                  <th className="py-2.5 px-3 border border-white/20">FUP</th>
                  <th className="py-2.5 px-3 border border-white/20" title="Girlene fixa">
                    SERVICE NOW 🛡️
                  </th>
                  <th className="py-2.5 px-3 border border-white/20" title="Tratativas V360 (Sincronizado com E-mail)">
                    V360 ⇄
                  </th>
                  <th className="py-2.5 px-3 border border-white/20">SPOT MATERIAIS</th>
                  <th className="py-2.5 px-3 border border-white/20">ENCERRAMENTO</th>
                </tr>
              </thead>
              <tbody id="tbodyProgramacao" className="divide-y divide-border">
                {diasDoMes.map(diaInfo => {
                  const dataStr = diaInfo.data.toLocaleDateString('pt-BR');

                  // Caso 1: Feriado
                  if (diaInfo.ehFeriado) {
                    return (
                      <tr
                        key={diaInfo.iso}
                        className="bg-amber-500/10 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 font-bold"
                      >
                        <td className="py-2 px-3 border border-border/80 font-mono text-[11px]">
                          {dataStr}
                        </td>
                        <td
                          colSpan={8}
                          className="py-2 px-3 border border-border/80 text-center tracking-wide uppercase text-xs"
                        >
                          🎉 FERIADO: {diaInfo.nomeFeriado}
                        </td>
                      </tr>
                    );
                  }

                  // Caso 2: Dia normal ou férias de Adri
                  const ehHoje = diaInfo.ehHoje;
                  const emFerias = diaInfo.emFeriasAdri;

                  return (
                    <tr
                      key={diaInfo.iso}
                      className={`transition-colors ${
                        ehHoje
                          ? 'bg-primary/10 dark:bg-primary/20 font-bold border-y-2 border-primary'
                          : emFerias
                          ? 'bg-emerald-500/[0.04] dark:bg-emerald-950/20 hover:bg-emerald-500/[0.08]'
                          : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* Coluna DATA com indicação de Férias e Hoje */}
                      <td className="py-2 px-3 border border-border font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {ehHoje && (
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Hoje"></span>
                          )}
                          <span>{dataStr}</span>
                          {emFerias && (
                            <span
                              className="text-[10px]"
                              title="Período de Férias da Adri (Demandas redistribuídas para Leto e Duda)"
                            >
                              🏖️
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 8 Atividades operacionais */}
                      {ATIVIDADES.map(atividade => {
                        const colaboradorAtual = diaInfo.valores[atividade];
                        const ehModificado = !!diaInfo.substituicoesAtivas[atividade];
                        const atendeFiltro =
                          !filtroColaborador || filtroColaborador === colaboradorAtual;

                        const ehPar = atividade === 'email' || atividade === 'v360';

                        return (
                          <td
                            key={atividade}
                            onClick={() =>
                              abrirModalEdicao(
                                diaInfo.ano,
                                diaInfo.mes,
                                diaInfo.dia,
                                atividade,
                                colaboradorAtual,
                                diaInfo.iso
                              )
                            }
                            title={`Clique para alterar ${NOMES_ATIVIDADES[atividade]} (Atual: ${colaboradorAtual})${
                              ehPar ? ' • Sincronizado automaticamente E-mail ⇄ V360' : ''
                            }`}
                            className={`py-2 px-2.5 border border-border font-extrabold cursor-pointer transition-all select-none relative group ${
                              getColaboradorEstilo(colaboradorAtual)
                            } ${!atendeFiltro ? 'opacity-25' : 'opacity-100'}`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>{colaboradorAtual}</span>
                              {ehModificado && (
                                <span
                                  className="text-[9px] text-primary"
                                  title="Substituição manual salva"
                                >
                                  ✎
                                </span>
                              )}
                              {ehPar && (
                                <span
                                  className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                                  title="Sincronizado"
                                >
                                  ⇄
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rodapé institucional */}
        <footer className="system-footer flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted pt-3 border-t border-border/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              CAF • Programação Inteligente & Escalas Operacionais © {new Date().getFullYear()}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-text">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Girlene fixa no Service Now
            </span>
            <span className="flex items-center gap-1 font-semibold text-text">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> E-mail ⇄ V360 sincronizados
            </span>
          </div>
        </footer>
      </main>

      {/* Modal de Substituição com Sincronização Inteligente */}
      <EditModal
        aberto={modalEdicao.aberto}
        contexto={modalEdicao.contexto}
        onFechar={() => setModalEdicao({ aberto: false, contexto: null })}
        onSalvar={handleSalvarSubstituicao}
        onRestaurar={handleRestaurarCelula}
      />

      {/* Modal de Férias e Ausências */}
      <VacationModal
        aberto={modalFeriasAberto}
        regraAtual={regraFerias}
        onFechar={() => setModalFeriasAberto(false)}
        onAtualizarRegra={nova => {
          setRegraFerias(nova);
          mostrarToast('Regra de férias atualizada com sucesso!', 'success');
        }}
      />

      {/* Modal de Histórico e Auditoria */}
      <AuditLogModal
        aberto={modalAuditAberto}
        substituicoes={substituicoes}
        onFechar={() => setModalAuditAberto(false)}
        onRestaurarChave={handleRestaurarChave}
        onLimparTodas={handleLimparTodasSubstituicoes}
      />

      {/* Toast Notifier */}
      <Toast mensagem={toast?.mensagem || null} tipo={toast?.tipo} />
    </div>
  );
}
