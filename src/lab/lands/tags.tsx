import { random } from '../voronoi';
import { blurFilter, heroAt, rimFilter } from './common';

/*
  Долина Тегов — туманный рассвет. Солнце встаёт за холмами, в низинах тёплый туман,
  на холме древние камни в форме < и >, на ближнем холме деревня с окнами, где уже зажгли свет.
*/

const DARK = '#0a0c13';

export const tagsDefs = [
  <linearGradient key="g1" id="tags-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#0c1322" />
    <stop offset="0.4" stopColor="#27314a" />
    <stop offset="0.66" stopColor="#6c6577" />
    <stop offset="0.84" stopColor="#c4967a" />
    <stop offset="1" stopColor="#f2c48c" />
  </linearGradient>,
  <radialGradient key="g2" id="tags-sun" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stopColor="#fff6dc" />
    <stop offset="0.7" stopColor="#ffd59a" />
    <stop offset="1" stopColor="#f5a86a" />
  </radialGradient>,
  <radialGradient key="g3" id="tags-halo" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.6" />
    <stop offset="0.35" stopColor="#f0a070" stopOpacity="0.2" />
    <stop offset="1" stopColor="#f0a070" stopOpacity="0" />
  </radialGradient>,
  rimFilter('rim-dawn', '#ffcf96', -0.55, 0.5),
  blurFilter('tags-mist', 7),
];

const SUN = { x: 520, y: 268 };

const stars = random(71);
const STARS = Array.from({ length: 22 }, () => [stars() * 800, stars() * 90, 0.4 + stars() * 0.6] as const);

const HOUSES =
  'M560 314 V296 L573 284 L586 296 V314 Z ' +
  'M590 314 V300 L601 290 L612 300 V314 Z ' +
  'M672 314 V294 L686 281 L700 294 V314 Z ' +
  'M704 314 V302 L714 293 L724 302 V314 Z ' +
  'M632 314 V262 L640 250 L648 262 V314 Z M640 250 V238 L652 242 L640 246 Z ' +
  'M578 290 V280 H583 V292 Z';
const WINDOWS: [number, number][] = [
  [570, 300],
  [598, 304],
  [638, 272],
  [684, 298],
  [711, 306],
];

export const tagsScene = (
  <g>
    <rect width="800" height="360" fill="url(#tags-sky)" />
    {STARS.map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#e8eef8" opacity={0.6 - y / 160} />
    ))}
    <circle cx={SUN.x} cy={SUN.y} r="270" fill="url(#tags-halo)" />
    <circle cx={SUN.x} cy={SUN.y} r="34" fill="url(#tags-sun)" />
    <path d="M286 118 q4 -3 8 0 q4 -3 8 0 M318 104 q3 -2.4 6 0 q3 -2.4 6 0 M268 136 q3 -2 6 0 q3 -2 6 0" fill="none" stroke="#2a2f40" strokeWidth="1.2" />
    <path d="M0 262 Q90 240 180 254 Q280 232 380 252 Q470 238 560 258 Q660 236 760 252 L800 248 V360 H0 Z" fill="#4a4d63" />
    <g className="a-drift" filter="url(#tags-mist)">
      <ellipse cx="400" cy="268" rx="430" ry="15" fill="#f0c49a" opacity="0.4" />
    </g>
    <path d="M0 292 Q110 268 230 284 Q330 270 430 290 Q560 272 680 288 Q750 280 800 286 V360 H0 Z" fill="#262b3c" />
    {/* Древние камни-теги на холме: края подсвечены рассветом, руны в них тлеют */}
    <g filter="url(#rim-dawn)">
      <path d="M176 246 L150 266 L176 286 L186 279 L166 266 L186 253 Z M200 246 L226 266 L200 286 L190 279 L210 266 L190 253 Z" fill="#262b3c" />
    </g>
    <path className="a-glow" d="M174 258 L162 266 L174 274 M202 258 L214 266 L202 274" fill="none" stroke="#ffd27a" strokeWidth="1.2" opacity="0.7" filter="url(#sil-glow)" />
    <g className="a-drift a-delay" filter="url(#tags-mist)">
      <ellipse cx="300" cy="300" rx="330" ry="12" fill="#b9a7a8" opacity="0.3" />
    </g>
    <g filter="url(#rim-dawn)">
      <path d={`M0 320 Q150 298 300 312 Q420 302 520 314 Q660 300 800 312 V360 H0 Z ${HOUSES}`} fill={DARK} />
    </g>
    <path d="M0 352 Q120 334 210 330 Q300 326 380 322 Q470 318 540 316" fill="none" stroke="#161a24" strokeWidth="6" strokeLinecap="round" />
    {WINDOWS.map(([x, y], i) => (
      <rect key={i} className={i === 1 ? 'a-twinkle' : undefined} x={x} y={y} width="3" height="4" fill="#ffc77a" />
    ))}
    <g className="a-rise" style={{ animationDuration: '14s' }} filter="url(#tags-mist)">
      <ellipse cx="582" cy="270" rx="8" ry="14" fill="#8a8597" opacity="0.35" />
    </g>
    {heroAt(352, 322, 0.5, 'rim-dawn', 'ember')}
  </g>
);
