import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Pocket, Transaction, AppSettings } from '../types';
import { generateId, downloadJSON } from '../utils/formatters';

const STORAGE_KEY = 'aturduit_data_v1';

const defaultState: AppState = {
  mainBalance: 0,
  pockets: [],
  transactions: [],
  notepadContent: '',
  settings: {
    darkMode: false,
    language: 'id',
  },
};

interface AppContextType {
  state: AppState;
  totalPocketsBalance: number;
  totalGlobalBalance: number;
  stats: { income: number; expense: number };
  addIncome: (amount: number, description: string, isRecurring?: boolean, date?: string) => void;
  addExpense: (amount: number, description: string, pocketId: string, isRecurring?: boolean, date?: string) => void;
  addPocket: (name: string, target: number, color?: string) => Pocket;
  editPocket: (id: string, name: string, target: number, color?: string) => void;
  allocateToPocket: (pocketId: string, amount: number) => void;
  deletePocket: (id: string) => void;
  deleteTransaction: (id: string) => void;
  setNotepadContent: (content: string) => void;
  toggleDarkMode: () => void;
  setLanguage: (lang: 'id' | 'en') => void;
  resetData: () => void;
  importData: (jsonData: string) => boolean;
  exportData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          mainBalance: parsed.mainBalance ?? 0,
          pockets: parsed.pockets ?? [],
          transactions: parsed.transactions ?? [],
          notepadContent: parsed.notepadContent ?? '',
          settings: {
            darkMode: parsed.settings?.darkMode ?? false,
            language: parsed.settings?.language ?? 'id',
          },
        };
      }
    } catch (e) {
      console.error('Failed to parse stored state:', e);
    }
    return defaultState;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  // Sync Dark Mode class to <html>
  useEffect(() => {
    if (state.settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.darkMode]);

  // Recurring transactions processor (once a day)
  useEffect(() => {
    const today = new Date().toDateString();
    const lastRun = localStorage.getItem('aturduit_last_run');
    if (lastRun !== today) {
      localStorage.setItem('aturduit_last_run', today);
    }
  }, []);

  const totalPocketsBalance = state.pockets.reduce((acc, p) => acc + (p.balance || 0), 0);
  const totalGlobalBalance = state.mainBalance + totalPocketsBalance;

  const stats = {
    income: state.transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0),
    expense: state.transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0),
  };

  const addIncome = useCallback(
    (amount: number, description: string, isRecurring = false, date?: string) => {
      const transaction: Transaction = {
        id: generateId(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        description: description.trim(),
        type: 'income',
        amount: Math.abs(amount),
        recurring: isRecurring,
      };

      setState((prev) => ({
        ...prev,
        mainBalance: prev.mainBalance + transaction.amount,
        transactions: [transaction, ...prev.transactions],
      }));
    },
    []
  );

  const addExpense = useCallback(
    (amount: number, description: string, pocketId: string, isRecurring = false, date?: string) => {
      setState((prev) => {
        const pocket = prev.pockets.find((p) => p.id === pocketId);
        if (!pocket) {
          throw new Error('Kantong tidak ditemukan!');
        }
        if (pocket.balance < amount) {
          throw new Error(`Saldo kantong "${pocket.name}" tidak mencukupi!`);
        }

        const transaction: Transaction = {
          id: generateId(),
          date: date ? new Date(date).toISOString() : new Date().toISOString(),
          description: description.trim(),
          type: 'expense',
          amount: Math.abs(amount),
          pocketId,
          recurring: isRecurring,
        };

        const updatedPockets = prev.pockets.map((p) =>
          p.id === pocketId ? { ...p, balance: p.balance - transaction.amount } : p
        );

        return {
          ...prev,
          pockets: updatedPockets,
          transactions: [transaction, ...prev.transactions],
        };
      });
    },
    []
  );

  const addPocket = useCallback((name: string, target: number, color = 'blue'): Pocket => {
    const newPocket: Pocket = {
      id: generateId(),
      name: name.trim(),
      target: Math.max(0, target),
      balance: 0,
      color,
    };

    setState((prev) => ({
      ...prev,
      pockets: [...prev.pockets, newPocket],
    }));

    return newPocket;
  }, []);

  const editPocket = useCallback((id: string, name: string, target: number, color?: string) => {
    setState((prev) => ({
      ...prev,
      pockets: prev.pockets.map((p) =>
        p.id === id
          ? {
              ...p,
              name: name.trim() || p.name,
              target: target !== undefined ? Math.max(0, target) : p.target,
              color: color || p.color,
            }
          : p
      ),
    }));
  }, []);

  const allocateToPocket = useCallback((pocketId: string, amount: number) => {
    setState((prev) => {
      const pocket = prev.pockets.find((p) => p.id === pocketId);
      if (!pocket) throw new Error('Kantong tidak ditemukan!');
      if (prev.mainBalance < amount) throw new Error('Saldo utama tidak mencukupi!');

      const transaction: Transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        description: `Alokasi ke ${pocket.name}`,
        type: 'transfer_out',
        amount: Math.abs(amount),
        pocketId,
        recurring: false,
      };

      const updatedPockets = prev.pockets.map((p) =>
        p.id === pocketId ? { ...p, balance: p.balance + Math.abs(amount) } : p
      );

      return {
        ...prev,
        mainBalance: prev.mainBalance - Math.abs(amount),
        pockets: updatedPockets,
        transactions: [transaction, ...prev.transactions],
      };
    });
  }, []);

  const deletePocket = useCallback((id: string) => {
    setState((prev) => {
      const pocket = prev.pockets.find((p) => p.id === id);
      if (!pocket) return prev;

      let newMainBalance = prev.mainBalance;
      const newTransactions = [...prev.transactions];

      // Refund remaining balance to main balance
      if (pocket.balance > 0) {
        newMainBalance += pocket.balance;
        newTransactions.unshift({
          id: generateId(),
          date: new Date().toISOString(),
          description: `Refund dari ${pocket.name}`,
          type: 'transfer_in',
          amount: pocket.balance,
          recurring: false,
        });
      }

      return {
        ...prev,
        mainBalance: newMainBalance,
        pockets: prev.pockets.filter((p) => p.id !== id),
        transactions: newTransactions,
      };
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((t) => t.id !== id),
    }));
  }, []);

  const setNotepadContent = useCallback((content: string) => {
    setState((prev) => ({
      ...prev,
      notepadContent: content,
    }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        darkMode: !prev.settings.darkMode,
      },
    }));
  }, []);

  const setLanguage = useCallback((language: 'id' | 'en') => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        language,
      },
    }));
  }, []);

  const resetData = useCallback(() => {
    setState(defaultState);
  }, []);

  const importData = useCallback((jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || !Array.isArray(parsed.pockets) || !Array.isArray(parsed.transactions)) {
        throw new Error('Format JSON tidak valid');
      }
      setState({
        mainBalance: Number(parsed.mainBalance) || 0,
        pockets: parsed.pockets,
        transactions: parsed.transactions,
        notepadContent: parsed.notepadContent || '',
        settings: {
          darkMode: Boolean(parsed.settings?.darkMode),
          language: parsed.settings?.language === 'en' ? 'en' : 'id',
        },
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }, []);

  const exportData = useCallback(() => {
    const filename = `aturduit_backup_${new Date().toISOString().slice(0, 10)}`;
    downloadJSON(state, filename);
  }, [state]);

  return (
    <AppContext.Provider
      value={{
        state,
        totalPocketsBalance,
        totalGlobalBalance,
        stats,
        addIncome,
        addExpense,
        addPocket,
        editPocket,
        allocateToPocket,
        deletePocket,
        deleteTransaction,
        setNotepadContent,
        toggleDarkMode,
        setLanguage,
        resetData,
        importData,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

