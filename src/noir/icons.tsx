import type { AchievementCategory } from '../game/achievements';

/*
  Значки интерфейса в «Сумраке»: тонкая линия цвета текста, светится только то, что «горит» —
  полученная звезда, медаль, кристалл в названии игры. Рамка 24 × 24.
*/

export type NoirIconName = 'gem' | 'book' | 'sound' | 'mute' | 'effects' | 'effects-off' | 'moon' | 'flame';

const PATHS: Record<NoirIconName, string> = {
  gem: 'M12 2.5 L18 8.5 L18 15.5 L12 21.5 L6 15.5 L6 8.5 Z M12 2.5 L9.5 8.5 L9.5 15.5 L12 21.5 M12 2.5 L14.5 8.5 L14.5 15.5 L12 21.5 M6 8.5 H18',
  book: 'M3 5.5 Q7.5 4 12 6.5 Q16.5 4 21 5.5 V19 Q16.5 17.5 12 20 Q7.5 17.5 3 19 Z M12 6.5 V20 M6 9 Q8 8.6 10 9.4 M6 12 Q8 11.6 10 12.4 M14 9.4 Q16 8.6 18 9 M14 12.4 Q16 11.6 18 12',
  sound: 'M4 9.5 H7.5 L12 5.5 V18.5 L7.5 14.5 H4 Z M15 9 Q17 12 15 15 M17.5 7 Q21 12 17.5 17',
  mute: 'M4 9.5 H7.5 L12 5.5 V18.5 L7.5 14.5 H4 Z M15.5 9.5 L20.5 14.5 M20.5 9.5 L15.5 14.5',
  effects: 'M12 3 Q12.8 10.2 20 12 Q12.8 13.8 12 21 Q11.2 13.8 4 12 Q11.2 10.2 12 3 Z M18.5 3.5 V7.5 M16.5 5.5 H20.5',
  'effects-off': 'M12 6 Q12.6 11.2 17.5 12 Q12.6 12.8 12 18 Q11.4 12.8 6.5 12 Q11.4 11.2 12 6 Z',
  moon: 'M14.5 3.5 A8.5 8.5 0 1 0 20.5 15.5 A6.8 6.8 0 1 1 14.5 3.5 Z',
  flame: 'M12 2.5 C12.8 6 17.5 8.2 17.5 13.8 A5.5 5.5 0 0 1 6.5 13.8 C6.5 11 8.2 9.8 9.2 7.6 C10.4 8.6 10.6 9.8 10.6 10.8 C11.8 9 12.6 5.8 12 2.5 Z M12 21 C10.4 21 9.2 19.8 9.2 18.2 C9.2 16.8 10.6 15.8 12 14 C13.4 15.8 14.8 16.8 14.8 18.2 C14.8 19.8 13.6 21 12 21 Z',
};

/** Что светится: кристалл названия — аметистом, эффекты — золотом */
const GLOW: Partial<Record<NoirIconName, string>> = { gem: '#c9a2ff', effects: '#f0c890', flame: '#ffb067' };

export function NoirIcon({ name, size = 22 }: { name: NoirIconName; size?: number }) {
  const glow = GLOW[name];
  return (
    <svg className={`noir-icon noir-icon--${name}`} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      {glow && <path d={PATHS[name]} fill={glow} opacity="0.18" />}
      <path
        d={PATHS[name]}
        fill="none"
        stroke={glow ?? 'currentColor'}
        strokeWidth="1.3"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={glow ? { filter: `drop-shadow(0 0 3px ${glow})` } : undefined}
      />
    </svg>
  );
}

/** Звезда за уровень: полученная горит золотом, остальные — тонкий контур */
export function NoirStar({ on, size }: { on: boolean; size: number }) {
  return (
    <svg className={on ? 'noir-star noir-star--on' : 'noir-star'} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
      <path
        d="M12 2.8 L14.6 9 L21.2 9.5 L16.2 13.8 L17.8 20.4 L12 16.8 L6.2 20.4 L7.8 13.8 L2.8 9.5 L9.4 9 Z"
        fill={on ? '#f0c890' : 'none'}
        stroke={on ? '#ffe2b0' : 'rgba(228, 220, 205, 0.35)'}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Знак внутри медали: чистота — искра, упорство — пламя, исследование — компас, секрет — глаз */
const MEDAL_SIGNS: Record<AchievementCategory, string> = {
  clean: 'M24 22 Q24.8 28.2 31 29 Q24.8 29.8 24 36 Q23.2 29.8 17 29 Q23.2 28.2 24 22 Z',
  persistence: 'M24 21 Q30 26.5 29 31 Q28.2 35.4 24 36 Q19.8 35.4 19 31 Q18.6 27.6 21.6 25.6 Q21.8 28.6 23.6 29.4 Q22.6 25 24 21 Z',
  explore: 'M24 20.5 L26.6 29 L24 37.5 L21.4 29 Z M15.5 29 H32.5',
  secret: 'M16 29 Q24 21.5 32 29 Q24 36.5 16 29 Z M24 26.4 A2.6 2.6 0 1 0 24 31.6 A2.6 2.6 0 1 0 24 26.4 Z',
};

const MEDAL_LIGHT: Record<AchievementCategory, string> = {
  clean: '#f0c890',
  persistence: '#ff9a7a',
  explore: '#8ff0c8',
  secret: '#c9a2ff',
};

/** Медаль-медальон на ленте. Закрытая — тёмная, без знака; полученная горит цветом своего раздела */
export function NoirMedal({ category, locked, size }: { category: AchievementCategory; locked?: boolean; size: number }) {
  const light = locked ? 'rgba(228, 220, 205, 0.28)' : MEDAL_LIGHT[category];
  return (
    <svg className={locked ? 'noir-medal noir-medal--locked' : 'noir-medal'} viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path d="M15 2 L21 17 M33 2 L27 17 M19 2 L24 14 L29 2" fill="none" stroke={light} strokeWidth="1.4" opacity="0.6" />
      <circle cx="24" cy="29" r="12.5" fill="#0b0d14" stroke={light} strokeWidth="1.4" />
      <circle cx="24" cy="29" r="9.5" fill="none" stroke={light} strokeWidth="0.8" opacity="0.45" />
      {!locked && (
        <path
          d={MEDAL_SIGNS[category]}
          fill={category === 'explore' ? 'none' : light}
          fillRule="evenodd"
          stroke={light}
          strokeWidth="1"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${light})` }}
        />
      )}
    </svg>
  );
}
