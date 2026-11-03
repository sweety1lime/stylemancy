import { HERO_FIGURE, MENTOR_FIGURE, VILLAIN_FIGURE } from '../figures';
import { DUNGEON_MAP, GEM, GEM_COLORS, ISLAND, sparkle, TILE } from '../shapes';
import type { Kit } from '../types';
import { random } from '../voronoi';
import { LIGHTS } from './silLights';
import { Glow, SIL, Silhouette } from './silParts';

/*
  Силуэты и свет: тёмные фигуры против низкой луны на закатном небе, контровой свет по краю,
  дымка между планами. Цветом горят только источники света — кристалл, монокль, самоцветы, факелы.
*/

const SUN = { x: 640, y: 226 };

const defs = (
  <>
    <linearGradient id="sil-sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#140b2e" />
      <stop offset="0.38" stopColor="#3d1652" />
      <stop offset="0.62" stopColor="#8a2f63" />
      <stop offset="0.8" stopColor="#d9605a" />
      <stop offset="0.92" stopColor="#f6a35b" />
      <stop offset="1" stopColor="#ffd889" />
    </linearGradient>
    <radialGradient id="sil-sun" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#fffbea" />
      <stop offset="0.55" stopColor="#ffe6a8" />
      <stop offset="1" stopColor="#ffc27a" />
    </radialGradient>
    <radialGradient id="sil-halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.75" />
      <stop offset="0.3" stopColor="#ff9f6e" stopOpacity="0.3" />
      <stop offset="1" stopColor="#ff7a6e" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="sil-ray" gradientUnits="userSpaceOnUse" cx={SUN.x} cy={SUN.y} r="620">
      <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.5" />
      <stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
    </radialGradient>
    <radialGradient id="sil-portrait" cx="0.5" cy="0.62" r="0.62">
      <stop offset="0" stopColor="#ffe2a0" />
      <stop offset="0.35" stopColor="#f08a5d" />
      <stop offset="0.75" stopColor="#7a2a62" />
      <stop offset="1" stopColor="#2a1240" />
    </radialGradient>
    <linearGradient id="sil-fog" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1a0c26" stopOpacity="0" />
      <stop offset="1" stopColor="#1a0c26" stopOpacity="0.92" />
    </linearGradient>
    {Object.entries(LIGHTS).map(([name, color]) => (
      <radialGradient key={name} id={`sil-light-${name}`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={color} stopOpacity="0.85" />
        <stop offset="0.35" stopColor={color} stopOpacity="0.3" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
    ))}
    {/* Контровой свет: край силуэта сверху и с боков подсвечен тёплым */}
    <filter id="sil-rim" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="erode" radius="0.9" result="inner" />
      <feOffset in="inner" dx="-0.4" dy="1.1" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#ffbf80" floodOpacity="0.95" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="0.35" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    <filter id="sil-rim-big" x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="erode" radius="6" result="inner" />
      <feOffset in="inner" dx="-3" dy="8" result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor="#ffbf80" floodOpacity="0.95" />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="2" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
    <filter id="sil-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </>
);

/** Лучи от луны: узкие клинья, расходятся влево и вверх */
const rays = Array.from({ length: 9 }, (_, i) => {
  const angle = ((168 + i * 12) * Math.PI) / 180;
  const spread = (1.6 * Math.PI) / 180;
  const far = 760;
  const p1 = [SUN.x + Math.cos(angle - spread) * far, SUN.y + Math.sin(angle - spread) * far];
  const p2 = [SUN.x + Math.cos(angle + spread) * far, SUN.y + Math.sin(angle + spread) * far];
  return `M${SUN.x} ${SUN.y} L${p1[0].toFixed(0)} ${p1[1].toFixed(0)} L${p2[0].toFixed(0)} ${p2[1].toFixed(0)} Z`;
}).join(' ');

const starRandom = random(41);
const STARS = Array.from({ length: 40 }, () => [starRandom() * 800, starRandom() * 150, 0.5 + starRandom() * 1.1] as const);

const emberRandom = random(7);
const EMBERS = Array.from({ length: 18 }, () => [60 + emberRandom() * 680, 200 + emberRandom() * 150, 0.8 + emberRandom() * 1.4, emberRandom()] as const);

/** Дальний парящий остров с крошечными деревьями */
const farIsland = (x: number, y: number, w: number) =>
  `M${x} ${y} Q${x + w / 2} ${y - 6} ${x + w} ${y} Q${x + w * 0.8} ${y + 20} ${x + w * 0.5} ${y + 34} Q${x + w * 0.25} ${y + 18} ${x} ${y} Z ` +
  `M${x + w * 0.2} ${y - 2} l3 -14 l3 14 Z M${x + w * 0.32} ${y - 2} l2.5 -10 l2.5 10 Z M${x + w * 0.7} ${y - 3} l3.5 -17 l3.5 17 Z`;

const sky = (
  <g>
    <rect width="800" height="360" fill="url(#sil-sky)" />
    {STARS.map(([x, y, r], i) => (
      <circle key={i} className={i % 5 ? undefined : 'a-twinkle'} cx={x} cy={y} r={r} fill="#ffeedd" opacity={0.85 - y / 220} />
    ))}
    <circle cx={SUN.x} cy={SUN.y} r="250" fill="url(#sil-halo)" />
    <path className="a-rays" d={rays} fill="url(#sil-ray)" />
    <circle cx={SUN.x} cy={SUN.y} r="54" fill="url(#sil-sun)" />
    <path
      d="M0 272 L60 252 L110 264 L170 238 L240 260 L300 246 L360 264 L430 242 L500 260 L560 248 L620 264 L690 240 L760 258 L800 250 V360 H0 Z"
      fill="#8c3f6c"
      opacity="0.55"
    />
    <path d="M0 288 Q120 272 240 286 Q360 270 480 284 Q600 270 720 282 Q770 278 800 284 V302 Q600 298 400 302 Q200 298 0 304 Z" fill="#ffb27a" opacity="0.3" />
    <path d={farIsland(40, 196, 110)} fill="#4f1f55" />
    <path d={farIsland(690, 150, 80)} fill="#5c2459" />
    <path d="M0 314 Q80 294 170 308 Q260 292 350 310 Q440 294 530 308 Q620 292 710 306 Q760 300 800 306 V360 H0 Z" fill="#2c1238" />
    <rect y="280" width="800" height="80" fill="url(#sil-fog)" />
    {EMBERS.map(([x, y, r, delay], i) => (
      <circle key={i} className="a-rise" cx={x} cy={y} r={r} fill={i % 3 ? '#ffc58a' : '#ff8fb1'} style={{ animationDelay: `${-delay * 6}s` }} />
    ))}
  </g>
);

const tuftRandom = random(3);
const tufts = Array.from({ length: 56 }, (_, i) => {
  const x = 12 + i * 7 + tuftRandom() * 3;
  const top = 21 + 10 * ((x - 210) / 204) ** 2;
  return `M${x.toFixed(1)} ${(top + 2).toFixed(1)} L${(x + 2).toFixed(1)} ${(top - 4 - tuftRandom() * 5).toFixed(1)} L${(x + 4).toFixed(1)} ${(top + 2).toFixed(1)} Z`;
}).join(' ');

const TREE =
  'M400 31 Q398 18 403 8 Q398 2 391 -1 L392.5 -3 Q400 0 404 5 Q407 -2 414 -5 L415 -3 Q409 0 406 8 Q404.5 18 406.5 31 Z ' +
  'M383 -9 a9 8 0 1 1 18 0 a9 8 0 1 1 -18 0 Z M392 -17 a12 11 0 1 1 24 0 a12 11 0 1 1 -24 0 Z M407 -8 a8 7 0 1 1 16 0 a8 7 0 1 1 -16 0 Z';

const island = (
  <g filter="url(#sil-rim)">
    <path d={ISLAND.rock} fill={SIL} />
    <path d={ISLAND.grass} fill={SIL} />
    <path d={tufts} fill={SIL} />
    {ISLAND.bushes.slice(0, 2).map((d) => (
      <path key={d} d={d} fill={SIL} />
    ))}
    <path d={TREE} fill={SIL} />
  </g>
);

function gem(kind: keyof typeof GEM_COLORS) {
  const c = GEM_COLORS[kind];
  return (
    <g>
      <Glow className="a-glow" x={20} y={28} r={34} light={kind} />
      <g filter="url(#sil-glow)">
        <path d={GEM.mid} fill={c.main} />
        <path d={GEM.left} fill={c.light} />
        <path d={GEM.right} fill={c.dark} />
        <path d={GEM.top} fill="#ffffff" opacity="0.6" />
      </g>
    </g>
  );
}

const isWall = (x: number, y: number) => {
  const cell = DUNGEON_MAP[y]?.[x];
  return cell === undefined || cell === '#' || cell === 'T';
};

export const silhouetteKit: Kit = {
  id: 'silhouette',
  name: 'Силуэты и свет',
  about: 'Тёмные силуэты против низкой луны, контровой свет по краю, дымка между планами. Цветом горят только источники света.',
  traits: [
    'Шрифты Philosopher и Golos Text',
    'Глубина за счёт планов и света, а не мелких деталей',
    'Любой силуэт из готового набора сразу вписывается в стиль',
  ],
  defs,
  sky,
  island,
  hero: <Silhouette figure={HERO_FIGURE} lit={{ crystal: '#e6fdff' }} light="cyan" />,
  villain: (
    <g>
      <Silhouette figure={VILLAIN_FIGURE} light="blue" />
      <path className="a-twinkle" d={sparkle(55.5, 38.6, 3.4)} fill="#e6f0ff" filter="url(#sil-glow)" />
    </g>
  ),
  mentor: (
    <g>
      <circle cx="60" cy="60" r="60" fill="url(#sil-portrait)" />
      <Silhouette figure={MENTOR_FIGURE} />
      <g className="a-blink" fill="#ffd27a" filter="url(#sil-glow)">
        {MENTOR_FIGURE.dots.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  ),
  gem,
  wall: (x, y) => (
    <g>
      <rect width="40" height="40" fill="#0c0712" />
      <path d="M2 2 H22 V18 H2 Z M25 2 H38 V18 H25 Z M2 21 H11 V38 H2 Z M14 21 H38 V38 H14 Z" fill="none" stroke="#1d1128" strokeWidth="1" />
      {!isWall(x, y + 1) && <rect y="37" width="40" height="3" fill="#4a2650" />}
      {!isWall(x - 1, y) && <rect width="2" height="40" fill="#2e1838" />}
      {!isWall(x + 1, y) && <rect x="38" width="2" height="40" fill="#2e1838" />}
    </g>
  ),
  floor: (x, y) => (
    <g>
      <rect width="40" height="40" fill="#1c1029" />
      {(x * 7 + y * 3) % 4 === 0 && <circle cx="14" cy="24" r="1" fill="#2c1a3c" />}
    </g>
  ),
  torch: (
    <g>
      <Glow className="a-glow" x={20} y={20} r={72} light="amber" />
      <path d={`${TILE.plate} ${TILE.handle} ${TILE.cup}`} fill={SIL} />
      <g className="a-flicker" filter="url(#sil-glow)">
        <path d={TILE.flameOuter} fill="#ff8a3d" />
        <path d={TILE.flameMid} fill="#ffc35c" />
        <path d={TILE.flameCore} fill="#fff4d6" />
      </g>
    </g>
  ),
  exit: (
    <g>
      <Glow className="a-glow" x={20} y={24} r={48} light="green" />
      <path d={TILE.archOuter} fill={SIL} />
      <path d={TILE.archLight} fill="#5dff9b" filter="url(#sil-glow)" />
      <path d={TILE.archCore} fill="#eafff1" />
    </g>
  ),
  icon: (d) => (
    <g>
      <rect width="512" height="512" fill="url(#sil-portrait)" />
      <path d={d} fill={SIL} filter="url(#sil-rim-big)" />
    </g>
  ),
  bug: (
    <g>
      <path d={TILE.bugLegs} stroke={SIL} strokeWidth="2.2" strokeLinecap="round" />
      <path d={TILE.bugAntennae} fill="none" stroke={SIL} strokeWidth="1.6" strokeLinecap="round" />
      <path d={`${TILE.bugHead} ${TILE.bugBody}`} fill={SIL} />
      <g className="a-blink" fill="#ff4d5e" filter="url(#sil-glow)">
        {TILE.bugEyes.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  ),
};
