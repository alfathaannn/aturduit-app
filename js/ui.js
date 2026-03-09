/**
 * Aturduit - UI Module
 * Handles rendering and visual Logic
 */
import {
  formatCurrency,
  formatDate,
  translations,
  getTranslation,
} from "./utils.js";

export const ui = {
  elements: {
    totalBalance: document.getElementById("main-balance-display"),
    totalIncome: document.getElementById("income-display"),
    totalExpense: document.getElementById("expense-display"),
    pocketsGrid: document.getElementById("pockets-grid"),
    transactionList: document.getElementById("transaction-list"),
    navItems: document.querySelectorAll(".nav-link"),
    views: document.querySelectorAll(".view-section"),
    dynamicIsland: document.getElementById("dynamic-island"),
    navContent: document.getElementById("nav-content"),
    notificationContent: document.getElementById("notification-content"),
    currentDate: document.getElementById("current-date"), // New Reference

    // Modals
    modalTransaction: document.getElementById("modal-transaction"),
    modalPocketDetails: document.getElementById("modal-pocket-details"),
    modalAddPocket: document.getElementById("modal-add-pocket"), // New
    modalAllocate: document.getElementById("modal-allocate"), // New
    pocketSelect: document.getElementById("transaction-pocket-select"),
    modalPocketSelector: document.getElementById("pocket-selector-container"), // Fix: Needed for toggle
    modalExportPdf: document.getElementById("modal-export-pdf"),
  },

  chartInstance: null,

  init() {
    // Initialize Anime.js or other visual setups
    lucide.createIcons();
    this.startClock();
    this.bindToolbarInteractions();
  },

  startClock() {
    const update = () => {
      const now = new Date();
      const locale = this.currentLang === "id" ? "id-ID" : "en-US";
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Asia/Jakarta",
        timeZoneName: "short",
      };
      if (this.elements.currentDate) {
        this.elements.currentDate.textContent = now
          .toLocaleDateString(locale, options)
          .replace(/\./g, ":");
      }
    };

    update();
    setInterval(update, 1000);
  },

  calcStats(transactions) {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    return { income, expense };
  },

  renderDashboard(state) {
    // Total Balance (Main + Pockets)
    const totalPockets = state.pockets.reduce((acc, p) => acc + p.balance, 0);
    const globalTotal = state.mainBalance + totalPockets;

    updateNumberAnimation(this.elements.totalBalance, globalTotal);

    const stats = this.calcStats(state.transactions);
    updateNumberAnimation(this.elements.totalIncome, stats.income);
    updateNumberAnimation(this.elements.totalExpense, stats.expense);

    this.renderChart(state.transactions);
    this.renderBalanceBreakdown(state);
  },

  renderBalanceBreakdown(state) {
    const pocketsTotal = state.pockets.reduce((acc, p) => acc + p.balance, 0);

    // Update Summaries
    if (document.getElementById("summary-main-balance"))
      document.getElementById("summary-main-balance").textContent =
        formatCurrency(state.mainBalance);
    if (document.getElementById("summary-pockets-total"))
      document.getElementById("summary-pockets-total").textContent =
        formatCurrency(pocketsTotal);

    const list = document.getElementById("pockets-breakdown-list");
    if (!list) return;

    list.innerHTML = "";

    if (state.pockets.length === 0) {
      list.innerHTML = `<p class="text-center text-xs text-gray-400 italic">${getTranslation(this.currentLang, "noPockets")}</p>`;
    } else {
      state.pockets.forEach((p) => {
        const target = p.target || 0;
        const percentage =
          target > 0 ? Math.round((p.balance / target) * 100) : 0;
        const visualPercentage = percentage > 100 ? 100 : percentage;
        const el = document.createElement("div");
        el.className =
          "flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm";
        el.innerHTML = `
                    <div class="flex items-center gap-3 w-1/2">
                        <div class="w-3 h-3 rounded-full bg-${p.color || "blue"}-500 shrink-0"></div>
                        <div class="flex-1 w-full overflow-hidden">
                            <p class="text-sm font-bold text-slate-800 dark:text-white truncate">${p.name}</p>
                            <div class="w-full h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full mt-1 overflow-hidden">
                                <div class="h-full bg-${p.color || "blue"}-500 transition-all duration-500" style="width: ${visualPercentage}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <p class="text-sm font-bold text-slate-800 dark:text-white">${formatCurrency(p.balance)}</p>
                        <p class="text-[10px] text-gray-400">Target: ${target > 0 ? formatCurrency(target) : "Tidak ada"} (${percentage}%)</p>
                    </div>
                `;
        list.appendChild(el);
      });
    }
  },

  renderPockets(pockets) {
    this.elements.pocketsGrid.innerHTML = "";
    if (pockets.length === 0) {
      this.elements.pocketsGrid.innerHTML = `
                <div class="col-span-full text-center py-10 opacity-50">
                    <i data-lucide="wallet" class="mx-auto w-12 h-12 mb-2"></i>
                    <p>${getTranslation(this.currentLang, "noPockets")}</p>
                </div>
            `;
    }

    pockets.forEach((pocket) => {
      const el = document.createElement("div");
      el.setAttribute("data-id", pocket.id);
      el.className = `bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer`;
      const target = pocket.target || 0;
      const targetDisplay =
        target > 0 ? `Target: ${formatCurrency(target)}` : "Tanpa Target";

      el.innerHTML = `
                <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-${pocket.color}-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
                <div class="flex justify-between items-start mb-4">
                    <div class="p-3 bg-${pocket.color}-50 dark:bg-${pocket.color}-900/20 text-${pocket.color}-600 rounded-xl">
                        <i data-lucide="wallet" class="w-6 h-6"></i>
                    </div>
                    <button class="text-gray-400 hover:text-red-500 delete-pocket-btn" data-id="${pocket.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
                <h3 class="font-bold text-lg mb-1">${pocket.name}</h3>
                <p class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-gray-300">
                    ${formatCurrency(pocket.balance)}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${targetDisplay}</p>
            `;
      el.querySelector(".delete-pocket-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        document.dispatchEvent(
          new CustomEvent("delete-pocket", { detail: pocket.id }),
        );
      });
      this.elements.pocketsGrid.appendChild(el);
    });
    lucide.createIcons();
  },

  renderHistory(transactions, pockets) {
    this.elements.transactionList.innerHTML = "";
    const locale = this.currentLang === "id" ? "id-ID" : "en-US";

    if (transactions.length === 0) {
      this.elements.transactionList.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-center opacity-60">
                    <div class="bg-gray-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                        <i data-lucide="receipt" class="w-8 h-8 text-gray-400"></i>
                    </div>
                    <p class="text-gray-500 font-medium">${getTranslation(this.currentLang, "noTransactions")}</p>
                    <p class="text-xs text-gray-400 mt-1">${getTranslation(this.currentLang, "startTracking")}</p>
                </div>
            `;
      lucide.createIcons();
      return;
    }

    let lastDateKey = null;

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const dateKey = date.toDateString();

      if (dateKey !== lastDateKey) {
        const header = document.createElement("div");
        header.className =
          "sticky top-0 z-10 py-2 px-2 mt-4 mb-2 flex items-center justify-between border-b border-gray-100 dark:border-slate-800/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg";
        const dateStr = date.toLocaleDateString(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        header.innerHTML = `
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">${dateStr}</span>
                `;
        this.elements.transactionList.appendChild(header);
        lastDateKey = dateKey;
      }

      const isIncome = t.type === "income" || t.type === "transfer_in";
      let colorClass, icon, sign;

      if (t.type === "income") {
        colorClass = "text-green-600 bg-green-50 dark:bg-green-900/20";
        icon = "arrow-down-left";
        sign = "+";
      } else if (t.type === "expense") {
        colorClass = "text-red-600 bg-red-50 dark:bg-red-900/20";
        icon = "arrow-up-right";
        sign = "-";
      } else if (t.type === "transfer_in") {
        colorClass = "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
        icon = "refresh-ccw";
        sign = "+";
      } else {
        colorClass = "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
        icon = "arrow-right-circle";
        sign = "";
      }

      const pocket = t.pocketId
        ? pockets.find((p) => p.id === t.pocketId)
        : null;
      const pocketBadge = pocket
        ? `<span class="inline-flex items-center text-[10px] font-medium bg-${pocket.color}-50 dark:bg-${pocket.color}-900/30 text-${pocket.color}-700 px-1.5 py-0.5 rounded ml-2">${pocket.name}</span>`
        : "";

      const el = document.createElement("div");
      el.className =
        "group flex items-center justify-between p-3 sm:px-4 sm:py-3.5 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-gray-50 dark:border-slate-800/50 last:border-b-0 rounded-lg";
      el.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="p-2.5 rounded-full ${colorClass.split(" ")[1]} ${colorClass.split(" ")[0]} group-hover:scale-110 transition-transform duration-300">
                        <i data-lucide="${icon}" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 dark:text-gray-200 flex items-center text-sm md:text-base leading-tight mb-1">
                            ${t.description}
                            ${t.recurring ? '<i data-lucide="repeat" class="w-3 h-3 ml-2 text-blue-500" title="Recurring"></i>' : ""}
                        </h4>
                        <div class="flex items-center">
                            <span class="text-xs text-gray-400 font-medium">${new Date(t.date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }).replace(".", ":")}</span>
                            ${pocketBadge}
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-bold ${colorClass.split(" ")[0]} text-sm md:text-base">
                        ${sign} ${formatCurrency(t.amount)}
                    </p>
                </div>
            `;

      el.addEventListener("click", () => {
        let walletInfo = getTranslation(this.currentLang, "mainBalance");
        if (t.type === "expense" && pocket) walletInfo = pocket.name;

        let typeDisplay = t.type.toUpperCase().replace("_", " ");
        if (t.type === "income")
          typeDisplay = getTranslation(this.currentLang, "income");
        if (t.type === "expense")
          typeDisplay = getTranslation(this.currentLang, "expense");
        if (t.type === "transfer_in") typeDisplay = "REFUND";
        if (t.type === "transfer_out") typeDisplay = "ALLOCATION";

        Swal.fire({
          width: "auto",
          showConfirmButton: false,
          background: document.documentElement.classList.contains("dark")
            ? "#1e293b"
            : "#fff",
          html: `
                        <div class="p-2 dark:text-gray-200 text-left">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="text-lg font-bold">${getTranslation(this.currentLang, "detailTransaction")}</h3>
                                <button onclick="Swal.close()" class="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                    <i data-lucide="x" class="w-5 h-5"></i>
                                </button>
                            </div>
                            <div class="flex flex-col items-center mb-6">
                                <div class="p-4 rounded-full ${colorClass.split(" ")[1]} mb-3">
                                    <i data-lucide="${icon}" class="w-8 h-8 ${colorClass.split(" ")[0]}"></i>
                                </div>
                                <h2 class="text-2xl font-bold ${colorClass.split(" ")[0]}">${sign} ${formatCurrency(t.amount)}</h2>
                                <p class="text-gray-500 font-medium mt-1">${typeDisplay}</p>
                            </div>
                            <div class="space-y-4 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-2xl">
                                <div class="flex justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
                                    <span class="text-gray-500 text-sm">${getTranslation(this.currentLang, "desc")}</span>
                                    <span class="font-medium text-right">${t.description}</span>
                                </div>
                                <div class="flex justify-between border-b border-gray-200 dark:border-slate-700 pb-3">
                                    <span class="text-gray-500 text-sm">${getTranslation(this.currentLang, "time")}</span>
                                    <span class="font-medium text-right">${date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, ${date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }).replace(".", ":")}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500 text-sm">${getTranslation(this.currentLang, "sourceFund")}</span>
                                    <div class="flex items-center justify-end gap-2">
                                        <span class="font-medium">${walletInfo}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `,
        });
        lucide.createIcons();
      });

      this.elements.transactionList.appendChild(el);
    });

    lucide.createIcons();
  },

  renderChart(transactions) {
    if (this.chartInstance) this.chartInstance.destroy();
    const ctx = document.getElementById("financeChart").getContext("2d");
    const locale = this.currentLang === "id" ? "id-ID" : "en-US";

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const incomeData = [];
    const expenseData = [];
    const labels = [];

    days.forEach((day) => {
      const dateStr = day.toDateString();
      labels.push(
        day.toLocaleDateString(locale, { day: "2-digit", month: "short" }),
      );

      const dayTrans = transactions.filter(
        (t) => new Date(t.date).toDateString() === dateStr,
      );

      const income = dayTrans
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTrans
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(income);
      expenseData.push(expense);
    });

    this.chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: getTranslation(this.currentLang, "chartIncome"),
            data: incomeData,
            borderColor: "#16a34a",
            backgroundColor: "rgba(22, 163, 74, 0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#16a34a",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#16a34a",
          },
          {
            label: getTranslation(this.currentLang, "chartExpense"),
            data: expenseData,
            borderColor: "#dc2626",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#dc2626",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#dc2626",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: {
              usePointStyle: true,
              font: { family: "'Google Sans', sans-serif", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            titleColor: "#1e293b",
            bodyColor: "#1e293b",
            borderColor: "#e2e8f0",
            borderWidth: 1,
            padding: 10,
            bodyFont: { family: "'Google Sans', sans-serif" },
            titleFont: { family: "'Google Sans', sans-serif", weight: "bold" },
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) label += ": ";
                if (context.parsed.y !== null)
                  label += new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(context.parsed.y);
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: "'Google Sans', sans-serif" } },
          },
          y: {
            beginAtZero: true,
            grid: { borderDash: [5, 5], color: "#e2e8f0" },
            ticks: {
              font: { family: "'Google Sans', sans-serif" },
              callback: function (value) {
                if (value >= 1000000)
                  return "Rp " + (value / 1000000).toFixed(1) + "jt";
                if (value >= 1000)
                  return "Rp " + (value / 1000).toFixed(0) + "rb";
                return value;
              },
            },
          },
        },
      },
    });
  },

  // --- Internationalization ---
  translate(lang) {
    this.currentLang = lang;
    const t = translations[lang];
    if (!t) return;

    // 1. Text Content
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) el.textContent = t[key];
    });

    // 2. Titles (Tooltip)
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const key = el.getAttribute("data-i18n-title");
      if (t[key]) el.title = t[key];
    });

    // 3. Placeholders
    const descInput = document.getElementById("transaction-desc");
    if (descInput)
      descInput.placeholder = t.descPlaceholder || descInput.placeholder;

    const pocketInput = document.getElementById("pocket-name-input");
    if (pocketInput)
      pocketInput.placeholder = t.examplePocket || pocketInput.placeholder;
  },

  // --- Dynamic Island Notification ---
  showNotification(message, type = "success") {
    const island = this.elements.dynamicIsland;
    const navContent = this.elements.navContent;
    const notifContent = this.elements.notificationContent;
    const notifMsg = document.getElementById("notif-message");
    const notifIcon = document.getElementById("notif-icon");

    // Configure message and icon
    notifMsg.textContent = message;
    if (type === "error") {
      notifIcon.setAttribute("data-lucide", "alert-circle");
      notifIcon.classList.remove("text-green-500");
      notifIcon.classList.add("text-red-500");
    } else {
      notifIcon.setAttribute("data-lucide", "check-circle");
      notifIcon.classList.add("text-green-500");
      notifIcon.classList.remove("text-red-500");
    }
    lucide.createIcons();

    // Animate Timeline
    const tl = anime.timeline({
      easing: "easeOutExpo",
    });

    // Step 1: Fade out nav content
    tl.add({
      targets: navContent,
      opacity: 0,
      scale: 0.8,
      duration: 200,
      complete: () => {
        navContent.classList.add("hidden");
        notifContent.classList.remove("hidden");
        notifContent.classList.add("flex");
      },
    })
      // Step 2: Expand Island & Show Notif concurrently
      .add(
        {
          targets: island,
          width: "340px",
          height: "70px",
          borderRadius: "25px",
          duration: 400,
          easing: "spring(1, 80, 10, 0)",
        },
        "-=100",
      )
      .add(
        {
          targets: notifContent,
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 300,
        },
        "-=300",
      )

      // Wait
      .add({
        duration: 2000,
      })

      // Step 3: Revert
      .add({
        targets: notifContent,
        opacity: 0,
        scale: 0.8,
        duration: 200,
        complete: () => {
          notifContent.classList.add("hidden");
          notifContent.classList.remove("flex");
          navContent.classList.remove("hidden");
        },
      })
      .add(
        {
          borderRadius: "50px",
          duration: 400,
          easing: "spring(1, 80, 10, 0)",
          complete: () => {
            // Critical: Clear inline styles to let CSS responsiveness take over again
            island.style.width = "";
            island.style.height = "";
            island.style.borderRadius = "";
          },
        },
        "-=100",
      )
      .add(
        {
          targets: navContent,
          opacity: [0, 1],
          scale: [0.8, 1],
          duration: 300,
        },
        "-=300",
      );
  },

  // --- Pocket Details Logic ---
  openPocketDetails(pocket, transactions) {
    const modal = this.elements.modalPocketDetails;
    if (!modal) return;

    // Populate Data
    document.getElementById("detail-pocket-name").textContent = pocket.name;
    document.getElementById("detail-pocket-balance").textContent =
      formatCurrency(pocket.balance);

    // Filter transactions specific to this pocket
    // Expenses (pocketId matches) OR Allocations (transfer_out AND pocketId matches)
    const pocketTrans = transactions.filter((t) => t.pocketId === pocket.id);

    const list = document.getElementById("detail-transaction-list");
    list.innerHTML = "";

    if (pocketTrans.length === 0) {
      list.innerHTML =
        '<p class="text-center text-gray-500 py-4 opacity-70">Belum ada transaksi di kantong ini.</p>';
    } else {
      pocketTrans.forEach((t) => {
        let colorClass, sign;

        // Determine type for this pocket context
        if (t.type === "expense") {
          // Money leaving pocket
          colorClass = "text-red-500";
          sign = "-";
        } else if (t.type === "transfer_out") {
          // Allocations (Incoming to this pocket from Main)
          // Note: In global history 'transfer_out' is Orange (leaving main),
          // but inside Pocket Details it is Income (Green).
          colorClass = "text-green-500";
          sign = "+";
        } else {
          // Safety fallback
          colorClass = "text-gray-500";
          sign = "";
        }

        const el = document.createElement("div");
        el.className =
          "flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl";
        el.innerHTML = `
                    <div>
                        <p class="font-bold text-sm text-slate-800 dark:text-white">${t.description}</p>
                        <p class="text-xs text-gray-400">${formatDate(t.date)}</p>
                    </div>
                    <span class="font-bold ${colorClass} text-sm">${sign}${formatCurrency(t.amount)}</span>
                `;
        list.appendChild(el);
      });
    }

    // Store ID
    document
      .getElementById("btn-detail-allocate")
      .setAttribute("data-id", pocket.id);
    document
      .getElementById("btn-detail-edit")
      .setAttribute("data-id", pocket.id);
    document
      .getElementById("btn-detail-delete")
      .setAttribute("data-id", pocket.id);

    this.modals.open("pocket-details");
  },
  calcStats(transactions) {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else if (t.type === "expense") acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  },

  modals: {
    open(id) {
      const el = document.getElementById(`modal-${id}`);
      if (el) {
        el.classList.remove("hidden");
        anime({
          targets: el.firstElementChild,
          scale: [0.9, 1],
          opacity: [0, 1],
          easing: "spring(1, 80, 10, 0)",
        });
      } else if (id === "add-pocket") {
        // SweetAlert for creating pocket as it's simpler
        Swal.fire({
          title: "Buat Kantong Baru",
          input: "text",
          inputLabel: "Nama Kantong",
          showCancelButton: true,
          confirmButtonText: "Buat",
          showLoaderOnConfirm: true,
        }).then((result) => {
          if (result.isConfirmed) {
            document.dispatchEvent(
              new CustomEvent("create-pocket", { detail: result.value }),
            );
          }
        });
      }
    },
    close(id) {
      const el = document.getElementById(`modal-${id}`);
      if (el) el.classList.add("hidden");
    },
  },
  animateToolbarEntry() {
    const toolbar = document.getElementById("smart-toolbar");
    if (!toolbar) return;

    // Reset initial state
    const items = toolbar.querySelectorAll(".toolbar-item");
    anime.set(items, { opacity: 0, translateY: 20 });

    // Staggered Entrance
    anime({
      targets: items,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(100, { start: 200 }), // Start after view transition
      duration: 800,
      easing: "spring(1, 80, 10, 0)",
    });
  },

  bindToolbarInteractions() {
    // 1. Filter Buttons - Pill Elasticity
    const filterBtns = document.querySelectorAll(".filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        if (!btn.classList.contains("active")) {
          anime({
            targets: btn,
            scale: 1.05,
            duration: 400,
            easing: "easeOutElastic(1, .5)",
          });
        }
      });
      btn.addEventListener("mouseleave", () => {
        anime({
          targets: btn,
          scale: 1,
          duration: 300,
          easing: "easeOutExpo",
        });
      });

      // Click visual feedback (separate from logic)
      btn.addEventListener("click", () => {
        anime({
          targets: btn,
          scale: [0.95, 1],
          duration: 300,
          easing: "spring(1, 80, 10, 0)",
        });
      });
    });

    // (Removed datepicker trigger interactions)
  },
};

function updateNumberAnimation(element, targetValue) {
  const current = parseInt(element.getAttribute("data-value") || 0);
  const obj = { val: current };

  anime({
    targets: obj,
    val: targetValue,
    round: 1,
    easing: "easeOutExpo",
    update: function () {
      element.innerText = formatCurrency(obj.val);
    },
    complete: function () {
      element.setAttribute("data-value", targetValue);
    },
  });
}
