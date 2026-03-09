/**
 * Aturduit - Utility Functions
 */

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getLocalStorageSize = () => {
  let totalBytes = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalBytes += (localStorage[key].length + key.length) * 2;
    }
  }
  // Return in KB
  return (totalBytes / 1024).toFixed(2);
};

export const downloadJSON = (data, filename) => {
  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const getTranslation = (lang, key) => {
  return translations[lang]?.[key] || key;
};

export const translations = {
  id: {
    // Build & Meta
    appTitle: "Aturduit App",
    appDesc:
      "Aplikasi manajemen keuangan pribadi untuk membantu mengelola pengeluaran, pemasukan, dan tujuan finansial dengan mudah dan efisien.",
    copyright: "© 2026 by alfathaannn",

    // Navigation
    dashboard: "Dashboard",
    pockets: "Kantong",
    history: "Riwayat",
    settings: "Pengaturan",

    // Dashboard
    totalBalance: "Total Saldo",
    income: "Pemasukan",
    expense: "Pengeluaran",
    mainBalance: "Saldo Utama",
    pocketsTotal: "Total Kantong",
    cashFlow: "Arus Kas",
    currentDate: "Hari Ini", // Fallback

    // Pockets
    addPocket: "Buat Kantong",
    noPockets: "Belum ada kantong dibuat.",
    pocketName: "Nama Kantong",
    initialBalance: "Saldo Awal",
    createNow: "Buat Sekarang",
    fillBalance: "Isi Saldo",
    editPocket: "Edit Kantong",
    delete: "Hapus",
    pocketDetail: "Kantong Detail",

    // History & Filters
    all: "Semua",
    transfer: "Transfer",
    pickDate: "Pilih Tanggal",
    today: "Hari Ini",
    resetFilter: "Reset Filter",
    noTransactions: "Belum ada transaksi",
    startTracking: "Mulai catat keuanganmu sekarang!",

    // Settings
    backupTitle: "Backup Data",
    backupDesc:
      "Unduh seluruh data keuangan Anda dalam format JSON untuk keperluan cadangan atau pemindahan perangkat.",
    backupSuccessTitle: "Backup Selesai",
    backupSuccessDesc:
      "File backup telah disimpan. Simpan file ini di tempat yang aman.",

    restoreTitle: "Pulihkan Data",
    restoreDesc:
      "Kembalikan data keuangan Anda dari file cadangan JSON yang valid. Tindakan ini akan menggabungkan data.",
    restoreSuccessTitle: "Pemulihan Berhasil",
    restoreSuccessDesc: "Data keuangan Anda telah berhasil dipulihkan.",

    resetTitle: "Reset Aplikasi",
    resetDesc:
      "Hapus seluruh data transaksi, kantong, dan pengaturan secara permanen. Tindakan ini tidak dapat dikembalikan.",
    resetSuccessTitle: "Berhasil Direset",
    resetSuccessDesc: "Aplikasi telah kembali ke pengaturan awal.",

    storageUsage: "Kapasitas Penyimpanan Lokal",
    storageWarning:
      "Penyimpanan hampir penuh! Lakukan backup atau hapus transaksi lama.",
    storageMax: "~5 MB maksimal",
    usedFormat: " KB terpakai",

    pocketRefundDesc: "Saldo akan dikembalikan ke Saldo Utama.",
    pocketCreated: "Kantong Dibuat!",

    // Modals & Forms
    newTransaction: "Transaksi Baru",
    type: "Tipe",
    amount: "Jumlah",
    desc: "Keterangan",
    descPlaceholder: "Makan siang, Gaji, dll",
    fromPocket: "Dari Kantong",
    recurring: "Ulangi setiap bulan",
    save: "Simpan",
    cancel: "Batal",
    examplePocket: "Contoh: Liburan",

    // Chart
    chartIncome: "Pemasukan",
    chartExpense: "Pengeluaran",

    // Export/Import
    exportReport: "Export Laporan",
    startDate: "Dari Tanggal",
    endDate: "Sampai Tanggal",
    downloadPDF: "Download PDF",

    // Allocate
    transferBalance: "Transfer Saldo",
    target: "Target",
    allocationAmount: "Jumlah Alokasi",

    // SweetAlerts & Notifications
    success: "Berhasil",
    error: "Error",
    transactionSuccess: "Transaksi Berhasil!",
    allocationSuccess: "Alokasi Berhasil!",
    editPocketTitle: "Edit Kantong",
    deletePocketTitle: "Hapus Kantong?",
    deleteAndRefund: "Hapus & Refund",
    pocketDeleted: "Kantong dihapus & saldo dikembalikan",
    resetConfirm: "Ya, Hapus Semuanya",
    restoreConfirm: "Pilih File",
    backupConfirm: "Ya, Download Backup",
    successTitle: "Berhasil",
    errorTitle: "Gagal",
    warning: "Peringatan",
    info: "Info",

    // Validation & PDF
    val_dateRange: "Harap pilih rentang tanggal",
    val_dateInvalid: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
    noTransactionsRange: "Tidak ada transaksi pada rentang tanggal tersebut",
    pdfSuccess: "PDF Berhasil Digenerate!",
    pdfFailed: "Gagal membuat PDF: ",
    balanceMoved: "Saldo berhasil dipindahkan!",

    transSuccess: "Transaksi Berhasil!",
    pocketCreated: "Kantong berhasil dibuat",
    pocketRenamed: "Nama Kantong Diubah!",
    pocketDeleted: "Kantong dihapus & saldo dikembalikan",
    balanceMoved: "Saldo berhasil dipindahkan!",
    dataReset: "Data berhasil di-reset",
    dataImported: "Data Imported",
    dataExported: "Data Exported!",

    // SWAL Dialogs
    swalResetTitle: "Reset Aplikasi?",
    swalResetText:
      "Tindakan ini akan menghapus seluruh data transaksi, kantong, dan preferensi Anda secara permanen. Data yang hilang tidak dapat dikembalikan.",
    swalResetConfirm: "Ya, Hapus Semuanya",

    swalResetSuccessTitle: "Berhasil Direset",
    swalResetSuccessText: "Aplikasi telah kembali ke pengaturan awal.",

    swalRestoreTitle: "Pulihkan Data?",
    swalRestoreText:
      "Data saat ini akan digabungkan atau ditimpa dengan data dari file backup. Pastikan file backup valid.",
    swalRestoreConfirm: "Pilih File",

    swalRestoreSuccessTitle: "Pemulihan Berhasil",
    swalRestoreSuccessText: "Data keuangan Anda telah berhasil dipulihkan.",

    swalBackupTitle: "Backup Data?",
    swalBackupText:
      "Simpan salinan data keuangan Anda ke penyimpanan lokal perangkat ini.",
    swalBackupConfirm: "Ya, Download Backup",

    swalBackupSuccessTitle: "Backup Selesai",
    swalBackupSuccessText:
      "File backup telah disimpan. Simpan file ini di tempat yang aman.",

    swalDeletePocketTitle: "Hapus Kantong?",
    swalDeletePocketText: "Saldo akan dikembalikan ke Saldo Utama.",
    swalDeletePocketConfirm: "Hapus & Refund",

    swalRenameTitle: "Ubah Nama Kantong",
    swalRenameConfirm: "Simpan",

    // Validation
    val_noPocket: "Wajib pilih kantong!",
    val_insufficient: "Saldo tidak cukup!",
    val_dateRange: "Harap pilih rentang tanggal",
    val_dateInvalid: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
    val_jsonInvalid: "Format JSON tidak valid",

    // Transaction Details
    detailTransaction: "Detail Transaksi",
    time: "Waktu",
    sourceFund: "Sumber Dana",
    // PDF Report
    reportTitle: "Laporan Keuangan",
    reportSubtitle: "Laporan Pemasukan & Pengeluaran",
    period: "Periode",
    generatedOn: "Dibuat pada",
    summary: "Ringkasan",
    totalIncome: "Total Pemasukan",
    totalExpense: "Total Pengeluaran",
    netFlow: "Selisih (Net)",
    deletedPocket: "Kantong Terhapus",
    tableDate: "Tanggal",
    tableType: "Tipe",
    tableSource: "Sumber/Wallet",
    tableDesc: "Keterangan",
    tableAmount: "Jumlah",
    page: "Halaman",
    of: "dari",
  },
  en: {
    // Build & Meta
    appTitle: "Aturduit App",
    appDesc:
      "Personal financial management app to help manage expenses, income, and financial goals easily and efficiently.",
    copyright: "© 2026 by alfathaannn",

    // Navigation
    dashboard: "Dashboard",
    pockets: "Pockets",
    history: "History",
    settings: "Settings",

    // Dashboard
    totalBalance: "Total Balance",
    income: "Income",
    expense: "Expense",
    mainBalance: "Main Balance",
    pocketsTotal: "Total Pockets",
    cashFlow: "Cash Flow",
    currentDate: "Today",

    // Pockets
    addPocket: "Create Pocket",
    noPockets: "No pockets yet.",
    pocketName: "Pocket Name",
    initialBalance: "Initial Balance",
    createNow: "Create Now",
    fillBalance: "Top Up",
    editPocket: "Edit Pocket",
    delete: "Delete",
    pocketDetail: "Pocket Details",

    // History & Filters
    all: "All",
    transfer: "Transfer",
    pickDate: "Pick Date",
    today: "Today",
    resetFilter: "Reset Filter",
    noTransactions: "No transactions yet",
    startTracking: "Start tracking your finance now!",

    // Settings
    backupTitle: "Backup Data",
    backupDesc:
      "Download all your financial data in JSON format for backup or device migration.",
    restoreTitle: "Restore Data",
    restoreDesc:
      "Restore your financial data from a valid JSON backup file. This will merge the data.",
    resetDescCard:
      "Permanently delete all transaction data, pockets, and settings. This action cannot be undone.",

    storageUsage: "Local Storage Capacity",
    storageWarning:
      "Storage is almost full! Please backup or delete old transactions.",
    storageMax: "~5 MB max",
    usedFormat: " KB used",

    // Modals & Forms
    newTransaction: "New Transaction",
    type: "Type",
    amount: "Amount",
    desc: "Description",
    descPlaceholder: "Lunch, Salary, etc",
    fromPocket: "From Pocket",
    recurring: "Repeat monthly",
    save: "Save",
    cancel: "Cancel",
    examplePocket: "Ex: Holiday",

    // Chart
    chartIncome: "Income",
    chartExpense: "Expense",

    // Export/Import
    exportReport: "Export Report",
    startDate: "Start Date",
    endDate: "End Date",
    downloadPDF: "Download PDF",

    // Allocate
    transferBalance: "Transfer Balance",
    target: "Target",
    allocationAmount: "Allocation Amount",

    // Alerts & Notifications
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",

    transactionSuccess: "Transaction Successful!",
    allocationSuccess: "Allocation Successful!",
    editPocketTitle: "Edit Pocket Name",
    deletePocketTitle: "Delete Pocket?",
    deleteAndRefund: "Delete & Refund",
    pocketDeleted: "Pocket deleted & balance refunded",
    resetConfirm: "Yes, Delete All",
    restoreConfirm: "Select File",
    backupConfirm: "Yes, Download Backup",
    target: "Target",
    successTitle: "Success",
    errorTitle: "Error",
    pocketCreated: "Pocket Created!",

    // Detailed Descriptions
    resetTitle: "Reset App?",
    resetDesc:
      "This action will permanently delete all your transactions, pockets, and preferences. Lost data cannot be recovered.",
    resetSuccessTitle: "Reset Successful",
    resetSuccessDesc: "App has been reset to initial settings.",

    restoreTitle: "Restore Data?",
    restoreDesc:
      "Current data will be merged or overwritten with data from backup file. Ensure backup file is valid.",
    restoreSuccessTitle: "Restore Successful",
    restoreSuccessDesc: "Your financial data has been successfully restored.",

    backupTitle: "Backup Data?",
    backupDesc:
      "Save a copy of your financial data to this device's local storage.",
    backupSuccessTitle: "Backup Complete",
    backupSuccessDesc: "Backup file saved. Keep this file safe.",

    pocketRefundDesc: "Balance will be refunded to Main Balance.",

    // Validation
    val_noPocket: "Must select a pocket!",
    val_insufficient: "Insufficient balance!",
    val_dateRange: "Please select date range",
    val_dateInvalid: "Start date cannot be later than end date",
    val_jsonInvalid: "Invalid JSON format",

    // Transaction Details
    detailTransaction: "Transaction Details",
    time: "Time",
    sourceFund: "Source Fund",

    // PDF Report & Helper Notifications
    reportTitle: "Financial Report",
    reportSubtitle: "Income & Expense Report",
    period: "Period",
    generatedOn: "Generated on",
    summary: "Summary",
    totalIncome: "Total Income",
    totalExpense: "Total Expense",
    netFlow: "Net Flow",
    deletedPocket: "Deleted Pocket",
    tableDate: "Date",
    tableType: "Type",
    tableSource: "Source/Wallet",
    tableDesc: "Description",
    tableAmount: "Amount",
    page: "Page",
    of: "of",

    pdfSuccess: "PDF Generated Successfully!",
    pdfFailed: "Failed to generate PDF: ",
    balanceMoved: "Balance moved successfully!",
    noTransactionsRange: "No transactions in date range",
  },
};
