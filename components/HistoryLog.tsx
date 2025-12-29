
import React, { useRef } from 'react';
import { Transaction, Player, TransactionType, Currency } from '../types';

interface HistoryLogProps {
  transactions: Transaction[];
  players: Player[];
  currency: Currency;
  onToggleTransaction: (id: string) => void;
}

const HistoryLog: React.FC<HistoryLogProps> = ({ transactions, players, currency, onToggleTransaction }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getPlayer = (id: string) => {
    if (id === 'BANK') return { name: 'Bank', avatar: '🏛️' };
    const p = players.find(p => p.id === id);
    return p ? { name: p.name, avatar: p.avatar } : { name: 'Unknown', avatar: '❓' };
  };

  const formatMoney = (amount: number) => {
    const displayVal = (amount ?? 0).toLocaleString('en-US');
    return currency.position === 'prefix' ? `${currency.symbol}${displayVal}` : `${displayVal}${currency.symbol}`;
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center">
        <span className="text-4xl mb-2 opacity-30">📜</span>
        <p className="text-sm">No transactions yet.</p>
      </div>
    );
  }

  const displayTransactions = [...transactions].reverse();

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto space-y-3 pr-2 custom-scrollbar">
      {displayTransactions.map((tx) => {
        const isDeposit = tx.toId !== 'BANK' && tx.fromId === 'BANK';
        const isPayment = tx.fromId !== 'BANK' && tx.toId === 'BANK';
        
        const fromPlayer = getPlayer(tx.fromId);
        const toPlayer = getPlayer(tx.toId);
        
        let icon = '';
        let colorClass = 'text-slate-300';
        
        if (tx.type === TransactionType.PASS_GO) {
          icon = '🏁';
          colorClass = 'text-emerald-400';
        } else if (isDeposit) {
          icon = '🏦';
          colorClass = 'text-emerald-400';
        } else if (isPayment) {
          icon = '📉';
          colorClass = 'text-red-400';
        } else {
            icon = '💸';
        }

        const isReverted = tx.isReverted;

        return (
          <div 
            key={tx.id} 
            className={`rounded-lg p-3 border transition-all ${
              isReverted 
                ? 'bg-red-900/10 border-red-500/20 opacity-60' 
                : 'bg-slate-800/50 border-slate-700/50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                 <span className={`text-lg ${isReverted ? 'grayscale' : ''}`}>{icon}</span>
                 {isReverted && <span className="text-xs font-bold text-red-500 uppercase tracking-wider border border-red-500/50 px-1 rounded">Undone</span>}
              </div>
               <span className={`font-mono font-bold ${isReverted ? 'line-through text-slate-500' : colorClass}`}>
                 {formatMoney(tx.amount)}
               </span>
            </div>
            
            <div className={`flex items-center justify-between p-2 rounded ${isReverted ? 'bg-black/20 text-slate-500' : 'text-slate-300 bg-slate-900/50'}`}>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-base">{fromPlayer.avatar}</span>
                <span className="truncate">{fromPlayer.name}</span>
              </div>
              <span className="text-slate-600 px-1">➜</span>
              <div className="flex items-center gap-1.5 overflow-hidden justify-end">
                <span className="truncate">{toPlayer.name}</span>
                <span className="text-base">{toPlayer.avatar}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
               <span className="text-[10px] text-slate-600">
                {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              <button 
                onClick={() => onToggleTransaction(tx.id)}
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  isReverted
                    ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                    : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30'
                }`}
              >
                {isReverted ? 'Redo' : 'Undo'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HistoryLog;
