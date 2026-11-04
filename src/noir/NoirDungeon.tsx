import { HERO_RIG } from './rig/heroRig';
import { Rig } from './rig/Rig';
import { NoirGem } from './scene';

/*
  Подземелье Лабиринта Решений в «Сумраке»: тёмная кладка, плиты пола, живое пламя факелов,
  выход светится зелёным, баг сверкает красными глазами. Герой — тот же силуэт на шарнирах, что у кнопки «Сотворить».
*/

/** Факел на стене: держатель и пламя, пламя дрожит */
export function NoirTorch() {
  return (
    <svg className="dungeon__torch noir-art noir-torch" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <radialGradient id="nd-fire">
          <stop offset="0" stopColor="#ffb35c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffb35c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="20" r="18" fill="url(#nd-fire)" className="a-glow" />
      <path d="M21 30 H27 L25.6 44 H22.4 Z" fill="#0a0806" stroke="#b9cbe8" strokeOpacity="0.3" strokeWidth="0.8" />
      <g className="a-flicker">
        <path d="M24 10 Q30 18 28 24 Q26.6 29 24 29 Q21.4 29 20 24 Q18 18 24 10 Z" fill="#ff9a3c" />
        <path d="M24 16 Q27 21 26 25 Q25 27.6 24 27.6 Q23 27.6 22 25 Q21 21 24 16 Z" fill="#fff1c4" />
      </g>
    </svg>
  );
}

/** Изумруд на полу */
export function NoirDungeonGem() {
  return (
    <svg className="noir-art dungeon__item" viewBox="-14 -14 68 90" aria-hidden="true">
      <NoirGem kind="emerald" />
    </svg>
  );
}

/** Баг: тёмный жук, усики, красные глаза */
export function NoirBug() {
  return (
    <svg className="noir-art dungeon__item dungeon__item--bug" viewBox="0 0 32 32" aria-hidden="true">
      <g filter="url(#noir-rim)" fill="#05060a">
        <ellipse cx="16" cy="19" rx="8" ry="9" />
        <ellipse cx="16" cy="10" rx="5" ry="4" />
        <path d="M13 7 Q10 3 7 2 L7.4 1.2 Q11 2.4 14 6 Z M19 7 Q22 3 25 2 L24.6 1.2 Q21 2.4 18 6 Z" />
        <path d="M8.4 14 L3 11 L3.4 10 L9 13 Z M8 20 L2 20 L2 19 L8 19 Z M8.6 25 L3.6 29 L3 28 L8 24 Z M23.6 14 L29 11 L28.6 10 L23 13 Z M24 20 L30 20 L30 19 L24 19 Z M23.4 25 L28.4 29 L29 28 L24 24 Z" />
      </g>
      <path d="M16 11 V28" stroke="#b9cbe8" strokeOpacity="0.25" strokeWidth="0.6" />
      <g fill="#ff4d5e" filter="url(#sil-glow)" className="a-blink">
        <circle cx="14" cy="9.6" r="1.1" />
        <circle cx="18" cy="9.6" r="1.1" />
      </g>
    </svg>
  );
}

/** Выход: арка, из которой льётся зелёный свет */
export function NoirExit() {
  return (
    <svg className="noir-art dungeon__item dungeon__item--exit" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <radialGradient id="nd-exit" cy="0.7">
          <stop offset="0" stopColor="#5dffb0" stopOpacity="0.6" />
          <stop offset="1" stopColor="#5dffb0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="20" r="16" fill="url(#nd-exit)" className="a-pulse" />
      <path d="M6 31 V14 A10 10 0 0 1 26 14 V31 Z" fill="#05060a" stroke="#b9cbe8" strokeOpacity="0.35" strokeWidth="0.8" />
      <path d="M9.5 31 V15 A6.5 6.5 0 0 1 22.5 15 V31 Z" fill="#5dffb0" opacity="0.75" filter="url(#sil-glow)" />
    </svg>
  );
}

/** Герой в клетке подземелья: силуэт на шарнирах, ходит, радуется и ойкает */
export function NoirDungeonHero({ move }: { move: string }) {
  return (
    <span className="noir-art dungeon__noir-hero">
      <Rig key={move} rig={HERO_RIG} kind="hero" move={move} rim="noir-rim" x={0} y={0} width={100} height={124} viewBox="-20 -24 140 174" />
    </span>
  );
}
