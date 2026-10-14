// Cálculo exato de feriados nacionais e estaduais/municipais (PE / Recife)

export const Holidays = {
  formatar(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  },

  calcularPascoa(ano: number): Date {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);

    const mes = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const dia = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(ano, mes, dia);
  },

  obter(ano: number): Record<string, string> {
    const lista: Record<string, string> = {};
    const pascoa = this.calcularPascoa(ano);

    // Feriados móveis derivados da Páscoa
    const carnavalSeg = new Date(pascoa);
    carnavalSeg.setDate(pascoa.getDate() - 48);

    const carnavalTer = new Date(pascoa);
    carnavalTer.setDate(pascoa.getDate() - 47);

    const quartaCinzas = new Date(pascoa);
    quartaCinzas.setDate(pascoa.getDate() - 46);

    const sextaSanta = new Date(pascoa);
    sextaSanta.setDate(pascoa.getDate() - 2);

    const corpusChristi = new Date(pascoa);
    corpusChristi.setDate(pascoa.getDate() + 60);

    // Feriados Nacionais Fixos
    lista[`${ano}-01-01`] = 'Ano Novo';
    lista[`${ano}-04-21`] = 'Tiradentes';
    lista[`${ano}-05-01`] = 'Dia do Trabalho';
    lista[`${ano}-09-07`] = 'Independência do Brasil';
    lista[`${ano}-10-12`] = 'Nossa Senhora Aparecida';
    lista[`${ano}-11-02`] = 'Finados';
    lista[`${ano}-11-15`] = 'Proclamação da República';
    lista[`${ano}-11-20`] = 'Consciência Negra';
    lista[`${ano}-12-25`] = 'Natal';

    // Feriados Móveis
    lista[this.formatar(carnavalSeg)] = 'Carnaval';
    lista[this.formatar(carnavalTer)] = 'Carnaval';
    lista[this.formatar(quartaCinzas)] = 'Ponto Facultativo - Quarta-feira de Cinzas';
    lista[this.formatar(sextaSanta)] = 'Sexta-feira Santa';
    lista[this.formatar(corpusChristi)] = 'Corpus Christi';

    // Feriados Regionais (Pernambuco / Recife)
    lista[`${ano}-03-06`] = 'Revolução Pernambucana';
    lista[`${ano}-06-24`] = 'São João';
    lista[`${ano}-07-16`] = 'Nossa Senhora do Carmo';

    return lista;
  }
};
