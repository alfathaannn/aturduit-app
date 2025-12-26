// ====================================
// MoneyTrack - Personal Finance Dashboard
// Version 2.0
// ====================================

// Data Storage
let transactions = [];
let currentView = 'dashboard';
let currentMonth = new Date();
let selectedTransactionId = null;
let activeFilters = new Set();

// Settings
let settings = {
    darkMode: false
};

// Filter State
let filterState = {
    type: 'all',
    category: 'all',
    month: 'all'
};


// Categories
const CATEGORIES = {
    income: [
        'Gaji',
        'Bonus',
        'Investasi',
        'Freelance',
        'Bisnis',
        'Hadiah',
        'Lainnya'
    ],
    expense: [
        'Makanan & Minuman',
        'Transport',
        'Belanja',
        'Tagihan',
        'Hiburan',
        'Kesehatan',
        'Pendidikan',
        'Olahraga',
        'Investasi',
        'Donasi',
        'Lainnya'
    ]
};

// Nama hari dalam bahasa Indonesia
const DAY_NAMES = {
    'Sunday': 'Minggu',
    'Monday': 'Senin',
    'Tuesday': 'Selasa',
    'Wednesday': 'Rabu',
    'Thursday': 'Kamis',
    'Friday': 'Jumat',
    'Saturday': 'Sabtu'
};

// Fungsi untuk mendapatkan nama hari dari date string
function getDayName(dateString) {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const indonesianDay = DAY_NAMES[dayName] || dayName;
    // Khusus untuk Jumat, tambahkan apostrophe
    return indonesianDay === 'Jumat' ? "Jum'at" : indonesianDay;
}

// Initialize App

document.addEventListener('click', function(e) {
    const filterPanel = document.getElementById('filterPanel');
    const filterToggle = document.getElementById('filterToggle');
    
    // Jika klik di luar panel dan toggle, tutup panel
    if (!filterPanel.contains(e.target) && 
        !filterToggle.contains(e.target) && 
        filterPanel.classList.contains('show')) {
        closeFilterPanel();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        
        // Initialize app
        initializeApp();
    }, 2500);

    setupOutsideClickHandler();
});

function setupOutsideClickHandler() {
    document.addEventListener('click', function(e) {
        const filterPanel = document.getElementById('filterPanel');
        const filterToggle = document.getElementById('filterToggle');
        
        // Jika klik di luar panel dan toggle, dan panel sedang terbuka
        if (filterPanel && 
            !filterPanel.contains(e.target) && 
            !filterToggle.contains(e.target) && 
            filterPanel.classList.contains('show')) {
            closeFilterPanel();
        }
    });
}

function initializeApp() {
    loadSettings();
    loadTransactions();
    setupEventListeners();
    updateDashboard();
    populateMonthFilter();
    populateCategoryFilter();
    setTodayDate();
}

function getCurrentDateTime() {
    return new Date().toISOString();
}

// Fungsi untuk format datetime tampilan
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const options = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('id-ID', options);
}

// Fungsi untuk mengambil tanggal saja dari datetime
function getDateFromDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toISOString().split('T')[0];
}

// Fungsi untuk format tanggal dengan nama hari
function formatDateWithDay(dateString) {
    const date = new Date(dateString);
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
}

// Fungsi untuk format tanggal tanpa hari (untuk kompatibilitas)
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    };
    return date.toLocaleDateString('id-ID', options);
}

// Fungsi untuk format datetime dengan hari dan waktu
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const options = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const formatted = date.toLocaleDateString('id-ID', options);
    // Ubah format hari menjadi singkatan kustom
    return formatted.replace(/^(\w+)/, (match) => {
        const dayMap = {
            'Min': 'Minggu',
            'Sen': 'Senin',
            'Sel': 'Selasa',
            'Rab': 'Rabu',
            'Kam': 'Kamis',
            'Jum': 'Jumat',
            'Sab': 'Sabtu'
        };
        return dayMap[match] || match;
    });
}

