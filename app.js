// ===================================
// DATA STRUCTURE & STORAGE
// ===================================
let appData = {
    mainBalance: 0,
    transactions: [],
    pockets: []
};

let vantaEffect = null;
let currentPage = 'dashboard';

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', function() {
    initVanta();
    loadData();
    initTheme();
    initNavigation();
    renderAll();
});

// ===================================
// VANTA.JS BACKGROUND
// ===================================
function initVanta() {
    const isDark = localStorage.getItem('theme') === 'dark';
    
    vantaEffect = VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: isDark ? 0x2E4156 : 0x2E4156,
        backgroundColor: isDark ? 0x0F1419 : 0xF5F7FA,
        points: 8.00,
        maxDistance: 20.00,
        spacing: 15.00
    });
}

function updateVantaTheme(isDark) {
    if (vantaEffect) {
        vantaEffect.destroy();
    }
    initVanta();
}

// ===================================
// THEME MANAGEMENT
// ===================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    updateVantaTheme(newTheme === 'dark');
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle .material-icons-round');
    icon.textContent = theme === 'dark' ? 'dark_mode' : 'light_mode';
}

// ===================================
// NAVIGATION
// ===================================
function initNavigation() {
    // Desktop navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });
    
    // Mobile navigation items
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateToPage(page);
        });
    });
}

function navigateToPage(page) {
    // Update active nav item (desktop)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');
    
    // Update active nav item (mobile)
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.mobile-nav-item[data-page="${page}"]`)?.classList.add('active');
    
    // Update active page
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    document.getElementById(`page-${page}`).classList.add('active');
    
    currentPage = page;
    
    // Refresh content if needed
    if (page === 'statistics') {
        renderStatistics();
    } else if (page === 'transactions') {
        filterTransactions();
    } else if (page === 'pockets') {
        renderPockets();
    }
}

// ===================================
// DATA MANAGEMENT
// ===================================
function loadData() {
    const saved = localStorage.getItem('aturduit_data');
    if (saved) {
        appData = JSON.parse(saved);
    }
}

function saveData() {
    localStorage.setItem('aturduit_data', JSON.stringify(appData));
}

function calculateMainBalance() {
    const totalIncome = appData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalPocketsBalance = appData.pockets
        .reduce((sum, p) => sum + p.balance, 0);
    
    const totalExpenseFromMain = appData.transactions
        .filter(t => t.type === 'expense' && t.source === 'main')
        .reduce((sum, t) => sum + t.amount, 0);
    
    appData.mainBalance = totalIncome - totalPocketsBalance - totalExpenseFromMain;
    return appData.mainBalance;
}

// ===================================
// INCOME MODAL
// ===================================
async function showAddIncomeModal() {
    const { value: formValues } = await Swal.fire({
        title: '<strong>Tambah Pemasukan</strong>',
        html: `
            <div style="text-align: left; padding: 0 20px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">description</span>
                        Deskripsi
                    </label>
                    <input id="income-desc" class="swal2-input" placeholder="Gaji, bonus, dll" style="width: 100%; margin: 0;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">payments</span>
                        Jumlah (Rp)
                    </label>
                    <input id="income-amount" type="number" class="swal2-input" placeholder="0" style="width: 100%; margin: 0;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">event</span>
                        Tanggal
                    </label>
                    <input id="income-date" type="date" class="swal2-input" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; margin: 0;">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        focusConfirm: false,
        preConfirm: () => {
            const description = document.getElementById('income-desc').value;
            const amount = parseFloat(document.getElementById('income-amount').value);
            const date = document.getElementById('income-date').value;
            
            if (!description || !amount || amount <= 0) {
                Swal.showValidationMessage('Mohon isi semua field dengan benar');
                return false;
            }
            
            return { description, amount, date };
        }
    });
    
    if (formValues) {
        addIncome(formValues);
    }
}

