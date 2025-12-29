
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player, Transaction, TransactionType, ThemeColor, Currency, GameSettings } from './types';
import { DEFAULT_STARTING_BALANCE, DEFAULT_PASS_GO_AMOUNT, PLAYER_COLORS, CURRENCIES, AVATARS } from './constants';
import PlayerCard from './components/PlayerCard';
import BankCard from './components/BankCard';
import TransactionModal from './components/TransactionModal';
import HistoryLogModal from './components/HistoryLogModal';
import Button from './components/Button';
import PlayerFormModal from './components/PlayerFormModal';
import SettingsModal from './components/SettingsModal';
import TransactionFeedback from './components/TransactionFeedback';
import CommandCenter from './components/CommandCenter';

const generateId = () => Math.random().toString(36).substr(2, 9);
const REVEAL_DELETE_THRESHOLD_MS = 600;
const STORAGE_KEY = 'bankair_state_v1';
const OLD_STORAGE_KEY = 'polybank_state_v3';

const parseMoneyInput = (val: string | number): number => {
  if (typeof val === 'number') return val;
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

const App: React.FC = () => {
  const [currency, setCurrency] = useState<Currency>(CURRENCIES[0]);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    startingBalance: DEFAULT_STARTING_BALANCE,
    passGoAmount: DEFAULT_PASS_GO_AMOUNT
  });

  const [setupBalanceInput, setSetupBalanceInput] = useState(DEFAULT_STARTING_BALANCE.toString());
  const [setupGoInput, setSetupGoInput] = useState(DEFAULT_PASS_GO_AMOUNT.toString());

  const [players, setPlayers] = useState<Player[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    initialFromId?: string;
    initialToId?: string;
  }>({ isOpen: false });
  
  const [isCommandCenterOpen, setIsCommandCenterOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [playerFormState, setPlayerFormState] = useState<{
    isOpen: boolean;
    playerToEdit?: Player;
  }>({ isOpen: false });

  const [deleteState, setDeleteState] = useState<{ 
    id: string | null; 
    progress: number;
    revealedId: string | null; 
  }>({ id: null, progress: 0, revealedId: null });
  const deleteTimerRef = useRef<number | null>(null);

  const [dragVisual, setDragVisual] = useState<{
    isDragging: boolean;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
  }>({ isDragging: false, startX: 0, startY: 0, currX: 0, currY: 0 });

  const dragRef = useRef<{
    isDragging: boolean;
    sourceId: string | null;
    startX: number;
    startY: number;
    hasMoved: boolean;
  }>({ isDragging: false, sourceId: null, startX: 0, startY: 0, hasMoved: false });

  const boardRef = useRef<HTMLDivElement>(null);
  const [playerPositions, setPlayerPositions] = useState<{ [key: string]: { x: number, y: number } }>({});

  useEffect(() => {
    let savedGame = localStorage.getItem(STORAGE_KEY);
    if (!savedGame) {
      savedGame = localStorage.getItem(OLD_STORAGE_KEY);
    }
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        if (parsed.players) setPlayers(parsed.players);
        if (parsed.transactions) setTransactions(parsed.transactions || []);
        if (typeof parsed.gameStarted === 'boolean') setGameStarted(parsed.gameStarted);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.settings) {
          setGameSettings(parsed.settings);
          setSetupBalanceInput(parsed.settings.startingBalance.toString());
          setSetupGoInput(parsed.settings.passGoAmount.toString());
        }
      } catch (e) { console.error("Failed to load saved state", e); }
    }
  }, []);

  // Sync state to local storage automatically
  useEffect(() => {
    if (gameStarted) {
      const stateToSave = { players, transactions, gameStarted, currency, settings: gameSettings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [players, transactions, gameStarted, currency, gameSettings]);

  const handleAddPlayer = useCallback(() => {
    if (players.length >= 6) return;
    const count = players.length + 1;
    const colorKeys = Object.keys(PLAYER_COLORS) as ThemeColor[];
    const randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    const newPlayer: Player = {
      id: generateId(),
      name: `Player ${count}`,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      balance: gameStarted ? gameSettings.startingBalance : 0,
      color: randomColor,
      isBankrupt: false
    };
    setPlayers(prev => [...prev, newPlayer]);
  }, [players.length, gameStarted, gameSettings.startingBalance]);

  const handleStartGame = () => {
    if (players.length < 2) return;
    const finalStartingBalance = parseMoneyInput(setupBalanceInput);
    const finalPassGoAmount = parseMoneyInput(setupGoInput);
    const finalSettings = { startingBalance: finalStartingBalance, passGoAmount: finalPassGoAmount };
    setGameSettings(finalSettings);
    const resetPlayers = players.map(p => ({ ...p, balance: finalStartingBalance, isBankrupt: false }));
    setPlayers(resetPlayers);
    setTransactions([]);
    setGameStarted(true);

    const stateToSave = { players: resetPlayers, transactions: [], gameStarted: true, currency, settings: finalSettings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  };

  const handleNewGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayers([]);
    setTransactions([]);
    setGameStarted(false);
    setGameSettings({
      startingBalance: DEFAULT_STARTING_BALANCE,
      passGoAmount: DEFAULT_PASS_GO_AMOUNT
    });
    setSetupBalanceInput(DEFAULT_STARTING_BALANCE.toString());
    setSetupGoInput(DEFAULT_PASS_GO_AMOUNT.toString());
    setIsSettingsOpen(false);
  };

  const applyTransactionEffect = useCallback((tx: Transaction, isReversing: boolean) => {
    const { fromId, toId, amount } = tx;
    setPlayers(prevPlayers => prevPlayers.map(p => {
      let newBalance = p.balance;
      if (p.id === fromId) newBalance = isReversing ? p.balance + amount : p.balance - amount;
      if (p.id === toId) newBalance = isReversing ? p.balance - amount : p.balance + amount;
      return { ...p, balance: newBalance };
    }));
  }, []);

  const handleTransaction = useCallback((type: TransactionType, fromId: string, toId: string, amount: number) => {
    const validAmount = Number(amount) || 0;
    const newTx: Transaction = {
      id: generateId(),
      timestamp: Date.now(),
      type,
      fromId: fromId as any,
      toId: toId as any,
      amount: validAmount,
      isReverted: false
    };
    setTransactions(prev => [...prev, newTx]);
    applyTransactionEffect(newTx, false);
    setShowFeedback(false);
    setTimeout(() => {
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
    }, 10);
  }, [applyTransactionEffect]);

  const handleToggleTransaction = (id: string) => {
    const txIndex = transactions.findIndex(t => t.id === id);
    if (txIndex === -1) return;
    const tx = transactions[txIndex];
    const isReverting = !tx.isReverted;
    const updatedTransactions = [...transactions];
    updatedTransactions[txIndex] = { ...tx, isReverted: isReverting };
    setTransactions(updatedTransactions);
    applyTransactionEffect(tx, isReverting);
  };

  const startDeleteTimer = (id: string) => {
    if (id === 'BANK') return;
    setDeleteState(prev => ({ ...prev, id, progress: 0 }));
    const startTime = Date.now();
    if (deleteTimerRef.current) clearInterval(deleteTimerRef.current);
    deleteTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / REVEAL_DELETE_THRESHOLD_MS) * 100, 100);
      setDeleteState(prev => ({ ...prev, progress }));
      if (progress >= 100) {
        clearInterval(deleteTimerRef.current!);
        deleteTimerRef.current = null;
        setDeleteState(prev => ({ ...prev, id: null, progress: 0, revealedId: id }));
      }
    }, 50);
  };

  const cancelDeleteTimer = () => {
    if (deleteTimerRef.current) { clearInterval(deleteTimerRef.current); deleteTimerRef.current = null; }
    setDeleteState(prev => ({ ...prev, id: null, progress: 0 }));
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return;
    if (deleteState.revealedId && deleteState.revealedId !== id) {
       setDeleteState(prev => ({ ...prev, revealedId: null }));
    }
    const clientX = e.clientX;
    const clientY = e.clientY;
    dragRef.current = { isDragging: true, sourceId: id, startX: clientX, startY: clientY, hasMoved: false };
    setDragVisual({ isDragging: true, startX: clientX, startY: clientY, currX: clientX, currY: clientY });
    startDeleteTimer(id);
    try { (e.target as Element).setPointerCapture(e.pointerId); } catch (err) { }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 15 || Math.abs(dy) > 15) {
      dragRef.current.hasMoved = true;
      cancelDeleteTimer();
    }
    setDragVisual(prev => ({ ...prev, currX: e.clientX, currY: e.clientY }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    cancelDeleteTimer();
    if (!dragRef.current.isDragging) return;
    const { sourceId, hasMoved } = dragRef.current;
    if (!hasMoved && sourceId) {
      if (sourceId === 'BANK') setIsHistoryOpen(true);
      else if (deleteState.revealedId !== sourceId) {
        const playerActual = players.find(p => p.id === sourceId);
        if (playerActual) setPlayerFormState({ isOpen: true, playerToEdit: playerActual });
      }
    } else if (hasMoved && sourceId) {
      const elements = document.elementsFromPoint(e.clientX, e.clientY);
      const targetId = elements.find(el => el.getAttribute('data-id'))?.getAttribute('data-id');
      if (targetId && targetId !== sourceId) {
        setModalState({ isOpen: true, initialFromId: sourceId, initialToId: targetId });
      }
    }
    dragRef.current = { isDragging: false, sourceId: null, startX: 0, startY: 0, hasMoved: false };
    setDragVisual(prev => ({ ...prev, isDragging: false }));
    try { (e.target as Element).releasePointerCapture(e.pointerId); } catch (err) { }
  };

  useEffect(() => {
    if (!gameStarted || !boardRef.current) return;
    const updatePositions = () => {
      if (!boardRef.current) return;
      const { width, height } = boardRef.current.getBoundingClientRect();
      if (width === 0) return;
      const cx = width / 2;
      const cy = height / 2;
      const isMobile = width < 768;
      const rx = (width / 2) - (isMobile ? 85 : 180);
      const ry = (height / 2) - (isMobile ? 130 : 180);
      if (rx <= 20 || ry <= 20) return;
      const newPositions: { [key: string]: { x: number, y: number } } = {};
      const numPlayers = players.length;
      const startAngle = numPlayers === 4 ? -Math.PI / 4 : -Math.PI / 2;
      players.forEach((player, index) => {
        const angle = (index / numPlayers) * 2 * Math.PI + startAngle; 
        newPositions[player.id] = { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
      });
      setPlayerPositions(newPositions);
    };
    updatePositions();
    const observer = new ResizeObserver(() => updatePositions());
    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, [players.length, gameStarted]);

  const appendShorthand = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, unit: 'K' | 'M') => {
    const upper = current.toUpperCase();
    if (!upper.endsWith('K') && !upper.endsWith('M')) setter(current + unit);
    else setter(current.slice(0, -1) + unit);
  };

  if (!gameStarted) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center p-4 md:p-8 font-sans text-slate-100 overflow-y-auto custom-scrollbar bg-grid-pattern">
        <div className="w-full max-w-2xl space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <div className="text-center space-y-2 py-8 relative">
            <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full"></div>
            <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-600 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] tracking-tighter">BankAIr</h1>
            <p className="text-slate-500 text-lg font-bold tracking-[0.3em] uppercase opacity-60">System Online</p>
          </div>
          
          <div className="glass-panel rounded-[2rem] p-8 shadow-2xl space-y-8 border-white/5 bg-slate-900/40 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 opacity-50"></div>
            <div className="space-y-4">
              <label className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 pulse-cyan"></span>
                Select Protocol (Currency)
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {CURRENCIES.map((c) => (
                  <button key={c.name} onClick={() => setCurrency(c)} className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${currency.name === c.name ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:bg-white/10'}`}>
                    <span className="text-xl font-black">{c.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em]">Vault Reserve (Balance)</label>
                <div className="relative group">
                  <input type="text" inputMode="numeric" value={setupBalanceInput} onChange={(e) => setSetupBalanceInput(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-white font-mono-tech text-xl focus:ring-4 focus:ring-cyan-500/20 outline-none uppercase transition-all border-cyan-500/30 group-hover:border-cyan-500/50" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button onClick={() => appendShorthand(setSetupBalanceInput, setupBalanceInput, 'K')} className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-white/20 active:scale-95 transition-all">K</button>
                    <button onClick={() => appendShorthand(setSetupBalanceInput, setupBalanceInput, 'M')} className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-white/20 active:scale-95 transition-all">M</button>
                  </div>
                  <div className="absolute left-6 -bottom-5 text-[10px] font-black text-cyan-400 opacity-60 font-mono-tech">{formatFullAmount(parseMoneyInput(setupBalanceInput), currency)}</div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em]">GO Multiplier (Reward)</label>
                <div className="relative group">
                  <input type="text" inputMode="numeric" value={setupGoInput} onChange={(e) => setSetupGoInput(e.target.value)} className="w-full bg-black/60 border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-white font-mono-tech text-xl focus:ring-4 focus:ring-cyan-500/20 outline-none uppercase transition-all border-cyan-500/30 group-hover:border-cyan-500/50" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button onClick={() => appendShorthand(setSetupGoInput, setupGoInput, 'K')} className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-white/20 active:scale-95 transition-all">K</button>
                    <button onClick={() => appendShorthand(setSetupGoInput, setupGoInput, 'M')} className="bg-white/10 px-3 py-1 rounded-lg text-[10px] font-black hover:bg-white/20 active:scale-95 transition-all">M</button>
                  </div>
                  <div className="absolute left-6 -bottom-5 text-[10px] font-black text-cyan-400 opacity-60 font-mono-tech">{formatFullAmount(parseMoneyInput(setupGoInput), currency)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-8 shadow-2xl space-y-6 border-white/5 bg-slate-900/40 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
               <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                 Roster <span className="text-cyan-400 opacity-40">[{players.length}/6]</span>
               </h2>
               <button onClick={handleAddPlayer} disabled={players.length >= 6} className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-3.5 rounded-2xl active:scale-90 transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-20 hover:scale-110">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
               </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {players.length === 0 && <p className="col-span-full py-12 text-center text-slate-600 font-bold uppercase tracking-widest text-sm italic">Add operatives to begin...</p>}
              {players.map((player) => (
                <div key={player.id} className="flex items-center gap-4 bg-black/30 p-4 rounded-2xl border border-white/5 group hover:border-cyan-500/30 transition-all">
                  <span className="text-4xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)] group-hover:scale-125 transition-transform">{player.avatar}</span>
                  <input type="text" value={player.name} onChange={(e) => setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, name: e.target.value } : p))} className="bg-transparent text-white font-black w-full outline-none" />
                  <button onClick={() => setPlayers(prev => prev.filter(p => p.id !== player.id))} className="text-slate-700 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleStartGame} disabled={players.length < 2} className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white rounded-[2rem] py-7 text-2xl font-black active:scale-95 transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-20 hover:brightness-125 flex items-center justify-center gap-4 group">
            ENGAGE SESSION
            <span className="group-hover:translate-x-2 transition-transform">🏁</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden touch-none bg-grid-pattern" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onContextMenu={(e) => e.preventDefault()}>
      {showFeedback && <TransactionFeedback />}
      
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 bg-radial-glow pointer-events-none"></div>

      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-[100] pointer-events-none">
        <div className="flex gap-4 items-center pointer-events-auto">
          <button onClick={() => setIsSettingsOpen(true)} title="Game Settings" className="bg-slate-900/60 backdrop-blur-md text-cyan-400 p-4 rounded-3xl border border-cyan-500/20 hover:bg-cyan-500 hover:text-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.1)] active:scale-90">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
        <div className="flex flex-col items-end pointer-events-auto">
          <button onClick={() => setIsHistoryOpen(true)} className="bg-slate-900/60 backdrop-blur-md text-emerald-400 p-4 rounded-3xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.1)] active:scale-90 group">
            <span className="text-2xl group-hover:scale-125 transition-transform block">📜</span>
          </button>
        </div>
      </div>

      <div ref={boardRef} className="absolute inset-0 z-0">
        <BankCard currency={currency} onDragStart={handlePointerDown} />
        {players.map((player) => (
          <PlayerCard key={player.id} player={player} currency={currency} onEditName={() => {}} onDragStart={handlePointerDown} onDeleteClick={() => setPlayers(prev => prev.filter(p => p.id !== player.id))} showDeleteButton={deleteState.revealedId === player.id} deleteProgress={deleteState.id === player.id ? deleteState.progress : 0} style={{ left: playerPositions[player.id]?.x || '50%', top: playerPositions[player.id]?.y || '50%', opacity: playerPositions[player.id] ? 1 : 0, transition: (deleteState.id === player.id) ? 'none' : 'opacity 0.4s, left 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
        ))}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100]">
        <button 
          onClick={() => setIsCommandCenterOpen(true)}
          className="bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-4 rounded-full shadow-[0_0_30px_rgba(8,145,178,0.4)] border-2 border-white/10 active:scale-90 transition-all group relative"
        >
          <div className="absolute -inset-1 bg-cyan-400/10 blur-lg rounded-full animate-pulse"></div>
          <span className="text-2xl group-hover:scale-110 group-hover:rotate-12 transition-all block relative z-10">✨</span>
        </button>
        <div className="mt-3 text-[9px] font-black text-cyan-400/40 uppercase tracking-[0.5em] text-center">AI Uplink</div>
      </div>

      {dragVisual.isDragging && <div className="absolute inset-0 pointer-events-none z-[110]"><svg className="w-full h-full"><line x1={dragVisual.startX} y1={dragVisual.startY} x2={dragVisual.currX} y2={dragVisual.currY} stroke="#22d3ee" strokeWidth="4" strokeDasharray="10 10" className="opacity-40 animate-[dash_1s_linear_infinite]" /></svg></div>}
      
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>

      <CommandCenter 
        isOpen={isCommandCenterOpen} 
        onClose={() => setIsCommandCenterOpen(false)} 
        players={players} 
        onTransaction={handleTransaction} 
      />
      
      <TransactionModal isOpen={modalState.isOpen} initialFromId={modalState.initialFromId} initialToId={modalState.initialToId} onClose={() => setModalState({ isOpen: false })} players={players} currency={currency} passGoAmount={gameSettings.passGoAmount} onTransaction={handleTransaction} />
      <HistoryLogModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} transactions={transactions} players={players} currency={currency} onToggleTransaction={handleToggleTransaction} />
      <PlayerFormModal isOpen={playerFormState.isOpen} onClose={() => setPlayerFormState({ isOpen: false })} initialData={playerFormState.playerToEdit} onSave={(data) => { if (playerFormState.playerToEdit) setPlayers(prev => prev.map(p => p.id === playerFormState.playerToEdit?.id ? { ...p, ...data } : p)); }} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={gameSettings} 
        onUpdateSettings={setGameSettings} 
        currency={currency} 
        onUpdateCurrency={setCurrency} 
        playerCount={players.length} 
        onAddPlayer={handleAddPlayer} 
        onNewGame={handleNewGame}
      />
    </div>
  );
};

export default App;
