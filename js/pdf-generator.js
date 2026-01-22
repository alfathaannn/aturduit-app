/**
 * Aturduit - PDF Generator
 * Uses jsPDF and AutoTable to generate professional financial reports
 */

import { formatCurrency, formatDate } from './utils.js';

export const generatePDF = (transactions, pockets, startDate, endDate, userSettings) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // -- Configuration --
    const appName = "Aturduit";
    const reportTitle = "Laporan Keuangan";
    // Using standard Helvetica for ATS Friendliness (Clean, standard, readable)
    const primaryFont = 'helvetica'; 

    // -- Header --
    doc.setFont(primaryFont, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text(appName.toUpperCase(), 14, 22);

    doc.setFontSize(12);
    doc.setFont(primaryFont, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text("Laporan Pemasukan & Pengeluaran", 14, 30);

    // Period Info
    doc.setFontSize(10);
    doc.text(`Periode: ${formatDate(startDate)} - ${formatDate(endDate)}`, 196, 22, { align: 'right' });
    doc.text(`Dibuat pada: ${formatDate(new Date())}`, 196, 30, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 35, 196, 35);


    // -- Filter Data --
    // User requested ONLY Income and Expense
    const reportData = transactions.filter(t => t.type === 'income' || t.type === 'expense');

    // -- Summary Calculation --
    let totalIncome = 0;
    let totalExpense = 0;

    reportData.forEach(t => {
        if (t.type === 'income') totalIncome += parseFloat(t.amount);
        if (t.type === 'expense') totalExpense += parseFloat(t.amount);
    });

    const netFlow = totalIncome - totalExpense;

    // -- Summary Section (Clean Text Layout) --
    let startY = 45;

    doc.setFont(primaryFont, 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Ringkasan", 14, startY);

    const summaryY = startY + 10;
    doc.setFont(primaryFont, 'normal');
    doc.setFontSize(10);
    
    // Income
    doc.setTextColor(22, 163, 74); // Green
    doc.text("Total Pemasukan:", 14, summaryY);
    doc.text(formatCurrency(totalIncome), 60, summaryY);

    // Expense
    doc.setTextColor(220, 38, 38); // Red
    doc.text("Total Pengeluaran:", 14, summaryY + 7);
    doc.text(formatCurrency(totalExpense), 60, summaryY + 7);

    // Net
    doc.setTextColor(0, 0, 0);
    doc.text("Selisih (Net):", 14, summaryY + 14);
    doc.setFont(primaryFont, 'bold');
    doc.text(formatCurrency(netFlow), 60, summaryY + 14);


    // -- Table Section --
    const tableData = reportData.map(t => {
        let walletInfo = "Saldo Utama";
        if (t.type === 'expense' && t.pocketId) {
            const pocket = pockets.find(p => p.id === t.pocketId);
            walletInfo = pocket ? pocket.name : "Kantong Terhapus";
        }
        // Income strictly goes to Saldo Utama in this app logic

        return [
            formatDate(t.date),
            t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
            walletInfo,
            t.description,
            formatCurrency(t.amount)
        ];
    });

    doc.autoTable({
        startY: summaryY + 25,
        head: [['Tanggal', 'Tipe', 'Sumber/Wallet', 'Keterangan', 'Jumlah']],
        body: tableData,
        theme: 'plain', // Very clean, ATS friendly style
        styles: {
            font: primaryFont,
            fontSize: 9,
            cellPadding: 3,
            textColor: [50, 50, 50]
        },
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [200, 200, 200]
        },
        columnStyles: {
            0: { cellWidth: 35 }, // Date
            1: { cellWidth: 25 }, // Type
            2: { cellWidth: 35 }, // Wallet
            3: { cellWidth: 'auto' }, // Desc
            4: { cellWidth: 35, halign: 'right' } // Amount
        },
        didParseCell: function(data) {
            // Add border bottom to rows for readability in 'plain' theme
            if (data.section === 'body') {
                data.cell.styles.lineWidth = { bottom: 0.1 };
                data.cell.styles.lineColor = [230, 230, 230];

                if (data.column.index === 4) {
                    const rowData = reportData[data.row.index];
                    if (rowData.type === 'expense') {
                        data.cell.styles.textColor = [220, 38, 38];
                    } else {
                        data.cell.styles.textColor = [22, 163, 74];
                    }
                }
            }
        }
    });

    // -- Footer --
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Halaman ${i} dari ${pageCount}`, 196, 285, { align: 'right' });
        doc.text(`Laporan Keuangan - Generated automatically by @alfathaannn`, 14, 285);
    }

    // Save
    const filename = `Laporan_Keuangan_${formatDate(startDate)}_sd_${formatDate(endDate)}.pdf`;
    doc.save(filename);
};
