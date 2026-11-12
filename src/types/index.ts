export type TransactionType = 'income' | 'expense' | 'transfer_out' | 'transfer_in';

export interface Pocket {
  id: string;
  name: string;
  target: number;
  balance: number;
  color: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  type: TransactionType;
  amount: number;
  pocketId?: string;
  recurring?: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  language: 'id' | 'en';
}

export interface AppState {
  mainBalance: number;
  pockets: Pocket[];
  transactions: Transaction[];
  notepadContent: string;
  settings: AppSettings;
}

export type ActiveTab = 'dashboard' | 'pockets' | 'history' | 'notepad' | 'settings';

export type CashflowFilterType = '7days' | '1month' | '6months' | '1year' | 'all' | 'custom';

export interface CashflowFilterConfig {
  type: CashflowFilterType;
  startDate?: string;
  endDate?: string;
}