function addIncome(data) {
    const transaction = {
        id: Date.now(),
        type: 'income',
        description: data.description,
        amount: data.amount,
        date: data.date,
        timestamp: new Date().toISOString()
    };
    
    appData.transactions.unshift(transaction);
    saveData();
    renderAll();
    
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Pemasukan Rp ${formatCurrency(data.amount)} berhasil ditambahkan`,
        timer: 2000,
        showConfirmButton: false
    });
}

// ===================================
// EXPENSE MODAL
// ===================================
async function showAddExpenseModal() {
    // Get available sources
    const sources = [
        { id: 'main', name: 'Saldo Utama', balance: calculateMainBalance() }
    ];
    
    appData.pockets.forEach(pocket => {
        sources.push({
            id: pocket.id,
            name: pocket.name,
            balance: pocket.balance
        });
    });
    
    const sourceOptions = sources
        .map(s => `<option value="${s.id}">${s.name} (Rp ${formatCurrency(s.balance)})</option>`)
        .join('');
    
    const { value: formValues } = await Swal.fire({
        title: '<strong>Tambah Pengeluaran</strong>',
        html: `
            <div style="text-align: left; padding: 0 20px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">description</span>
                        Deskripsi
                    </label>
                    <input id="expense-desc" class="swal2-input" placeholder="Makan, transport, dll" style="width: 100%; margin: 0;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">payments</span>
                        Jumlah (Rp)
                    </label>
                    <input id="expense-amount" type="number" class="swal2-input" placeholder="0" style="width: 100%; margin: 0;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">account_balance_wallet</span>
                        Sumber Dana
                    </label>
                    <select id="expense-source" class="swal2-select" style="width: 100%; margin: 0;">
                        ${sourceOptions}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">event</span>
                        Tanggal
                    </label>
                    <input id="expense-date" type="date" class="swal2-input" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; margin: 0;">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        focusConfirm: false,
        preConfirm: () => {
            const description = document.getElementById('expense-desc').value;
            const amount = parseFloat(document.getElementById('expense-amount').value);
            const source = document.getElementById('expense-source').value;
            const date = document.getElementById('expense-date').value;
            
            if (!description || !amount || amount <= 0) {
                Swal.showValidationMessage('Mohon isi semua field dengan benar');
                return false;
            }
            
            // Validate balance
            const selectedSource = sources.find(s => s.id === source);
            if (amount > selectedSource.balance) {
                Swal.showValidationMessage(`Saldo ${selectedSource.name} tidak mencukupi`);
                return false;
            }
            
            return { description, amount, source, date };
        }
    });
    
    if (formValues) {
        addExpense(formValues);
    }
}

function addExpense(data) {
    const transaction = {
        id: Date.now(),
        type: 'expense',
        description: data.description,
        amount: data.amount,
        source: data.source,
        date: data.date,
        timestamp: new Date().toISOString()
    };
    
    appData.transactions.unshift(transaction);
    
    // Update pocket balance if source is a pocket
    if (data.source !== 'main') {
        const pocket = appData.pockets.find(p => p.id === data.source);
        if (pocket) {
            pocket.balance -= data.amount;
        }
    }
    
    saveData();
    renderAll();
    
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Pengeluaran Rp ${formatCurrency(data.amount)} berhasil ditambahkan`,
        timer: 2000,
        showConfirmButton: false
    });
}

// ===================================
// POCKET MODAL
// ===================================
async function showAddPocketModal() {
    const availableBalance = calculateMainBalance();
    
    const { value: formValues } = await Swal.fire({
        title: '<strong>Tambah Kantong</strong>',
        html: `
            <div style="text-align: left; padding: 0 20px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">label</span>
                        Nama Kantong
                    </label>
                    <input id="pocket-name" class="swal2-input" placeholder="Makan, Kosan, Tabungan, dll" style="width: 100%; margin: 0;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">emoji_emotions</span>
                        Emoji / Icon
                    </label>
                    <input id="pocket-icon" class="swal2-input" placeholder="🍔 🏠 💰" style="width: 100%; margin: 0;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">payments</span>
                        Alokasi Dana (Rp)
                    </label>
                    <input id="pocket-balance" type="number" class="swal2-input" placeholder="0" style="width: 100%; margin: 0;">
                    <small style="color: var(--text-secondary); font-size: 12px;">Saldo tersedia: Rp ${formatCurrency(availableBalance)}</small>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        <span class="material-icons-round" style="vertical-align: middle; font-size: 18px; margin-right: 4px;">flag</span>
                        Target (Opsional)
                    </label>
                    <input id="pocket-target" type="number" class="swal2-input" placeholder="0" style="width: 100%; margin: 0;">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('pocket-name').value;
            const icon = document.getElementById('pocket-icon').value;
            const balance = parseFloat(document.getElementById('pocket-balance').value) || 0;
            const target = parseFloat(document.getElementById('pocket-target').value) || 0;
            
            if (!name) {
                Swal.showValidationMessage('Nama kantong tidak boleh kosong');
                return false;
            }
            
            if (balance > availableBalance) {
                Swal.showValidationMessage('Saldo tidak mencukupi');
                return false;
            }
            
            return { name, icon: icon || '💼', balance, target };
        }
    });
    
    if (formValues) {
        addPocket(formValues);
    }
}

