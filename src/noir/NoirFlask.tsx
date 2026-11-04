/*
  Колба Скриптории в «Сумраке»: тёмное стекло с лунной кромкой, зелье светится цветом своего типа.
  undefined — пустая колба: стекло есть, света нет. Рамка 48 × 64, как у пиксельной колбы 12 × 16 × 4.
*/

import { NOIR_LIQUID } from './liquid';

export function NoirFlask({ type, size, className }: { type: string; size: number; className?: string }) {
  const color = NOIR_LIQUID[type] ?? null;
  const glowId = `nf-glow-${type}`;
  return (
    <svg className={['noir-flask', className].filter(Boolean).join(' ')} viewBox="0 0 48 64" width={size * 0.75} height={size} aria-hidden="true">
      <defs>
        {color && (
          <radialGradient id={glowId}>
            <stop offset="0" stopColor={color} stopOpacity="0.5" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
        )}
        <filter id="nf-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {color && <circle cx="24" cy="43" r="24" fill={`url(#${glowId})`} />}
      <path d="M19 9 H29 V22 Q42 28 42 42 A18 18 0 0 1 6 42 Q6 28 19 22 Z" fill="rgba(9, 12, 19, 0.88)" stroke="#b9cbe8" strokeOpacity="0.45" strokeWidth="1" />
      {color && (
        <>
          <path d="M8.4 37 Q24 32 39.6 37 A16.2 16.2 0 0 1 8.4 37 Z" fill={color} opacity="0.85" filter="url(#nf-blur)" />
          <circle cx="18" cy="44" r="1.3" fill="#ffffff" opacity="0.7" />
          <circle cx="27" cy="48" r="0.9" fill="#ffffff" opacity="0.6" />
        </>
      )}
      <path d="M10.5 33 Q11 27 17 24" fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="17" y="3" width="14" height="7" rx="1.5" fill="#2a1d12" stroke="#b9cbe8" strokeOpacity="0.3" strokeWidth="0.8" />
    </svg>
  );
}
