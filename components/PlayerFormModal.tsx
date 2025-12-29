
import React, { useState, useEffect } from 'react';
import { Player, ThemeColor } from '../types';
import Button from './Button';
import { AVATARS, PLAYER_COLORS } from '../constants';

interface PlayerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerData: Partial<Player>) => void;
  initialData?: Player;
}

const PlayerFormModal: React.FC<PlayerFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
}) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [color, setColor] = useState<ThemeColor>('blue');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setAvatar(initialData.avatar);
        setColor(initialData.color as ThemeColor);
      } else {
        setName('');
        setAvatar(AVATARS[0]);
        setColor('blue');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, avatar, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="glass-panel bg-slate-900/90 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-white/10 bg-white/5">
          <h3 className="font-bold text-white text-lg">
            Customize Player
          </h3>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="player-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Player Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder-white/20 font-bold"
                required
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setAvatar(av)}
                    className={`text-2xl p-2 rounded-xl transition-all ${
                      avatar === av 
                        ? 'bg-indigo-600 shadow-lg shadow-indigo-500/40 scale-110 text-white ring-2 ring-indigo-400' 
                        : 'bg-white/5 hover:bg-white/10 text-white/70'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Color Theme</label>
              <div className="grid grid-cols-5 gap-3">
                {(Object.keys(PLAYER_COLORS) as ThemeColor[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-12 rounded-xl transition-all relative flex items-center justify-center ${
                      color === c 
                        ? 'ring-2 ring-white scale-105 shadow-lg' 
                        : 'opacity-50 hover:opacity-100'
                    } ${PLAYER_COLORS[c]}`}
                    title={c}
                  >
                    {color === c && (
                      <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-white/10 bg-white/5 flex gap-3">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
          <Button type="submit" form="player-form" fullWidth className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerFormModal;
