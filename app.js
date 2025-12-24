// ====================================
// MoneyTrack - Personal Finance Dashboard
// ====================================

// Data Storage
let transactions = [];
let currentView = 'dashboard';
let currentMonth = new Date();
let selectedTransactionId = null;

// Settings
let settings = {
    darkMode: false,
    cloudSync: false
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        
        // Initialize app
        initializeApp();
    }, 2500);
});

function initializeApp() {
    loadSettings();
    loadTransactions();
    setupEventListeners();
    updateDashboard();
    populateMonthFilter();
    setTodayDate();
}

// ====================================
// Local Storage Functions
// ====================================

function loadTransactions() {
    const stored = localStorage.getItem('moneytrack_transactions');
    if (stored) {
        transactions = JSON.parse(stored);
    }
}

function saveTransactions() {
    localStorage.setItem('moneytrack_transactions', JSON.stringify(transactions));
    
    // Auto sync to cloud if enabled
    if (settings.cloudSync) {
        syncToCloud();
    }
}

function loadSettings() {
    const stored = localStorage.getItem('moneytrack_settings');
    if (stored) {
        settings = JSON.parse(stored);
        applySettings();
    }
}

function saveSettings() {
    localStorage.setItem('moneytrack_settings', JSON.stringify(settings));
}

function applySettings() {
    // Apply dark mode
    if (settings.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('darkModeToggle').checked = true;
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('darkModeToggle').checked = false;
    }
    
    // Apply cloud sync
    document.getElementById('cloudSyncToggle').checked = settings.cloudSync;
}

// ====================================
// Cloud Sync Functions (Simulated)
// ====================================

// function syncToCloud() {
//     // Simulate cloud sync with visual feedback
//     const syncBtn = document.getElementById('syncBtn');
//     const icon = syncBtn.querySelector('i');
    
//     icon.classList.add('fa-spin');
    
//     setTimeout(() => {
//         icon.classList.remove('fa-spin');
//         showNotification('Data berhasil disinkronkan ke cloud', 'success');
//     }, 1500);
    
//     // In production, you would integrate with:
//     // - Google Drive API
//     // - Dropbox API
//     // - Firebase
//     // - Your own backend API
// }

// Modify syncToCloud function in app.js
async function syncToCloud() {
    if (!settings.cloudSync) return;

    const syncBtn = document.getElementById('syncBtn');
    const icon = syncBtn.querySelector('i');
    icon.classList.add('fa-spin');

    try {
        // Initialize Google Drive
        if (!driveSync.gapiReady) {
            await driveSync.init();
        }

        // Sign in if needed
        if (!driveSync.isSignedIn) {
            await driveSync.signIn();
        }

        // Upload data
        const data = {
            transactions: transactions,
            settings: settings,
            syncDate: new Date().toISOString()
        };
        
        await driveSync.uploadData(data);
        
        icon.classList.remove('fa-spin');
        showNotification('Data berhasil disinkronkan ke Google Drive', 'success');
    } catch (error) {
        icon.classList.remove('fa-spin');
        showNotification('Gagal sinkronisasi: ' + error.message, 'error');
        console.error('Sync error:', error);
    }
}

// Add restore from cloud function
async function restoreFromCloud() {
    try {
        if (!driveSync.gapiReady) {
            await driveSync.init();
        }

        if (!driveSync.isSignedIn) {
            await driveSync.signIn();
        }

        const data = await driveSync.downloadData();
        
        if (data) {
            transactions = data.transactions || [];
            settings = data.settings || settings;
            saveTransactions();
            saveSettings();
            applySettings();
            updateDashboard();
            showNotification('Data berhasil direstore dari Google Drive', 'success');
        } else {
            showNotification('Tidak ada backup ditemukan', 'warning');
        }
    } catch (error) {
        showNotification('Gagal restore: ' + error.message, 'error');
        console.error('Restore error:', error);
    }
}

function manualSync() {
    if (!settings.cloudSync) {
        showNotification('Aktifkan sinkronisasi cloud di pengaturan', 'warning');
        return;
    }
    
    syncToCloud();
}

