import { mirror, recolor, rockSprite, type Sprite } from './pixelArt';

const INK = '#1a1030';

/* ——— Кристаллы ——— */

const CRYSTAL_ROWS = [
  '.....oo.....',
  '....owmo....',
  '...owmmmo...',
  '..owlmmmdo..',
  '.owllmmmddo.',
  'owllmmmmmddo',
  'owlmmmmmmddo',
  'olmmmmmmmddo',
  'olmmmmmmmddo',
  'olmmmmmmdddo',
  '.olmmmmmddo.',
  '.olmmmmmddo.',
  '..olmmmddo..',
  '...olmmdo...',
  '....omdo....',
  '.....oo.....',
];

function gem(light: string, main: string, dark: string): Sprite {
  return { rows: CRYSTAL_ROWS, palette: { o: INK, w: '#ffffff', l: light, m: main, d: dark } };
}

export const GEMS = {
  amethyst: { sprite: gem('#ddd0ff', '#a78bfa', '#6d4fd8'), color: '#a78bfa', glow: 'rgba(167, 139, 250, 0.75)' },
  emerald: { sprite: gem('#b7f5d8', '#34d399', '#059669'), color: '#34d399', glow: 'rgba(52, 211, 153, 0.7)' },
  ruby: { sprite: gem('#ffd1d8', '#fb7185', '#be123c'), color: '#fb7185', glow: 'rgba(251, 113, 133, 0.7)' },
  sapphire: { sprite: gem('#cfe3ff', '#60a5fa', '#1d4ed8'), color: '#60a5fa', glow: 'rgba(96, 165, 250, 0.7)' },
  topaz: { sprite: gem('#feeaa0', '#fbbf24', '#b45309'), color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.65)' },
};

export const GEM_SHADOW: Sprite = {
  rows: ['.kkkkkk.', 'kkkkkkkk'],
  palette: { k: 'rgba(8, 4, 20, 0.55)' },
};

/* ——— Небо ——— */

export const SKY_STAR: Sprite = { rows: ['.w.', 'www', '.w.'], palette: { w: '#e9e4ff' } };

export const SKY_SPARK: Sprite = { rows: ['..w..', '..w..', 'wwwww', '..w..', '..w..'], palette: { w: '#fff7d6' } };

export const MOON: Sprite = {
  rows: [
    '...mmmm...',
    '.mmmmm....',
    'mmmmm.....',
    'mmmM......',
    'mmmM......',
    'mmmM......',
    'mmmM......',
    'mmmmm.....',
    '.mmmmm....',
    '...mmmm...',
  ],
  palette: { m: '#fef3c7', M: '#fcd34d' },
};

/** Плитка фона страницы 40×30: редкие звёзды-пиксели. */
export const SKY_TILE: Sprite = (() => {
  const grid = Array.from({ length: 30 }, () => Array<string>(40).fill('.'));
  const stars: [number, number, string][] = [
    [3, 4, 'w'],
    [17, 11, 'v'],
    [31, 6, 'v'],
    [9, 22, 'v'],
    [26, 25, 'w'],
    [37, 17, 'v'],
  ];
  for (const [x, y, c] of stars) grid[y][x] = c;
  return {
    rows: grid.map((row) => row.join('')),
    palette: { w: 'rgba(233, 228, 255, 0.5)', v: 'rgba(167, 139, 250, 0.35)' },
  };
})();

/* ——— Скалы ——— */

export const ISLAND_ROCK = rockSprite(100, 14, { k: INK, G: '#6ee7a8', g: '#2f8f5b', d: '#7a5638', D: '#5c3f28' }, 11);

/* ——— Камни моста: левый край, середина (повторяется) и правый край ——— */

const STONE_CAP = [
  '..kk',
  '.kLL',
  'kLLL',
  'kLMM',
  'kLMM',
  'kMMM',
  'kMMM',
  'kMMM',
  'kMMM',
  'kMMM',
  'kMMD',
  'kMDD',
  '.kDD',
  '..kk',
];

