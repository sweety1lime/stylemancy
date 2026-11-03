import { HERO_FIGURE, MENTOR_FIGURE, VILLAIN_FIGURE } from '../figures';
import { circle, DUNGEON_MAP, GEM, GEM_COLORS, ISLAND, TILE } from '../shapes';
import type { Kit } from '../types';
import { random } from '../voronoi';
import { BG, Neon } from './neonParts';

/*
  Неон-код: магия как живой код. Фигуры — светящиеся трубки на тёмном фоне,
  вместо звёзд — знаки кода, под островом — дорожки, как на плате.
  Лорд Дефолт целиком синий, как ссылка без стилей, и мигает, как неисправная вывеска.
*/

const defs = (
  <>
    <filter id="neon-glow-big" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="near" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="26" result="far" />
      <feMerge>
        <feMergeNode in="far" />
        <feMergeNode in="far" />
        <feMergeNode in="near" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <filter id="neon-glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="near" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="far" />
      <feMerge>
        <feMergeNode in="far" />
        <feMergeNode in="far" />
        <feMergeNode in="near" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="neon-floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ff4fd8" stopOpacity="0.55" />
      <stop offset="1" stopColor="#ff4fd8" stopOpacity="0.12" />
    </linearGradient>
  </>
);

const ICON_COLORS = ['#7a5cff', '#ff4fd8', '#2ee6ff', '#ffe14d', '#4d7cff', '#ff4f6d'];

const GLYPHS = ['{', '}', '</>', ';', '=>', '()', '#', '.', '*', '[]', '&&', '!'];
const glyphRandom = random(11);
const CODE_STARS = Array.from({ length: 34 }, (_, i) => ({
  x: 20 + glyphRandom() * 760,
  y: 16 + glyphRandom() * 220,
  text: GLYPHS[i % GLYPHS.length],
  size: 8 + glyphRandom() * 7,
  bright: glyphRandom() > 0.75,
}));

/** Пол-сетка до горизонта, как в ретро-неоне */
const HORIZON = 300;
const grid = [
  ...Array.from({ length: 21 }, (_, i) => `M${400 + (i - 10) * 26} ${HORIZON} L${400 + (i - 10) * 150} 360`),
  ...[0.06, 0.16, 0.32, 0.56, 0.9].map((t) => `M0 ${(HORIZON + t * 60).toFixed(1)} H800`),
].join(' ');

const sky = (
  <g>
    <rect width="800" height="360" fill={BG} />
    {CODE_STARS.map((s, i) => (
      <text
        key={i}
        className={s.bright ? 'a-twinkle' : undefined}
        x={s.x}
        y={s.y}
        fontSize={s.size}
        fontFamily="'JetBrains Mono', monospace"
        fill={s.bright ? '#8f6bff' : '#3b2d6b'}
      >
        {s.text}
      </text>
    ))}
    <g filter="url(#neon-glow)" fill="none" strokeLinecap="round">
      <circle cx="668" cy="86" r="30" stroke="#ffe14d" strokeWidth="1.6" />
      <path d="M676 60 A26 26 0 0 1 676 112" stroke="#ffe14d" strokeWidth="1" opacity="0.6" />
      <path d={`M0 ${HORIZON} H800`} stroke="#ff4fd8" strokeWidth="1.4" />
      <path d={grid} stroke="url(#neon-floor)" strokeWidth="0.9" />
    </g>
  </g>
);

const island = (
  <g filter="url(#neon-glow)" strokeLinejoin="round" strokeLinecap="round">
    <path d={ISLAND.rock} fill={BG} stroke="#a066ff" strokeWidth="1.5" />
    <path d={ISLAND.strata} fill="none" stroke="#a066ff" strokeWidth="0.9" opacity="0.5" />
    {/* Дорожки платы внутри скалы */}
    <path
      d="M110 56 H170 L184 70 H232 M250 60 H300 L312 72 H352 M170 86 H214 L226 98 H262 M198 112 H232"
      fill="none"
      stroke="#2ee6ff"
      strokeWidth="1"
      opacity="0.75"
    />
    {[
      [110, 56],
      [232, 70],
      [250, 60],
      [352, 72],
      [170, 86],
      [262, 98],
      [198, 112],
      [232, 112],
    ].map(([x, y]) => (
      <path key={`${x},${y}`} d={circle(x, y, 2)} fill={BG} stroke="#2ee6ff" strokeWidth="1" />
    ))}
    {ISLAND.bushes.map((d) => (
      <path key={d} d={d} fill={BG} stroke="#3dffa0" strokeWidth="1.2" />
    ))}
    <path d={ISLAND.grass} fill={BG} stroke="#3dffa0" strokeWidth="1.6" />
  </g>
);

function gem(kind: keyof typeof GEM_COLORS) {
  const c = GEM_COLORS[kind];
  return (
    <g filter="url(#neon-glow)" fill="none" strokeLinejoin="round">
      <path d={GEM.outer} fill={c.main} fillOpacity="0.14" stroke={c.main} strokeWidth="1.6" />
      <path d="M12 17 V39 M28 17 V39 M12 17 H28 M20 2 L12 17 M20 2 L28 17 M12 39 L20 54 L28 39" stroke={c.light} strokeWidth="0.8" opacity="0.8" />
    </g>
  );
}

