/*
  Геометрия примерочной: одни и те же фигуры, а подача в каждом стиле своя.
  Так при сравнении видно стиль, а не разных персонажей.
  Свет везде сверху слева: тень — справа и снизу.
*/

export { circle, ellipse, GEM, GEM_COLORS, sparkle, star, type GemKind } from '../noir/geometry';
import { circle, ellipse, star } from '../noir/geometry';

/** Нижняя половина эллипса: передний край полей шляпы. */
export function lowerHalf(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy} Z`;
}

/** Ученик Академии. Рамка 100 × 140, ноги на y = 136. */
export const HERO = {
  shadow: ellipse(50, 136, 28, 4),
  glow: circle(76, 25, 15),
  staff: 'M74 36 H78 V133 Q76 136 74 133 Z',
  staffRing: 'M71.5 35.5 H80.5 V40 H71.5 Z',
  crystal: 'M76 10 L84 25 L76 40 L68 25 Z',
  crystalLight: 'M76 10 L76 40 L68 25 Z',
  bootL: 'M39 125 H48 V136 H35 Q33 136 34 133 Q35 131 39 131 Z',
  bootR: 'M52 125 H61 V131 Q65 131 66 133 Q67 136 65 136 H52 Z',
  cloak: 'M33 81 Q36 75 50 75 Q64 75 67 81 L74 128 Q50 134 26 128 Z',
  cloakShade: 'M50 75 Q64 75 67 81 L74 128 Q64 131.5 55 132 Z',
  tunic: 'M43 77 L57 77 L60 128 L40 128 Z',
  belt: 'M40.6 100 H59.4 L59.7 105 H40.3 Z',
  buckle: 'M47.5 99 H52.5 V106 H47.5 Z',
  armL: 'M37 81 Q29 92 30 104 L36.5 104.5 Q36.5 94 41 86 Z',
  handL: circle(33.3, 106, 4),
  armR: 'M63 80 Q72 84 75.5 95 L70.5 99.5 Q66.5 90 59 85 Z',
  handR: circle(76, 98, 4.5),
  head: circle(50, 61, 15),
  headShade: 'M50 46 A15 15 0 0 1 50 76 Q58 70 58.5 61 Q58 52 50 46 Z',
  hair: 'M35.5 52 Q38 47 50 47 Q62 47 64.5 52 Q60 56 55 53 Q50 57 45 53 Q40 56 35.5 52 Z',
  eyes: [ellipse(44.5, 62.5, 1.9, 2.5), ellipse(55.5, 62.5, 1.9, 2.5)],
  cheeks: [circle(40.5, 67.5, 2.6), circle(59.5, 67.5, 2.6)],
  mouth: 'M47 69.5 Q50 72 53 69.5',
  brimBack: ellipse(50, 47.5, 27, 5.5),
  hatCone: 'M31 47 C39 36 47 22 59 4 C60 18 62.5 34 69 47 Z',
  hatShade: 'M59 4 C60 18 62.5 34 69 47 L58 47 C58 33 58.5 18 59 4 Z',
  hatBand: 'M33.5 43.5 Q50 48.5 66.5 43.5 L68 46.8 Q50 52 32 46.8 Z',
  brimFront: lowerHalf(50, 47.5, 27, 5.5),
  hatStar: star(52, 31, 5),
};

/** Лорд Дефолт. Рамка 100 × 150, ноги на y = 146. Синяя лента подчёркнута — как ссылка без стилей. */
export const VILLAIN = {
  shadow: ellipse(50, 146, 26, 4),
  legL: 'M41 110 H48 V142 H41 Z',
  legR: 'M52 110 H59 V142 H52 Z',
  shoeL: 'M48 141 V146 H35 Q34 141 41 141 Z',
  shoeR: 'M52 141 H59 Q66 141 65 146 H52 Z',
  coat: 'M35 70 Q50 63 65 70 L70 116 Q64 120 57 118 L50 100 L43 118 Q36 120 30 116 Z',
  coatShade: 'M54 65 Q60 66 65 70 L70 116 Q64 120 57 118 L54 110 Z',
  lapelL: 'M43.5 66.5 L50 88 L40 74 Z',
  lapelR: 'M56.5 66.5 L60 74 L50 88 Z',
  shirt: 'M44.5 66 L55.5 66 L50 88 Z',
  tie: 'M48.6 67.5 H51.4 L52.6 81 L50 86 L47.4 81 Z',
  collar: 'M43.5 63 H56.5 L55.5 67.5 L50 66 L44.5 67.5 Z',
  armL: 'M37 72 Q31 86 32 101 L38 101 Q38 88 42 78 Z',
  gloveL: circle(35, 103, 4.2),
  armR: 'M63 72 Q71 82 72 95 L66 96 Q65 86 58 78 Z',
  gloveR: circle(70, 97, 4.4),
  cane: 'M70.6 95 L80.6 145 L78.4 145.4 L68.4 95.4 Z',
  caneKnob: circle(69.6, 91.6, 3.4),
  head: ellipse(50, 50, 12.5, 14),
  headShade: 'M50 36 A12.5 14 0 0 1 50 64 Q57 58 57.5 50 Q57 42 50 36 Z',
  brow: 'M40.5 43.5 Q44.5 40.2 48 43',
  eyes: [ellipse(44.5, 47.5, 1.6, 2.1), ellipse(55.5, 47.5, 1.6, 2.1)],
  monocle: circle(55.5, 47.5, 5),
  chain: 'M60.3 49.5 Q64.5 60 58 70',
  mustache:
    'M50 55.5 Q45 52.5 41 55 Q38.5 57.5 36.5 55 Q38 60.5 43 59.5 Q47 59 50 57.5 Q53 59 57 59.5 Q62 60.5 63.5 55 Q61.5 57.5 59 55 Q55 52.5 50 55.5 Z',
  mouth: 'M46 62 Q50.5 63.5 54.5 61',
  hatCrown: 'M37.5 9 H62.5 L61.5 36 H38.5 Z',
  hatShine: 'M40.2 11 H44 L43.4 34 H40.8 Z',
  hatBand: 'M38.4 27 H61.6 L61.5 31.6 H38.5 Z',
  hatUnderline: 'M38.5 33 H61.5 V34.4 H38.5 Z',
  hatBrim: 'M31 36.5 Q50 32 69 36.5 Q69 39.6 50 38.6 Q31 39.6 31 36.5 Z',
};

/** Магистр Флекс, погрудно. Рамка 120 × 120. */
export const MENTOR = {
  robe: 'M10 120 Q14 94 38 87 L82 87 Q106 94 110 120 Z',
  robeShade: 'M84 88 Q104 95 110 120 L88 120 Q90 102 84 88 Z',
  robeStars: [star(25, 108, 4), star(97, 106, 3.4), star(36, 98, 2.6)],
  beard: 'M38.5 70 Q34 100 60 116 Q86 100 81.5 70 Q74 83 60 83 Q46 83 38.5 70 Z',
  beardLines: 'M50 88 Q52 99 56 107 M62 88 Q64 99 63 110 M71 86 Q72 95 68 103',
  face: ellipse(60, 64, 21, 21),
  faceShade: 'M60 43 A21 21 0 0 1 60 85 Q72 77 73 64 Q72 51 60 43 Z',
  brows: 'M43 57 Q48 53.5 54 57 M66 57 Q72 53.5 77 57',
  eyes: [ellipse(49, 63, 2.2, 2.8), ellipse(71, 63, 2.2, 2.8)],
  cheeks: [circle(46, 71, 3.5), circle(74, 71, 3.5)],
  nose: ellipse(60, 70, 4, 3.5),
  mustache: 'M42 79 Q51 72 60 77 Q69 72 78 79 Q70 84 60 80 Q50 84 42 79 Z',
  brimBack: ellipse(60, 46, 38, 8),
  hatCone: 'M33 46 C42 31 50 15 74 2 C68 18 76 32 87 46 Z',
  hatShade: 'M74 2 C68 18 76 32 87 46 L73 46 C69 31 69 16 74 2 Z',
  brimFront: lowerHalf(60, 46, 38, 8),
  hatStars: [star(51, 36, 4.6), star(66, 24, 3.4), star(70, 37, 2.4)],
};

/** Парящий остров. Рамка 420 × 140, трава сверху около y = 24. */
export const ISLAND = {
  rock: 'M14 36 Q120 32 210 34 Q300 32 406 36 Q396 66 344 90 Q300 112 262 128 Q226 140 196 134 Q150 124 112 100 Q50 72 14 36 Z',
  rockShade: 'M262 34 Q340 33 406 36 Q396 66 344 90 Q300 112 262 128 Q236 137 220 136 Q270 112 300 84 Q330 58 262 34 Z',
  strata: 'M50 62 Q130 72 214 66 Q280 62 360 70 M110 96 Q180 106 250 100 M168 120 Q200 126 236 122',
  grass: 'M6 30 Q60 18 210 20 Q360 18 414 30 Q412 40 396 41 Q300 36 210 38 Q120 36 24 41 Q8 40 6 30 Z',
  grassShade: 'M24 41 Q120 36 210 38 Q300 36 396 41 Q380 45 360 43 Q290 40 210 42 Q130 40 50 45 Q32 45 24 41 Z',
  bushes: [circle(44, 22, 9), circle(56, 20, 11), circle(376, 22, 10), circle(389, 24, 8)],
};

/** Клетки подземелья 40 × 40. */
export const TILE = {
  bricks: [
    [1, 1, 22, 17],
    [25, 1, 14, 17],
    [1, 21, 10, 18],
    [13, 21, 26, 18],
  ] as const,
  specks: [
    [9, 8],
    [30, 14],
    [17, 29],
    [33, 33],
  ] as const,
  glow: circle(20, 12, 14),
  flameOuter: 'M20 2 C27 9 27 14 25 18 H15 C13 14 14 9 20 2 Z',
  flameMid: 'M20 7 C24 11 24.4 15 23 18 H17 C15.6 15 16 11 20 7 Z',
  flameCore: 'M20 11 C22 13 22.2 16 21.5 18 H18.5 C17.8 16 18 13 20 11 Z',
  cup: 'M14.5 17.5 H25.5 L23.5 22 H16.5 Z',
  handle: 'M18.5 21 H21.5 L21 34 H19 Z',
  plate: 'M15 30 H25 V33.5 H15 Z',
  archOuter: 'M6 40 V18 Q6 4 20 4 Q34 4 34 18 V40 Z',
  archLight: 'M11 40 V19 Q11 9 20 9 Q29 9 29 19 V40 Z',
  archCore: 'M15.5 40 V21 Q15.5 14 20 14 Q24.5 14 24.5 21 V40 Z',
  bugBody: ellipse(20, 24, 11, 10),
  bugHead: circle(20, 13, 5),
  bugSplit: 'M20 14.5 V34',
  bugSpots: [circle(15, 20.5, 2.6), circle(25, 20.5, 2.6), circle(14.5, 27.5, 2.1), circle(25.5, 27.5, 2.1)],
  bugLegs: 'M9.5 19 L4 15.5 M9 25 L3 25 M10 30.5 L4.5 34 M30.5 19 L36 15.5 M31 25 L37 25 M30 30.5 L35.5 34',
  bugAntennae: 'M17.5 9 Q15 4 11.5 3.5 M22.5 9 Q25 4 28.5 3.5',
  bugEyes: [circle(18, 12, 1.2), circle(22, 12, 1.2)],
};

/** Карта подземелья для всех стилей: # стена, . пол, H герой, g кристалл, b баг, E выход, T факел на стене. */
export const DUNGEON_MAP = ['##T#####', '#H..g.E#', '#.##T###', '#..b...#', '########'];
