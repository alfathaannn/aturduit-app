/**
 * Aturduit - Store Module
 * Handles state management and localStorage persistence
 */
import { generateId } from "./utils.js";

const STORAGE_KEY = "aturduit_data_v1";

const defaultState = {
  mainBalance: 0,
  pockets: [], // { id, name, balance, color, icon }
  transactions: [], // { id, date, description, type: 'income'|'expense', amount, pocketId (optional), recurring: boolean }
  notepadContent: "",
  settings: {
    darkMode: false,
    language: "id",
  },
};

class Store {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
    this.processRecurringTransactions();
  }

  loadState() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? JSON.parse(stored)
      : JSON.parse(JSON.stringify(defaultState));
  }

  processRecurringTransactions() {
    const today = new Date();
    const lastRun = localStorage.getItem("aturduit_last_run");

    // Simple daily check prevents multiple runs on same day
    if (lastRun === today.toDateString()) return;

    let changesMade = false;
    this.state.transactions.forEach((t) => {
      if (t.recurring) {
        // Logic: Check if it's been a month since transaction date
        // This is a simplified version. Ideal would be next_run_date in transaction object.
        const tDate = new Date(t.date);
        const nextMonth = new Date(tDate);
        nextMonth.setMonth(tDate.getMonth() + 1);

        // If today is past the next occurrence (and we haven't already processed it - simplified)
        // In a real app, we'd need a robust schedule system.
        // Here we just check: if it's recurring, do we add a new one?
        // For safety in this demo, strict recurring logic is complex without a backend.
        // We will skip auto-add for now to avoid duplicate spam on refresh,
        // but this is where the logic would sit.
        // console.log('Checking recurring:', t.description);
      }
    });

    localStorage.setItem("aturduit_last_run", today.toDateString());
  }

  saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // --- Actions ---

  addIncome(amount, description, isRecurring = false, date = null) {
    const transaction = {
      id: generateId(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      description,
      type: "income",
      amount: parseFloat(amount),
      recurring: isRecurring,
    };

    this.state.mainBalance += transaction.amount;
    this.state.transactions.unshift(transaction); // Add to beginning
    this.saveState();
    return transaction;
  }

  addPocket(name, target, initialColor = "blue") {
    const pocket = {
      id: generateId(),
      name,
      target: parseFloat(target) || 0,
      balance: 0,
      color: initialColor,
    };
    this.state.pockets.push(pocket);
    this.saveState();
    return pocket;
  }

  editPocket(id, newName, newTarget) {
    const pocket = this.state.pockets.find((p) => p.id === id);
    if (pocket) {
      if (newName) pocket.name = newName;
      if (newTarget !== undefined) pocket.target = parseFloat(newTarget) || 0;
      this.saveState();
    }
  }

  allocateToPocket(pocketId, amount) {
    const pocket = this.state.pockets.find((p) => p.id === pocketId);
    if (!pocket) throw new Error("Kantong tidak ditemukan");
    if (this.state.mainBalance < amount)
      throw new Error("Saldo utama tidak cukup");

    this.state.mainBalance -= parseFloat(amount);
    pocket.balance += parseFloat(amount);

    // Record Transaction
    const transaction = {
      id: generateId(),
      date: new Date().toISOString(),
      description: `Alokasi ke ${pocket.name}`,
      type: "transfer_out",
      amount: parseFloat(amount),
      pocketId: pocketId,
      recurring: false,
    };
    this.state.transactions.unshift(transaction);

    this.saveState();
  }

  deletePocket(id) {
    const pocketIndex = this.state.pockets.findIndex((p) => p.id === id);
    if (pocketIndex === -1) throw new Error("Kantong tidak ditemukan");

    const pocket = this.state.pockets[pocketIndex];

    // Refund Balance
    if (pocket.balance > 0) {
      this.state.mainBalance += pocket.balance;

      // Record Refund Transaction
      const transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        description: `Refund dari ${pocket.name}`,
        type: "transfer_in",
        amount: pocket.balance,
        recurring: false,
      };
      this.state.transactions.unshift(transaction);
    }

    // Remove Pocket
    this.state.pockets.splice(pocketIndex, 1);
    this.saveState();
  }

  addExpense(amount, description, pocketId, isRecurring = false, date = null) {
    const pocket = this.state.pockets.find((p) => p.id === pocketId);
    if (!pocket) throw new Error("Wajib pilih kantong untuk pengeluaran!");
    if (pocket.balance < amount)
      throw new Error(`Saldo kantong "${pocket.name}" tidak cukup!`);

    const transaction = {
      id: generateId(),
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      description,
      type: "expense",
      amount: parseFloat(amount),
      pocketId,
      recurring: isRecurring,
    };

    pocket.balance -= transaction.amount;
    this.state.transactions.unshift(transaction);
    this.saveState();
    return transaction;
  }

  getTotalBalance() {
    const pocketsTotal = this.state.pockets.reduce(
      (acc, p) => acc + p.balance,
      0,
    );
    return this.state.mainBalance + pocketsTotal;
  }

  getStats() {
    const income = this.state.transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = this.state.transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    return { income, expense };
  }

  resetData() {
    this.state = JSON.parse(JSON.stringify(defaultState));
    this.saveState();
  }

  importData(jsonData) {
    try {
      const parsed = JSON.parse(jsonData);
      // Basic validation
      if (!parsed.pockets || !parsed.transactions)
        throw new Error("Invalid JSON format");
      this.state = parsed;
      this.saveState();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  exportData() {
    return JSON.stringify(this.state, null, 2);
  }
}

export const store = new Store();