// Fungsi untuk format hanya hari dan tanggal
function formatDayDate(dateString) {
    const date = new Date(dateString);
    const dayName = getDayName(dateString);
    const datePart = date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    return `${dayName}, ${datePart}`;
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
    // document.getElementById('filterType').addEventListener('change', filterTransactions);
    // document.getElementById('filterCategory').addEventListener('change', filterTransactions);
    // document.getElementById('filterMonth').addEventListener('change', filterTransactions);
    document.getElementById('filterToggle').addEventListener('click', toggleFilterPanel);
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

    // event listener untuk tombol Terapkan
    document.getElementById('applyFilters').addEventListener('click', function(e) {
        // Tambahkan efek visual
        const btn = e.currentTarget;
        btn.style.transform = 'scale(0.95)';
        btn.style.opacity = '0.8';
        
        // Reset setelah 200ms
        setTimeout(() => {
            btn.style.transform = '';
            btn.style.opacity = '';
        }, 200);
        
        // Jalankan apply filters
        applyFilters();
    });
    
    // Filter Chip Click
    document.addEventListener('click', function(e) {
        if (e.target.closest('.filter-chip')) {
            const chip = e.target.closest('.filter-chip');
            handleFilterChipClick(chip);
        }
        
        // Remove active filter tag
        if (e.target.closest('.active-filter-tag i')) {
            const tag = e.target.closest('.active-filter-tag');
            const filterType = tag.getAttribute('data-filter');
            const filterValue = tag.getAttribute('data-value');
            removeActiveFilter(filterType, filterValue);
        }
    });
    
    // Month Navigation
    document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
    document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
    
    // Settings
    document.getElementById('darkModeToggle').addEventListener('change', toggleDarkMode);
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
// Filter Section Functions
// ====================================

function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const toggle = document.getElementById('filterToggle');
    
    panel.classList.toggle('show');
    toggle.classList.toggle('active');
    
    // Populate filter options jika belum diisi
    if (!document.getElementById('filterCategoryOptions').hasChildNodes()) {
        populateCategoryChips();
        populateMonthChips();
    }
}

function populateCategoryChips() {
    const container = document.getElementById('filterCategoryOptions');
    
    // Reset container, tapi pertahankan "Semua"
    const allChip = container.querySelector('.filter-chip[data-value="all"]');
    container.innerHTML = '';
    if (allChip) {
        container.appendChild(allChip);
    }
    
    // Ambil semua kategori unik dari transaksi
    const categories = new Set();
    transactions.forEach(transaction => {
        categories.add(transaction.category);
    });
    
    const sortedCategories = Array.from(categories).sort();
    
    sortedCategories.forEach(category => {
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.setAttribute('data-filter', 'category');
        chip.setAttribute('data-value', category);
        chip.innerHTML = category;
        container.appendChild(chip);
    });
}

function populateMonthChips() {
    const container = document.getElementById('filterMonthOptions');
    
    // Reset container, tapi pertahankan "Semua Bulan"
    const allChip = container.querySelector('.filter-chip[data-value="all"]');
    container.innerHTML = '';
    if (allChip) {
        container.appendChild(allChip);
    }
    
    // Ambil semua bulan unik dari transaksi
    const months = new Set();
    transactions.forEach(transaction => {
        const monthYear = transaction.date.substring(0, 7); // YYYY-MM
        months.add(monthYear);
    });
    
    const sortedMonths = Array.from(months).sort().reverse();
    
    sortedMonths.forEach(month => {
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.setAttribute('data-filter', 'month');
        chip.setAttribute('data-value', month);
        chip.innerHTML = formatMonthYear(month);
        container.appendChild(chip);
    });
}

function handleFilterChipClick(chip) {
    const filterType = chip.getAttribute('data-filter');
    const filterValue = chip.getAttribute('data-value');
    
    // Reset semua chip dalam group yang sama
    const groupChips = document.querySelectorAll(`.filter-chip[data-filter="${filterType}"]`);
    groupChips.forEach(c => c.classList.remove('active'));
    
    // Aktifkan chip yang diklik
    chip.classList.add('active');
    
    // Update filter state
    filterState[filterType] = filterValue;
}

