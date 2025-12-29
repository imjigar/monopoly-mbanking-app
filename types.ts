
export interface Player {
  id: string;
  name: string;
  avatar: string;
  balance: number;
  color: string;
  isBankrupt: boolean;
}

export enum TransactionType {
  TRANSFER = 'TRANSFER',
  PASS_GO = 'PASS_GO',
  BANK_DEPOSIT = 'BANK_DEPOSIT', // Player pays Bank
  BANK_WITHDRAWAL = 'BANK_WITHDRAWAL' // Bank pays Player
}

export interface Transaction {
  id: string;
  timestamp: number;
  type: TransactionType;
  fromId: string | 'BANK'; // 'BANK' or player ID
  toId: string | 'BANK';   // 'BANK' or player ID
  amount: number;
  description?: string;
  isReverted?: boolean;
}

export interface GameState {
  players: Player[];
  transactions: Transaction[];
  gameStarted: boolean;
  currency: Currency;
  settings: GameSettings;
}

export interface GameSettings {
  startingBalance: number;
  passGoAmount: number;
}

export type ThemeColor = 
  | 'red' | 'orange' | 'amber' | 'yellow' 
  | 'lime' | 'green' | 'emerald' | 'teal' 
  | 'cyan' | 'sky' | 'blue' | 'indigo' 
  | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose';

export interface Currency {
  symbol: string;
  name: string;
  position: 'prefix' | 'suffix';
}
