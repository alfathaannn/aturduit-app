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
  addIncome: (amount: number, description: string, date?: string) => void;
  addExpense: (amount: number, description: string, pocketId: string, date?: string) => void;
  addPocket: (name: string, target: number, color?: string) => Pocket;
  editPocket: (id: string, name: string, target: number, color?: string) => void;
  movePocket: (id: string, direction: 'up' | 'down') => void;
  allocateToPocket: (pocketId: string, amount: number) => void;
  transferFromPocket: (fromPocketId: string, targetId: string, amount: number) => void;
  deletePocket: (id: string) => void;
  deleteTransaction: (id: string) => void;
  voidTransaction: (id: string) => void;
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

  // Sync Dark Mode class to <html> & Status Bar meta tags for Android / Webview / iOS
  useEffect(() => {
    const isDark = state.settings.darkMode;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Dynamic theme-color meta tag for Android / Nativefy Webview status bar contrast
    const themeColor = isDark ? '#191d24' : '#eef2f6';
    let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', themeColor);

    // Dynamic Apple status bar style (default = dark icons on light bg; black-translucent = white icons on dark bg)
    let metaApple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement | null;
    if (metaApple) {
      metaApple.setAttribute('content', isDark ? 'black-translucent' : 'default');
    }
  }, [state.settings.darkMode]);

  const totalPocketsBalance = state.pockets.reduce((acc, p) => acc + (p.balance || 0), 0);
  const totalGlobalBalance = state.mainBalance + totalPocketsBalance;

  const stats = {
    income: state.transactions
      .filter((t) => !t.voided && t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0),
    expense: state.transactions
      .filter((t) => !t.voided && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0),
  };

  const addIncome = useCallback(
    (amount: number, description: string, date?: string) => {
      const transaction: Transaction = {
        id: generateId(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        description: description.trim(),
        type: 'income',
        amount: Math.abs(amount),
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
    (amount: number, description: string, pocketId: string, date?: string) => {
      const numericAmount = Math.abs(amount);
      const isEn = state.settings.language === 'en';
      if (!numericAmount || numericAmount <= 0) {
        throw new Error(isEn ? 'Invalid expense amount!' : 'Nominal pengeluaran tidak valid!');
      }

      const pocket = state.pockets.find((p) => p.id === pocketId);
      if (!pocket) {
        throw new Error(isEn ? 'Pocket not found!' : 'Kantong tidak ditemukan!');
      }
      if (pocket.balance < numericAmount) {
        throw new Error(
          isEn
            ? `Insufficient balance in "${pocket.name}"! (Available: Rp ${pocket.balance.toLocaleString('id-ID')})`
            : `Saldo kantong "${pocket.name}" tidak mencukupi! (Tersedia: Rp ${pocket.balance.toLocaleString('id-ID')})`
        );
      }

      const transaction: Transaction = {
        id: generateId(),
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        description: description.trim(),
        type: 'expense',
        amount: numericAmount,
        pocketId,
      };

      setState((prev) => {
        const currentPocket = prev.pockets.find((p) => p.id === pocketId);
        if (!currentPocket || currentPocket.balance < numericAmount) {
          return prev;
        }

        const updatedPockets = prev.pockets.map((p) =>
          p.id === pocketId ? { ...p, balance: p.balance - numericAmount } : p
        );

        return {
          ...prev,
          pockets: updatedPockets,
          transactions: [transaction, ...prev.transactions],
        };
      });
    },
    [state.pockets, state.settings.language]
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

  const movePocket = useCallback((id: string, direction: 'up' | 'down') => {
    setState((prev) => {
      const index = prev.pockets.findIndex((p) => p.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.pockets.length) return prev;

      const updated = [...prev.pockets];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return { ...prev, pockets: updated };
    });
  }, []);

  const allocateToPocket = useCallback(
    (pocketId: string, amount: number) => {
      const numericAmount = Math.abs(amount);
      const isEn = state.settings.language === 'en';
      if (!numericAmount || numericAmount <= 0) {
        throw new Error(isEn ? 'Invalid allocation amount!' : 'Nominal alokasi tidak valid!');
      }

      const pocket = state.pockets.find((p) => p.id === pocketId);
      if (!pocket) {
        throw new Error(isEn ? 'Pocket not found!' : 'Kantong tidak ditemukan!');
      }
      if (state.mainBalance < numericAmount) {
        throw new Error(isEn ? 'Insufficient main balance!' : 'Saldo utama tidak mencukupi!');
      }

      setState((prev) => {
        const currentPocket = prev.pockets.find((p) => p.id === pocketId);
        if (!currentPocket || prev.mainBalance < numericAmount) return prev;

        const transaction: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          description: `Alokasi ke ${currentPocket.name}`,
          type: 'transfer_out',
          amount: numericAmount,
          pocketId,
        };

        const updatedPockets = prev.pockets.map((p) =>
          p.id === pocketId ? { ...p, balance: p.balance + numericAmount } : p
        );

        return {
          ...prev,
          mainBalance: prev.mainBalance - numericAmount,
          pockets: updatedPockets,
          transactions: [transaction, ...prev.transactions],
        };
      });
    },
    [state.pockets, state.mainBalance, state.settings.language]
  );

  const transferFromPocket = useCallback(
    (fromPocketId: string, targetId: string, amount: number) => {
      const numericAmount = Math.abs(amount);
      if (!numericAmount || numericAmount <= 0) {
        throw new Error('Nominal transfer tidak valid!');
      }

      const fromPocket = state.pockets.find((p) => p.id === fromPocketId);
      if (!fromPocket) throw new Error('Kantong asal tidak ditemukan!');
      if (fromPocket.balance < numericAmount) {
        throw new Error(`Saldo kantong "${fromPocket.name}" tidak mencukupi!`);
      }

      const isToMain = targetId === '__MAIN__';
      const toPocket = !isToMain ? state.pockets.find((p) => p.id === targetId) : undefined;
      if (!isToMain && !toPocket) {
        throw new Error('Kantong tujuan tidak ditemukan!');
      }

      setState((prev) => {
        const src = prev.pockets.find((p) => p.id === fromPocketId);
        if (!src || src.balance < numericAmount) return prev;

        const targetName = isToMain
          ? prev.settings.language === 'en'
            ? 'Main Balance'
            : 'Saldo Utama'
          : prev.pockets.find((p) => p.id === targetId)?.name || '';

        const transaction: Transaction = {
          id: generateId(),
          date: new Date().toISOString(),
          description: `Transfer ${src.name} → ${targetName}`,
          type: isToMain ? 'transfer_in' : 'transfer_out',
          amount: numericAmount,
          sourcePocketId: fromPocketId,
          pocketId: isToMain ? undefined : targetId,
        };

        const updatedPockets = prev.pockets.map((p) => {
          if (p.id === fromPocketId) return { ...p, balance: p.balance - numericAmount };
          if (!isToMain && p.id === targetId) return { ...p, balance: p.balance + numericAmount };
          return p;
        });

        return {
          ...prev,
          mainBalance: isToMain ? prev.mainBalance + numericAmount : prev.mainBalance,
          pockets: updatedPockets,
          transactions: [transaction, ...prev.transactions],
        };
      });
    },
    [state.pockets]
  );

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

  const voidTransaction = useCallback(
    (id: string) => {
      const tx = state.transactions.find((t) => t.id === id);
      if (!tx || tx.voided) return;

      const isEn = state.settings.language === 'en';

      if (tx.type === 'income' || tx.type === 'transfer_in') {
        if (state.mainBalance < tx.amount) {
          throw new Error(
            isEn
              ? 'Insufficient main balance to void this income/refund transaction!'
              : 'Saldo utama tidak mencukupi untuk membatalkan transaksi pemasukan/refund ini!'
          );
        }
      } else if (tx.type === 'transfer_out') {
        const pocket = state.pockets.find((p) => p.id === tx.pocketId);
        if (!pocket) {
          throw new Error(
            isEn
              ? 'Target pocket no longer exists, cannot reverse transfer.'
              : 'Kantong tujuan sudah dihapus, transfer tidak dapat dibatalkan.'
          );
        }
        if (pocket.balance < tx.amount) {
          throw new Error(
            isEn
              ? `Insufficient balance in "${pocket.name}" to void this transfer!`
              : `Saldo di kantong "${pocket.name}" tidak mencukupi untuk membatalkan transfer ini!`
          );
        }
      }

      setState((prev) => {
        const currentTx = prev.transactions.find((t) => t.id === id);
        if (!currentTx || currentTx.voided) return prev;

        let newMainBalance = prev.mainBalance;
        let newPockets = prev.pockets;

        if (currentTx.type === 'expense') {
          const targetPocketExists = currentTx.pocketId
            ? prev.pockets.some((p) => p.id === currentTx.pocketId)
            : false;

          if (targetPocketExists) {
            newPockets = prev.pockets.map((p) =>
              p.id === currentTx.pocketId ? { ...p, balance: p.balance + currentTx.amount } : p
            );
          } else {
            newMainBalance += currentTx.amount;
          }
        } else if (currentTx.type === 'income') {
          newMainBalance = Math.max(0, prev.mainBalance - currentTx.amount);
        } else if (currentTx.type === 'transfer_in') {
          newMainBalance = Math.max(0, prev.mainBalance - currentTx.amount);
          if (currentTx.sourcePocketId) {
            newPockets = prev.pockets.map((p) =>
              p.id === currentTx.sourcePocketId
                ? { ...p, balance: p.balance + currentTx.amount }
                : p
            );
          }
        } else if (currentTx.type === 'transfer_out') {
          if (currentTx.sourcePocketId) {
            // Pocket-to-pocket transfer: reverse from pocketId back to sourcePocketId
            const sourceExists = prev.pockets.some((p) => p.id === currentTx.sourcePocketId);
            newPockets = prev.pockets.map((p) => {
              if (p.id === currentTx.pocketId) {
                return { ...p, balance: Math.max(0, p.balance - currentTx.amount) };
              }
              if (p.id === currentTx.sourcePocketId) {
                return { ...p, balance: p.balance + currentTx.amount };
              }
              return p;
            });
            if (!sourceExists) {
              newMainBalance += currentTx.amount;
            }
          } else {
            // Allocation from Main Balance to Pocket
            newPockets = prev.pockets.map((p) =>
              p.id === currentTx.pocketId
                ? { ...p, balance: Math.max(0, p.balance - currentTx.amount) }
                : p
            );
            newMainBalance += currentTx.amount;
          }
        }

        const updatedTransactions = prev.transactions.map((t) =>
          t.id === id ? { ...t, voided: true, voidedAt: new Date().toISOString() } : t
        );

        return {
          ...prev,
          mainBalance: newMainBalance,
          pockets: newPockets,
          transactions: updatedTransactions,
        };
      });
    },
    [state.transactions, state.mainBalance, state.pockets, state.settings.language]
  );

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
        movePocket,
        allocateToPocket,
        transferFromPocket,
        deletePocket,
        deleteTransaction,
        voidTransaction,
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