function updateActiveFiltersDisplay() {
    const container = document.getElementById('activeFilters');
    container.innerHTML = '';
    
    activeFilters.clear();
    
    // Tambahkan filter yang aktif (kecuali "all")
    Object.entries(filterState).forEach(([type, value]) => {
        if (value !== 'all') {
            const filterId = `${type}:${value}`;
            if (!activeFilters.has(filterId)) {
                activeFilters.add(filterId);
                
                let displayText = value;
                let icon = '';
                
                switch(type) {
                    case 'type':
                        displayText = value === 'income' ? 'Pemasukan' : 'Pengeluaran';
                        icon = value === 'income' ? 'fa-arrow-down' : 'fa-arrow-up';
                        break;
                    case 'month':
                        displayText = formatMonthYear(value);
                        icon = 'fa-calendar';
                        break;
                    case 'category':
                        displayText = value;
                        icon = 'fa-tag';
                        break;
                }
                
                const tag = document.createElement('div');
                tag.className = 'active-filter-tag';
                tag.setAttribute('data-filter', type);
                tag.setAttribute('data-value', value);
                tag.innerHTML = `
                    <i class="fas ${icon}"></i>
                    ${displayText}
                    <i class="fas fa-times"></i>
                `;
                container.appendChild(tag);
            }
        }
    });
}

function removeActiveFilter(filterType, filterValue) {
    // Reset chip yang sesuai
    const chip = document.querySelector(`.filter-chip[data-filter="${filterType}"][data-value="${filterValue}"]`);
    if (chip) {
        chip.classList.remove('active');
    }
    
    // Aktifkan chip "all" pada group yang sama
    const allChip = document.querySelector(`.filter-chip[data-filter="${filterType}"][data-value="all"]`);
    if (allChip) {
        allChip.classList.add('active');
    }
    
    // Update filter state
    filterState[filterType] = 'all';
    
    // Update tampilan
    updateActiveFiltersDisplay();
    applyFilters();
}

function clearAllFilters() {
    // Reset semua chip
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    // Aktifkan semua chip "all"
    document.querySelectorAll('.filter-chip[data-value="all"]').forEach(chip => {
        chip.classList.add('active');
    });
    
    // Reset filter state
    filterState = {
        type: 'all',
        category: 'all',
        month: 'all'
    };
    
    // Update tampilan
    updateActiveFiltersDisplay();
    applyFilters();
    
    showNotification('Semua filter telah direset', 'success');
}

function applyFilters() {
    // Tampilkan loading state
    const applyBtn = document.getElementById('applyFilters');
    const originalText = applyBtn.innerHTML;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    applyBtn.disabled = true;
    
    // Update active filters display
    updateActiveFiltersDisplay();
    
    // Tutup filter panel
    closeFilterPanel();
    
    // Beri sedikit delay untuk efek visual
    setTimeout(() => {
        // Filter transactions berdasarkan filterState
        let filtered = transactions.filter(transaction => {
            const typeMatch = filterState.type === 'all' || transaction.type === filterState.type;
            const categoryMatch = filterState.category === 'all' || transaction.category === filterState.category;
            const monthMatch = filterState.month === 'all' || transaction.date.startsWith(filterState.month);
            
            return typeMatch && categoryMatch && monthMatch;
        });
        
        // Sort by datetime descending (newest first)
        filtered.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
        
        displayFilteredTransactions(filtered);
        
        // Update filter count
        updateFilterCount();
        
        // Reset tombol
        applyBtn.innerHTML = originalText;
        applyBtn.disabled = false;
        
        // Tampilkan notifikasi
        const filteredCount = filtered.length;
        const totalCount = transactions.length;
        
        if (filteredCount === 0) {
            showNotification('Tidak ada transaksi yang sesuai dengan filter', 'warning');
        } else if (filteredCount === totalCount) {
            showNotification(`Menampilkan semua ${totalCount} transaksi`, 'success');
        } else {
            showNotification(`Menampilkan ${filteredCount} transaksi`, 'success');
        }
    }, 300);
}