const STONE_TILE = [
  'kkkkkkkk',
  'LLLLLLLL',
  'LLLLLLLL',
  'MMMMMMMM',
  'MMMMMDMM',
  'MMMMMMMM',
  'MDMMMMMM',
  'MMMMMMMM',
  'MMMMMMMM',
  'MMMMMMDM',
  'MMMMMMMM',
  'DDDDDDDD',
  'DDDDDDDD',
  'kkkkkkkk',
];

const RUNE_TILE = [
  'kkkkkkkk',
  'LLLLLLLL',
  'MMMMMMMM',
  'MMMrrMMM',
  'MMMrMMMM',
  'MMMrrMMM',
  'MMMrMMMM',
  'MMMrMMMM',
  'MMMMMMMM',
  'MMMMMMMM',
  'MMMMMMMM',
  'DDDDDDDD',
  'DDDDDDDD',
  'kkkkkkkk',
];

const STONE_PALETTE = { k: INK, L: '#b8bdd6', M: '#7d8299', D: '#4b4f66' };
const RUNE_PALETTE = { k: INK, L: '#c4b5fd', M: '#6d5fc9', D: '#3b3270', r: '#f0e6ff' };

export const STONE = {
  left: { rows: STONE_CAP, palette: STONE_PALETTE },
  middle: { rows: STONE_TILE, palette: STONE_PALETTE },
  right: mirror({ rows: STONE_CAP, palette: STONE_PALETTE }),
};

export const RUNE_STONE = {
  left: { rows: STONE_CAP, palette: RUNE_PALETTE },
  middle: { rows: RUNE_TILE, palette: RUNE_PALETTE },
  right: mirror({ rows: STONE_CAP, palette: RUNE_PALETTE }),
};

/* ——— Интерфейс ——— */

export const STAR_ON: Sprite = {
  rows: ['...y...', '..yyy..', 'yyyyyyy', '.yyyyy.', '..yyy..', '.yy.yy.', 'yy...yy'],
  palette: { y: '#f6c453' },
};

export const STAR_OFF = recolor(STAR_ON, { y: '#3b2f66' });

/* ——— Медали достижений: одна форма, цвет по категории ——— */

const MEDAL_ROWS = [
  '..rr....rr..',
  '..rRr..rRr..',
  '...rRrrRr...',
  '....rRRr....',
  '...kkkkkk...',
  '..kmmmmmmk..',
  '.kmMMmmmmmk.',
  '.kmMmmmmmmk.',
  '.kmmmmmmmdk.',
  '.kmmmmmmddk.',
  '..kmmmmddk..',
  '...kkkkkk...',
];

function medal(main: string, light: string, dark: string, ribbon: string, ribbonLight: string): Sprite {
  return { rows: MEDAL_ROWS, palette: { k: INK, m: main, M: light, d: dark, r: ribbon, R: ribbonLight } };
}

export const MEDALS = {
  clean: medal('#f6c453', '#ffe9a8', '#c98f2c', '#6d3fe0', '#a78bfa'),
  persistence: medal('#fb7185', '#ffd1d8', '#be123c', '#c98f2c', '#f6c453'),
  explore: medal('#34d399', '#b7f5d8', '#059669', '#1d4ed8', '#60a5fa'),
  secret: medal('#a78bfa', '#ddd0ff', '#6d4fd8', '#3b2f66', '#7e74ad'),
  locked: medal('#3b3f56', '#555a75', '#2a2d40', '#2a2d40', '#3b3f56'),
};

export const BOOK: Sprite = {
  rows: [
    '.kkkk..kkkk.',
    'kppppkkppppk',
    'kpllpkkpllpk',
    'kppppkkppppk',
    'kpllpkkpllpk',
    'kppppkkppppk',
    'kkkkkkkkkkkk',
    '.....kk.....',
  ],
  palette: { k: '#6d3fe0', p: '#e9e4ff', l: '#7e74ad' },
};

