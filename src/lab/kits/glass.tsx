import { HERO_FIGURE, MENTOR_FIGURE, VILLAIN_FIGURE, type Role } from '../figures';
import { circle, GEM, GEM_COLORS, ISLAND, star, TILE } from '../shapes';
import type { Kit } from '../types';
import { polygonPath, shade, voronoi } from '../voronoi';
import { paint } from './glassPaint';
import { Glass, LEAD } from './glassParts';

/*
  Витраж: сцена — окно собора. Осколки цветного стекла в свинцовых перемычках,
  лица расписаны по стеклу. Витраж не двигается: по нему проходит свет.
*/

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const channel = (shift: number) => Math.round(((pa >> shift) & 255) + (((pb >> shift) & 255) - ((pa >> shift) & 255)) * t);
  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`;
}

/** Цвет неба по высоте: синий сверху, фиолетовый, розовый у горизонта */
function skyColor(y: number): string {
  const stops = ['#1d2c7e', '#33308f', '#5a3594', '#9a4690', '#c86386'];
  const t = Math.min(0.999, Math.max(0, y / 360)) * (stops.length - 1);
  const i = Math.floor(t);
  return mix(stops[i], stops[i + 1], t - i);
}

const MOON = { x: 668, y: 86, r: 36 };

const skyCells = voronoi(0, 0, 800, 360, 150, 17);
const moonCells = voronoi(MOON.x - MOON.r, MOON.y - MOON.r, MOON.r * 2, MOON.r * 2, 7, 5);
const heroCells = voronoi(0, 0, 100, 140, 70, 23);
const villainCells = voronoi(0, 0, 100, 150, 70, 29);
const mentorCells = voronoi(0, 0, 120, 120, 54, 31);
const medallionCells = voronoi(0, 0, 120, 120, 26, 37);
const islandCells = voronoi(0, 0, 420, 140, 80, 43);
const iconCells = voronoi(0, 0, 512, 512, 46, 51);
const ICON_COLORS = ['#7b8fd6', '#c8344f', '#5fe3f2', '#e8b93c', '#6b7590', '#d23a45'];

const STAR_SPOTS: [number, number, number][] = [
  [80, 50, 8], [200, 96, 6], [312, 40, 7], [460, 70, 6], [540, 30, 5], [760, 140, 7], [120, 160, 5],
];

const sky = (
  <g>
    {skyCells.map((cell, i) => {
      const near = Math.hypot(cell.center[0] - MOON.x, cell.center[1] - MOON.y);
      const base = skyColor(cell.center[1]);
      const color = near < 110 ? mix(base, '#7d6bc0', 1 - near / 110) : base;
      return <path key={i} d={polygonPath(cell.polygon)} fill={shade(color, (cell.jitter - 0.5) * 0.22)} stroke={LEAD} strokeWidth="2" />;
    })}
    <Glass pieces={[{ d: circle(MOON.x, MOON.y, MOON.r), color: '#f2d675' }]} cells={moonCells} spread={0.18} />
    <Glass pieces={STAR_SPOTS.map(([x, y, r]) => ({ d: star(x, y, r, 4, 0.38), color: '#ffe9a0' }))} />
  </g>
);

const HERO_COLORS: Partial<Record<Role, string>> = {
  hat: '#7b4fd6',
  hatDark: '#5a33b0',
  band: '#e8b93c',
  skin: '#f0c9a4',
  hair: '#8a5530',
  cloak: '#2f62c9',
  cloakDark: '#22489c',
  cloth: '#e6e0f2',
  trim: '#e8b93c',
  staff: '#9a6235',
  crystal: '#5fe3f2',
  boot: '#5a3518',
  scarf: '#c8344f',
};

const VILLAIN_COLORS: Partial<Record<Role, string>> = {
  hat: '#4a5163',
  hatDark: '#353a48',
  band: '#2f6fe0',
  skin: '#e4e7ec',
  hair: '#24262e',
  coat: '#4c5466',
  coatDark: '#363c4b',
  shirt: '#f2f2f6',
  tie: '#2f6fe0',
  glove: '#f2f2f6',
  cane: '#b9c0cc',
  metal: '#dfe3ea',
  boot: '#1c1e25',
};

const MENTOR_COLORS: Partial<Record<Role, string>> = {
  robe: '#5634b8',
  robeDark: '#40258f',
  trim: '#e8b93c',
  skin: '#f0c9a4',
  beard: '#eef0f6',
  hat: '#7b4fd6',
  hatDark: '#5a33b0',
  band: '#e8b93c',
};

const island = (
  <Glass
    pieces={[
      { d: ISLAND.rock, color: '#8a5634' },
      { d: ISLAND.rockShade, color: '#673e24' },
      ...ISLAND.bushes.map((d) => ({ d, color: '#2f8a45' })),
      { d: ISLAND.grass, color: '#4fae54' },
    ]}
    cells={islandCells}
    lines={[ISLAND.strata]}
  />
);

function gem(kind: keyof typeof GEM_COLORS) {
  const c = GEM_COLORS[kind];
  return (
    <g>
      <circle className="a-glow" cx="20" cy="28" r="26" fill={c.main} opacity="0.35" filter="url(#glass-bloom)" />
      <Glass
        pieces={[
          { d: GEM.mid, color: c.main },
          { d: GEM.left, color: c.light },
          { d: GEM.right, color: c.dark },
          { d: GEM.top, color: '#ffffff' },
        ]}
      />
    </g>
  );
}

const defs = (
  <>
    <filter id="glass-bloom" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </>
);

const BRICK_COLORS = ['#3c4872', '#45527e', '#36416a', '#4a5683'];

export const glassKit: Kit = {
  id: 'glass',
  name: 'Витраж',
  about: 'Сцена — окно собора: цветное стекло в свинцовых перемычках, лица расписаны по стеклу. Витраж стоит, по нему проходит свет.',
  traits: [
    'Шрифты Old Standard TT и PT Serif',
    'Осколки режутся сами: витражом становится любой силуэт',
    'Самый «магический»; почти без анимации, оживляет свет',
  ],
  defs,
  sky,
  island,
  hero: <Glass pieces={paint(HERO_FIGURE, HERO_COLORS)} cells={heroCells} lines={HERO_FIGURE.lines} dots={HERO_FIGURE.dots} />,
  villain: <Glass pieces={paint(VILLAIN_FIGURE, VILLAIN_COLORS)} cells={villainCells} lines={VILLAIN_FIGURE.lines} dots={VILLAIN_FIGURE.dots} />,
  mentor: (
    <g>
      <Glass pieces={[{ d: circle(60, 60, 60), color: '#2c3f90' }]} cells={medallionCells} spread={0.35} />
      <Glass pieces={paint(MENTOR_FIGURE, MENTOR_COLORS)} cells={mentorCells} lines={MENTOR_FIGURE.lines} dots={MENTOR_FIGURE.dots} />
      <circle cx="60" cy="60" r="58" fill="none" stroke="#c9a24a" strokeWidth="3" />
      <circle cx="60" cy="60" r="59.5" fill="none" stroke={LEAD} strokeWidth="1.5" />
    </g>
  ),
  gem,
  wall: (x, y) => (
    <g>
      <rect width="40" height="40" fill={LEAD} />
      {TILE.bricks.map(([bx, by, w, h], i) => (
        <rect key={i} x={bx} y={by} width={w} height={h} fill={BRICK_COLORS[(x + y + i) % 4]} stroke={LEAD} strokeWidth="1.2" />
      ))}
    </g>
  ),
  floor: (x, y) => (
    <g stroke={LEAD} strokeWidth="1.4">
      <path d="M0 0 H40 L0 40 Z" fill={(x + y) % 2 ? '#2c2244' : '#342852'} />
      <path d="M40 0 V40 H0 Z" fill={(x + y) % 2 ? '#342852' : '#2c2244'} />
    </g>
  ),
  torch: (
    <g>
      <circle className="a-glow" cx="20" cy="14" r="20" fill="#f5a83c" opacity="0.55" filter="url(#glass-bloom)" />
      <Glass
        pieces={[
          { d: TILE.plate, color: '#6d6f80' },
          { d: TILE.handle, color: '#8a5530' },
          { d: TILE.cup, color: '#8d90a3' },
          { d: TILE.flameOuter, color: '#e8742c' },
          { d: TILE.flameMid, color: '#f5b53c' },
          { d: TILE.flameCore, color: '#fff0b8' },
        ]}
      />
    </g>
  ),
  exit: (
    <g>
      <circle className="a-glow" cx="20" cy="24" r="20" fill="#3fc06a" opacity="0.5" filter="url(#glass-bloom)" />
      <Glass
        pieces={[
          { d: TILE.archOuter, color: '#1f6b3c' },
          { d: TILE.archLight, color: '#3fc06a' },
          { d: TILE.archCore, color: '#c9f7d6' },
        ]}
      />
    </g>
  ),
  icon: (d, i) => (
    <g>
      <rect width="512" height="512" fill="#241d33" />
      <Glass pieces={[{ d, color: ICON_COLORS[i % ICON_COLORS.length] }]} cells={iconCells} weight={7} spread={0.35} />
    </g>
  ),
  bug: (
    <g>
      <path d={`${TILE.bugLegs} ${TILE.bugAntennae}`} fill="none" stroke={LEAD} strokeWidth="2" strokeLinecap="round" />
      <Glass pieces={[{ d: TILE.bugHead, color: '#2a2233' }, { d: TILE.bugBody, color: '#c62f3a' }]} lines={[TILE.bugSplit]} dots={TILE.bugSpots} />
    </g>
  ),
};
