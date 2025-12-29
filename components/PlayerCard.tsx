
import React from 'react';
import { Player, Currency } from '../types';
import { PLAYER_COLORS, PLAYER_BORDER_COLORS } from '../constants';
import { ThemeColor } from '../types';

interface PlayerCardProps {
  player: Player;
  currency: Currency;
  onEditName: (name: string) => void;
  onDragStart: (e: React.PointerEvent, id: string) => void;
  onDeleteClick: (id: string) => void;
  showDeleteButton?: boolean;
  deleteProgress?: number; // 0 to 100
  style?: React.CSSProperties;
  className?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ 
  player, 
  currency, 
  onEditName, 
  onDragStart, 
  onDeleteClick,
  showDeleteButton = false,
  deleteProgress = 0,
  style, 
  className = '' 
}) => {
  const colorKey = player.color as ThemeColor;
  
  const borderColor = PLAYER_BORDER_COLORS[colorKey] || 'border-slate-500';
  const glowColor = PLAYER_COLORS[colorKey] || 'bg-slate-500';

  const formatMoney = (amount: number) => {
    const displayVal = (amount ?? 0).toLocaleString('en-US');
    return currency.position === 'prefix' 
      ? `${currency.symbol}${displayVal}`
      : `${displayVal}${currency.symbol}`;
  };

  const isActivating = deleteProgress > 0 && deleteProgress < 100;
  const jiggleClass = showDeleteButton ? 'animate-jiggle' : '';

  return (
    <div 
      className={`absolute flex flex-col items-center touch-none select-none group cursor-grab active:cursor-grabbing ${className} ${jiggleClass}`}
      style={{
        ...style,
        transform: 'translate(-50%, -50%)',
        width: 'max-content',
        transition: isActivating ? 'none' : (style?.transition || 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'),
        zIndex: showDeleteButton ? 100 : style?.zIndex
      }}
      onPointerDown={(e) => onDragStart(e, player.id)}
      data-id={player.id}
    >
      {/* Player Aura Ring */}
      <div className={`absolute inset-0 w-32 h-32 md:w-44 md:h-44 -translate-y-8 md:-translate-y-12 blur-2xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none ${glowColor}`}></div>

      {/* Avatar Circle */}
      <div 
        className={`relative w-28 h-28 md:w-40 md:h-40 rounded-full border-[6px] md:border-[8px] ${borderColor} shadow-[0_0_40px_rgba(0,0,0,0.8)] z-20 flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-black overflow-hidden group-active:scale-90 transition-transform`}
      >
        {/* Animated Inner Shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>

        {/* Activation Progress Ring */}
        {isActivating && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <svg className="w-full h-full rotate-[-90deg]">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="transparent"
                stroke="rgba(34, 211, 238, 0.8)"
                strokeWidth="10"
                strokeDasharray="301.6"
                strokeDashoffset={301.6 - (301.6 * deleteProgress) / 100}
                className="transition-all duration-75 ease-linear"
              />
            </svg>
          </div>
        )}

        {/* Delete Button (X) */}
        {showDeleteButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(player.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            className="absolute -top-3 -right-3 w-12 h-12 md:w-16 md:h-16 bg-red-600 border-4 border-slate-900 rounded-full flex items-center justify-center text-white shadow-2xl z-[120] hover:bg-red-500 hover:scale-110 active:scale-90 transition-all animate-pop-in pointer-events-auto"
          >
            <svg className="w-7 h-7 md:w-9 md:h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <div className="absolute inset-0 rounded-full bg-radial-gradient(circle, transparent 70%, rgba(0,0,0,0.4)) pointer-events-none"></div>
        <div className={`absolute -inset-2 rounded-full opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-300 ${glowColor} animate-pulse`}></div>
        
        <span className="text-6xl md:text-8xl relative z-10 filter drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] select-none leading-none transform group-hover:scale-110 transition-transform">
          {player.avatar}
        </span>
        
        {player.isBankrupt && (
          <div className="absolute inset-0 bg-black/90 rounded-full flex flex-col items-center justify-center z-40 border-4 border-red-600 animate-in fade-in duration-500">
            <span className="text-5xl md:text-7xl">💀</span>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-2">Eliminated</span>
          </div>
        )}
      </div>

      {/* Info HUD */}
      <div className={`mt-4 flex flex-col items-center z-30 filter drop-shadow-2xl transition-all duration-300 ${showDeleteButton ? 'opacity-20 blur-[2px] scale-90' : 'opacity-100'}`}>
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-t-2xl px-5 py-2 text-[11px] md:text-xs text-white/70 font-black text-center w-28 md:w-36 border-b border-white/10 truncate tracking-[0.2em] uppercase">
          {player.name}
        </div>
        <div className={`bg-black/80 backdrop-blur-xl border border-t-0 border-white/10 rounded-b-2xl px-6 py-2.5 min-w-[7rem] md:min-w-[10rem] text-center shadow-2xl transition-colors duration-300 ${player.balance < 0 ? 'border-red-500/50 bg-red-950/20' : 'border-emerald-500/20'}`}>
          <span className={`text-base md:text-2xl font-black font-mono-tech tracking-tighter ${player.balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {formatMoney(player.balance)}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes jiggle {
          0% { transform: translate(-50%, -50%) rotate(-1deg); }
          50% { transform: translate(-50%, -50%) rotate(1deg); }
          100% { transform: translate(-50%, -50%) rotate(-1deg); }
        }
        @keyframes pop-in {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-jiggle { animation: jiggle 0.4s infinite ease-in-out; }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default PlayerCard;