/* ——— Портреты ——— */

export const PORTRAITS: Record<string, Sprite> = {
  flex: {
    rows: [
      '.......kk.......',
      '......khHk......',
      '......khHk......',
      '.....khhsHk.....',
      '.....khssHk.....',
      '....khhhshHk....',
      '....khhhhhHk....',
      '..kkkkkkkkkkkk..',
      '...kffffffffk...',
      '...kfeffffefk...',
      '...kffffffffk...',
      '...kbbbffbbbk...',
      '..kbbbbbbbbbbk..',
      '..krbbbbbbbbrk..',
      '.krrrbbBBbbrrrk.',
      '.krrrrbBBbrrrrk.',
    ],
    palette: {
      k: INK,
      h: '#6d3fe0',
      H: '#a78bfa',
      s: '#f6c453',
      f: '#f1c27d',
      e: INK,
      b: '#e5e7eb',
      B: '#9ca3af',
      r: '#4c2aa8',
    },
  },
  // Лорд Дефолт: серый цилиндр с синей подчёркнутой лентой — как ссылка без стилей
  default: {
    rows: [
      '....kkkkkkkk....',
      '....kttttttk....',
      '....kttTTttk....',
      '....kttTTttk....',
      '....kuuuuuuk....',
      '..kkkkkkkkkkkk..',
      '...kffffffffk...',
      '...kfefffmmfk...',
      '...kffffmemfk...',
      '...kffffffmfk...',
      '...kfkkkkkkfk...',
      '....kffffffk....',
      '..kkskwllwkskk..',
      '.ksssskllkssssk.',
      '.kssSsskkssSssk.',
      '.kssSssssssSssk.',
    ],
    palette: {
      k: '#0f0f14',
      t: '#4b5563',
      T: '#6b7280',
      u: '#2563eb',
      f: '#e5e7eb',
      e: '#0f0f14',
      m: '#3b82f6',
      w: '#ffffff',
      l: '#2563eb',
      s: '#374151',
      S: '#4b5563',
    },
  },
};

/* ——— Эмблемы земель на карте ——— */

export const EMBLEMS: Record<string, Sprite> = {
  tags: {
    rows: ['..y...y..', '.y.....y.', 'y.......y', '.y.....y.', '..y...y..'],
    palette: { y: '#fbbf24' },
  },
  forest: {
    rows: [
      '....g....',
      '...ggg...',
      '..ggGgg..',
      '.gggggGg.',
      '..ggggg..',
      '.gggGggg.',
      'ggggggggg',
      '....t....',
      '....t....',
    ],
    palette: { g: '#2f8f5b', G: '#6ee7a8', t: '#7a5638' },
  },
  fortress: {
    rows: [
      's.s.s.s.s',
      'sssssssss',
      '.sSsssss.',
      '.sssssSs.',
      '.ss.d.ss.',
      '.sssssss.',
      '.sSsssss.',
      '.sss.sss.',
      '.ss...ss.',
      '.ss...ss.',
    ],
    palette: { s: '#9ca3af', S: '#d1d5db', d: INK },
  },
  crystal: GEMS.amethyst.sprite,
};

/** Скалы под землями на карте — у каждой своя трава. */
export const LAND_ROCKS: Record<string, Sprite> = {
  tags: rockSprite(26, 7, { k: INK, G: '#86efac', g: '#22a05a', d: '#8a6240', D: '#6b4a30' }, 3),
  forest: rockSprite(26, 7, { k: INK, G: '#4ade80', g: '#166534', d: '#6b4a30', D: '#523722' }, 5),
  fortress: rockSprite(26, 7, { k: INK, G: '#a3b18a', g: '#5b6b45', d: '#6b6b7a', D: '#4b4b5a' }, 9),
  crystal: rockSprite(26, 7, { k: INK, G: '#c4b5fd', g: '#6d3fe0', d: '#4a3a7a', D: '#352a5c' }, 13),
};
