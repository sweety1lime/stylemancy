import { random } from '../voronoi';
import { blurFilter, heroAt, rimFilter } from './common';

/*
  Крепость Блоков — зарево. За стенами что-то горит: небо в багровом свете, к нему тянется дым.
  Крепость сложена из блоков, как блочная модель CSS: донжон — блоки друг на друге.
  На стенах факелы и стражники, из ворот льётся тёплый свет, вверх летят искры.
*/

const DARK = '#090405';

export const fortressDefs = [
  <linearGradient key="g1" id="fort-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#080406" />
    <stop offset="0.35" stopColor="#1d0b0c" />
    <stop offset="0.62" stopColor="#4a1712" />
    <stop offset="0.84" stopColor="#9a3416" />
    <stop offset="1" stopColor="#e0702c" />
  </linearGradient>,
  <radialGradient key="g2" id="fort-halo" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stopColor="#ff9a4a" stopOpacity="0.5" />
    <stop offset="1" stopColor="#ff6a2a" stopOpacity="0" />
  </radialGradient>,
  <linearGradient key="g3" id="fort-gate" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#ff9a4a" />
    <stop offset="1" stopColor="#ffd9a0" />
  </linearGradient>,
  rimFilter('rim-ember', '#ffa060', 0.2, 0.6, 0.7),
  blurFilter('fort-smoke', 7),
];

/** Стена с зубцами: от x1 до x2, верх на top, зубец шириной w */
function battlement(x1: number, x2: number, top: number, bottom: number, w = 8): string {
  let d = `M${x1} ${bottom} V${top}`;
  for (let x = x1; x < x2; x += w * 2) d += ` H${Math.min(x + w, x2)} V${top - w} H${Math.min(x + w * 2, x2)} V${top}`;
  return `${d} H${x2} V${bottom} Z`;
}

const FORTRESS = [
  battlement(120, 680, 252, 330, 8),
  battlement(120, 196, 172, 330, 8),
  battlement(604, 680, 172, 330, 8),
  // Донжон — блоки, поставленные друг на друга
  'M336 252 V196 H464 V252 Z',
  'M356 196 V154 H444 V196 Z',
  'M376 154 V122 H424 V154 Z',
  battlement(388, 412, 114, 122, 4),
].join(' ');

const TORCHES: [number, number][] = [
  [228, 240],
  [306, 240],
  [494, 240],
  [572, 240],
  [158, 160],
  [642, 160],
];

const sparks = random(53);
const SPARKS = Array.from({ length: 24 }, () => [120 + sparks() * 560, 200 + sparks() * 140, 0.6 + sparks() * 1, sparks()] as const);

/** Стражник с копьём на стене */
const guard = (x: number) =>
  `M${x - 3} 244 V232 Q${x} 228 ${x + 3} 232 V244 Z M${x - 2.4} 228 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0 Z M${x + 5} 244 V216 L${x + 6.5} 212 L${x + 8} 216 V244 Z`;

export const fortressScene = (
  <g>
    <rect width="800" height="360" fill="url(#fort-sky)" />
    <circle cx="400" cy="340" r="400" fill="url(#fort-halo)" />
    <g className="a-drift" filter="url(#fort-smoke)" opacity="0.75">
      <path d="M250 260 Q236 200 262 150 Q284 108 250 50 Q310 104 298 158 Q288 210 312 260 Z" fill="#1a0b0b" />
      <path d="M520 260 Q540 190 512 136 Q492 90 528 30 Q566 98 552 150 Q540 206 570 260 Z" fill="#1d0c0b" />
    </g>
    <path d="M0 290 Q120 272 240 284 Q400 268 560 286 Q690 274 800 284 V360 H0 Z" fill="#3a1611" />
    <g filter="url(#rim-ember)">
      <path d={`${FORTRESS} ${guard(262)} ${guard(538)}`} fill={DARK} />
    </g>
    {/* Ворота: изнутри льётся тёплый свет, поверх решётка */}
    <path d="M380 330 V298 Q380 282 400 282 Q420 282 420 298 V330 Z" fill="url(#fort-gate)" opacity="0.9" />
    <path d="M386 330 V290 M393 330 V284 M400 330 V282 M407 330 V284 M414 330 V290 M380 300 H420 M380 314 H420" stroke={DARK} strokeWidth="1.6" />
    <path d="M380 330 L420 330 L470 360 L330 360 Z" fill="#ffb067" opacity="0.18" filter="url(#fort-smoke)" />
    <path d="M362 210 h4 v6 h-4 Z M434 210 h4 v6 h-4 Z M396 136 h8 v8 h-8 Z" fill="#ffb067" />
    {TORCHES.map(([x, y]) => (
      <g key={`${x},${y}`}>
        <circle className="a-glow" cx={x} cy={y} r="22" fill="url(#sil-light-ember)" style={{ mixBlendMode: 'screen' }} />
        <path className="a-flicker" d={`M${x} ${y - 9} C${x + 4} ${y - 4} ${x + 3.5} ${y} ${x} ${y + 1} C${x - 3.5} ${y} ${x - 4} ${y - 4} ${x} ${y - 9} Z`} fill="#ffb067" filter="url(#sil-glow)" />
      </g>
    ))}
    <path d="M0 330 H800 V360 H0 Z" fill="#050203" />
    {SPARKS.map(([x, y, r, delay], i) => (
      <circle key={i} className="a-rise" cx={x} cy={y} r={r} fill={i % 3 ? '#ffb067' : '#ffd9a0'} style={{ animationDelay: `${-delay * 6}s` }} />
    ))}
    {heroAt(400, 346, 0.52, 'rim-ember', 'ember')}
  </g>
);
