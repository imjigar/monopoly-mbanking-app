import React from 'react';
import HistoryLog from './HistoryLog';
import { Transaction, Player, Currency } from '../types';

interface HistoryLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  players: Player[];
  currency: Currency;
  onToggleTransaction: (id: string) => void;
}

const HistoryLogModal: React.FC<HistoryLogModalProps> = ({ 
  isOpen, 
  onClose, 
  transactions, 
  players, 
  currency,
  onToggleTransaction
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden h-[70vh] flex flex-col">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="font-bold text-slate-100">Transaction History</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-4 bg-slate-900/50">
          <HistoryLog 
            transactions={transactions} 
            players={players} 
            currency={currency} 
            onToggleTransaction={onToggleTransaction}
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryLogModal;