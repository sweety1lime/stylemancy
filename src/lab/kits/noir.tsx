import { HERO_NOIR, MENTOR_NOIR, VILLAIN_NOIR } from '../figuresNoir';
import { DUNGEON_MAP, GEM, GEM_COLORS, sparkle, TILE } from '../shapes';
import type { Kit } from '../types';
import { random } from '../voronoi';
import { Glow, Silhouette } from './silParts';

/*
  Сумрак — серьёзная версия «Силуэтов и света». Холодная луна против тёплой магии:
  окружение в сине-серых тонах, цветом горит только волшебство. Взрослые пропорции,
  руины и туман, медленное движение, зерно плёнки и виньетка.
*/

const NIGHT = '#06070c';
const MOON = { x: 604, y: 92, r: 44 };

const defs = (
  <>
    <linearGradient id="noir-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#04060b" />
      <stop offset="0.45" stopColor="#0d1322" />
      <stop offset="0.78" stopColor="#1b2437" />
      <stop offset="1" stopColor="#2a3244" />
    </linearGradient>
    <radialGradient id="noir-moon" cx="0.4" cy="0.38" r="0.65">
      <stop offset="0" stopColor="#f4f7fb" />
      <stop offset="0.7" stopColor="#cfd8e6" />
      <stop offset="1" stopColor="#aab6c9" />
    </radialGradient>
    <radialGradient id="noir-halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#a9bcdc" stopOpacity="0.35" />
      <stop offset="0.4" stopColor="#7d90b4" stopOpacity="0.12" />
      <stop offset="1" stopColor="#7d90b4" stopOpacity="0" />
    </radialGradient>
    <linearGradient id="noir-beam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </linearGradient>
    <radialGradient id="noir-vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stopColor="#000000" stopOpacity="0" />
      <stop offset="1" stopColor="#000000" stopOpacity="0.7" />
    </radialGradient>
    <radialGradient id="noir-portrait" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stopColor="#4a5a7c" />
      <stop offset="0.45" stopColor="#1c2438" />
      <stop offset="1" stopColor="#07090f" />
    </radialGradient>
    {/* Контровой свет луны: холодный, на краях сверху и справа — луна справа вверху */}
    <filter id="noir-rim" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="erode" radius="0.35" result="inner" />
      <feOffset in="inner" dx="-0.55" dy="0.5" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#b9cbe8" floodOpacity="0.6" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="0.3" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    <filter id="noir-rim-big" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="erode" radius="6" result="inner" />
      <feOffset in="inner" dx="-7" dy="6" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#b9cbe8" floodOpacity="0.8" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="2" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    <filter id="noir-cloud" x="-10%" y="-60%" width="120%" height="220%">
      <feGaussianBlur stdDeviation="2.2" />
    </filter>
    <filter id="noir-shaft" x="-30%" y="-10%" width="160%" height="120%">
      <feGaussianBlur stdDeviation="4" />
    </filter>
    <filter id="noir-mist" x="-20%" y="-50%" width="140%" height="200%">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    {/* Зерно плёнки: мелкий шум поверх всего кадра */}
    <filter id="noir-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.9  0.7 0 0 0 -0.32" />
    </filter>
  </>
);

/** Академия вдали: скала с башнями и острыми крышами, несколько тёплых окон */
const ACADEMY_ROCK = 'M54 198 Q150 188 252 198 Q234 214 204 224 Q166 240 134 228 Q92 216 54 198 Z';
const ACADEMY_TOWERS =
  'M92 198 V150 L99 132 L106 150 V198 Z ' +
  'M112 198 V128 L122 96 L132 128 V198 Z ' +
  'M106 198 V164 H112 V198 Z M132 198 V158 H146 V198 Z ' +
  'M146 198 V140 L154 116 L162 140 V198 Z ' +
  'M162 198 V170 H190 V198 Z M176 170 V160 L183 150 L190 160 V170 Z ' +
  'M200 198 V176 L206 164 L212 176 V198 Z';
const WINDOWS: [number, number][] = [
  [120, 136],
  [124, 150],
  [152, 148],
  [168, 180],
  [98, 160],
];

const dust = random(5);
const DUST = Array.from({ length: 26 }, () => [40 + dust() * 720, 60 + dust() * 280, 0.5 + dust() * 0.9, dust()] as const);
const starRandom = random(19);
const STARS = Array.from({ length: 34 }, () => [starRandom() * 800, starRandom() * 130, 0.4 + starRandom() * 0.7] as const);

