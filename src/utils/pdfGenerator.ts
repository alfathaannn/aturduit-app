import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Pocket } from '../types';
import { formatCurrency, formatDate } from './formatters';
import { getTranslation } from './translations';

export const generatePDF = (
  transactions: Transaction[],
  pockets: Pocket[],
  startDate: string,
  endDate: string,
  language: 'id' | 'en' = 'id'
): void => {
  const doc = new jsPDF();
  const appName = 'Aturduit';
  const primaryFont = 'helvetica';

  // -- Header --
  doc.setFont(primaryFont, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(33, 33, 33);
  doc.text(appName.toUpperCase(), 14, 22);

  doc.setFontSize(11);
  doc.setFont(primaryFont, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(getTranslation(language, 'reportSubtitle'), 14, 30);

  // Period Info
  doc.setFontSize(9);
  doc.text(
    `${getTranslation(language, 'period')}: ${formatDate(startDate, language)} - ${formatDate(endDate, language)}`,
    196,
    22,
    { align: 'right' }
  );
  doc.text(
    `${getTranslation(language, 'generatedOn')}: ${formatDate(new Date().toISOString(), language)}`,
    196,
    30,
    { align: 'right' }
  );

  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.5);
  doc.line(14, 35, 196, 35);

  // Filter Data: Income and Expense within range (or all if empty)
  const reportData = transactions
    .filter((t) => t.type === 'income' || t.type === 'expense')
    .filter((t) => {
      const tTime = new Date(t.date).getTime();
      const sTime = startDate ? new Date(startDate).getTime() : 0;
      const eTime = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
      return tTime >= sTime && tTime <= eTime;
    });

  // Summary Calculation
  let totalIncome = 0;
  let totalExpense = 0;

  reportData.forEach((t) => {
    if (t.type === 'income') totalIncome += Number(t.amount);
    if (t.type === 'expense') totalExpense += Number(t.amount);
  });

  const netFlow = totalIncome - totalExpense;

  // Summary Section
  const startY = 44;
  doc.setFont(primaryFont, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(getTranslation(language, 'summary'), 14, startY);

  const summaryY = startY + 8;
  doc.setFont(primaryFont, 'normal');
  doc.setFontSize(10);

  // Income
  doc.setTextColor(22, 163, 74);
  doc.text(`${getTranslation(language, 'totalIncome')}:`, 14, summaryY);
  doc.text(formatCurrency(totalIncome), 65, summaryY);

  // Expense
  doc.setTextColor(220, 38, 38);
  doc.text(`${getTranslation(language, 'totalExpense')}:`, 14, summaryY + 7);
  doc.text(formatCurrency(totalExpense), 65, summaryY + 7);

  // Net Flow
  doc.setTextColor(20, 20, 20);
  doc.text(`${getTranslation(language, 'netFlow')}:`, 14, summaryY + 14);
  doc.setFont(primaryFont, 'bold');
  if (netFlow >= 0) {
    doc.setTextColor(14, 165, 233);
  } else {
    doc.setTextColor(220, 38, 38);
  }
  doc.text(formatCurrency(netFlow), 65, summaryY + 14);

  // Table Data
  const tableData = reportData.map((t) => {
    let walletInfo = getTranslation(language, 'mainBalance');
    if (t.type === 'expense' && t.pocketId) {
      const pocket = pockets.find((p) => p.id === t.pocketId);
      walletInfo = pocket ? pocket.name : getTranslation(language, 'deletedPocket');
    }

    let typeStr: string = t.type;
    if (t.type === 'income') typeStr = getTranslation(language, 'income');
    if (t.type === 'expense') typeStr = getTranslation(language, 'expense');

    return [
      formatDate(t.date, language),
      typeStr,
      walletInfo,
      t.description,
      formatCurrency(t.amount),
    ];
  });

  autoTable(doc, {
    startY: summaryY + 22,
    head: [
      [
        getTranslation(language, 'date'),
        getTranslation(language, 'transactionType'),
        getTranslation(language, 'pockets'),
        getTranslation(language, 'description'),
        getTranslation(language, 'amount'),
      ],
    ],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 233], // Sky 500
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      font: primaryFont,
      fontSize: 9,
      cellPadding: 4,
    },
    columnStyles: {
      4: { halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  // Save the PDF file
  const filename = `Laporan_Keuangan_Aturduit_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
