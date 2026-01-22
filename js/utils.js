/**
 * Aturduit - Utility Functions
 */

export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const downloadJSON = (data, filename) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

export const translations = {
    id: {
        dashboard: 'Dashboard',
        pockets: 'Kantong',
        history: 'Riwayat',
        settings: 'Pengaturan',
        totalBalance: 'Total Saldo',
        income: 'Pemasukan',
        expense: 'Pengeluaran',
        cashFlow: 'Arus Kas',
        addPocket: 'Buat Kantong',
        noPockets: 'Belum ada kantong. Buat satu sekarang!',
        resetData: 'Reset Data',
        resetDesc: 'Hapus semua data dan mulai dari awal (Danger Zone)',
        importData: 'Import Data (JSON)',
        exportData: 'Export Data (JSON)',
        exportDataDesc: 'Unduh data keuangan Anda dalam format JSON',
        newTransaction: 'Transaksi Baru',
        type: 'Tipe',
        fromPocket: 'Dari Kantong',
        amount: 'Jumlah',
        desc: 'Keterangan',
        recurring: 'Ulangi setiap bulan',
        save: 'Simpan',
        success: 'Berhasil',
        transactionSaved: 'Transaksi Disimpan!',
        confirmReset: 'Yakin hapus semua data?',
        confirmDeletePocket: 'Yakin hapus kantong ini?',
        pocketCreated: 'Kantong berhasil dibuat',
        allocateNow: 'Alokasikan saldo sekarang?'
    },
    en: {
        dashboard: 'Dashboard',
        pockets: 'Pockets',
        history: 'History',
        settings: 'Settings',
        totalBalance: 'Total Balance',
        income: 'Income',
        expense: 'Expense',
        cashFlow: 'Cash Flow',
        addPocket: 'Create Pocket',
        noPockets: 'No pockets yet. Create one now!',
        resetData: 'Reset Data',
        resetDesc: 'Delete all data and start over (Danger Zone)',
        importData: 'Import Data (JSON)',
        exportData: 'Export Data (JSON)',
        exportDataDesc: 'Download your financial data in JSON format',
        newTransaction: 'New Transaction',
        type: 'Type',
        fromPocket: 'From Pocket',
        amount: 'Amount',
        desc: 'Description',
        recurring: 'Repeat monthly',
        save: 'Save',
        success: 'Success',
        transactionSaved: 'Transaction Saved!',
        confirmReset: 'Are you sure to delete all data?',
        confirmDeletePocket: 'Are you sure to delete this pocket?',
        pocketCreated: 'Pocket created successfully',
        allocateNow: 'Allocate funds now?'
    }
};