// ====================================
// Event Listeners
// ====================================

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.currentTarget.getAttribute('data-view');
            switchView(view);
        });
    });
    
    // Quick Actions
    document.getElementById('addIncomeBtn').addEventListener('click', () => openTransactionModal('income'));
    document.getElementById('addExpenseBtn').addEventListener('click', () => openTransactionModal('expense'));
    
    // View Navigation
    document.getElementById('viewAllBtn').addEventListener('click', () => switchView('transactions'));
    document.getElementById('backToHome').addEventListener('click', () => switchView('dashboard'));
    document.getElementById('backFromReports').addEventListener('click', () => switchView('dashboard'));
    document.getElementById('backFromSettings').addEventListener('click', () => switchView('dashboard'));
    
    // Transaction Form
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
    
    // File Upload
    document.getElementById('fileUploadArea').addEventListener('click', () => {
        document.getElementById('transactionReceipt').click();
    });
    
    document.getElementById('transactionReceipt').addEventListener('change', handleFileUpload);
    document.getElementById('removeImage').addEventListener('click', (e) => {
        e.stopPropagation();
        removeUploadedImage();
    });
    
    // Filters
    document.getElementById('filterType').addEventListener('change', filterTransactions);
    document.getElementById('filterMonth').addEventListener('change', filterTransactions);
    
    // Month Navigation
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    
    // Settings
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
    document.getElementById('cloudSyncToggle').addEventListener('change', toggleCloudSync);
    document.getElementById('syncBtn').addEventListener('click', manualSync);
    document.getElementById('settingsBtn').addEventListener('click', () => switchView('settings'));
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('importDataBtn').addEventListener('click', () => {
        document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', importData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    
    // Detail Modal Actions
    document.getElementById('editDetailBtn').addEventListener('click', editTransaction);
    document.getElementById('deleteDetailBtn').addEventListener('click', deleteTransaction);
}

// ====================================
// View Management
// ====================================

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected view
    const viewMap = {
        'dashboard': 'dashboardView',
        'transactions': 'transactionsView',
        'reports': 'reportsView',
        'settings': 'settingsView'
    };
    
    document.getElementById(viewMap[viewName]).classList.add('active');
    
    // Set active nav item
    const navItem = document.querySelector(`[data-view="${viewName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }
    
    currentView = viewName;
    
    // Update view-specific content
    if (viewName === 'transactions') {
        displayAllTransactions();
    } else if (viewName === 'reports') {
        updateMonthlyReport();
    }
}

// ====================================
// Dashboard Functions
// ====================================

function updateDashboard() {
    const { totalIncome, totalExpense, balance } = calculateTotals();
    
    // Update balance card
    document.getElementById('totalBalance').textContent = formatCurrency(balance);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);
    
    // Update recent transactions
    displayRecentTransactions();
}

function calculateTotals() {
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });
    
    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
    };
}

function displayRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    const recent = transactions.slice(-5).reverse();
    
    if (recent.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>Belum ada transaksi</p>
                <small>Mulai catat keuangan Anda sekarang</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recent.map(transaction => createTransactionHTML(transaction)).join('');
    
    // Add click listeners
    container.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            showTransactionDetail(id);
        });
    });
}

// ====================================
// Transaction Functions
// ====================================

function openTransactionModal(type) {
    selectedTransactionId = null;
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionId').value = '';
    document.getElementById('transactionType').value = type;
    
    const modalTitle = type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran';
    document.getElementById('modalTitle').textContent = modalTitle;
    
    removeUploadedImage();
    setTodayDate();
    
    const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
    modal.show();
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const formData = {
        id: document.getElementById('transactionId').value || generateId(),
        type: document.getElementById('transactionType').value,
        title: document.getElementById('transactionTitle').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        category: document.getElementById('transactionCategory').value,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,
        date: document.getElementById('transactionDate').value,
        note: document.getElementById('transactionNote').value,
        receipt: document.getElementById('previewImage').src || null,
        timestamp: new Date().toISOString()
    };
    
    // Check if editing or adding new
    const existingIndex = transactions.findIndex(t => t.id === formData.id);
    
    if (existingIndex !== -1) {
        transactions[existingIndex] = formData;
        showNotification('Transaksi berhasil diperbarui', 'success');
    } else {
        transactions.push(formData);
        showNotification('Transaksi berhasil ditambahkan', 'success');
    }
    
    saveTransactions();
    updateDashboard();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('transactionModal'));
    modal.hide();
}

function showTransactionDetail(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    selectedTransactionId = id;
    
    const detailHTML = `
        ${transaction.receipt ? `<img src="${transaction.receipt}" class="detail-image" alt="Bukti Transaksi">` : ''}
        <div class="detail-row">
            <span class="detail-label">Judul</span>
            <span class="detail-value">${transaction.title}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Jenis</span>
            <span class="detail-value ${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                ${transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Jumlah</span>
            <span class="detail-value ${transaction.type === 'income' ? 'text-success' : 'text-danger'}">
                ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Kategori</span>
            <span class="detail-value">${transaction.category}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Metode Pembayaran</span>
            <span class="detail-value">${transaction.paymentMethod === 'cash' ? 'Cash' : 'Saldo'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Tanggal</span>
            <span class="detail-value">${formatDate(transaction.date)}</span>
        </div>
        ${transaction.note ? `
        <div class="detail-row">
            <span class="detail-label">Catatan</span>
            <span class="detail-value">${transaction.note}</span>
        </div>
        ` : ''}
    `;
    
    document.getElementById('detailContent').innerHTML = detailHTML;
    
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}

function editTransaction() {
    if (!selectedTransactionId) return;
    
    const transaction = transactions.find(t => t.id === selectedTransactionId);
    if (!transaction) return;
    
    // Close detail modal
    const detailModal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
    detailModal.hide();
    
    // Open transaction modal with data
    setTimeout(() => {
        document.getElementById('transactionId').value = transaction.id;
        document.getElementById('transactionType').value = transaction.type;
        document.getElementById('transactionTitle').value = transaction.title;
        document.getElementById('transactionAmount').value = transaction.amount;
        document.getElementById('transactionCategory').value = transaction.category;
        document.querySelector(`input[name="paymentMethod"][value="${transaction.paymentMethod}"]`).checked = true;
        document.getElementById('transactionDate').value = transaction.date;
        document.getElementById('transactionNote').value = transaction.note || '';
        
        const modalTitle = transaction.type === 'income' ? 'Edit Pemasukan' : 'Edit Pengeluaran';
        document.getElementById('modalTitle').textContent = modalTitle;
        
        if (transaction.receipt) {
            document.getElementById('previewImage').src = transaction.receipt;
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('uploadPreview').style.display = 'block';
        }
        
        const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
        modal.show();
    }, 300);
}

function deleteTransaction() {
    if (!selectedTransactionId) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
        transactions = transactions.filter(t => t.id !== selectedTransactionId);
        saveTransactions();
        updateDashboard();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('detailModal'));
        modal.hide();
        
        showNotification('Transaksi berhasil dihapus', 'success');
    }
}

function createTransactionHTML(transaction) {
    return `
        <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-icon ${transaction.type}">
                <i class="fas ${transaction.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${transaction.title}</div>
                <div class="transaction-type ${transaction.type}">
                    ${transaction.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}
                </div>
                <div class="transaction-meta">
                    ${transaction.category} • ${formatDate(transaction.date)}
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${formatCurrency(transaction.amount)}
            </div>
        </div>
    `;
}

// ====================================
// File Upload Functions
// ====================================

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showNotification('File harus berupa gambar', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('previewImage').src = event.target.result;
        document.getElementById('uploadPlaceholder').style.display = 'none';
        document.getElementById('uploadPreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

function removeUploadedImage() {
    document.getElementById('transactionReceipt').value = '';
    document.getElementById('previewImage').src = '';
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('uploadPreview').style.display = 'none';
}

// ====================================
// Filter & Display Functions
// ====================================

function displayAllTransactions() {
    filterTransactions();
}

function filterTransactions() {
    const typeFilter = document.getElementById('filterType').value;
    const monthFilter = document.getElementById('filterMonth').value;
    
    let filtered = [...transactions];
    
    // Filter by type
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    // Filter by month
    if (monthFilter !== 'all') {
        filtered = filtered.filter(t => {
            const transactionMonth = t.date.substring(0, 7);
            return transactionMonth === monthFilter;
        });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    displayFilteredTransactions(filtered);
}

function displayFilteredTransactions(filtered) {
    const container = document.getElementById('allTransactions');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <p>Tidak ada transaksi</p>
                <small>Coba ubah filter pencarian</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtered.map(transaction => createTransactionHTML(transaction)).join('');
    
    // Add click listeners
    container.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            showTransactionDetail(id);
        });
    });
}

function populateMonthFilter() {
    const select = document.getElementById('filterMonth');
    const months = new Set();
    
    transactions.forEach(transaction => {
        const month = transaction.date.substring(0, 7);
        months.add(month);
    });
    
    const sortedMonths = Array.from(months).sort().reverse();
    
    sortedMonths.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = formatMonthYear(month);
        select.appendChild(option);
    });
}

// ====================================
// Monthly Report Functions
// ====================================

function updateMonthlyReport() {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const monthKey = `${year}-${month}`;
    
    // Update month display
    document.getElementById('currentMonth').textContent = formatMonthYear(monthKey);
    
    // Filter transactions for current month
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey));
    
    // Calculate totals
    let monthIncome = 0;
    let monthExpense = 0;
    
    monthTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            monthIncome += transaction.amount;
        } else {
            monthExpense += transaction.amount;
        }
    });
    
    const difference = monthIncome - monthExpense;
    
    // Update report cards
    document.getElementById('monthIncome').textContent = formatCurrency(monthIncome);
    document.getElementById('monthExpense').textContent = formatCurrency(monthExpense);
    document.getElementById('monthDifference').textContent = formatCurrency(Math.abs(difference));
    document.getElementById('monthDifference').className = `report-card-value ${difference >= 0 ? 'text-success' : 'text-danger'}`;
    
    // Display month transactions
    displayMonthTransactions(monthTransactions);
}

function displayMonthTransactions(monthTransactions) {
    const container = document.getElementById('monthTransactions');
    
    if (monthTransactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar"></i>
                <p>Tidak ada transaksi bulan ini</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    const sorted = [...monthTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sorted.map(transaction => createTransactionHTML(transaction)).join('');
    
    // Add click listeners
    container.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            showTransactionDetail(id);
        });
    });
}

function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    updateMonthlyReport();
}

// ====================================
// Settings Functions
// ====================================

function toggleDarkMode() {
    settings.darkMode = document.getElementById('darkModeToggle').checked;
    saveSettings();
    applySettings();
    showNotification(settings.darkMode ? 'Mode gelap diaktifkan' : 'Mode terang diaktifkan', 'success');
}

function toggleCloudSync() {
    settings.cloudSync = document.getElementById('cloudSyncToggle').checked;
    saveSettings();
    
    if (settings.cloudSync) {
        showNotification('Sinkronisasi cloud diaktifkan', 'success');
        syncToCloud();
    } else {
        showNotification('Sinkronisasi cloud dinonaktifkan', 'info');
    }
}

function exportData() {
    const data = {
        transactions: transactions,
        settings: settings,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneytrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Data berhasil diexport', 'success');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (!data.transactions || !Array.isArray(data.transactions)) {
                throw new Error('Format file tidak valid');
            }
            
            if (confirm('Import data akan mengganti semua data yang ada. Lanjutkan?')) {
                transactions = data.transactions;
                if (data.settings) {
                    settings = data.settings;
                    saveSettings();
                    applySettings();
                }
                saveTransactions();
                updateDashboard();
                populateMonthFilter();
                showNotification('Data berhasil diimport', 'success');
            }
        } catch (error) {
            showNotification('Error: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
}

function clearAllData() {
    if (confirm('Apakah Anda yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan!')) {
        if (confirm('Konfirmasi sekali lagi. Semua transaksi akan dihapus permanen!')) {
            transactions = [];
            saveTransactions();
            updateDashboard();
            populateMonthFilter();
            showNotification('Semua data berhasil dihapus', 'success');
        }
    }
}

// ====================================
// Utility Functions
// ====================================

function generateId() {
    return 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function formatMonthYear(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
}

function showNotification(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-weight: 600;
        max-width: 300px;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);