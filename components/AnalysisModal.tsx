import React, { useState, useEffect } from 'react';
import { Player, Transaction, Currency } from '../types';
import { getDetailedGameAnalysis } from '../services/geminiService';
import Button from './Button';

interface AnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  transactions: Transaction[];
  currency: Currency;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ 
  isOpen, 
  onClose, 
  players, 
  transactions,
  currency 
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    const result = await getDetailedGameAnalysis(players, transactions);
    if (result) {
      setAnalysis(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatMoney = (amount: number) => {
    const displayVal = (amount ?? 0).toLocaleString('en-US');
    return currency.position === 'prefix' ? `${currency.symbol}${displayVal}` : `${displayVal}${currency.symbol}`;
  };

  const totalWealth = players.reduce((sum, p) => sum + p.balance, 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden backdrop-blur-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-cyan-500/5 relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-pulse">🧠</span>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight leading-none">Game Intelligence</h3>
              <p className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] mt-2">Neural Analysis Active</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-all p-2 rounded-full hover:bg-white/5 active:scale-90">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
              </div>
              <p className="text-cyan-400 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Scanning Transaction Logs...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Wealth Distribution Visualization */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Wealth Distribution</label>
                <div className="h-6 w-full flex rounded-full overflow-hidden border border-white/5 shadow-inner">
                  {players.map((p, idx) => {
                    const percentage = totalWealth > 0 ? (p.balance / totalWealth) * 100 : 0;
                    return (
                      <div 
                        key={p.id} 
                        style={{ width: `${Math.max(percentage, 2)}%` }} 
                        className={`${p.color.replace('bg-', 'bg-')} h-full relative group transition-all duration-1000`}
                        title={`${p.name}: ${Math.round(percentage)}%`}
                      />
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {players.map(p => (
                    <div key={p.id} className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                      <span className="text-lg">{p.avatar}</span>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 truncate w-20">{p.name}</span>
                        <span className="text-xs font-black text-white">{Math.round((p.balance / totalWealth) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-3xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Game Sentiment</h4>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{analysis.sentiment}"</p>
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-3xl border border-white/5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">Target Intel</h4>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{analysis.targetIntel}"</p>
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-[2rem] space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚔️</span>
                  <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Battle Plan</h4>
                </div>
                <ul className="space-y-3">
                  {analysis.advice.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-300 font-medium">
                      <span className="text-indigo-500 font-black">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-600 font-bold uppercase tracking-widest text-sm">
              Analysis failed. Try again after a few transactions.
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 flex gap-3">
          <Button variant="ghost" fullWidth onClick={onClose} className="rounded-2xl py-4">Close Link</Button>
          <Button 
            onClick={fetchAnalysis} 
            disabled={loading} 
            fullWidth 
            className="bg-cyan-600 rounded-2xl py-4 font-black shadow-lg shadow-cyan-500/20"
          >
            Re-Sync Analysis
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;