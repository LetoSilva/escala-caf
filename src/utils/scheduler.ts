import { Atividade, Colaborador, EscalaDia, RegraFerias } from '../types';
import { Holidays } from './holidays';

export const COLABORADORES: Colaborador[] = ['Duda', 'Adri', 'Leto', 'Girlene'];

export const ATIVIDADES: Atividade[] = [
  'email',
  'retorno',
  'fieldglass',
  'fup',
  'service',
  'v360',
  'spot',
  'encerramento'
];

export const NOMES_ATIVIDADES: Record<Atividade, string> = {
  email: 'E-MAIL',
  retorno: 'RETORNO',
  fieldglass: 'FIELDGLASS',
  fup: 'FUP',
  service: 'SERVICE NOW',
  v360: 'V360',
  spot: 'SPOT MATERIAIS',
  encerramento: 'ENCERRAMENTO'
};

export const DESCRICOES_ATIVIDADES: Record<Atividade, string> = {
  email: 'Tratativa e resposta de chamados por e-mail (sincronizado com V360)',
  retorno: 'Retorno com solicitantes e alinhamento de pendências',
  fieldglass: 'Gestão e aprovação operacional no sistema Fieldglass',
  fup: 'Follow-up de pedidos e requisições pendentes',
  service: 'Fila e tratativas no ServiceNow (Girlene fixa)',
  v360: 'Gestão e acompanhamento no sistema V360 (sincronizado com E-mail)',
  spot: 'Cotação e requisição de compras e materiais Spot',
  encerramento: 'Validação e encerramento de ordens e tickets do dia'
};

export const REGRA_FERIAS_ADRI_PADRAO: RegraFerias = {
  id: 'ferias-adri-outubro',
  colaborador: 'Adri' as Colaborador,
  dataInicio: '10-13', // 13 de Outubro
  dataFim: '10-27', // 27 de Outubro
  aplicarTodoAno: true,
  substitutos: ['Leto', 'Duda'] as Colaborador[],
  descricao: 'Férias de Adri (13/10 a 27/10) com redistribuição para Leto e Duda (Girlene fixa no Service Now)',
  ativa: true
};

