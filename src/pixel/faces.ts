import { recolor, type Sprite } from './pixelArt';
import { PORTRAITS } from './sprites';

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
