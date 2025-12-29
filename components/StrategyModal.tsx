
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { getStrategyAdvice } from '../services/geminiService';
import Button from './Button';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
}

const StrategyModal: React.FC<StrategyModalProps> = ({ isOpen, onClose, players }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getStrategyAdvice(players);
    setAdvice(result);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdvice();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden backdrop-blur-2xl">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-purple-500/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔮</span>
            <h3 className="text-xl font-black text-white tracking-tight">AI Strategy Advisor</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center py-12 space-y-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-purple-300 font-bold animate-pulse">Analyzing board position...</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap italic">
                "{advice}"
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 flex gap-3">
            <Button variant="ghost" fullWidth onClick={onClose} className="rounded-2xl py-3">Close</Button>
            <Button 
              onClick={fetchAdvice} 
              disabled={loading}
              className="bg-purple-600 rounded-2xl py-3 flex-1 font-black shadow-lg shadow-purple-500/20"
            >
              Refresh Analysis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyModal;