const sky = (
  <g>
    <rect width="800" height="360" fill="url(#noir-sky)" />
    {STARS.map(([x, y, r], i) => (
      <circle key={i} className={i % 6 ? undefined : 'a-twinkle'} cx={x} cy={y} r={r} fill="#dfe7f4" opacity={0.7 - y / 260} />
    ))}
    <circle cx={MOON.x} cy={MOON.y} r="230" fill="url(#noir-halo)" />
    {/* Холодные лучи луны вниз и влево */}
    <path d={`M${MOON.x - 20} ${MOON.y + 30} L250 360 L330 360 Z M${MOON.x} ${MOON.y + 40} L470 360 L520 360 Z`} fill="url(#noir-beam)" opacity="0.07" />
    <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="url(#noir-moon)" />
    <path d="M592 80 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0 Z M614 104 a4 3.4 0 1 0 8 0 a4 3.4 0 1 0 -8 0 Z" fill="#b8c3d4" opacity="0.6" />
    {/* Облака проходят перед луной */}
    <g className="a-drift" filter="url(#noir-cloud)">
      <path d="M500 128 Q540 112 580 118 Q610 106 646 114 Q690 108 724 124 Q700 134 660 132 Q620 138 580 134 Q540 138 500 128 Z" fill="#0d1321" opacity="0.9" />
      <path d="M548 112 Q576 104 604 108 Q630 102 656 110 Q634 116 606 115 Q578 118 548 112 Z" fill="#141c2e" opacity="0.55" />
    </g>
    {/* Академия на дальней скале, под ней цепи */}
    <g className="a-hover">
      <path d="M118 226 V262 M190 220 V250" stroke="#1d2638" strokeWidth="1.4" strokeDasharray="2.5 2" />
      <path d={`${ACADEMY_ROCK} ${ACADEMY_TOWERS}`} fill="#1a2234" />
      {WINDOWS.map(([x, y], i) => (
        <rect key={i} className={i === 2 ? 'a-twinkle' : undefined} x={x} y={y} width="2.4" height="4" fill="#ffc77a" />
      ))}
    </g>
    <g className="a-hover a-delay">
      <path d="M686 214 Q722 206 770 214 Q756 230 734 238 Q704 232 686 214 Z M700 214 L704 196 L708 214 Z M744 213 L747 200 L750 213 Z" fill="#141b2b" />
    </g>
    <path d="M0 300 Q120 286 260 298 Q420 284 560 298 Q690 288 800 296 V360 H0 Z" fill="#0e131f" />
    <g className="a-drift a-delay" filter="url(#noir-mist)">
      <ellipse cx="160" cy="290" rx="190" ry="14" fill="#3a4560" opacity="0.35" />
      <ellipse cx="620" cy="300" rx="220" ry="16" fill="#3a4560" opacity="0.3" />
    </g>
    {DUST.map(([x, y, r, delay], i) => (
      <circle key={i} className="a-rise" cx={x} cy={y} r={r} fill={i % 4 ? '#c9d6ea' : '#ffc890'} opacity="0.7" style={{ animationDelay: `${-delay * 6}s`, animationDuration: '11s' }} />
    ))}
  </g>
);

/** Ближний остров: зубчатая скала, обломок колонны и мёртвое дерево */
const ROCK =
  'M10 30 L40 26 L80 28 L130 24 L210 26 L290 23 L350 27 L410 30 L396 44 L372 56 L356 74 L330 86 L306 104 L282 112 L262 130 L236 136 L214 152 L198 136 L176 128 L150 112 L126 102 L104 84 L80 70 L56 58 L30 44 Z';
const PILLAR = 'M396 28 V-14 L399 -18 L402 -12 L404 -22 L407 -16 L410 -20 V28 Z M392 28 H414 V22 H392 Z M394 -10 H412 V-14 H394 Z';
const DEAD_TREE =
  'M20 28 Q22 14 18 2 Q14 -6 6 -12 L7.6 -13.4 Q15 -8 19 -2 Q20 -12 26 -20 L27.6 -19 Q22 -10 22 -2 Q26 -8 32 -10 L32.6 -8.4 Q26 -5 23 2 Q24 14 24.6 28 Z';
const CRAGS = 'M60 26 L64 18 L68 26 Z M240 25 L243 19 L246 25 Z M330 26 L333 21 L336 26 Z';

const island = (
  <g filter="url(#noir-rim)">
    <path d="M150 112 L146 140 M214 152 L216 176 M262 130 L268 150" stroke={NIGHT} strokeWidth="1.4" strokeDasharray="2.5 2" />
    <path d={`${ROCK} ${PILLAR} ${DEAD_TREE} ${CRAGS}`} fill={NIGHT} />
  </g>
);

/** Кристалл парит, внутри горит цветом, вниз падает луч света */
function gem(kind: keyof typeof GEM_COLORS) {
  const c = GEM_COLORS[kind];
  return (
    <g>
      <path d="M14 50 L26 50 L44 104 L-4 104 Z" fill={c.main} opacity="0.16" filter="url(#noir-shaft)" style={{ mixBlendMode: 'screen' }} />
      <Glow className="a-glow" x={20} y={28} r={36} light={kind} />
      <g filter="url(#sil-glow)">
        <path d={GEM.outer} fill={c.dark} />
        <path d={GEM.mid} fill={c.main} />
        <path d="M20 10 L24 20 L20 46 L16 20 Z" fill="#ffffff" opacity="0.85" />
      </g>
    </g>
  );
}