// Tambahkan fungsi untuk menutup filter panel
function closeFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const toggle = document.getElementById('filterToggle');
    
    panel.classList.remove('show');
    toggle.classList.remove('active');
    
    // Tambahkan animasi untuk menutup
    panel.style.maxHeight = '0';
    setTimeout(() => {
        panel.style.maxHeight = '';
    }, 300);
}

// Perbarui fungsi toggleFilterPanel
function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const toggle = document.getElementById('filterToggle');
    
    if (panel.classList.contains('show')) {
        closeFilterPanel();
    } else {
        openFilterPanel();
    }
    
    // Populate filter options jika belum diisi
    if (!document.getElementById('filterCategoryOptions').hasChildNodes() || 
        document.getElementById('filterCategoryOptions').children.length <= 1) {
        populateCategoryChips();
        populateMonthChips();
    }
}

// Tambahkan fungsi untuk membuka filter panel
function openFilterPanel() {
    const panel = document.getElementById('filterPanel');
    const toggle = document.getElementById('filterToggle');
    
    panel.classList.add('show');
    toggle.classList.add('active');
    
    // Atur max-height untuk animasi
    panel.style.maxHeight = '500px';
}

// function updateFilterCount() {
//     const toggle = document.getElementById('filterToggle');
//     const activeCount = Array.from(activeFilters).length;
    
//     let countBadge = toggle.querySelector('.filter-count');
    
//     if (activeCount > 0) {
//         if (!countBadge) {
//             countBadge = document.createElement('span');
//             countBadge.className = 'filter-count';
//             countBadge.style.cssText = `
//                 color: var(--text-primary);
//                 font-size: 12px;
//                 font-weight: 700;
//                 width: 20px;
//                 height: 20px;
//                 border-radius: 50%;
//                 display: flex;
//                 align-items: center;
//                 justify-content: center;
//                 margin-left: 8px;
//             `;
//             toggle.insertBefore(countBadge, toggle.querySelector('.fa-chevron-down'));
//         }
//         countBadge.textContent = activeCount;
//     } else if (countBadge) {
//         countBadge.remove();
//     }
// }

// Update fungsi filterTransactions yang lama untuk menggunakan sistem baru
function filterTransactions() {
    // Gunakan applyFilters() sebagai pengganti
    applyFilters();
}

// ====================================
// View Management
// ====================================

function switchView(viewName) {
    currentView = viewName;
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    document.getElementById(viewName + 'View').classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        }
    });
    
    // Update view-specific content
    if (viewName === 'transactions') {
        filterTransactions();
    } else if (viewName === 'reports') {
        updateMonthlyReport();
    }
}

// ====================================
// Transaction Modal Functions
// ====================================

function openTransactionModal(type) {
    selectedTransactionId = null;
    
    // Set modal title
    const title = type === 'income' ? 'Tambah Pemasukan' : 'Tambah Pengeluaran';
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('transactionType').value = type;
    
    // Populate categories
    populateCategories(type);
    
    // Reset form
    document.getElementById('transactionForm').reset();
    document.getElementById('transactionId').value = '';
    removeUploadedImage();
    setTodayDate();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
    modal.show();
}

