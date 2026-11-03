import { random } from '../voronoi';
import { blurFilter, gear, heroAt, rimFilter } from './common';

/*
  Скриптория — холодные огни. Город механизмов в бирюзовой ночи: шестерни, трубы, пар,
  окна мастерских. В центре дверь <script>: из неё льётся зелёный свет и всплывают знаки кода.
*/

const DARK = '#030909';

export const scriptoriaDefs = [
  <linearGradient key="g1" id="scr-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#020607" />
    <stop offset="0.5" stopColor="#061518" />
    <stop offset="0.8" stopColor="#0b2628" />
    <stop offset="1" stopColor="#134040" />
  </linearGradient>,
  <linearGradient key="g2" id="scr-door" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor="#c8ffe0" />
    <stop offset="1" stopColor="#3fd88a" />
  </linearGradient>,
  rimFilter('rim-teal', '#8ff0e0', -0.4, 0.55),
  blurFilter('scr-steam', 6),
];

const stars = random(83);
const STARS = Array.from({ length: 26 }, () => [stars() * 800, stars() * 120, 0.4 + stars() * 0.6] as const);

/** Дальний город: башни, купола и трубы */
const FAR_CITY =
  'M0 270 V236 H40 V214 H62 V244 H96 V200 L106 186 L116 200 V250 H150 V226 Q166 206 182 226 V262 ' +
  'H230 V218 H244 V196 H254 V218 H268 V262 H560 V232 H590 V204 L604 188 L618 204 V240 H660 V222 Q680 200 700 222 V250 H740 V212 H756 V250 H800 V270 Z';

/** Ближние мастерские с трубами и дверью посередине */
const NEAR =
  'M0 330 V262 H70 V246 H82 V262 H150 V280 H210 V252 H226 V236 H234 V252 H262 V330 Z ' +
  'M330 330 V214 L350 196 L370 214 V200 H430 V214 L450 196 L470 214 V330 Z ' +
  'M540 330 V250 H566 V230 H578 V250 H640 V270 H700 V244 H716 V226 H724 V244 H800 V330 Z';

const WINDOWS: [number, number, string][] = [
  [20, 280, '#6ff3d6'],
  [44, 292, '#6ff3d6'],
  [108, 286, '#7dff9a'],
  [180, 296, '#6ff3d6'],
  [236, 270, '#7dff9a'],
  [346, 230, '#6ff3d6'],
  [444, 230, '#6ff3d6'],
  [560, 272, '#7dff9a'],
  [610, 262, '#6ff3d6'],
  [660, 288, '#6ff3d6'],
  [748, 262, '#7dff9a'],
];

const GLYPHS = ['{ }', ';', '=>', '()', '</>', '[ ]'];
const glyphs = random(97);
const CODE = Array.from({ length: 10 }, (_, i) => ({
  x: 380 + glyphs() * 40,
  y: 250 + glyphs() * 60,
  text: GLYPHS[i % GLYPHS.length],
  delay: glyphs(),
}));

export const scriptoriaScene = (
  <g>
    <rect width="800" height="360" fill="url(#scr-sky)" />
    {STARS.map(([x, y, r], i) => (
      <circle key={i} cx={x} cy={y} r={r} fill="#bff4ea" opacity={0.6 - y / 200} />
    ))}
    <g fill="#0c2224">
      <g className="a-spin" style={{ transformOrigin: '150px 208px' }}>
        <path d={gear(150, 208, 40, 12)} fillRule="evenodd" />
      </g>
      <g className="a-spin a-reverse" style={{ transformOrigin: '664px 186px' }}>
        <path d={gear(664, 186, 52, 14)} fillRule="evenodd" />
      </g>
      <path d={FAR_CITY} />
    </g>
    <g className="a-rise" style={{ animationDuration: '16s' }} filter="url(#scr-steam)">
      <ellipse cx="76" cy="230" rx="9" ry="18" fill="#5a8a88" opacity="0.35" />
      <ellipse cx="572" cy="214" rx="10" ry="20" fill="#5a8a88" opacity="0.3" />
      <ellipse cx="720" cy="208" rx="8" ry="16" fill="#5a8a88" opacity="0.3" />
    </g>
    <g filter="url(#rim-teal)">
      <path d={`${NEAR} M0 330 H800 V360 H0 Z`} fill={DARK} />
    </g>
    {WINDOWS.map(([x, y, color], i) => (
      <rect key={i} className={i % 4 === 1 ? 'a-twinkle' : undefined} x={x} y={y} width="5" height="7" fill={color} opacity="0.85" />
    ))}
    {/* Дверь <script>: свет изнутри, пятно света на мостовой и всплывающий код */}
    <path d="M380 330 V262 Q380 240 400 240 Q420 240 420 262 V330 Z" fill="url(#scr-door)" filter="url(#sil-glow)" />
    <path d="M380 330 L420 330 L500 360 L300 360 Z" fill="#3fd88a" opacity="0.22" filter="url(#scr-steam)" />
    {CODE.map((c, i) => (
      <text
        key={i}
        className="a-rise"
        x={c.x}
        y={c.y}
        fontSize="8"
        fontFamily="'JetBrains Mono', monospace"
        fill="#9dffc8"
        opacity="0.8"
        style={{ animationDelay: `${-c.delay * 8}s`, animationDuration: '8s' }}
      >
        {c.text}
      </text>
    ))}
    {heroAt(318, 344, 0.52, 'rim-teal')}
  </g>
);
