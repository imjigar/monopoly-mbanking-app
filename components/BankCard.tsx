
import React from 'react';
import { Currency } from '../types';

interface BankCardProps {
  currency: Currency;
  onDragStart: (e: React.PointerEvent, id: string) => void;
  className?: string;
}

const BankCard: React.FC<BankCardProps> = ({ currency, onDragStart, className = '' }) => {
  return (
    <div 
      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group touch-none select-none z-10 ${className}`}
      onPointerDown={(e) => onDragStart(e, 'BANK')}
      data-id="BANK"
    >
      {/* Outer Holographic Rings */}
      <div className="absolute inset-0 -m-8 border border-cyan-500/20 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none"></div>
      <div className="absolute inset-0 -m-4 border-2 border-dashed border-cyan-400/10 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none"></div>
      
      {/* Central Glow */}
      <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/40 transition-all duration-500 animate-pulse pointer-events-none"></div>
      
      {/* Main Vault Hub */}
      <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full glass-panel border-[3px] md:border-[5px] border-white/10 shadow-[0_0_60px_rgba(8,145,178,0.3)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-active:scale-95 cursor-grab active:cursor-grabbing overflow-hidden">
        
        {/* Radar Line Scan */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-1/2 w-full animate-[scan_3s_linear_infinite]"></div>

        <div className="w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/80 to-black/90 relative z-10">
          <div className="text-5xl md:text-7xl mb-2 filter drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] group-hover:rotate-12 transition-transform duration-500">🏦</div>
          <div className="flex flex-col items-center">
            {/* Added pl-[0.4em] to balance the tracking-[0.4em] offset for perfect centering */}
            <span className="text-[10px] md:text-xs font-black text-cyan-400 uppercase tracking-[0.4em] pl-[0.4em] mb-1 text-center">Central Vault</span>
            <div className="h-[2px] w-8 bg-cyan-500/50 rounded-full"></div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>
    </div>
  );
};

export default BankCard;