function populateCategories(type) {
    const categorySelect = document.getElementById('transactionCategory');
    categorySelect.innerHTML = '<option value="">Pilih Kategori</option>';
    
    const categories = CATEGORIES[type] || [];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const id = selectedTransactionId || generateId();
    const type = document.getElementById('transactionType').value;
    const title = document.getElementById('transactionTitle').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const category = document.getElementById('transactionCategory').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const dateInput = document.getElementById('transactionDate').value;
    const note = document.getElementById('transactionNote').value;
    const receipt = document.getElementById('previewImage').src;
    const dateTime = new Date(dateInput + 'T' + new Date().toTimeString().split(' ')[0]);
    
    const transaction = {
        id,
        type,
        title,
        amount,
        category,
        paymentMethod,
        date: dateInput, // Simpan date untuk filter
        datetime: dateTime.toISOString(), // Simpan datetime lengkap
        note,
        receipt: receipt !== window.location.href ? receipt : null,
        createdAt: selectedTransactionId ? 
            transactions.find(t => t.id === selectedTransactionId).createdAt : 
            getCurrentDateTime(),
        updatedAt: getCurrentDateTime()
    };
    
    if (selectedTransactionId) {
        // Update existing transaction
        const index = transactions.findIndex(t => t.id === selectedTransactionId);
        transactions[index] = transaction;
        showNotification('Transaksi berhasil diupdate', 'success');
    } else {
        // Add new transaction
        transactions.unshift(transaction);
        showNotification('Transaksi berhasil ditambahkan', 'success');
    }
    
    saveTransactions();
    updateDashboard();
    populateMonthFilter();
    populateCategoryFilter();
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('transactionModal')).hide();
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('uploadPlaceholder').style.display = 'none';
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('previewImage').src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function removeUploadedImage() {
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('previewImage').src = '';
    document.getElementById('transactionReceipt').value = '';
}

// ====================================
// Transaction Display Functions
// ====================================

function updateDashboard() {
    let totalIncome = 0;
    let totalExpense = 0;
    let totalCash = 0;
    let totalSaldo = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
            if (transaction.paymentMethod === 'cash') {
                totalCash += transaction.amount;
            } else {
                totalSaldo += transaction.amount;
            }
        } else {
            totalExpense += transaction.amount;
            if (transaction.paymentMethod === 'cash') {
                totalCash -= transaction.amount;
            } else {
                totalSaldo -= transaction.amount;
            }
        }
    });
    
    // Update dashboard values
    document.getElementById('totalSaldo').textContent = formatCurrency(totalSaldo);
    document.getElementById('totalCash').textContent = formatCurrency(totalCash);
    document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
    document.getElementById('totalExpense').textContent = formatCurrency(totalExpense);
    
    // Display recent transactions (last 5, ordered by creation time - oldest at bottom)
    displayRecentTransactions();
}