export const Scheduler = {
  // Escala padrão de rodízio de 3 dias úteis
  rodizioPadrao: [
    {
      email: 'Leto' as Colaborador,
      retorno: 'Duda' as Colaborador,
      fieldglass: 'Adri' as Colaborador,
      fup: 'Adri' as Colaborador,
      service: 'Girlene' as Colaborador,
      v360: 'Leto' as Colaborador,
      spot: 'Duda' as Colaborador,
      encerramento: 'Duda' as Colaborador
    },
    {
      email: 'Adri' as Colaborador,
      retorno: 'Leto' as Colaborador,
      fieldglass: 'Duda' as Colaborador,
      fup: 'Duda' as Colaborador,
      service: 'Girlene' as Colaborador,
      v360: 'Adri' as Colaborador,
      spot: 'Leto' as Colaborador,
      encerramento: 'Leto' as Colaborador
    },
    {
      email: 'Duda' as Colaborador,
      retorno: 'Adri' as Colaborador,
      fieldglass: 'Leto' as Colaborador,
      fup: 'Leto' as Colaborador,
      service: 'Girlene' as Colaborador,
      v360: 'Duda' as Colaborador,
      spot: 'Adri' as Colaborador,
      encerramento: 'Adri' as Colaborador
    }
  ],

  // Data base de referência do rodízio (04/05/2026)
  dataBase: new Date(2026, 4, 4),

  regraFeriasAdriPadrao: REGRA_FERIAS_ADRI_PADRAO,

  /**
   * Calcula o índice de dias úteis entre a dataBase e a data alvo
   */
  obterIndiceParaData(dataAlvo: Date, ano: number): number {
    let contador = 0;
    const data = new Date(this.dataBase);
    const feriados = Holidays.obter(ano);
    const feriadosDatas = Object.keys(feriados);

    if (data < dataAlvo) {
      while (data < dataAlvo) {
        const diaSemana = data.getDay();
        const iso = Holidays.formatar(data);
        const diaUtil = diaSemana !== 0 && diaSemana !== 6 && !feriadosDatas.includes(iso);

        if (diaUtil) {
          contador++;
        }
        data.setDate(data.getDate() + 1);
      }
      return contador;
    } else {
      const temp = new Date(dataAlvo);
      while (temp < data) {
        const diaSemana = temp.getDay();
        const iso = Holidays.formatar(temp);
        const diaUtil = diaSemana !== 0 && diaSemana !== 6 && !feriadosDatas.includes(iso);

        if (diaUtil) {
          contador--;
        }
        temp.setDate(temp.getDate() + 1);
      }
      const totalRodizio = this.rodizioPadrao.length;
      return (contador % totalRodizio + totalRodizio) % totalRodizio;
    }
  },

  /**
   * Verifica se a data atual está dentro do período de férias da Adri (13/10 a 27/10)
   */
  estaEmFeriasAdri(data: Date, regra: RegraFerias = REGRA_FERIAS_ADRI_PADRAO): boolean {
    if (!regra.ativa || regra.colaborador !== 'Adri') return false;

    const mes = data.getMonth() + 1; // 1-12
    const dia = data.getDate(); // 1-31

    // Outubro é mês 10
    if (mes === 10 && dia >= 13 && dia <= 27) {
      return true;
    }

    return false;
  },

  /**
   * Gera a escala base de um dia específico, aplicando a redistribuição automática
   * caso a data coincida com as férias da Adri (13/10 a 27/10).
   * Girlene permanece SEMPRE fixa em Service Now.
   */
  gerarEscalaBase(data: Date, ano: number, regraFerias: RegraFerias = REGRA_FERIAS_ADRI_PADRAO): EscalaDia {
    const indice = this.obterIndiceParaData(data, ano);
    const cicloIndex = Math.abs(indice) % this.rodizioPadrao.length;
    const escalaOriginal = { ...this.rodizioPadrao[cicloIndex] };

    const emFerias = this.estaEmFeriasAdri(data, regraFerias);

    if (!emFerias) {
      return escalaOriginal;
    }

    // REDISTRIBUIÇÃO INTELIGENTE DE FÉRIAS (13/10 a 27/10):
    // Adri está ausente.
    // Girlene permanece fixa em 'Service Now'.
    // Atribuição balanceada para Leto e Duda mantendo a regra E-mail ⇄ V360 sincronizada:
    switch (cicloIndex) {
      case 0:
        // Original:
        // email: Leto, v360: Leto, retorno: Duda, spot: Duda, encerramento: Duda, service: Girlene
        // Adri estava em: fieldglass, fup
        // Leto assume fieldglass e Duda assume fup (Equilíbrio: Leto 3 tarefas, Duda 4 tarefas)
        return {
          email: 'Leto',
          retorno: 'Duda',
          fieldglass: 'Leto', // Substituído da Adri para Leto
          fup: 'Duda', // Substituído da Adri para Duda
          service: 'Girlene', // Sempre fixa
          v360: 'Leto', // Mantém par com e-mail
          spot: 'Duda',
          encerramento: 'Duda'
        };

      case 1:
        // Original:
        // Adri estava em: email, v360
        // retorno: Leto, spot: Leto, encerramento: Leto, service: Girlene
        // fieldglass: Duda, fup: Duda
        // E-mail e V360 andam juntos! Duda assume Email e V360.
        // (Equilíbrio: Duda 4 tarefas, Leto 3 tarefas)
        return {
          email: 'Duda', // Substituído da Adri para Duda
          retorno: 'Leto',
          fieldglass: 'Duda',
          fup: 'Duda',
          service: 'Girlene', // Sempre fixa
          v360: 'Duda', // Substituído da Adri para Duda (sincronizado com email)
          spot: 'Leto',
          encerramento: 'Leto'
        };

      case 2:
      default:
        // Original:
        // email: Duda, v360: Duda, fieldglass: Leto, fup: Leto, service: Girlene
        // Adri estava em: retorno, spot, encerramento
        // Leto assume retorno e spot; Duda assume encerramento.
        // (Equilíbrio: Leto 4 tarefas, Duda 3 tarefas)
        return {
          email: 'Duda',
          retorno: 'Leto', // Substituído da Adri para Leto
          fieldglass: 'Leto',
          fup: 'Leto',
          service: 'Girlene', // Sempre fixa
          v360: 'Duda', // Mantém par com e-mail
          spot: 'Leto', // Substituído da Adri para Leto
          encerramento: 'Duda' // Substituído da Adri para Duda
        };
    }
  }
};