function addPocket(data) {
    const pocket = {
        id: 'pocket_' + Date.now(),
        name: data.name,
        icon: data.icon,
        balance: data.balance,
        target: data.target,
        createdAt: new Date().toISOString()
    };
    
    appData.pockets.push(pocket);
    saveData();
    renderAll();
    
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: `Kantong "${data.name}" berhasil dibuat`,
        timer: 2000,
        showConfirmButton: false
    });
}

async function editPocket(pocketId) {
    const pocket = appData.pockets.find(p => p.id === pocketId);
    if (!pocket) return;
    
    const availableBalance = calculateMainBalance() + pocket.balance;
    
    const { value: formValues } = await Swal.fire({
        title: '<strong>Edit Kantong</strong>',
        html: `
            <div style="text-align: left; padding: 0 20px;">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        Nama Kantong
                    </label>
                    <input id="pocket-name" class="swal2-input" value="${pocket.name}" style="width: 100%; margin: 0;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        Icon
                    </label>
                    <input id="pocket-icon" class="swal2-input" value="${pocket.icon}" style="width: 100%; margin: 0;">
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        Saldo (Rp)
                    </label>
                    <input id="pocket-balance" type="number" class="swal2-input" value="${pocket.balance}" style="width: 100%; margin: 0;">
                    <small style="color: var(--text-secondary); font-size: 12px;">Saldo tersedia: Rp ${formatCurrency(availableBalance)}</small>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: var(--text-primary);">
                        Target (Opsional)
                    </label>
                    <input id="pocket-target" type="number" class="swal2-input" value="${pocket.target || 0}" style="width: 100%; margin: 0;">
                </div>
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        focusConfirm: false,
        preConfirm: () => {
            const name = document.getElementById('pocket-name').value;
            const icon = document.getElementById('pocket-icon').value;
            const balance = parseFloat(document.getElementById('pocket-balance').value) || 0;
            const target = parseFloat(document.getElementById('pocket-target').value) || 0;
            
            if (!name) {
                Swal.showValidationMessage('Nama kantong tidak boleh kosong');
                return false;
            }
            
            if (balance > availableBalance) {
                Swal.showValidationMessage('Saldo tidak mencukupi');
                return false;
            }
            
            return { name, icon, balance, target };
        }
    });
    
    if (formValues) {
        pocket.name = formValues.name;
        pocket.icon = formValues.icon;
        pocket.balance = formValues.balance;
        pocket.target = formValues.target;
        
        saveData();
        renderAll();
        
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Kantong berhasil diperbarui',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

async function deletePocket(pocketId) {
    const pocket = appData.pockets.find(p => p.id === pocketId);
    if (!pocket) return;
    
    const result = await Swal.fire({
        title: 'Hapus Kantong?',
        text: `Dana di kantong "${pocket.name}" akan dikembalikan ke saldo utama`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#EF4444'
    });
    
    if (result.isConfirmed) {
        appData.pockets = appData.pockets.filter(p => p.id !== pocketId);
        saveData();
        renderAll();
        
        Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Kantong berhasil dihapus',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// ===================================
// SETTINGS MODAL
// ===================================
async function showSettingsModal() {
    const result = await Swal.fire({
        title: '<strong>Pengaturan</strong>',
        html: `
            <div style="display: flex; flex-direction: column; gap: 12px; padding: 0 20px;">
                <button onclick="exportData()" class="swal2-confirm swal2-styled" style="margin: 0;">
                    <span class="material-icons-round" style="vertical-align: middle; margin-right: 8px;">download</span>
                    Ekspor Data
                </button>
                <button onclick="importData()" class="swal2-confirm swal2-styled" style="margin: 0; background: #10B981;">
                    <span class="material-icons-round" style="vertical-align: middle; margin-right: 8px;">upload</span>
                    Impor Data
                </button>
                <button onclick="resetData()" class="swal2-confirm swal2-styled" style="margin: 0; background: #EF4444;">
                    <span class="material-icons-round" style="vertical-align: middle; margin-right: 8px;">delete_forever</span>
                    Reset Data
                </button>
            </div>
        `,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'Tutup'
    });
}

function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aturduit-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data berhasil diekspor',
        timer: 2000,
        showConfirmButton: false
    });
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                
                if (!imported.transactions || !imported.pockets) {
                    throw new Error('Invalid data format');
                }
                
                const result = await Swal.fire({
                    title: 'Konfirmasi Impor',
                    text: 'Data yang ada akan diganti. Lanjutkan?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ya, Impor',
                    cancelButtonText: 'Batal'
                });
                
                if (result.isConfirmed) {
                    appData = imported;
                    saveData();
                    renderAll();
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Data berhasil diimpor',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'File tidak valid'
                });
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

async function resetData() {
    const result = await Swal.fire({
        title: 'Reset Semua Data?',
        text: 'Semua data akan dihapus permanen!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Reset',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#EF4444'
    });
    
    if (result.isConfirmed) {
        appData = {
            mainBalance: 0,
            transactions: [],
            pockets: []
        };
        saveData();
        renderAll();
        
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Semua data telah direset',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// ===================================
// DELETE TRANSACTION
// ===================================
async function deleteTransaction(transactionId) {
    const result = await Swal.fire({
        title: 'Hapus Transaksi?',
        text: 'Transaksi akan dihapus permanen',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#EF4444'
    });
    
    if (result.isConfirmed) {
        const transaction = appData.transactions.find(t => t.id === transactionId);
        
        // If it's an expense from a pocket, return the money to the pocket
        if (transaction && transaction.type === 'expense' && transaction.source !== 'main') {
            const pocket = appData.pockets.find(p => p.id === transaction.source);
            if (pocket) {
                pocket.balance += transaction.amount;
            }
        }
        
        appData.transactions = appData.transactions.filter(t => t.id !== transactionId);
        saveData();
        renderAll();
        
        Swal.fire({
            icon: 'success',
            title: 'Terhapus!',
            text: 'Transaksi berhasil dihapus',
            timer: 2000,
            showConfirmButton: false
        });
    }
}

// ===================================
// RENDER FUNCTIONS
// ===================================
function renderAll() {
    renderDashboard();
    renderPockets();
    renderTransactions();
    renderStatistics();
}

function renderDashboard() {
    const mainBalance = calculateMainBalance();
    const totalIncome = appData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = appData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    document.getElementById('mainBalance').textContent = 'Rp ' + formatCurrency(mainBalance);
    document.getElementById('totalIncome').textContent = 'Rp ' + formatCurrency(totalIncome);
    document.getElementById('totalExpense').textContent = 'Rp ' + formatCurrency(totalExpense);
    
    // Recent transactions
    const recentList = document.getElementById('recentTransactionsList');
    const recent = appData.transactions.slice(0, 5);
    
    if (recent.length === 0) {
        recentList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3 class="empty-title">Belum Ada Transaksi</h3>
                <p class="empty-description">Mulai catat pemasukan dan pengeluaran Anda</p>
            </div>
        `;
    } else {
        recentList.innerHTML = recent.map(t => createTransactionHTML(t)).join('');
    }
}

function renderTransactions() {
    filterTransactions();
}

function filterTransactions() {
    const typeFilter = document.getElementById('filterType')?.value || 'all';
    const periodFilter = document.getElementById('filterPeriod')?.value || 'all';
    
    let filtered = [...appData.transactions];
    
    // Filter by type
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    // Filter by period
    if (periodFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filtered = filtered.filter(t => {
            const transDate = new Date(t.date);
            
            if (periodFilter === 'today') {
                return transDate >= today;
            } else if (periodFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                return transDate >= weekAgo;
            } else if (periodFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                return transDate >= monthAgo;
            }
            return true;
        });
    }
    
    const listElement = document.getElementById('allTransactionsList');
    if (!listElement) return;
    
    if (filtered.length === 0) {
        listElement.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3 class="empty-title">Tidak Ada Transaksi</h3>
                <p class="empty-description">Tidak ada transaksi sesuai filter</p>
            </div>
        `;
    } else {
        listElement.innerHTML = filtered.map(t => createTransactionHTML(t)).join('');
    }
}

function createTransactionHTML(transaction) {
    const isIncome = transaction.type === 'income';
    const icon = isIncome ? 'arrow_upward' : 'arrow_downward';
    const typeClass = isIncome ? 'income' : 'expense';
    const sign = isIncome ? '+' : '-';
    
    let source = '';
    if (!isIncome && transaction.source) {
        if (transaction.source === 'main') {
            source = ' • Saldo Utama';
        } else {
            const pocket = appData.pockets.find(p => p.id === transaction.source);
            source = pocket ? ` • ${pocket.name}` : '';
        }
    }
    
    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
    
    return `
        <div class="transaction-item">
            <div class="transaction-left">
                <div class="transaction-icon ${typeClass}">
                    <span class="material-icons-round">${icon}</span>
                </div>
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">${formattedDate}${source}</div>
                </div>
            </div>
            <div class="transaction-amount ${typeClass}">
                ${sign} Rp ${formatCurrency(transaction.amount)}
            </div>
            <div class="transaction-actions">
                <button onclick="deleteTransaction(${transaction.id})" title="Hapus">
                    <span class="material-icons-round">delete</span>
                </button>
            </div>
        </div>
    `;
}

function renderPockets() {
    const pocketsList = document.getElementById('pocketsList');
    if (!pocketsList) return;
    
    if (appData.pockets.length === 0) {
        pocketsList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-icon">💼</div>
                <h3 class="empty-title">Belum Ada Kantong</h3>
                <p class="empty-description">Buat kantong untuk mengatur alokasi dana Anda</p>
            </div>
        `;
    } else {
        pocketsList.innerHTML = appData.pockets.map(pocket => {
            const progress = pocket.target > 0 ? (pocket.balance / pocket.target) * 100 : 0;
            
            return `
                <div class="pocket-card">
                    <div class="pocket-header">
                        <div class="pocket-icon">${pocket.icon}</div>
                        <div class="pocket-info">
                            <div class="pocket-name">${pocket.name}</div>
                            ${pocket.target > 0 ? `<div class="pocket-target">Target: Rp ${formatCurrency(pocket.target)}</div>` : ''}
                        </div>
                    </div>
                    <div class="pocket-balance">Rp ${formatCurrency(pocket.balance)}</div>
                    ${pocket.target > 0 ? `
                        <div class="pocket-progress">
                            <div class="pocket-progress-bar" style="width: ${Math.min(progress, 100)}%"></div>
                        </div>
                    ` : ''}
                    <div class="pocket-actions">
                        <button class="pocket-btn" onclick="editPocket('${pocket.id}')">
                            <span class="material-icons-round">edit</span>
                            Edit
                        </button>
                        <button class="pocket-btn" onclick="deletePocket('${pocket.id}')">
                            <span class="material-icons-round">delete</span>
                            Hapus
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

function renderStatistics() {
    const mainBalance = calculateMainBalance();
    const totalIncome = appData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = appData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    const pocketsTotal = appData.pockets.reduce((sum, p) => sum + p.balance, 0);
    
    document.getElementById('statTotalIncome').textContent = 'Rp ' + formatCurrency(totalIncome);
    document.getElementById('statTotalExpense').textContent = 'Rp ' + formatCurrency(totalExpense);
    document.getElementById('statPocketsTotal').textContent = 'Rp ' + formatCurrency(pocketsTotal);
    document.getElementById('statMainBalance').textContent = 'Rp ' + formatCurrency(mainBalance);
    
    renderChart();
    renderPocketDistribution();
}

function renderChart() {
    const canvas = document.getElementById('transactionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Get last 7 days data
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayTransactions = appData.transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate >= date && transDate < nextDate;
        });
        
        const income = dayTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = dayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        last7Days.push({ date, income, expense });
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Chart settings
    const padding = 50;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = (chartWidth / 7 / 2) - 8;
    
    const maxValue = Math.max(
        ...last7Days.map(d => Math.max(d.income, d.expense)),
        100000
    );
    
    // Get theme colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#374151' : '#E5E7EB';
    const textColor = isDark ? '#9CA3AF' : '#6B7280';
    
    // Draw grid
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
        
        // Y-axis labels
        ctx.fillStyle = textColor;
        ctx.font = '12px Google Sans';
        ctx.textAlign = 'right';
        const value = maxValue - (maxValue / 4) * i;
        ctx.fillText(formatCurrency(value).substring(0, 6) + 'K', padding - 10, y + 4);
    }
    
    // Draw bars
    last7Days.forEach((day, index) => {
        const x = padding + (chartWidth / 7) * index + 12;
        
        // Income bar
        const incomeHeight = (day.income / maxValue) * chartHeight;
        const incomeY = padding + chartHeight - incomeHeight;
        
        const incomeGradient = ctx.createLinearGradient(0, incomeY, 0, incomeY + incomeHeight);
        incomeGradient.addColorStop(0, '#10B981');
        incomeGradient.addColorStop(1, '#059669');
        
        ctx.fillStyle = incomeGradient;
        ctx.fillRect(x, incomeY, barWidth, incomeHeight);
        
        // Expense bar
        const expenseHeight = (day.expense / maxValue) * chartHeight;
        const expenseY = padding + chartHeight - expenseHeight;
        
        const expenseGradient = ctx.createLinearGradient(0, expenseY, 0, expenseY + expenseHeight);
        expenseGradient.addColorStop(0, '#EF4444');
        expenseGradient.addColorStop(1, '#DC2626');
        
        ctx.fillStyle = expenseGradient;
        ctx.fillRect(x + barWidth + 6, expenseY, barWidth, expenseHeight);
        
        // Date labels
        ctx.fillStyle = textColor;
        ctx.font = '11px Google Sans';
        ctx.textAlign = 'center';
        const dateLabel = day.date.getDate() + '/' + (day.date.getMonth() + 1);
        ctx.fillText(dateLabel, x + barWidth, canvas.height - padding + 20);
    });
    
    // Legend
    const legendY = 15;
    ctx.fillStyle = '#10B981';
    ctx.fillRect(padding, legendY, 15, 15);
    ctx.fillStyle = textColor;
    ctx.font = '13px Google Sans';
    ctx.textAlign = 'left';
    ctx.fillText('Pemasukan', padding + 20, legendY + 12);
    
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(padding + 120, legendY, 15, 15);
    ctx.fillStyle = textColor;
    ctx.fillText('Pengeluaran', padding + 140, legendY + 12);
}

function renderPocketDistribution() {
    const container = document.getElementById('pocketDistribution');
    if (!container) return;
    
    if (appData.pockets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3 class="empty-title">Belum Ada Kantong</h3>
            </div>
        `;
        return;
    }
    
    const total = appData.pockets.reduce((sum, p) => sum + p.balance, 0);
    const colors = ['#2E4156', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899'];
    
    container.innerHTML = appData.pockets.map((pocket, index) => {
        const percentage = total > 0 ? (pocket.balance / total) * 100 : 0;
        const color = colors[index % colors.length];
        
        return `
            <div class="distribution-item">
                <div class="distribution-color" style="background: ${color};"></div>
                <div class="distribution-info">
                    <div class="distribution-name">${pocket.icon} ${pocket.name}</div>
                    <div class="distribution-bar">
                        <div class="distribution-fill" style="width: ${percentage}%; background: ${color};"></div>
                    </div>
                </div>
                <div class="distribution-amount">Rp ${formatCurrency(pocket.balance)}</div>
            </div>
        `;
    }).join('');
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function formatCurrency(amount) {
    return Math.abs(amount).toLocaleString('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}