function displayRecentTransactions() {
    const container = document.getElementById('recentTransactions');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>Belum ada transaksi</p>
                <small>Mulai catat keuangan Anda sekarang</small>
            </div>
        `;
        return;
    }
    
    // Sort by datetime descending (newest first)
    const sorted = [...transactions].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    const recent = sorted.slice(0, 5);
    
    // Group by date and display with separators
    container.innerHTML = createTransactionsWithDateSeparators(recent);
    
    // Add click listeners
    container.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            showTransactionDetail(id);
        });
    });
}

function createTransactionHTML(transaction) {
    const isIncome = transaction.type === 'income';
    const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';
    const colorClass = isIncome ? 'text-success' : 'text-danger';
    const sign = isIncome ? '+' : '-';
    
    return `
        <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-icon ${colorClass}">
                <i class="fas ${icon}"></i>
            </div>
            <div class="transaction-info">
                <div class="transaction-title">${transaction.title}</div>
                <div class="transaction-meta">
                    <span class="transaction-category">${transaction.category}</span>
                    <span class="transaction-time">${formatDateTime(transaction.datetime)}</span>
                </div>
                <div class="transaction-payment-method">
                    <i class="fas ${transaction.paymentMethod === 'cash' ? 'fa-money-bill-wave' : 'fa-wallet'}"></i>
                    ${transaction.paymentMethod === 'cash' ? 'Cash' : 'Saldo'}
                </div>
            </div>
            <div class="transaction-amount ${colorClass}">
                ${sign} ${formatCurrency(transaction.amount)}
            </div>
        </div>
    `;
}

function showTransactionDetail(id) {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    selectedTransactionId = id;
    
    const isIncome = transaction.type === 'income';
    const colorClass = isIncome ? 'text-success' : 'text-danger';
    const sign = isIncome ? '+' : '-';
    
    let detailHTML = '';
    
    if (transaction.receipt) {
        detailHTML += `<img src="${transaction.receipt}" alt="Receipt" class="detail-image">`;
    }
    
    detailHTML += `
        <div class="detail-row">
            <span class="detail-label">Tipe</span>
            <span class="detail-value ${colorClass}">${isIncome ? 'Pemasukan' : 'Pengeluaran'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Judul</span>
            <span class="detail-value">${transaction.title}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Jumlah</span>
            <span class="detail-value ${colorClass}">${sign} ${formatCurrency(transaction.amount)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Kategori</span>
            <span class="detail-value">${transaction.category}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Metode Pembayaran</span>
            <span class="detail-value">
                <i class="fas ${transaction.paymentMethod === 'cash' ? 'fa-money-bill-wave' : 'fa-wallet'}"></i>
                ${transaction.paymentMethod === 'cash' ? 'Cash' : 'Saldo'}
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Tanggal & Waktu</span>
            <span class="detail-value">${formatDayDate(transaction.date)}, ${new Date(transaction.datetime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
    `;
    
    if (transaction.note) {
        detailHTML += `
            <div class="detail-row">
                <span class="detail-label">Catatan</span>
                <span class="detail-value">${transaction.note}</span>
            </div>
        `;
    }
    
    document.getElementById('detailContent').innerHTML = detailHTML;
    
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    modal.show();
}

function editTransaction() {
    const transaction = transactions.find(t => t.id === selectedTransactionId);
    if (!transaction) return;
    
    // Close detail modal
    bootstrap.Modal.getInstance(document.getElementById('detailModal')).hide();
    
    // Open transaction modal with data
    document.getElementById('modalTitle').textContent = transaction.type === 'income' ? 'Edit Pemasukan' : 'Edit Pengeluaran';
    document.getElementById('transactionId').value = transaction.id;
    document.getElementById('transactionType').value = transaction.type;
    document.getElementById('transactionTitle').value = transaction.title;
    document.getElementById('transactionAmount').value = transaction.amount;
    
    // Populate and select category
    populateCategories(transaction.type);
    document.getElementById('transactionCategory').value = transaction.category;
    
    document.querySelector(`input[name="paymentMethod"][value="${transaction.paymentMethod}"]`).checked = true;
    document.getElementById('transactionDate').value = transaction.date;
    document.getElementById('transactionNote').value = transaction.note || '';
    
    if (transaction.receipt) {
        document.getElementById('uploadPlaceholder').style.display = 'none';
        document.getElementById('uploadPreview').style.display = 'block';
        document.getElementById('previewImage').src = transaction.receipt;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('transactionModal'));
    modal.show();
}

function deleteTransaction() {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    
    transactions = transactions.filter(t => t.id !== selectedTransactionId);
    saveTransactions();
    updateDashboard();
    populateMonthFilter();
    populateCategoryFilter();
    
    bootstrap.Modal.getInstance(document.getElementById('detailModal')).hide();
    showNotification('Transaksi berhasil dihapus', 'success');
}

// ====================================
// Filter Functions
// ====================================

function populateMonthFilter() {
    // Fungsi ini masih diperlukan untuk filter dropdown lama
    const monthFilter = document.getElementById('filterMonth');
    const months = new Set();
    
    transactions.forEach(transaction => {
        const monthYear = transaction.date.substring(0, 7);
        months.add(monthYear);
    });
    
    const sortedMonths = Array.from(months).sort().reverse();
    
    let html = '<option value="all">Semua Bulan</option>';
    sortedMonths.forEach(month => {
        html += `<option value="${month}">${formatMonthYear(month)}</option>`;
    });
    
    monthFilter.innerHTML = html;
    
    // Juga update filter chips
    populateMonthChips();
}

function populateCategoryFilter() {
    // Fungsi ini masih diperlukan untuk filter dropdown lama
    const categoryFilter = document.getElementById('filterCategory');
    const categories = new Set();
    
    transactions.forEach(transaction => {
        categories.add(transaction.category);
    });
    
    const sortedCategories = Array.from(categories).sort();
    
    let html = '<option value="all">Semua Kategori</option>';
    sortedCategories.forEach(category => {
        html += `<option value="${category}">${category}</option>`;
    });
    
    categoryFilter.innerHTML = html;
    
    // Juga update filter chips
    populateCategoryChips();
}

function filterTransactions() {
    const typeFilter = document.getElementById('filterType').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    const monthFilter = document.getElementById('filterMonth').value;
    
    let filtered = transactions.filter(transaction => {
        const typeMatch = typeFilter === 'all' || transaction.type === typeFilter;
        const categoryMatch = categoryFilter === 'all' || transaction.category === categoryFilter;
        const monthMatch = monthFilter === 'all' || transaction.date.startsWith(monthFilter);
        
        return typeMatch && categoryMatch && monthMatch;
    });
    
    // Sort by datetime descending (newest first)
    filtered.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    displayFilteredTransactions(filtered);
}

function displayFilteredTransactions(filtered) {
    const container = document.getElementById('allTransactions');
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <p>Tidak ada transaksi yang sesuai</p>
                <small>Coba ubah filter Anda</small>
            </div>
        `;
        return;
    }
    
    // Group by date and display with separators
    container.innerHTML = createTransactionsWithDateSeparators(filtered);
    
    // Add click listeners
    container.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            showTransactionDetail(id);
        });
    });
}

