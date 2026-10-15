import { recolor, type Sprite } from './pixelArt';
import { PORTRAITS, VILLAIN_BUST } from './sprites';

/*
  Живые лица: из портрета получаются кадр «моргнул» и кадр «открыл рот».
  У большинства персонажей глаза нарисованы буквой e на коже f, а рот — буквой m.
  Исключения описаны ниже: у Лорда Дефолта m — это монокль, у Древня глаза-светлячки, у Совы — совиные.
*/

/** Открытый рот: тот же рот, только тёмный */
const OPEN_MOUTH = '#4c0519';

interface FaceRule {
  /** Буква глаза и во что она превращается, когда глаз закрыт */
  eye?: [string, string];
  /** Есть ли рот, который открывается (буква m) */
  mouth?: boolean;
  /** Свои строки для закрытых глаз: номер строки → новая строка */
  blinkRows?: Record<number, string>;
}

const RULES: Record<string, FaceRule> = {
  default: { mouth: false },
  flex: { mouth: false },
  display: { mouth: false },
  cascade: { eye: ['y', 'b'], mouth: false },
  select: {
    mouth: false,
    blinkRows: {
      4: 'kbbbbbbbbbbbbbbk',
      5: 'kbbbbbbbbbbbbbbk',
      6: 'kbkkkkbbbbkkkkbk',
      7: 'kbbbbbbbbbbbbbbk',
    },
  },
};

export interface Face {
  blink?: Sprite;
  talk?: Sprite;
}

const cache = new Map<string, Face>();

/** Кадры лица персонажа — считаются один раз. */
export function faceOf(id: string): Face {
  const cached = cache.get(id);
  if (cached) return cached;
  const portrait = PORTRAITS[id] ?? PORTRAITS.flex;
  const rule = RULES[id] ?? {};
  const [eye, lid] = rule.eye ?? ['e', 'f'];
  let blink: Sprite | undefined;
  if (rule.blinkRows) {
    blink = { ...portrait, rows: portrait.rows.map((row, i) => rule.blinkRows?.[i] ?? row) };
  } else if (portrait.rows.some((row) => row.includes(eye))) {
    blink = { ...portrait, rows: portrait.rows.map((row) => row.replaceAll(eye, lid)) };
  }
  const hasMouth = (rule.mouth ?? true) && 'm' in portrait.palette;
  const face: Face = { blink, talk: hasMouth ? recolor(portrait, { m: OPEN_MOUTH }) : undefined };
  cache.set(id, face);
  return face;
}

/*
  Реакции наставника на заклинание. Радость: глаза-дуги «^ ^», рот открыт, вокруг искры.
  Раздумье: взгляд влево-вправо и капля пота у виска. Кадры тоже получаются из портрета.
  Лорд Дефолт (наставник Цитадели) наоборот: твоему успеху он не рад, а промаху — очень.
*/

export interface Reaction {
  frames: Sprite[];
  fps: number;
  repeat: number;
}

export interface Reactions {
  joy: Reaction;
  think: Reaction;
}

/** Искры и капля пота — свои буквы, чтобы не путаться с цветами портрета */
const EXTRA_PALETTE = { '*': '#fde68a', '~': '#7dd3fc' };

type Grid = string[][];

const toGrid = (sprite: Sprite): Grid => sprite.rows.map((row) => [...row]);
const toSprite = (grid: Grid, palette: Sprite['palette']): Sprite => ({ rows: grid.map((row) => row.join('')), palette });

function eyesOf(grid: Grid, eye: string): [number, number][] {
  const eyes: [number, number][] = [];
  grid.forEach((row, y) => row.forEach((ch, x) => ch === eye && eyes.push([x, y])));
  return eyes;
}

/** Глаза-дуги: на месте глаза кожа, а над ним и по бокам — дуга. Рисуем только по коже */
function happyEyes(grid: Grid, eye: string, lid: string): Grid {
  const next = grid.map((row) => [...row]);
  for (const [x, y] of eyesOf(grid, eye)) {
    next[y][x] = lid;
    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
    ]) {
      if (grid[y + dy]?.[x + dx] === lid) next[y + dy][x + dx] = eye;
    }
  }
  return next;
}

/** Взгляд в сторону: зрачки сдвигаются на пиксель, если там кожа */
function lookAside(grid: Grid, eye: string, lid: string, dir: number): Grid {
  const next = grid.map((row) => [...row]);
  for (const [x, y] of eyesOf(grid, eye)) {
    if (grid[y][x + dir] === lid) {
      next[y][x] = lid;
      next[y][x + dir] = eye;
    }
  }
  return next;
}

/** Ставит знак на прозрачные клетки — искры и пот не залезают на рисунок */
function sprinkle(grid: Grid, ch: string, points: [number, number][]): Grid {
  const next = grid.map((row) => [...row]);
  for (const [x, y] of points) if (next[y]?.[x] === '.') next[y][x] = ch;
  return next;
}

const SPARKS: [number, number][][] = [
  [
    [1, 1],
    [14, 3],
    [0, 8],
  ],
  [
    [2, 3],
    [13, 0],
    [15, 7],
  ],
];
const SWEAT: [number, number][] = [
  [14, 4],
  [14, 5],
  [15, 5],
];

const reactionCache = new Map<string, Reactions>();

/** Как наставник радуется твоему успеху и задумывается над промахом. */
export function reactionsOf(id: string): Reactions {
  const cached = reactionCache.get(id);
  if (cached) return cached;
  let reactions: Reactions;
  if (id === 'default') {
    reactions = {
      joy: { frames: VILLAIN_BUST.angry, fps: 6, repeat: 3 },
      think: { frames: VILLAIN_BUST.laugh, fps: 8, repeat: 3 },
    };
  } else {
    const portrait = PORTRAITS[id] ?? PORTRAITS.flex;
    const rule = RULES[id] ?? {};
    const [eye, lid] = rule.eye ?? ['e', 'f'];
    const palette: Record<string, string> = { ...portrait.palette, ...EXTRA_PALETTE };
    const hasMouth = (rule.mouth ?? true) && 'm' in portrait.palette;
    if (hasMouth) palette.m = OPEN_MOUTH;
    const base = toGrid(portrait);
    // У совы глаза — целые круги: радость без дуг, только искры
    const smiling = rule.blinkRows ? base : happyEyes(base, eye, lid);
    reactions = {
      joy: {
        frames: SPARKS.map((points) => toSprite(sprinkle(smiling, '*', points), palette)),
        fps: 4,
        repeat: 3,
      },
      think: {
        frames: [-1, 1].map((dir) => toSprite(sprinkle(lookAside(base, eye, lid, dir), '~', SWEAT), { ...portrait.palette, ...EXTRA_PALETTE })),
        fps: 3,
        repeat: 2,
      },
    };
  }
  reactionCache.set(id, reactions);
  return reactions;
}