const isWall = (x: number, y: number) => {
  const cell = DUNGEON_MAP[y]?.[x];
  return cell === undefined || cell === '#' || cell === 'T';
};

/** Баг в темноте: длинные суставчатые лапы, вытянутое тело, красные глаза */
const BUG_BODY = 'M20 14 Q26 18 26 26 Q25 34 20 37 Q15 34 14 26 Q14 18 20 14 Z M17 9 Q20 6 23 9 Q23 13 20 14 Q17 13 17 9 Z';
const BUG_LEGS =
  'M15 20 L8 15 L3 18 M14.5 25 L6 25 L1 30 M15 30 L9 34 L5 39 M25 20 L32 15 L37 18 M25.5 25 L34 25 L39 30 M25 30 L31 34 L35 39 M18.5 8 Q14 2 8 1 M21.5 8 Q26 2 32 1';

export const noirKit: Kit = {
  id: 'noir',
  name: 'Сумрак',
  about: 'Серьёзная версия силуэтов: холодная луна против тёплой магии, руины и туман, взрослые пропорции и медленное движение.',
  traits: ['Шрифты Cormorant Garamond и Golos Text', 'Холодный лунный свет, цветом горит только магия', 'Без мультяшности: острые формы, лица в тени'],
  defs,
  sky,
  island,
  hero: <Silhouette figure={HERO_NOIR} rim="noir-rim" fill={NIGHT} lit={{ crystal: '#e9f6ff' }} light="ice" />,
  villain: (
    <g>
      <Silhouette figure={VILLAIN_NOIR} rim="noir-rim" fill={NIGHT} />
      <path className="a-twinkle" d={sparkle(53.4, 35.4, 2.6)} fill="#d6e6ff" filter="url(#sil-glow)" />
    </g>
  ),
  mentor: (
    <g>
      <rect width="120" height="120" fill="url(#noir-portrait)" />
      <Silhouette figure={MENTOR_NOIR} rim="noir-rim" fill={NIGHT} />
      <g className="a-blink" fill="#ffb067" filter="url(#sil-glow)">
        {MENTOR_NOIR.dots.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  ),
  gem,
  wall: (x, y) => (
    <g>
      <rect width="40" height="40" fill="#0b0e16" />
      <path d="M2 2 H22 V18 H2 Z M25 2 H38 V18 H25 Z M2 21 H11 V38 H2 Z M14 21 H38 V38 H14 Z" fill="none" stroke="#141a27" strokeWidth="1" />
      {!isWall(x, y + 1) && <rect y="38" width="40" height="2" fill="#2a3550" />}
      {!isWall(x - 1, y) && <rect width="1.5" height="40" fill="#1c2438" />}
      {!isWall(x + 1, y) && <rect x="38.5" width="1.5" height="40" fill="#1c2438" />}
    </g>
  ),
  floor: (x, y) => (
    <g>
      <rect width="40" height="40" fill="#0a0c12" />
      {(x * 5 + y * 3) % 4 === 0 && <path d="M8 30 L15 24 L19 27 L26 20" fill="none" stroke="#141a26" strokeWidth="1" />}
    </g>
  ),
  torch: (
    <g>
      <Glow className="a-glow" x={20} y={20} r={84} light="ember" />
      <path d={`${TILE.plate} ${TILE.handle} ${TILE.cup}`} fill={NIGHT} />
      <g className="a-flicker" filter="url(#sil-glow)">
        <path d={TILE.flameOuter} fill="#e8743a" />
        <path d={TILE.flameMid} fill="#ffb067" />
        <path d={TILE.flameCore} fill="#fff1d6" />
      </g>
    </g>
  ),
  exit: (
    <g>
      <Glow className="a-glow" x={20} y={24} r={46} light="green" />
      <path d={TILE.archOuter} fill={NIGHT} />
      <path d={TILE.archLight} fill="#4fd486" opacity="0.85" filter="url(#sil-glow)" />
      <path d={TILE.archCore} fill="#e6fff0" />
    </g>
  ),
  bug: (
    <g>
      <path d={BUG_LEGS} fill="none" stroke={NIGHT} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d={BUG_BODY} fill={NIGHT} filter="url(#noir-rim)" />
      <g className="a-blink" fill="#ff4d5e" filter="url(#sil-glow)">
        <circle cx="18.6" cy="10" r="0.9" />
        <circle cx="21.4" cy="10" r="0.9" />
      </g>
    </g>
  ),
  sceneOverlay: (
    <g pointerEvents="none">
      <rect width="800" height="360" fill="url(#noir-vignette)" />
      <rect width="800" height="360" filter="url(#noir-grain)" opacity="0.5" />
    </g>
  ),
  dungeonOverlay: (width, height) => <rect width={width} height={height} fill="url(#noir-vignette)" pointerEvents="none" />,
  icon: (d) => (
    <g>
      <rect width="512" height="512" fill="url(#noir-portrait)" />
      <path d={d} fill={NIGHT} filter="url(#noir-rim-big)" />
    </g>
  ),
};

