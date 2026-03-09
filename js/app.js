/**
 * Aturduit - Main Application
 */
import { store } from "./store.js";
import { ui } from "./ui.js";
import {
  generateId,
  downloadJSON,
  formatCurrency,
  formatDate,
  getTranslation,
  getLocalStorageSize,
} from "./utils.js";
import { generatePDF } from "./pdf-generator.js";

const app = {
  init() {
    console.log("App Initializing...");
    ui.init();

    // Initialize Filter State
    this.activeFilter = {
      type: "all",
    };
    this.vantaEffect = null;

    // Initial Render
    this.updateView();

    // Subscribe UI to Store changes
    store.subscribe((state) => {
      this.updateView(state);
    });

    this.bindEvents();
    this.bindForms(); // Bind new form listeners

    // Load Theme & Language
    if (store.state.settings.darkMode) {
      document.documentElement.classList.add("dark");
    }
    this.setLanguage(store.state.settings.language);

    // Apply Global Animations
    this.applyGenericAnimations();

    // Initialize Vanta Background
    this.initVantaBackground();

    // Initialize Notepad
    this.initNotepad();

    // Initialize Datepicker
    this.initDatepicker();
  },

  initVantaBackground() {
    if (window.VANTA && document.getElementById("vanta-bg")) {
      this.vantaEffect = window.VANTA.FOG({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0xbae6fd, // Sky-200
        midtoneColor: 0x7dd3fc, // Sky-300
        lowlightColor: 0x38bdf8, // Sky-400
        baseColor: 0xf0f9ff, // Sky-50
        blurFactor: 0.6,
        speed: 1.2,
        zoom: 1.5,
      });

      // Adjust for Dark Mode initial state (optional logic)
      if (store.state.settings.darkMode) {
        this.vantaEffect.setOptions({
          baseColor: 0x0f172a, // Slate-900
          highlightColor: 0x38bdf8,
          midtoneColor: 0x0ea5e9,
          lowlightColor: 0x0284c7,
        });
      }
    }
  },

  initNotepad() {
    setTimeout(() => {
      const editorEl = document.getElementById("notepad-editor");
      if (!editorEl || typeof Quill === "undefined") return;

      const quill = new Quill(editorEl, {
        theme: "snow",
        placeholder: "Tuliskan catatan atau rencana kamu di sini...",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "clean"],
          ],
        },
      });

      // Load initial content
      if (store.state.notepadContent) {
        quill.root.innerHTML = store.state.notepadContent;
      }

      // Save content on change (debounce for performance)
      let timeout;
      quill.on("text-change", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          store.state.notepadContent = quill.root.innerHTML;
          store.saveState();
        }, 500);
      });
    }, 500);
  },

  initDatepicker() {
    setTimeout(() => {
      if (typeof VanillaCalendar === "undefined") {
        console.warn("VanillaCalendar not loaded");
        return;
      }

      // Removed Main Filter Datepicker init here since it's deleted from UI

      // 2. Export Start Datepicker
      this.createDatepicker(
        "export-start-trigger",
        "export-start-popup",
        "export-start-text",
        (date) => {
          document.getElementById("export-start-value").value = date;
        },
      );

      // 3. Export End Datepicker
      this.createDatepicker(
        "export-end-trigger",
        "export-end-popup",
        "export-end-text",
        (date) => {
          document.getElementById("export-end-value").value = date;
        },
      );

      // 4. Transaction Date Picker
      this.createDatepicker(
        "transaction-date-trigger",
        "transaction-date-popup",
        "transaction-date-text",
        (date) => {
          document.getElementById("transaction-date-value").value = date;
        },
      );
    }, 500);
  },

  createDatepicker(triggerId, popupId, textId, onSelect) {
    const trigger = document.getElementById(triggerId);
    const popup = document.getElementById(popupId);
    const textSpan = document.getElementById(textId);

    if (!trigger || !popup) return;

    const calendar = new VanillaCalendar(`#${popupId}`, {
      settings: {
        visibility: {
          theme: document.documentElement.classList.contains("dark")
            ? "dark"
            : "light",
        },
        lang: "id-ID",
      },
      actions: {
        clickDay: (e, self) => {
          if (self.selectedDates[0]) {
            const date = self.selectedDates[0];
            // Update UI
            if (textSpan) {
              textSpan.textContent = formatDate(date);
              textSpan.classList.remove("text-gray-500");
              textSpan.classList.add(
                "text-slate-800",
                "dark:text-white",
                "font-medium",
              );
            }

            // Callback
            if (onSelect) onSelect(date);

            // Close
            popup.classList.add("hidden");
          }
        },
      },
    });
    calendar.init();

    // Toggle
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (popup.classList.contains("hidden")) {
        // Close others
        document.querySelectorAll('[id$="-popup"]').forEach((el) => {
          if (el.id !== popupId) el.classList.add("hidden");
        });

        popup.classList.remove("hidden");
        calendar.settings.visibility.theme =
          document.documentElement.classList.contains("dark")
            ? "dark"
            : "light";
        calendar.update();
      } else {
        popup.classList.add("hidden");
      }
    });

    // Add to global close list logic (or handle individually if simpler)
    document.addEventListener("click", (e) => {
      if (!trigger.contains(e.target) && !popup.contains(e.target)) {
        popup.classList.add("hidden");
      }
    });
  },

  setLanguage(lang) {
    store.state.settings.language = lang;
    document.getElementById("lang-toggle").textContent = lang.toUpperCase();
    ui.translate(lang);
    ui.renderDashboard(store.state);
    store.saveState();
  },

  updateView(state = store.state) {
    ui.renderDashboard(state);
    ui.renderPockets(state.pockets);

    // Filter Logic
    let filtered = state.transactions;

    // 1. By Type
    if (this.activeFilter.type !== "all") {
      if (this.activeFilter.type === "transfer") {
        filtered = filtered.filter(
          (t) => t.type === "transfer_in" || t.type === "transfer_out",
        );
      } else {
        filtered = filtered
          .filter((t) => t.type === "income" || t.type === "expense")
          .filter((t) => t.type === this.activeFilter.type);

        if (this.activeFilter.type === "income") {
          filtered = filtered.filter((t) => t.type === "income");
        } else if (this.activeFilter.type === "expense") {
          filtered = filtered.filter((t) => t.type === "expense");
        }
      }
    }

    // Removed Date filtering logic since it is no longer tracked

    ui.renderHistory(filtered, state.pockets);
    this.updateStorageUI();
  },

  updateStorageUI() {
    const usedKB = parseFloat(getLocalStorageSize());
    const maxKB = 5000; // ~5MB
    let percentage = (usedKB / maxKB) * 100;
    if (percentage > 100) percentage = 100;

    const progressBar = document.getElementById("storage-progress-bar");
    const usedText = document.getElementById("storage-used-text");
    const warningText = document.getElementById("storage-warning-text");

    if (progressBar && usedText) {
      progressBar.style.width = `${percentage}%`;
      const formatString = getTranslation(
        store.state.settings.language,
        "usedFormat",
      );
      usedText.textContent = `${usedKB.toFixed(2)}${formatString}`;

      // Progressive coloring
      progressBar.classList.remove("bg-blue-500", "bg-amber-500", "bg-red-500");
      if (percentage >= 90) {
        progressBar.classList.add("bg-red-500");
        if (warningText) warningText.classList.remove("hidden");
      } else if (percentage >= 75) {
        progressBar.classList.add("bg-amber-500");
        if (warningText) warningText.classList.add("hidden");
      } else {
        progressBar.classList.add("bg-blue-500");
        if (warningText) warningText.classList.add("hidden");
      }
    }
  },

  bindEvents() {
    // Navigation (Dynamic Island & Tabs)
    // Navigation (Dynamic Island & Tabs)
    const indicator = document.getElementById("nav-indicator");
    const navParent = document.getElementById("nav-content");

    // Initial Active Position
    const setIndicator = (target) => {
      const parentRect = navParent.getBoundingClientRect();
      const rect = target.getBoundingClientRect();
      const left = rect.left - parentRect.left;

      anime({
        targets: indicator,
        left: left,
        width: rect.width,
        opacity: 1,
        duration: 300, // Faster
        easing: "spring(1, 95, 12, 0)", // Snappier spring
      });
    };

    // Set initial state if active link exists
    const activeLink = document.querySelector(".nav-link.active");
    if (activeLink && indicator) {
      // Delay slightly to ensure layout stability
      setTimeout(() => setIndicator(activeLink), 100);
    }

    // Feature: Handle Resize for Responsive Indicator
    window.addEventListener("resize", () => {
      const currentActive = document.querySelector(".nav-link.active");
      if (currentActive) setIndicator(currentActive);
    });

    ui.elements.navItems.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.getAttribute("data-page");

        // Update Active Link State
        ui.elements.navItems.forEach((l) =>
          l.classList.remove("active", "text-blue-600", "dark:text-blue-400"),
        );
        ui.elements.navItems.forEach((l) => l.classList.add("text-gray-400")); // Reset colors

        link.classList.add("active", "text-blue-600", "dark:text-blue-400");
        link.classList.remove("text-gray-400");

        // Animate Indicator
        if (indicator) setIndicator(link);

        // Update Vanta on Theme Toggle (Logic in click listener manually if needed, or observed via class mutation)
        // For now, simplify.

        // Icon Punch Effect (Scale only, no rotation)
        const icon = link.querySelector("svg");
        if (icon) {
          anime({
            targets: icon,
            scale: [1, 1.25, 1],
            duration: 200, // Faster
            easing: "easeOutQuad", // Lighter
          });
        }

        // Switch View
        ui.elements.views.forEach((view) => {
          view.classList.add("hidden");
          view.classList.remove("block");
        });
        document.getElementById(`view-${page}`).classList.remove("hidden");
        document.getElementById(`view-${page}`).classList.add("block");

        // Re-trigger view animation
        const targetView = document.getElementById(`view-${page}`);
        targetView.classList.remove("animate-fade-in-up");
        void targetView.offsetWidth; // trigger reflow
        targetView.classList.add("animate-fade-in-up");

        // Toolbar Entry Animation
        if (page === "history") {
          ui.animateToolbarEntry();
        }
      });

      // Hover Effects
      link.addEventListener("mouseenter", () => {
        if (!link.classList.contains("active")) {
          anime({
            targets: link.querySelector("svg"),
            translateY: -3,
            duration: 200, // Faster
            easing: "easeOutQuad",
          });
        }
      });

      link.addEventListener("mouseleave", () => {
        anime({
          targets: link.querySelector("svg"),
          translateY: 0,
          duration: 200, // Faster
          easing: "easeOutQuad",
        });
      });
    });

    // Add Transaction Modal Open
    document
      .getElementById("add-transaction-btn")
      .addEventListener("click", () => {
        // Populate Pockets Dropdown
        const select = ui.elements.pocketSelect;
        select.innerHTML = '<option value="">-- Pilih Kantong --</option>';
        store.state.pockets.forEach((p) => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = `${p.name} (Rp ${p.balance})`;
          select.appendChild(opt);
        });

        // Reset Date Picker
        document.getElementById("transaction-date-value").value = "";
        const dateText = document.getElementById("transaction-date-text");
        if (dateText) {
          dateText.textContent = "Hari Ini";
          dateText.classList.remove(
            "text-slate-800",
            "dark:text-white",
            "font-medium",
          );
          dateText.classList.add("text-gray-500");
        }

        ui.modals.open("transaction");
      });

    // Add Pocket Button (Fix for module scope issue)
    const addPocketBtn = document.getElementById("add-pocket-btn");
    if (addPocketBtn) {
      addPocketBtn.addEventListener("click", () => {
        ui.modals.open("add-pocket"); // Logic needs update to target custom modal, handled in generic opener if ID matches or specifically here
        // Note: ui.modals.open takes 'name' -> 'modal-name'.
        // So 'add-pocket' maps to 'modal-add-pocket'. This works perfectly with our new ID!
      });
    }

    // Transaction Type Toggle
    const typeBtns = document.querySelectorAll(
      "#transaction-form button[data-type]",
    );
    let currentType = "income";

    typeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        currentType = btn.getAttribute("data-type");

        // Visual Update
        typeBtns.forEach((b) => {
          b.classList.remove(
            "bg-white",
            "dark:bg-slate-700",
            "shadow-sm",
            "text-green-600",
            "text-red-500",
          );
          b.classList.add("text-gray-500", "dark:text-gray-400");
        });
        btn.classList.add("bg-white", "dark:bg-slate-700", "shadow-sm");
        if (currentType === "income") btn.classList.add("text-green-600");
        else btn.classList.add("text-red-500");

        // Logic Update: Show/Hide Pocket Selector
        const pocketContainer = ui.elements.modalPocketSelector;
        if (currentType === "expense") {
          pocketContainer.classList.remove("hidden");
          document.getElementById("transaction-pocket-select").required = true;
          // Hide Date Picker for Expense (per user request)
          document
            .getElementById("transaction-date-container")
            .classList.add("hidden");
        } else {
          pocketContainer.classList.add("hidden");
          document.getElementById("transaction-pocket-select").required = false;
          // Show Date Picker for Income
          document
            .getElementById("transaction-date-container")
            .classList.remove("hidden");
        }
      });
    });

    // Close Modals
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => {
        const modal = btn.closest('div[id^="modal-"]');
        if (modal) ui.modals.close(modal.id.replace("modal-", ""));
      });
    });

    // Transaction Form Submit
    document
      .getElementById("transaction-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const desc = document.getElementById("transaction-desc").value;
        const amount = document.getElementById("transaction-amount").value;
        const pocketId = document.getElementById(
          "transaction-pocket-select",
        ).value;
        const isRecurring = document.getElementById(
          "transaction-recurring",
        ).checked;
        const dateVal = document.getElementById("transaction-date-value").value;

        try {
          if (currentType === "expense") {
            // For expense, we currently don't use the date picker as it's hidden, but we could if expanded.
            // Passing null/undefined relies on defaults.
            store.addExpense(amount, desc, pocketId, isRecurring);
          } else {
            store.addIncome(amount, desc, isRecurring, dateVal || null);
          }

          ui.modals.close("transaction");
          e.target.reset();
          ui.showNotification(
            getTranslation(store.state.settings.language, "transactionSuccess"),
          );
        } catch (error) {
          Swal.fire("Error", error.message, "error");
        }
      });

    // Delete Pocket Listener (Global)
    document.addEventListener("delete-pocket", (e) => {
      this.handleDeletePocket(e.detail);
    });

    // --- Filter Events ---

    // Filter Buttons (Pills)
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // UI Toggle
        document.querySelectorAll(".filter-btn").forEach((b) => {
          b.classList.remove(
            "active",
            "bg-white",
            "dark:bg-slate-700",
            "shadow-sm",
            "text-blue-600",
            "dark:text-blue-400",
          );
          b.classList.add(
            "text-gray-500",
            "hover:text-gray-900",
            "dark:text-gray-400",
            "dark:hover:text-white",
          );
        });

        // Active State Style
        e.target.classList.add(
          "active",
          "bg-white",
          "dark:bg-slate-700",
          "shadow-sm",
          "text-blue-600",
          "dark:text-blue-400",
        );
        e.target.classList.remove("text-gray-500", "hover:text-gray-900");

        // Update Filter State
        this.activeFilter.type = e.target.getAttribute("data-filter");
        this.updateView();
      });
    });

    // Reset Filter Button
    const resetFilterBtn = document.getElementById("reset-filter-btn");
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", () => {
        // 1. Reset State
        this.activeFilter = { type: "all" };

        // 3. Reset UI - Filter Buttons
        document.querySelectorAll(".filter-btn").forEach((b) => {
          b.classList.remove(
            "active",
            "bg-white",
            "dark:bg-slate-700",
            "shadow-sm",
            "text-blue-600",
            "dark:text-blue-400",
          );
          b.classList.add(
            "text-gray-500",
            "hover:text-gray-900",
            "dark:text-gray-400",
            "dark:hover:text-white",
          );

          if (b.getAttribute("data-filter") === "all") {
            b.classList.add(
              "active",
              "bg-white",
              "dark:bg-slate-700",
              "shadow-sm",
              "text-blue-600",
              "dark:text-blue-400",
            );
            b.classList.remove(
              "text-gray-500",
              "hover:text-gray-900",
              "dark:text-gray-400",
              "dark:hover:text-white",
            );
          }
        });

        // 4. Update View
        this.updateView();

        // Optional: Animation for feedback
        anime({
          targets: resetFilterBtn,
          rotate: "-1turn",
          duration: 500,
          easing: "easeOutExpo",
        });
      });
    }

    // Pocket Grid Click Delegation
    const grid = document.getElementById("pockets-grid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const card = e.target.closest(".group");
        const deleteBtn = e.target.closest(".delete-pocket-btn");

        // If clicked card but NOT the delete button
        if (card && !deleteBtn) {
          const id = card.getAttribute("data-id");
          if (id) {
            const pocket = store.state.pockets.find((p) => p.id === id);
            if (pocket) this.openPocketDetails(pocket);
          }
        }
      });
    }

    // --- Pocket Details Modal Actions ---

    // Allocate (Isi Saldo)
    const btnAllocate = document.getElementById("btn-detail-allocate");
    if (btnAllocate) {
      btnAllocate.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        ui.modals.close("pocket-details");
        setTimeout(() => this.openAllocateModal(id), 300);
      });
    }

    // Edit Name & Target
    const btnEdit = document.getElementById("btn-detail-edit");
    if (btnEdit) {
      btnEdit.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        const pocket = store.state.pockets.find((p) => p.id === id);

        Swal.fire({
          title: getTranslation(
            store.state.settings.language,
            "editPocketTitle",
          ),
          html: `
            <input id="swal-input-name" class="swal2-input" placeholder="Nama Kantong" value="${pocket.name}">
            <input id="swal-input-target" class="swal2-input" type="number" placeholder="Max Target Saldo (Opsional)" value="${pocket.target || ""}">
          `,
          focusConfirm: false,
          showCancelButton: true,
          confirmButtonText: getTranslation(
            store.state.settings.language,
            "save",
          ),
          cancelButtonText: getTranslation(
            store.state.settings.language,
            "cancel",
          ),
          preConfirm: () => {
            const name = document.getElementById("swal-input-name").value;
            const target = document.getElementById("swal-input-target").value;
            if (!name) {
              Swal.showValidationMessage("Nama kantong harus diisi");
            }
            return { name, target };
          },
        }).then((result) => {
          if (result.isConfirmed && result.value) {
            store.editPocket(id, result.value.name, result.value.target);
            ui.modals.close("pocket-details");
            this.updateView();
            ui.showNotification(
              getTranslation(store.state.settings.language, "successTitle"),
            );
          }
        });
      });
    }

    // Delete (from Modal)
    const btnDelete = document.getElementById("btn-detail-delete");
    if (btnDelete) {
      btnDelete.addEventListener("click", (e) => {
        const id = e.currentTarget.getAttribute("data-id");
        ui.modals.close("pocket-details");
        setTimeout(() => this.handleDeletePocket(id), 300);
      });
    }

    // --- Settings & Data Actions ---

    const exportPdfBtn = document.getElementById("export-pdf-btn");
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", () => {
        ui.modals.open("export-pdf");
      });
    }

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        const isDark = document.documentElement.classList.contains("dark");
        store.state.settings.darkMode = isDark;
        store.saveState();

        // Update Vanta Effect
        if (this.vantaEffect) {
          if (isDark) {
            this.vantaEffect.setOptions({
              baseColor: 0x0f172a, // Slate-900
              highlightColor: 0x38bdf8,
              midtoneColor: 0x0ea5e9,
              lowlightColor: 0x0284c7,
            });
          } else {
            this.vantaEffect.setOptions({
              highlightColor: 0xbae6fd, // Sky-200
              midtoneColor: 0x7dd3fc, // Sky-300
              lowlightColor: 0x38bdf8, // Sky-400
              baseColor: 0xf0f9ff, // Sky-50
            });
          }
        }
      });
    }

    const langToggle = document.getElementById("lang-toggle");
    if (langToggle) {
      langToggle.addEventListener("click", () => {
        const current = store.state.settings.language;
        const next = current === "id" ? "en" : "id";
        this.setLanguage(next);
      });
    }

    // Settings: Reset Data
    const btnReset = document.getElementById("reset-data-btn");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        const lang = store.state.settings.language;
        Swal.fire({
          title: getTranslation(lang, "resetTitle"),
          text: getTranslation(lang, "resetDesc"),
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#dc2626",
          cancelButtonColor: "#64748b",
          confirmButtonText: getTranslation(lang, "resetConfirm"),
          cancelButtonText: getTranslation(lang, "cancel"),
          background: document.documentElement.classList.contains("dark")
            ? "#1e293b"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#1e293b",
        }).then((result) => {
          if (result.isConfirmed) {
            store.resetData();
            Swal.fire({
              title: getTranslation(lang, "resetSuccessTitle"),
              text: getTranslation(lang, "resetSuccessDesc"),
              icon: "success",
              confirmButtonColor: "#3b82f6",
              background: document.documentElement.classList.contains("dark")
                ? "#1e293b"
                : "#fff",
              color: document.documentElement.classList.contains("dark")
                ? "#fff"
                : "#1e293b",
            });
            ui.renderDashboard(store.state); // Immediate refresh
          }
        });
      });
    }

    // Settings: Input File Trigger Logic
    const importCard = document.getElementById("import-trigger-card");
    const importInput = document.getElementById("import-json-input");

    if (importCard && importInput) {
      importCard.addEventListener("click", () => {
        const lang = store.state.settings.language;
        Swal.fire({
          title: getTranslation(lang, "restoreTitle"),
          text: getTranslation(lang, "restoreDesc"),
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#3b82f6",
          cancelButtonColor: "#64748b",
          confirmButtonText: getTranslation(lang, "restoreConfirm"),
          cancelButtonText: getTranslation(lang, "cancel"),
          background: document.documentElement.classList.contains("dark")
            ? "#1e293b"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#1e293b",
        }).then((result) => {
          if (result.isConfirmed) {
            importInput.click();
          }
        });
      });

      importInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const success = store.importData(event.target.result);
            if (success) {
              Swal.fire({
                title: getTranslation(
                  store.state.settings.language,
                  "restoreSuccessTitle",
                ),
                text: getTranslation(
                  store.state.settings.language,
                  "restoreSuccessDesc",
                ),
                icon: "success",
                confirmButtonColor: "#3b82f6",
                background: document.documentElement.classList.contains("dark")
                  ? "#1e293b"
                  : "#fff",
                color: document.documentElement.classList.contains("dark")
                  ? "#fff"
                  : "#1e293b",
              });
              this.updateView();
            } else {
              throw new Error("Format Invalid");
            }
          } catch (err) {
            Swal.fire({
              title: "Gagal Memproses",
              text: "Format file tidak valid atau rusak.",
              icon: "error",
              background: document.documentElement.classList.contains("dark")
                ? "#1e293b"
                : "#fff",
              color: document.documentElement.classList.contains("dark")
                ? "#fff"
                : "#1e293b",
            });
          }
          // Reset input
          e.target.value = "";
        };
        reader.readAsText(file);
      });
    }

    // Settings: Export JSON
    const exportJsonBtn = document.getElementById("export-json-btn");
    if (exportJsonBtn) {
      exportJsonBtn.addEventListener("click", () => {
        const lang = store.state.settings.language;
        Swal.fire({
          title: getTranslation(lang, "backupTitle"),
          text: getTranslation(lang, "backupDesc"),
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#10b981", // Emerald
          cancelButtonColor: "#64748b",
          confirmButtonText: getTranslation(lang, "backupConfirm"),
          cancelButtonText: getTranslation(lang, "cancel"),
          background: document.documentElement.classList.contains("dark")
            ? "#1e293b"
            : "#fff",
          color: document.documentElement.classList.contains("dark")
            ? "#fff"
            : "#1e293b",
        }).then((result) => {
          if (result.isConfirmed) {
            try {
              const jsonData = store.exportData();
              const blob = new Blob([jsonData], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              const timestamp = new Date().toISOString().split("T")[0];
              link.download = `aturduit-backup-${timestamp}.json`;
              link.click();
              URL.revokeObjectURL(url);

              Swal.fire({
                title: getTranslation(lang, "backupSuccessTitle"),
                text: getTranslation(lang, "backupSuccessDesc"),
                icon: "success",
                confirmButtonColor: "#3b82f6",
                background: document.documentElement.classList.contains("dark")
                  ? "#1e293b"
                  : "#fff",
                color: document.documentElement.classList.contains("dark")
                  ? "#fff"
                  : "#1e293b",
              });
            } catch (error) {
              Swal.fire("Error", "Gagal: " + error.message, "error");
            }
          }
        });
      });
    }
  },

  // --- Helpers Methods ---

  handleDeletePocket(id) {
    const pocket = store.state.pockets.find((p) => p.id === id);
    const lang = store.state.settings.language;

    Swal.fire({
      title: getTranslation(lang, "deletePocketTitle"),
      text: `(Rp ${formatCurrency(pocket.balance)}) ${getTranslation(lang, "pocketRefundDesc")}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: getTranslation(lang, "deleteAndRefund"),
      cancelButtonText: getTranslation(lang, "cancel"),
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          store.deletePocket(id);
          ui.showNotification(getTranslation(lang, "pocketDeleted"));
        } catch (e) {
          Swal.fire("Error", e.message, "error");
        }
      }
    });
  },

  // --- Actions ---

  openAllocateModal(pocketId) {
    const pocket = store.state.pockets.find((p) => p.id === pocketId);
    if (!pocket) return;

    document.getElementById("allocate-pocket-id").value = pocketId;
    document.getElementById("allocate-pocket-name").textContent =
      `Target: ${pocket.name}`;
    document.getElementById("allocate-main-balance").textContent =
      `Saldo Utama: ${formatCurrency(store.state.mainBalance)}`;
    document.getElementById("allocate-amount").value = ""; // Reset

    ui.modals.open("allocate"); // Maps to modal-allocate
  },

  bindForms() {
    // Add Pocket Form
    document
      .getElementById("add-pocket-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("pocket-name-input").value;
        const targetStr = document.getElementById("pocket-target-input").value;
        const target = targetStr ? parseFloat(targetStr) : 0;

        const colors = [
          "blue",
          "green",
          "yellow",
          "red",
          "purple",
          "pink",
          "indigo",
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newPocket = store.addPocket(name, target, randomColor);

        ui.modals.close("add-pocket");
        e.target.reset();

        // Ask to allocate immediately?
        // User requested "Show alloction popup like after creating".
        // So we open allocate modal immediately.
        setTimeout(() => {
          this.openAllocateModal(newPocket.id);
        }, 300);
      });

    // Allocation Form
    document.getElementById("allocate-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("allocate-pocket-id").value;
      const amount = document.getElementById("allocate-amount").value;

      try {
        store.allocateToPocket(id, amount);
        ui.modals.close("allocate");
        e.target.reset();
        ui.showNotification(
          getTranslation(store.state.settings.language, "balanceMoved"),
        );
      } catch (err) {
        Swal.fire("Gagal", err.message, "error");
      }
    });

    // Export PDF Form
    const pdfForm = document.getElementById("export-pdf-form");
    if (pdfForm) {
      pdfForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const startDate = document.getElementById("export-start-value").value;
        const endDate = document.getElementById("export-end-value").value;

        if (!startDate || !endDate) {
          Swal.fire(
            getTranslation(store.state.settings.language, "errorTitle"),
            getTranslation(store.state.settings.language, "val_dateRange"),
            "warning",
          );
          return;
        }

        if (new Date(startDate) > new Date(endDate)) {
          Swal.fire(
            getTranslation(store.state.settings.language, "errorTitle"),
            getTranslation(store.state.settings.language, "val_dateInvalid"),
            "error",
          );
          return;
        }

        // Filter transactions
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const filtered = store.state.transactions.filter((t) => {
          const tDate = new Date(t.date);
          return tDate >= start && tDate <= end;
        });

        if (filtered.length === 0) {
          Swal.fire(
            getTranslation(store.state.settings.language, "info"),
            getTranslation(
              store.state.settings.language,
              "noTransactionsRange",
            ),
            "info",
          );
          return;
        }

        try {
          // Pass filtered transactions AND pockets list for detailed report
          generatePDF(
            filtered,
            store.state.pockets,
            startDate,
            endDate,
            store.state.settings.language,
          );
          ui.modals.close("export-pdf");
          ui.showNotification(
            getTranslation(store.state.settings.language, "pdfSuccess"),
          );
        } catch (err) {
          console.error(err);
          Swal.fire(
            getTranslation(store.state.settings.language, "errorTitle"),
            getTranslation(store.state.settings.language, "pdfFailed") +
              err.message,
            "error",
          );
        }
      });
    }
  },

  openPocketDetails(pocket) {
    ui.openPocketDetails(pocket, store.state.transactions);
  },

  applyGenericAnimations() {
    // 1. Standard Scale Buttons (Export, Filter, Save, Nav items)
    const scaleButtons = document.querySelectorAll(
      '#export-json-btn, #transaction-form button[type="submit"], .modal-close',
    );
    scaleButtons.forEach((btn) => {
      btn.addEventListener("mouseenter", () =>
        anime({
          targets: btn,
          scale: 1.05,
          duration: 300,
          easing: "easeOutExpo",
        }),
      );
      btn.addEventListener("mouseleave", () =>
        anime({ targets: btn, scale: 1, duration: 300, easing: "easeOutExpo" }),
      );
    });

    // 2. Rotate Buttons (Settings, Toggles, Add Pocket, Export PDF)
    const rotateButtons = document.querySelectorAll(
      "#theme-toggle, #lang-toggle",
    );
    rotateButtons.forEach((btn) => {
      btn.addEventListener("mouseenter", () => {
        anime({
          targets: btn,
          scale: 1.15,
          duration: 300,
          easing: "easeOutBack",
        });
      });
      btn.addEventListener("mouseleave", () => {
        anime({ targets: btn, scale: 1, duration: 300, easing: "easeOutExpo" });
      });
    });

    // Specialized Animations for Complex Buttons (Bounce Effect)
    const complexButtons = ["add-pocket-btn", "export-pdf-btn"];

    complexButtons.forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("mouseenter", () => {
          anime({
            targets: btn,
            scale: 1.05,
            duration: 300,
            easing: "easeOutExpo",
          });
          anime({
            targets: btn.querySelector("div"), // The icon container
            translateY: [0, -3, 0], // Bounce up
            duration: 600,
            loop: true,
            easing: "easeInOutSine",
          });
        });

        btn.addEventListener("mouseleave", () => {
          anime.remove(btn.querySelector("div")); // Stop loop
          anime({
            targets: btn,
            scale: 1,
            duration: 300,
            easing: "easeOutExpo",
          });
          anime({
            targets: btn.querySelector("div"),
            translateY: 0,
            duration: 300,
            easing: "easeOutExpo",
          });
        });
      }
    });

    // Add Transaction Button (Dedicated)
    const addTransBtn = document.getElementById("add-transaction-btn");
    if (addTransBtn) {
      addTransBtn.addEventListener("mouseenter", () => {
        anime({
          targets: addTransBtn,
          scale: 1.15,
          duration: 400,
          easing: "easeOutBack",
        });
      });
      addTransBtn.addEventListener("mouseleave", () => {
        anime({
          targets: addTransBtn,
          scale: 1,
          duration: 300,
          easing: "easeOutExpo",
        });
      });
    }

    // 3. Danger/Destructive Buttons (Reset)
    const dangerBtn = document.getElementById("reset-data-btn");
    if (dangerBtn) {
      dangerBtn.addEventListener("mouseenter", () => {
        anime({
          targets: dangerBtn,
          translateX: [
            { value: -5, duration: 100 },
            { value: 5, duration: 100 },
            { value: -5, duration: 100 },
            { value: 0, duration: 100 },
          ],
          easing: "linear",
        });
      });
    }

    // 4. Nav Links (Subtle lift)
    ui.elements.navItems.forEach((nav) => {
      nav.addEventListener("mouseenter", () =>
        anime({
          targets: nav,
          translateY: -3,
          duration: 200,
          easing: "easeOutQuad",
        }),
      );
      nav.addEventListener("mouseleave", () =>
        anime({
          targets: nav,
          translateY: 0,
          duration: 200,
          easing: "easeOutQuad",
        }),
      );
    });
  },
};

// Initialize
app.init();
