import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { DiaProgramacao } from '../types';
import { NOMES_ATIVIDADES } from './scheduler';

export const ExportService = {
  exportarExcel(dias: DiaProgramacao[], nomeMes: string, ano: number) {
    const dados = dias.map(d => {
      if (d.ehFeriado) {
        return {
          DATA: d.data.toLocaleDateString('pt-BR'),
          'E-MAIL': `FERIADO: ${d.nomeFeriado || ''}`,
          RETORNO: '-',
          FIELDGLASS: '-',
          FUP: '-',
          'SERVICE NOW': '-',
          V360: '-',
          'SPOT MATERIAIS': '-',
          ENCERRAMENTO: '-'
        };
      }

      return {
        DATA: d.data.toLocaleDateString('pt-BR'),
        'E-MAIL': d.valores.email,
        RETORNO: d.valores.retorno,
        FIELDGLASS: d.valores.fieldglass,
        FUP: d.valores.fup,
        'SERVICE NOW': d.valores.service,
        V360: d.valores.v360,
        'SPOT MATERIAIS': d.valores.spot,
        ENCERRAMENTO: d.valores.encerramento,
        STATUS: d.emFeriasAdri ? 'Férias de Adri (Redistribuído)' : 'Normal'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Programação CAF');

    XLSX.writeFile(workbook, `Escala_CAF_${nomeMes}_${ano}.xlsx`);
  },

  exportarPDF(dias: DiaProgramacao[], nomeMes: string, ano: number) {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Cabeçalho institucional
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 297, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`CAF • PROGRAMAÇÃO OPERACIONAL — ${nomeMes.toUpperCase()} ${ano}`, 14, 11);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 220, 11);

    const headers = [
      'DATA',
      NOMES_ATIVIDADES.email,
      NOMES_ATIVIDADES.retorno,
      NOMES_ATIVIDADES.fieldglass,
      NOMES_ATIVIDADES.fup,
      NOMES_ATIVIDADES.service,
      NOMES_ATIVIDADES.v360,
      NOMES_ATIVIDADES.spot,
      NOMES_ATIVIDADES.encerramento
    ];

    const body = dias.map(d => {
      if (d.ehFeriado) {
        return [
          d.data.toLocaleDateString('pt-BR'),
          { content: `FERIADO: ${d.nomeFeriado || ''}`, colSpan: 8, styles: { halign: 'center', fontStyle: 'bold', textColor: [180, 83, 9] } }
        ];
      }

      return [
        d.data.toLocaleDateString('pt-BR') + (d.emFeriasAdri ? ' 🏖️' : ''),
        d.valores.email,
        d.valores.retorno,
        d.valores.fieldglass,
        d.valores.fup,
        d.valores.service,
        d.valores.v360,
        d.valores.spot,
        d.valores.encerramento
      ];
    });

    autoTable(doc, {
      head: [headers],
      body: body as any,
      startY: 23,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        halign: 'center',
        valign: 'middle',
        textColor: [30, 41, 59]
      },
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      didParseCell: (data) => {
        // Destaque para feriado e dias
        if (data.section === 'body') {
          const rawText = String(data.cell.raw);
          if (rawText.includes('Leto')) {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fontStyle = 'bold';
          } else if (rawText.includes('Duda')) {
            data.cell.styles.textColor = [37, 99, 235];
            data.cell.styles.fontStyle = 'bold';
          } else if (rawText.includes('Girlene')) {
            data.cell.styles.textColor = [126, 34, 206];
            data.cell.styles.fontStyle = 'bold';
          } else if (rawText.includes('Adri')) {
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });

    doc.save(`Escala_CAF_${nomeMes}_${ano}.pdf`);
  }
};
