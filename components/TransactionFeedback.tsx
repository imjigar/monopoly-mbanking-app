
import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
  rotation: number;
}

const EMOJIS = ['💰', '💸', '💎', '🪙', '💵', '✨', '💳', '🔥', '🚀'];

export const TransactionFeedback: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      left: Math.random() * 100, // percentage
      duration: 0.8 + Math.random() * 1.5, // seconds
      delay: Math.random() * 0.3,
      size: 15 + Math.random() * 45, // px
      rotation: Math.random() * 720,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[400] overflow-hidden">
      {/* Intense Flash Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-purple-500/20 animate-flash-fade" />
      <div className="absolute inset-0 bg-white/5 animate-quick-flash" />
      
      {/* Particle Container */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute bottom-[-100px] animate-float-up opacity-0 filter drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        >
          {p.emoji}
        </div>
      ))}

      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translateY(-20vh) rotate(90deg) scale(1.2);
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg) scale(1);
            opacity: 0;
          }
        }
        @keyframes flash-fade {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes quick-flash {
          0% { opacity: 0; }
          10% { opacity: 0.3; }
          100% { opacity: 0; }
        }
        .animate-float-up {
          animation-name: float-up;
          animation-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
          animation-fill-mode: forwards;
        }
        .animate-flash-fade {
          animation: flash-fade 0.8s ease-out forwards;
        }
        .animate-quick-flash {
          animation: quick-flash 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TransactionFeedback;