// ====================================
// Reports Functions
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
    
    // Sort by datetime descending (newest first)
    const sorted = [...monthTransactions].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    
    // Group by date and display with separators
    container.innerHTML = createTransactionsWithDateSeparators(sorted);
    
    // Add click listeners
    container.querySelectorAll('.transaction-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.getAttribute('data-id');
            showTransactionDetail(id);
        });
    });
}

// Fungsi untuk membuat daftar transaksi dengan pembatas tanggal
function createTransactionsWithDateSeparators(transactionsList) {
    let html = '';
    let lastDate = '';
    
    transactionsList.forEach(transaction => {
        const currentDate = transaction.date; // YYYY-MM-DD
        
        // Tambahkan pembatas tanggal jika berbeda dengan tanggal sebelumnya
        if (currentDate !== lastDate) {
            html += `
                <div class="date-separator">
                    ${formatDayDate(currentDate)}
                </div>
            `;
            lastDate = currentDate;
        }
        
        // Tambahkan item transaksi
        const isIncome = transaction.type === 'income';
        const icon = isIncome ? 'fa-arrow-down' : 'fa-arrow-up';
        const colorClass = isIncome ? 'text-success' : 'text-danger';
        const sign = isIncome ? '+' : '-';
        
        html += `
            <div class="transaction-item" data-id="${transaction.id}">
                <div class="transaction-icon ${colorClass}">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="transaction-info">
                    <div class="transaction-title">${transaction.title}</div>
                    <div class="transaction-meta">
                        <span class="transaction-category">${transaction.category}</span>
                        <span class="transaction-time">${formatDateTime(transaction.datetime)}</span>
                    </div>
                    <div class="transaction-payment-method">
                        <i class="fas ${transaction.paymentMethod === 'cash' ? 'fa-money-bill-wave' : 'fa-wallet'}"></i>
                        ${transaction.paymentMethod === 'cash' ? 'Cash' : 'Saldo'}
                    </div>
                </div>
                <div class="transaction-amount ${colorClass}">
                    ${sign} ${formatCurrency(transaction.amount)}
                </div>
            </div>
        `;
    });
    
    return html;
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

function exportData() {
    const data = {
        transactions: transactions,
        settings: settings,
        exportDate: new Date().toISOString(),
        version: '2.0'
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
                populateCategoryFilter();
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
            populateCategoryFilter();
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
    const formatted = date.toLocaleDateString('id-ID', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
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