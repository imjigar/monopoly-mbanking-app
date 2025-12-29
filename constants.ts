import { ThemeColor, Currency } from './types';

export const DEFAULT_STARTING_BALANCE = 1500;
export const DEFAULT_PASS_GO_AMOUNT = 200;

export const PLAYER_COLORS: { [key in ThemeColor]: string } = {
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  yellow: 'bg-yellow-500',
  lime: 'bg-lime-500',
  green: 'bg-green-500',
  emerald: 'bg-emerald-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  sky: 'bg-sky-500',
  blue: 'bg-blue-500',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
  purple: 'bg-purple-500',
  fuchsia: 'bg-fuchsia-500',
  pink: 'bg-pink-500',
  rose: 'bg-rose-500',
};

export const PLAYER_BORDER_COLORS: { [key in ThemeColor]: string } = {
  red: 'border-red-500',
  orange: 'border-orange-500',
  amber: 'border-amber-500',
  yellow: 'border-yellow-500',
  lime: 'border-lime-500',
  green: 'border-green-500',
  emerald: 'border-emerald-500',
  teal: 'border-teal-500',
  cyan: 'border-cyan-500',
  sky: 'border-sky-500',
  blue: 'border-blue-500',
  indigo: 'border-indigo-500',
  violet: 'border-violet-500',
  purple: 'border-purple-500',
  fuchsia: 'border-fuchsia-500',
  pink: 'border-pink-500',
  rose: 'border-rose-500',
};

export const PLAYER_TEXT_COLORS: { [key in ThemeColor]: string } = {
  red: 'text-red-500',
  orange: 'text-orange-500',
  amber: 'text-amber-500',
  yellow: 'text-yellow-500',
  lime: 'text-lime-500',
  green: 'text-green-500',
  emerald: 'text-emerald-500',
  teal: 'text-teal-500',
  cyan: 'text-cyan-500',
  sky: 'text-sky-500',
  blue: 'text-blue-500',
  indigo: 'text-indigo-500',
  violet: 'text-violet-500',
  purple: 'text-purple-500',
  fuchsia: 'text-fuchsia-500',
  pink: 'text-pink-500',
  rose: 'text-rose-500',
};

export const AVATARS = [
  // Classic
  '🎩', '🚗', '🐕', '🚢', '👢', '🐈', '🦖', '🐧', 
  // Animals
  '🦁', '🐯', '🐻', '🐼', '🐨', '🐸', '🐙', '🦋', '🐞', '🐔', '🦄', '🐲',
  '🦈', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🐝', '🐛', '🐌', '🦂', '🐢',
  '🐍', '🦎', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏',
  // Fantasy/SciFi
  '🤖', '👽', '👻', '👾', '🤡', '☠️', '👹', '👺', '🧞', '🧜', '🧚', '🧛',
  // Objects/Food
  '💩', '💎', '👑', '🎸', '🎮', '🚀', '⚓', '⚔️', '🛡️', '💣', '🧨', '🎈',
  '🍔', '🍕', '🌮', '🍣', '🍦', '🍩', '🍪', '🍺', '🍷', '🍹', '🧉', '🧊'
];

export const CURRENCIES: Currency[] = [
  { symbol: '$', name: 'Dollar ($)', position: 'prefix' },
  { symbol: '₹', name: 'Rupee (₹)', position: 'prefix' },
  { symbol: '£', name: 'Pound (£)', position: 'prefix' },
  { symbol: '€', name: 'Euro (€)', position: 'prefix' },
  { symbol: 'M', name: 'Monopoly (M)', position: 'suffix' },
  { symbol: 'K', name: 'Thousands (K)', position: 'suffix' },
  { symbol: '₩', name: 'Won (₩)', position: 'prefix' },
  { symbol: '₽', name: 'Ruble (₽)', position: 'suffix' },
];