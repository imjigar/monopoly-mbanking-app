
import React, { useState, useEffect } from 'react';
import { Player, TransactionType, Currency } from '../types';
import Button from './Button';

interface TransactionModalProps {
  isOpen: boolean;
  initialFromId?: string;
  initialToId?: string;
  onClose: () => void;
  players: Player[];
  currency: Currency;
  passGoAmount: number;
  onTransaction: (type: TransactionType, fromId: string, toId: string, amount: number) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ 
  isOpen, 
  initialFromId, 
  initialToId, 
  onClose, 
  players, 
  currency,
  passGoAmount,
  onTransaction 
}) => {
  const [activeTab, setActiveTab] = useState<'transfer' | 'bank' | 'go'>('transfer');
  
  const [fromId, setFromId] = useState<string>('');
  const [toId, setToId] = useState<string>('');
  const [amount, setAmount] = useState<string>(''); 

  const [bankPlayerId, setBankPlayerId] = useState<string>('');
  const [bankAction, setBankAction] = useState<'pay' | 'receive'>('pay');

  useEffect(() => {
    if (isOpen) {
      if (initialFromId === 'BANK' && initialToId && initialToId !== 'BANK') {
        setActiveTab('bank');
        setBankAction('receive');
        setBankPlayerId(initialToId);
      } else if (initialToId === 'BANK' && initialFromId && initialFromId !== 'BANK') {
        setActiveTab('bank');
        setBankAction('pay');
        setBankPlayerId(initialFromId);
      } else if (initialFromId && initialToId && initialFromId !== 'BANK' && initialToId !== 'BANK') {
        setActiveTab('transfer');
        setFromId(initialFromId);
        setToId(initialToId);
      } else {
        setActiveTab('transfer');
        setFromId('');
        setToId('');
        setBankPlayerId('');
      }
      setAmount('');
    }
  }, [isOpen, initialFromId, initialToId]);

  if (!isOpen) return null;

  const parseValue = (val: string): number => {
    let str = val.toLowerCase().replace(/,/g, '').trim();
    if (!str) return 0;

    let multiplier = 1;
    if (str.endsWith('m')) {
      multiplier = 1000000;
      str = str.slice(0, -1);
    } else if (str.endsWith('k')) {
      multiplier = 1000;
      str = str.slice(0, -1);
    }

    const num = parseFloat(str);
    return isNaN(num) ? 0 : Math.floor(num * multiplier);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseValue(amount);
    if (fromId && toId && numericAmount > 0 && fromId !== toId) {
      onTransaction(TransactionType.TRANSFER, fromId, toId, numericAmount);
      onClose();
    }
  };

  const handleBankTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseValue(amount);
    if (bankPlayerId && numericAmount > 0) {
      if (bankAction === 'pay') {
        onTransaction(TransactionType.BANK_DEPOSIT, bankPlayerId, 'BANK', numericAmount);
      } else {
        onTransaction(TransactionType.BANK_WITHDRAWAL, 'BANK', bankPlayerId, numericAmount);
      }
      onClose();
    }
  };

  const handlePassGo = () => {
    if (bankPlayerId) {
      onTransaction(TransactionType.PASS_GO, 'BANK', bankPlayerId, passGoAmount);
      onClose();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow numeric, dots, commas, and k/m shorthand
    if (/^[0-9.,kmKM]*$/.test(val)) {
      setAmount(val);
    }
  };

  const formatMoneyDisplay = (amount: number) => {
    const displayVal = (amount ?? 0).toLocaleString('en-US');
    return currency.position === 'prefix' ? `${currency.symbol}${displayVal}` : `${displayVal}${currency.symbol}`;
  };

  const formatFullAmountPreview = (amount: number) => {
    const displayVal = (amount ?? 0).toLocaleString('en-US');
    return currency.position === 'prefix' 
      ? `${currency.symbol}${displayVal}` 
      : `${displayVal}${currency.symbol}`;
  };

  const appendUnit = (unit: 'K' | 'M') => {
    const cleanAmount = amount.toUpperCase();
    if (!cleanAmount.endsWith('K') && !cleanAmount.endsWith('M')) {
      setAmount(amount + unit);
    } else {
      setAmount(amount.slice(0, -1) + unit);
    }
  };

  const renderAmountInput = (value: string, setter: (v: string) => void) => {
    const numericValue = parseValue(value);
    
    return (
      <div className="space-y-4">
        <label className="block text-xs font-black text-blue-300 uppercase tracking-widest">Amount</label>
        <div className="relative group">
          <input 
            type="text" 
            inputMode="numeric"
            value={value} 
            onChange={handleAmountChange}
            className="w-full bg-black/40 border-2 border-white/10 text-white rounded-[1.5rem] p-6 text-5xl font-mono text-center focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 outline-none transition-all shadow-inner uppercase placeholder:opacity-20" 
            placeholder="0" 
            required 
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            <button 
              type="button" 
              onClick={() => appendUnit('K')} 
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-4 py-2 rounded-xl text-sm shadow-lg transition-transform active:scale-90 border border-white/10"
            >
              K
            </button>
            <button 
              type="button" 
              onClick={() => appendUnit('M')} 
              className="bg-purple-600 hover:bg-purple-500 text-white font-black px-4 py-2 rounded-xl text-sm shadow-lg transition-transform active:scale-90 border border-white/10"
            >
              M
            </button>
          </div>
        </div>
        
        {numericValue > 0 && (
          <div className="flex justify-center">
            <div className="bg-cyan-500/10 border-2 border-cyan-500/30 px-6 py-2 rounded-full animate-in fade-in slide-in-from-top-2 duration-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <span className="text-base font-black text-cyan-400">
                Resolved: {formatFullAmountPreview(numericValue)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 200, 500].map(amt => (
            <button 
              key={amt} 
              type="button" 
              onClick={() => setter(amt.toString())} 
              className="bg-white/5 hover:bg-white/10 text-blue-200 font-black py-4 rounded-xl border border-white/5 transition-all active:bg-cyan-500/20 text-sm"
            >
              {amt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderPlayerSelect = (value: string, onChange: (val: string) => void, excludeId?: string, label?: string) => (
    <div className="space-y-2">
      {label && <label className="block text-xs font-black text-blue-300 uppercase tracking-widest">{label}</label>}
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/40 border-2 border-white/10 text-white rounded-2xl p-5 pl-14 appearance-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500/50 outline-none transition-all backdrop-blur-sm cursor-pointer"
          required
        >
          <option value="" className="bg-slate-900">Select Player</option>
          {players.filter(p => p.id !== excludeId).map(p => (
            <option key={p.id} value={p.id} className="bg-slate-900">{p.name} ({formatMoneyDisplay(p.balance)})</option>
          ))}
        </select>
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl pointer-events-none">
          {value ? players.find(p => p.id === value)?.avatar : '👤'}
        </div>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden backdrop-blur-2xl">
        
        {/* Modern Tab HUD */}
        <div className="flex bg-black/30 p-2 gap-1">
          {(['transfer', 'bank', 'go'] as const).map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)} 
              className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {tab === 'transfer' ? 'Transfer' : tab === 'bank' ? 'Bank' : 'Go'}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'transfer' && (
            <form onSubmit={handleTransfer} className="space-y-6">
              {renderPlayerSelect(fromId, setFromId, undefined, "Sender")}
              <div className="flex justify-center -my-3 relative z-10">
                <div className="bg-slate-800 rounded-full p-3 border-2 border-slate-700 shadow-xl text-cyan-400">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </div>
              </div>
              {renderPlayerSelect(toId, setToId, fromId, "Recipient")}
              {renderAmountInput(amount, setAmount)}
              <div className="pt-6 flex gap-4">
                <Button type="button" variant="ghost" fullWidth onClick={onClose} className="rounded-2xl py-4">Cancel</Button>
                <Button type="submit" fullWidth disabled={!fromId || !toId || parseValue(amount) <= 0} className="bg-cyan-600 rounded-2xl py-4 text-lg shadow-xl shadow-cyan-500/20">Send</Button>
              </div>
            </form>
          )}

          {activeTab === 'bank' && (
            <form onSubmit={handleBankTransaction} className="space-y-6">
              <div className="flex bg-black/40 rounded-[1.2rem] p-1.5 gap-1">
                {(['pay', 'receive'] as const).map(action => (
                  <button 
                    key={action}
                    type="button"
                    onClick={() => setBankAction(action)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      bankAction === action 
                        ? (action === 'pay' ? 'bg-red-500' : 'bg-emerald-500') + ' text-white shadow-lg'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    {action === 'pay' ? 'Pay Bank' : 'Collect'}
                  </button>
                ))}
              </div>
              {renderPlayerSelect(bankPlayerId, setBankPlayerId, undefined, "Select Player")}
              {renderAmountInput(amount, setAmount)}
              <div className="pt-6 flex gap-4">
                <Button type="button" variant="ghost" fullWidth onClick={onClose} className="rounded-2xl py-4">Cancel</Button>
                <Button 
                  type="submit" 
                  fullWidth 
                  disabled={!bankPlayerId || parseValue(amount) <= 0} 
                  className={`${bankAction === 'pay' ? "bg-red-500" : "bg-emerald-500"} rounded-2xl py-4 text-lg shadow-xl transition-colors`}
                >
                  {bankAction === 'pay' ? 'Pay Bank' : 'Receive Funds'}
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'go' && (
            <div className="space-y-8 text-center">
              <div className="bg-emerald-500/10 border-2 border-emerald-500/20 rounded-[2.5rem] p-10 space-y-4 shadow-inner">
                <div className="text-6xl animate-bounce">🏁</div>
                <h3 className="text-3xl font-black text-emerald-400">Collect {formatMoneyDisplay(passGoAmount)}</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Passed Go Reward</p>
              </div>
              {renderPlayerSelect(bankPlayerId, setBankPlayerId, undefined, "Player reaching GO")}
              <div className="pt-6 flex gap-4">
                <Button variant="ghost" fullWidth onClick={onClose} className="rounded-2xl py-4">Cancel</Button>
                <Button fullWidth onClick={handlePassGo} disabled={!bankPlayerId} className="bg-emerald-500 rounded-2xl py-4 text-lg shadow-xl shadow-emerald-500/20">Collect</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