const isWall = (x: number, y: number) => {
  const cell = DUNGEON_MAP[y]?.[x];
  return cell === undefined || cell === '#' || cell === 'T';
};

/** Стены подземелья — светящиеся линии вдоль прохода, как неоновый лабиринт */
function wall(x: number, y: number) {
  const edges: string[] = [];
  if (!isWall(x, y - 1)) edges.push('M1 2 H39');
  if (!isWall(x, y + 1)) edges.push('M1 38 H39');
  if (!isWall(x - 1, y)) edges.push('M2 1 V39');
  if (!isWall(x + 1, y)) edges.push('M38 1 V39');
  return (
    <g>
      <rect width="40" height="40" fill="#100c22" />
      {/* Прозрачный квадрат даёт группе размер: у фильтра на одной прямой линии область нулевой высоты, и линия пропадает */}
      {edges.length > 0 && (
        <g filter="url(#neon-glow)">
          <rect width="40" height="40" fill="none" />
          <path d={edges.join(' ')} stroke="#7a5cff" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

export const neonKit: Kit = {
  id: 'neon',
  name: 'Неон-код',
  about: 'Магия как живой код: фигуры — светящиеся трубки, вместо звёзд — знаки кода, под островом — дорожки, как на плате.',
  traits: [
    'Шрифты Unbounded и JetBrains Mono',
    'Ближе всех к теме: игра учит коду',
    'Подходят готовые наборы линейных иконок (Tabler, Lucide)',
  ],
  defs,
  sky,
  island,
  hero: (
    <Neon
      figure={HERO_FIGURE}
      colors={{
        hat: '#ff4fd8',
        band: '#ffe14d',
        skin: '#ffe6cc',
        hair: '#ffb36b',
        cloak: '#2ee6ff',
        cloth: '#a8f0ff',
        trim: '#ffe14d',
        staff: '#ffb14d',
        crystal: '#e8ffff',
        boot: '#7c8bff',
        scarf: '#ff4fd8',
      }}
    />
  ),
  villain: (
    <g className="a-buzz">
      <Neon
        figure={VILLAIN_FIGURE}
        colors={{
          hat: '#4d7cff',
          hatDark: '#4d7cff',
          band: '#9fd0ff',
          skin: '#e8f0ff',
          hair: '#e8f0ff',
          coat: '#4d7cff',
          coatDark: '#3a5fd0',
          shirt: '#ffffff',
          tie: '#9fd0ff',
          glove: '#ffffff',
          cane: '#9fb3ff',
          metal: '#ffffff',
          boot: '#4d7cff',
        }}
      />
    </g>
  ),
  mentor: (
    <g>
      <rect width="120" height="120" fill={BG} />
      <circle cx="60" cy="60" r="56" fill="none" stroke="#2ee6ff" strokeWidth="1.4" filter="url(#neon-glow)" />
      <Neon
        figure={MENTOR_FIGURE}
        width={1.6}
        colors={{ robe: '#b16bff', trim: '#ffe14d', skin: '#ffe6cc', beard: '#ffffff', hat: '#b16bff', band: '#ffe14d' }}
      />
    </g>
  ),
  gem,
  wall,
  floor: () => (
    <g>
      <rect width="40" height="40" fill={BG} />
      <circle cx="20" cy="20" r="1" fill="#2a2150" />
    </g>
  ),
  torch: (
    <g filter="url(#neon-glow)" fill="none" strokeLinejoin="round" strokeLinecap="round">
      <path d={`${TILE.cup} ${TILE.handle}`} stroke="#7c8bff" strokeWidth="1.2" />
      <g className="a-flicker">
        <path d={TILE.flameOuter} stroke="#ff9a3d" strokeWidth="1.6" />
        <path d={TILE.flameCore} stroke="#ffe14d" strokeWidth="1.2" />
      </g>
    </g>
  ),
  exit: (
    <g filter="url(#neon-glow)" fill="none">
      <path d={TILE.archOuter} stroke="#3dff9a" strokeWidth="1.6" />
      <path d={TILE.archCore} stroke="#3dff9a" strokeWidth="1.2" />
    </g>
  ),
  icon: (d, i) => (
    <g>
      <rect width="512" height="512" fill={BG} />
      <path d={d} fill={BG} stroke={ICON_COLORS[i % ICON_COLORS.length]} strokeWidth="9" strokeLinejoin="round" filter="url(#neon-glow-big)" />
    </g>
  ),
  bug: (
    <g filter="url(#neon-glow)" fill={BG} stroke="#ff4f6d" strokeLinecap="round">
      <path d={`${TILE.bugLegs} ${TILE.bugAntennae}`} fill="none" strokeWidth="1.3" />
      <path d={TILE.bugHead} strokeWidth="1.3" />
      <path d={TILE.bugBody} strokeWidth="1.5" />
      <path d={TILE.bugSplit} strokeWidth="1" />
      {TILE.bugSpots.map((d) => (
        <path key={d} d={d} strokeWidth="1" />
      ))}
    </g>
  ),
};
