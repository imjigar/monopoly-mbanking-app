
import React, { useState, useEffect, useRef } from 'react';
import { Player, TransactionType } from '../types';
import { parseTransactionCommand } from '../services/geminiService';
import Button from './Button';

interface CommandCenterProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  onTransaction: (type: TransactionType, fromId: string, toId: string, amount: number) => void;
}

const CommandCenter: React.FC<CommandCenterProps> = ({ isOpen, onClose, players, onTransaction }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setError("Audio capture failed.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setError(null);
      setInput('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        setError("Microphone unavailable.");
      }
    }
  };

  const handleProcess = async () => {
    if (!input.trim() || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    const result = await parseTransactionCommand(input, players);

    if (result) {
      onTransaction(result.type, result.fromId, result.toId, result.amount);
      onClose();
      setInput('');
    } else {
      setError("Instruction unclear. Use format: '[Name] pays [Name] [Amount]'.");
    }
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 relative">
        
        {/* Subtle high-tech background detail */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden bg-grid-pattern"></div>

        <div className="p-6 md:p-8 space-y-6 relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 pulse-cyan flex-shrink-0"></div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase italic leading-none">Neural Command</h3>
              </div>
              <span className="text-[9px] font-black text-cyan-400/40 uppercase tracking-[0.4em] mt-2 ml-4">Secure Uplink</span>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-all p-2 hover:bg-white/5 rounded-full active:scale-90">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: 'Collect 200 for Bob' or 'Alice pays Bob 1500'"
                className="w-full bg-black/40 border border-white/10 text-cyan-400 rounded-2xl p-5 text-xl min-h-[120px] focus:border-cyan-500/50 outline-none transition-all resize-none placeholder:text-slate-800 font-mono-tech shadow-inner"
              />
              
              <button 
                onClick={toggleListening}
                className={`absolute right-4 bottom-4 p-4 rounded-xl transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-600 scale-105 shadow-lg' 
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-white/5'
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isListening ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  )}
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-500 text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-top-2 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="ghost" 
              fullWidth 
              onClick={onClose} 
              className="rounded-xl py-4 font-black uppercase tracking-widest text-xs"
            >
              Abort
            </Button>
            <Button 
              fullWidth 
              onClick={handleProcess} 
              disabled={!input.trim() || isProcessing}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl py-4 text-sm font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-20 relative group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 w-full leading-none">
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing</span>
                  </>
                ) : (
                  <>
                    <span>Execute</span> 
                    <span className="group-hover:translate-x-1 transition-transform">⚡</span>
                  </>
                )}
              </span>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-4 opacity-10">
             <div className="h-[1px] flex-1 bg-white"></div>
             <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white">Encrypted Terminal</span>
             <div className="h-[1px] flex-1 bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
