export type Colaborador = 'Duda' | 'Adri' | 'Leto' | 'Girlene';

export type Atividade =
  | 'email'
  | 'retorno'
  | 'fieldglass'
  | 'fup'
  | 'service'
  | 'v360'
  | 'spot'
  | 'encerramento';

export interface EscalaDia {
  email: Colaborador;
  retorno: Colaborador;
  fieldglass: Colaborador;
  fup: Colaborador;
  service: Colaborador;
  v360: Colaborador;
  spot: Colaborador;
  encerramento: Colaborador;
}

export interface RegraFerias {
  id: string;
  colaborador: Colaborador;
  dataInicio: string; // 'YYYY-MM-DD' ou 'MM-DD' para anual
  dataFim: string; // 'YYYY-MM-DD' ou 'MM-DD'
  aplicarTodoAno: boolean;
  substitutos: Colaborador[];
  descricao: string;
  ativa: boolean;
}

export interface SubstituicaoItem {
  colaborador: Colaborador;
  dataModificacao: string;
  motivo?: string;
  sincronizadoAutomaticamente?: boolean;
}

export interface SubstituicoesMapa {
  [chave: string]: SubstituicaoItem; // chave: 'YYYY-MM-DD_atividade'
}

export interface DiaProgramacao {
  data: Date;
  iso: string;
  dia: number;
  mes: number;
  ano: number;
  diaSemana: number;
  ehFeriado: boolean;
  nomeFeriado?: string;
  ehHoje: boolean;
  emFeriasAdri: boolean;
  valores: EscalaDia;
  valoresOriginais: EscalaDia;
  substituicoesAtivas: Partial<Record<Atividade, SubstituicaoItem>>;
}

export interface TemaMensal {
  nome: string;
  principal: string;
  secundario: string;
  bg: string;
  card: string;
  table: string;
  hover: string;
  text: string;
  border: string;
  accent: string;
  gradient?: string;
}
