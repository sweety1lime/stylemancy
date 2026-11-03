import { random } from '../voronoi';
import { blurFilter, forestRow, heroAt, rimFilter } from './common';

/*
  Лес Селекторов — лунный лес. Лучи пробиваются сквозь кроны, между рядами елей туман,
  светлячки, тлеющие грибы и Сова Селекта на ветке: глаза видят любой элемент.
*/

export const forestDefs = [
  <linearGradient key="g1" id="forest-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#04070a" />
    <stop offset="0.55" stopColor="#0b1617" />
    <stop offset="1" stopColor="#15282a" />
  </linearGradient>,
  <linearGradient key="g2" id="forest-ray" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#d6f2e4" stopOpacity="0.32" />
    <stop offset="1" stopColor="#d6f2e4" stopOpacity="0" />
  </linearGradient>,
  rimFilter('rim-moon', '#c4e8d6', 0.5, 0.55),
  blurFilter('forest-fog', 8),
];

const flies = random(29);
const FIREFLIES = Array.from({ length: 26 }, () => [60 + flies() * 680, 170 + flies() * 140, flies()] as const);

const MUSHROOMS: [number, number, number][] = [
  [118, 318, 1],
  [132, 320, 0.7],
  [516, 314, 0.9],
  [688, 316, 0.75],
];

/** Сова на ветке: силуэт и два горящих глаза */
const OWL = 'M728 150 Q726 136 732 130 L734 123 L737 129.5 Q742 127.5 747 129.5 L750 123 L752 130 Q758 136 756 150 Q754 161 742 163 Q730 161 728 150 Z';
const NEAR_TREES =
  'M0 0 H34 Q30 120 36 240 Q40 300 30 360 H0 Z M34 112 Q70 104 104 92 L106 96 Q72 110 36 120 Z ' +
  'M766 0 H800 V360 H770 Q760 300 764 240 Q770 120 766 0 Z M766 166 Q740 164 712 168 L712 164 Q742 159 766 160 Z';

export const forestScene = (
  <g>
    <rect width="800" height="360" fill="url(#forest-sky)" />
    <circle cx="600" cy="50" r="60" fill="url(#noir-halo)" />
    <circle cx="600" cy="50" r="15" fill="#e8f3ee" />
    <path className="a-breathe" d="M600 50 L380 360 L440 360 Z M600 50 L520 360 L560 360 Z M600 50 L230 360 L262 360 Z" fill="url(#forest-ray)" opacity="0.55" />
    <path d={forestRow(3, 262, 80, 140, 34)} fill="#1a2b2c" opacity="0.9" />
    <g className="a-drift" filter="url(#forest-fog)">
      <ellipse cx="400" cy="262" rx="440" ry="18" fill="#3d5a55" opacity="0.4" />
    </g>
    <path d={forestRow(8, 300, 120, 200, 58)} fill="#0c1617" />
    <g className="a-drift a-delay" filter="url(#forest-fog)">
      <ellipse cx="380" cy="306" rx="420" ry="14" fill="#2f4844" opacity="0.45" />
    </g>
    <path d="M0 318 Q200 306 400 314 Q600 304 800 312 V360 H0 Z" fill="#050909" />
    {MUSHROOMS.map(([x, y, s]) => (
      <g key={x}>
        <path d={`M${x - 1.2 * s} ${y} V${y - 7 * s} H${x + 1.2 * s} V${y} Z`} fill="#050909" />
        <path className="a-glow" d={`M${x - 6 * s} ${y - 6 * s} Q${x} ${y - 14 * s} ${x + 6 * s} ${y - 6 * s} Z`} fill="#5ff0d0" filter="url(#sil-glow)" />
      </g>
    ))}
    <g filter="url(#rim-moon)">
      <path d={`${NEAR_TREES} ${OWL}`} fill="#030606" />
    </g>
    <g className="a-blink" fill="#ffd27a" filter="url(#sil-glow)">
      <circle cx="737.5" cy="140" r="2" />
      <circle cx="746.5" cy="140" r="2" />
    </g>
    {FIREFLIES.map(([x, y, delay], i) => (
      <circle
        key={i}
        className="a-firefly"
        cx={x}
        cy={y}
        r="1.4"
        fill="#e4ff9a"
        filter="url(#sil-glow)"
        style={{ animationDelay: `${-delay * 7}s` }}
      />
    ))}
    {heroAt(360, 318, 0.56, 'rim-moon')}
  </g>
);
