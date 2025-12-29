
import React, { useState, useEffect } from 'react';
import { GameSettings, Currency } from '../types';
import { CURRENCIES } from '../constants';
import Button from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  currency: Currency;
  onUpdateCurrency: (currency: Currency) => void;
  playerCount: number;
  onAddPlayer: () => void;
  onNewGame: () => void;
}

const parseMoneyInput = (val: string): number => {
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

const formatFullAmount = (amount: number, currency: Currency) => {
  const formatted = (amount ?? 0).toLocaleString('en-US');
  return currency.position === 'prefix' ? `${currency.symbol}${formatted}` : `${formatted}${currency.symbol}`;
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currency,
  onUpdateCurrency,
  playerCount,
  onAddPlayer,
  onNewGame
}) => {
  const [localBalance, setLocalBalance] = useState('');
  const [localGo, setLocalGo] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalBalance(settings.startingBalance.toString());
      setLocalGo(settings.passGoAmount.toString());
      setShowResetConfirm(false);
    }
  }, [isOpen, settings.startingBalance, settings.passGoAmount]);

  const commitChanges = () => {
    const newSettings = {
      startingBalance: parseMoneyInput(localBalance),
      passGoAmount: parseMoneyInput(localGo)
    };
    onUpdateSettings(newSettings);
    return newSettings;
  };

  const appendShorthand = (type: 'balance' | 'go', unit: 'K' | 'M') => {
    const current = type === 'balance' ? localBalance : localGo;
    const upper = current.toUpperCase();
    let newVal = '';
    if (!upper.endsWith('K') && !upper.endsWith('M')) {
      newVal = current + unit;
    } else {
      newVal = current.slice(0, -1) + unit;
    }
    
    if (type === 'balance') {
      setLocalBalance(newVal);
      onUpdateSettings({ ...settings, startingBalance: parseMoneyInput(newVal) });
    } else {
      setLocalGo(newVal);
      onUpdateSettings({ ...settings, passGoAmount: parseMoneyInput(newVal) });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚙️</span>
            <h3 className="text-xl font-black text-white tracking-tight">Game Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em]">Manage Roster</label>
              <span className="text-[10px] font-bold text-slate-500">{playerCount}/6 Players</span>
            </div>
            <Button 
              onClick={onAddPlayer} 
              disabled={playerCount >= 6}
              className={`rounded-2xl py-4 font-black w-full border-2 transition-all ${
                playerCount >= 6 ? 'bg-white/5 border-white/5 text-slate-600' : 'bg-white/5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
              }`}
            >
              {playerCount >= 6 ? 'Roster Full' : '+ Add Late Player'}
            </Button>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em]">Active Currency</label>
            <div className="grid grid-cols-4 gap-2">
              {CURRENCIES.map((c) => (
                <button 
                  key={c.name} 
                  onClick={() => onUpdateCurrency(c)} 
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    currency.name === c.name ? 'bg-cyan-500 border-cyan-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  <span className="text-lg font-black">{c.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em]">Initial Balance</label>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={localBalance}
                  onChange={(e) => setLocalBalance(e.target.value)}
                  onBlur={commitChanges}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-4 pl-6 pr-16 text-white font-mono focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all uppercase"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button type="button" onClick={() => appendShorthand('balance', 'K')} className="bg-white/10 px-2 py-1 rounded text-[10px] font-black hover:bg-white/20">K</button>
                  <button type="button" onClick={() => appendShorthand('balance', 'M')} className="bg-white/10 px-2 py-1 rounded text-[10px] font-black hover:bg-white/20">M</button>
                </div>
                <div className="absolute left-6 -bottom-5 text-[10px] font-black text-cyan-400 opacity-60">
                  Resolved: {formatFullAmount(parseMoneyInput(localBalance), currency)}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="text-xs font-black text-cyan-400 uppercase tracking-[0.2em]">Pass GO Amount</label>
              <div className="relative">
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={localGo}
                  onChange={(e) => setLocalGo(e.target.value)}
                  onBlur={commitChanges}
                  className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-4 pl-6 pr-16 text-white font-mono focus:ring-4 focus:ring-cyan-500/20 outline-none transition-all uppercase"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button type="button" onClick={() => appendShorthand('go', 'K')} className="bg-white/10 px-2 py-1 rounded text-[10px] font-black hover:bg-white/20">K</button>
                  <button type="button" onClick={() => appendShorthand('go', 'M')} className="bg-white/10 px-2 py-1 rounded text-[10px] font-black hover:bg-white/20">M</button>
                </div>
                <div className="absolute left-6 -bottom-5 text-[10px] font-black text-cyan-400 opacity-60">
                  Resolved: {formatFullAmount(parseMoneyInput(localGo), currency)}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <div className="border-t border-white/5 pt-6">
              {!showResetConfirm ? (
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all"
                >
                  Reset Protocol (New Session)
                </button>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest text-center">Confirm total wipe? This action is irreversible.</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={onNewGame}
                      className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20"
                    >
                      Confirm Wipe
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <Button variant="ghost" fullWidth onClick={onClose} className="rounded-2xl py-3 text-slate-400 hover:text-white">
              Back to Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
