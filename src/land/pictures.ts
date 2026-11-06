import { picture } from '../levels/shared/images';
import { sized, sizeOf } from '../noir/scenes/pages';
import { spriteSvg, type Palette, type Sprite } from '../pixel/pixelArt';
import { EMBLEMS, GEAR_FRAMES, STAR_ON } from '../pixel/sprites';

/*
  Новые картинки для земель: дом, деревья, гриб, фонарь, облако, звезда, шестерня и башня. У каждой два рисунка:
  пиксельный и для «Сумрака». Имена и размеры у них одни, так что страница не прыгает при смене вида.
  Пиксельные нарисованы здесь же, кроме звезды, шестерни и башни: у них берётся готовый спрайт игры.
*/

type Cells = string[][];

function canvas(width: number, height: number): Cells {
  return Array.from({ length: height }, () => Array<string>(width).fill('.'));
}

function toSprite(cells: Cells, palette: Palette): Sprite {
  return { rows: cells.map((row) => row.join('')), palette };
}

/** Дом: красная крыша с трубой, светлые стены, два окна и дверь */
function houseSprite(): Sprite {
  const c = canvas(15, 14);
  for (let y = 0; y < 4; y++) for (const x of [9, 10]) c[y][x] = 'c';
  for (let y = 1; y <= 7; y++) for (let x = 7 - (y - 1); x <= 7 + (y - 1); x++) c[y][x] = x <= 7 ? 'R' : 'r';
  for (let x = 0; x < 15; x++) c[8][x] = x <= 7 ? 'R' : 'r';
  for (let y = 9; y < 14; y++) for (let x = 1; x <= 13; x++) c[y][x] = x === 13 ? 'W' : 'w';
  for (const wx of [3, 10]) for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) c[10 + dy][wx + dx] = 'y';
  for (let y = 11; y < 14; y++) for (let x = 6; x <= 8; x++) c[y][x] = 'd';
  c[12][8] = 'y';
  return toSprite(c, { R: '#ef6a3a', r: '#c2410c', c: '#9ca3af', w: '#fde7b0', W: '#e5c47e', y: '#7dd3fc', d: '#7a5638' });
}

/** Лиственное дерево: круглая крона с бликом и тенью, ствол */
function treeSprite(): Sprite {
  const c = canvas(13, 16);
  for (let y = 12; y < 16; y++) for (let x = 5; x <= 7; x++) c[y][x] = y === 15 ? 'T' : 't';
  for (let y = 0; y < 13; y++) {
    for (let x = 0; x < 13; x++) {
      const dx = (x - 6) / 6.4;
      const dy = (y - 6) / 6.4;
      if (dx * dx + dy * dy > 1) continue;
      const light = dx + dy;
      c[y][x] = light < -0.7 ? 'G' : light > 0.55 ? 'D' : 'g';
    }
  }
  return toSprite(c, { G: '#6ee7a8', g: '#34a36a', D: '#1f7048', t: '#8a5a36', T: '#5c3f28' });
}

/** Ель: три яруса, левая сторона светлее */
function firSprite(): Sprite {
  const c = canvas(11, 16);
  for (let y = 14; y < 16; y++) for (let x = 4; x <= 6; x++) c[y][x] = 't';
  const tiers = [
    { top: 0, height: 6, half: 3 },
    { top: 4, height: 6, half: 4 },
    { top: 8, height: 6, half: 5 },
  ];
  for (const { top, height, half } of tiers) {
    for (let y = top; y < top + height; y++) {
      const reach = Math.ceil(((y - top + 1) * half) / height);
      for (let x = 5 - reach + 1; x <= 5 + reach - 1; x++) c[y][x] = x <= 5 ? 'g' : 'D';
    }
  }
  return toSprite(c, { g: '#34a36a', D: '#1f7048', t: '#6e4a2a' });
}

/** Мухомор: красная шляпка в белых пятнах и светлая ножка */
function mushroomSprite(): Sprite {
  const c = canvas(12, 11);
  for (let y = 0; y <= 5; y++) {
    for (let x = 0; x < 12; x++) {
      const dx = (x - 5.5) / 5.8;
      const dy = (y - 5.5) / 5.8;
      if (dx * dx + dy * dy <= 1) c[y][x] = dx + dy < -0.9 ? 'R' : 'r';
    }
  }
  for (const [x, y] of [[3, 2], [7, 1], [8, 4], [5, 3]]) c[y][x] = 'w';
  for (let x = 1; x <= 10; x++) c[6][x] = 'b';
  for (let y = 7; y < 11; y++) for (let x = 4; x <= 7; x++) c[y][x] = x === 7 ? 'Z' : 'S';
  return toSprite(c, { R: '#ff6b6b', r: '#d9363e', w: '#ffffff', b: '#f3e1b4', S: '#fff3cf', Z: '#e5c984' });
}

/** Фонарь с тёплым светом */
function lanternSprite(): Sprite {
  return {
    rows: [
      '...kkk...',
      '..k...k..',
      '..k...k..',
      '.mmmmmmm.',
      '.mYYYYYm.',
      '.mYyyyYm.',
      '.mYyyyYm.',
      '.mYyyyYm.',
      '.mYYYYYm.',
      '.mmmmmmm.',
      '..m...m..',
    ],
    palette: { k: '#8b6f47', m: '#a0804f', Y: '#fff1b8', y: '#fbbf24' },
  };
}

/** Облако из трёх кругов с плоским дном */
function cloudSprite(): Sprite {
  const c = canvas(16, 7);
  const circles = [
    [4, 4, 3.2],
    [8.5, 3, 3.8],
    [12.5, 4, 3.2],
  ];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 16; x++) {
      const inside = circles.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r) || (y >= 4 && y <= 5 && x >= 2 && x <= 13);
      if (inside && y <= 5) c[y][x] = y < 4 ? 'w' : 'b';
    }
  }
  for (let x = 3; x <= 12; x++) c[6][x] = 'b';
  return toSprite(c, { w: '#ffffff', b: '#c7d2fe' });
}

/* ——— Рисунки «Сумрака»: тёмное тело, светлая линия и свечение ——— */

const GLOW = `<filter id="g" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

function noirSvg(viewBox: string, body: string, defs = ''): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><defs>${GLOW}${defs}</defs>${body}</svg>`;
}

/** Точки многоугольника-звезды или шестерни: радиус чередуется между внешним и внутренним */
function ring(cx: number, cy: number, outer: number, inner: number, points: number, turn = 0): string {
  const out: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = turn + (Math.PI * i) / points - Math.PI / 2;
    out.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
  }
  return out.join(' ');
}

/** Шестерня: зубцы — трапеции вокруг круга */
function gearPoints(cx: number, cy: number, teeth: number, outer: number, inner: number): string {
  const out: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const base = i * step - Math.PI / 2;
    for (const [angle, radius] of [
      [base - step * 0.24, inner],
      [base - step * 0.14, outer],
      [base + step * 0.14, outer],
      [base + step * 0.24, inner],
    ] as const) {
      out.push(`${(cx + radius * Math.cos(angle)).toFixed(2)},${(cy + radius * Math.sin(angle)).toFixed(2)}`);
    }
  }
  return out.join(' ');
}

const NOIR_HOUSE = noirSvg(
  '0 0 60 56',
  `<rect x="39" y="4" width="7" height="15" fill="#14100c" stroke="#c9a27a" stroke-opacity=".6"/>
<path d="M30 3 L58 30 H2 Z" fill="#1a1410" stroke="#f0c890" stroke-opacity=".8" stroke-width="1.2" stroke-linejoin="round"/>
<rect x="6" y="30" width="48" height="24" fill="#0e1119" stroke="#b9cbe8" stroke-opacity=".4"/>
<rect x="13" y="37" width="9" height="9" fill="url(#w)" filter="url(#g)"/>
<rect x="38" y="37" width="9" height="9" fill="url(#w)" filter="url(#g)"/>
<path d="M13 41.5 H22 M17.5 37 V46 M38 41.5 H47 M42.5 37 V46" stroke="#0e1119" stroke-width="1"/>
<path d="M26 54 V43 Q30 38 34 43 V54 Z" fill="#241a10" stroke="#f0c890" stroke-opacity=".55"/>
<circle cx="32" cy="48.5" r=".9" fill="#ffd9a0"/>`,
  `<radialGradient id="w"><stop offset="0" stop-color="#fff0cf"/><stop offset="1" stop-color="#ffb35c"/></radialGradient>`,
);

const NOIR_TREE = noirSvg(
  '0 0 52 64',
  `<path d="M23 38 H29 L30 62 H22 Z" fill="#1d1712" stroke="#c9a27a" stroke-opacity=".6"/>
<g fill="#0f1a16" stroke="#5dffb0" stroke-opacity=".6" stroke-width="1.2"><circle cx="26" cy="22" r="17"/><circle cx="13" cy="31" r="10"/><circle cx="39" cy="31" r="10"/></g>
<g fill="#0f1a16"><circle cx="26" cy="22" r="16.4"/><circle cx="13" cy="31" r="9.4"/><circle cx="39" cy="31" r="9.4"/></g>
<g fill="#5dffb0" opacity=".75" filter="url(#g)"><circle cx="20" cy="16" r="1"/><circle cx="31" cy="24" r="1"/><circle cx="14" cy="31" r=".9"/><circle cx="37" cy="14" r=".8"/></g>`,
);

const NOIR_FIR = noirSvg(
  '0 0 44 64',
  `<rect x="19" y="54" width="6" height="9" fill="#1d1712" stroke="#c9a27a" stroke-opacity=".6"/>
<g fill="#0f1a16" stroke="#5dffb0" stroke-opacity=".55" stroke-width="1.1" stroke-linejoin="round"><path d="M22 28 L43 56 H1 Z"/><path d="M22 14 L40 40 H4 Z"/><path d="M22 2 L36 24 H8 Z"/></g>
<g fill="#5dffb0" opacity=".7" filter="url(#g)"><circle cx="20" cy="18" r=".9"/><circle cx="26" cy="34" r=".9"/><circle cx="15" cy="46" r=".9"/><circle cx="29" cy="50" r=".8"/></g>`,
);

const NOIR_MUSHROOM = noirSvg(
  '0 0 48 44',
  `<path d="M20 25 H28 L29.5 42 H18.5 Z" fill="#1a1a22" stroke="#dfe8f5" stroke-opacity=".45"/>
<path d="M3 26 Q3 4 24 4 Q45 4 45 26 Z" fill="#2a0d18" stroke="#ff7b98" stroke-opacity=".85" stroke-width="1.2" stroke-linejoin="round"/>
<g fill="#ffe2e9" opacity=".9" filter="url(#g)"><circle cx="15" cy="15" r="2.6"/><circle cx="28" cy="11" r="2"/><circle cx="35" cy="20" r="2.4"/><circle cx="22" cy="21" r="1.6"/></g>`,
);

const NOIR_LANTERN = noirSvg(
  '0 0 36 44',
  `<circle cx="18" cy="26" r="17" fill="url(#l)"/>
<path d="M11 14 Q11 3 18 3 Q25 3 25 14" fill="none" stroke="#c9a27a" stroke-width="1.4"/>
<path d="M9 14 H27 L25 38 H11 Z" fill="#14100c" stroke="#f0c890" stroke-opacity=".8" stroke-width="1.2" stroke-linejoin="round"/>
<path d="M13 18 H23 L21.8 34 H14.2 Z" fill="#ffd9a0" filter="url(#g)"/>
<rect x="8" y="38" width="20" height="4" fill="#2a1d12" stroke="#f0c890" stroke-opacity=".6"/>`,
  `<radialGradient id="l"><stop offset="0" stop-color="#ffc880" stop-opacity=".5"/><stop offset="1" stop-color="#ffc880" stop-opacity="0"/></radialGradient>`,
);

const NOIR_CLOUD = noirSvg(
  '0 0 80 35',
  `<g fill="#161c2b" stroke="#b9cbe8" stroke-opacity=".55" stroke-width="1.2"><circle cx="22" cy="21" r="11"/><circle cx="42" cy="15" r="14"/><circle cx="62" cy="21" r="11"/><rect x="12" y="20" width="60" height="12" rx="6"/></g>
<g fill="#161c2b"><circle cx="22" cy="21" r="10.4"/><circle cx="42" cy="15" r="13.4"/><circle cx="62" cy="21" r="10.4"/><rect x="12.6" y="20" width="58.8" height="11.4" rx="5.7"/></g>
<path d="M20 28 H62" stroke="#dfe8f5" stroke-opacity=".14" stroke-width="2" stroke-linecap="round"/>`,
);

const NOIR_STAR = noirSvg(
  '0 0 24 24',
  `<polygon points="${ring(12, 12.6, 10.4, 4.4, 5)}" fill="#fff1b8" stroke="#ffd27a" stroke-width="1" stroke-linejoin="round" filter="url(#g)"/>`,
);

const NOIR_GEAR = noirSvg(
  '0 0 48 48',
  `<polygon points="${gearPoints(24, 24, 10, 22, 16)}" fill="#1a130a" stroke="#f0c890" stroke-opacity=".85" stroke-width="1.2" stroke-linejoin="round"/>
<circle cx="24" cy="24" r="8" fill="#0b0d14" stroke="#f0c890" stroke-opacity=".6"/>
<circle cx="24" cy="24" r="2.6" fill="#ffd9a0" filter="url(#g)"/>`,
);

const NOIR_TOWER = noirSvg(
  '0 0 45 50',
  `<path d="M9 48 V8 H15 V13 H19 V8 H26 V13 H30 V8 H36 V48 Z" fill="#0e1119" stroke="#b9cbe8" stroke-opacity=".55" stroke-width="1.2" stroke-linejoin="round"/>
<path d="M9 16 H36" stroke="#b9cbe8" stroke-opacity=".2"/>
<path d="M19.5 33 V26 Q22.5 21 25.5 26 V33 Z" fill="#ffd9a0" filter="url(#g)"/>
<path d="M17.5 48 V41 Q22.5 35.5 27.5 41 V48 Z" fill="#241a10" stroke="#f0c890" stroke-opacity=".55"/>`,
);

/* ——— Библиотека ——— */

interface Picture {
  name: string;
  /** Короткая подпись и alt по умолчанию */
  label: string;
  sprite: Sprite;
  scale: number;
  /** Рисунок «Сумрака»; без него берётся рисунок из HTML-уровней (NOIR_IMAGE_LIBRARY) */
  noir?: string;
}

const NEW_PICTURES: Picture[] = [
  { name: 'house.png', label: 'Дом', sprite: houseSprite(), scale: 4, noir: NOIR_HOUSE },
  { name: 'tree.png', label: 'Дерево', sprite: treeSprite(), scale: 4, noir: NOIR_TREE },
  { name: 'fir.png', label: 'Ель', sprite: firSprite(), scale: 4, noir: NOIR_FIR },
  { name: 'mushroom.png', label: 'Гриб', sprite: mushroomSprite(), scale: 4, noir: NOIR_MUSHROOM },
  { name: 'lantern.png', label: 'Фонарь', sprite: lanternSprite(), scale: 4, noir: NOIR_LANTERN },
  { name: 'cloud.png', label: 'Облако', sprite: cloudSprite(), scale: 5, noir: NOIR_CLOUD },
  { name: 'star.png', label: 'Звезда', sprite: STAR_ON, scale: 5, noir: NOIR_STAR },
  { name: 'gear.png', label: 'Шестерня', sprite: GEAR_FRAMES[0], scale: 3, noir: NOIR_GEAR },
  { name: 'tower.png', label: 'Башня', sprite: EMBLEMS.fortress, scale: 5, noir: NOIR_TOWER },
];

/** Новые картинки в пиксельном виде: имя файла → рисунок */
export const NEW_PIXEL_PICTURES: Record<string, string> = Object.fromEntries(NEW_PICTURES.map((item) => [item.name, picture(item.sprite, item.scale)]));

/** Те же картинки в «Сумраке»: размеры совпадают с пиксельными */
export const NEW_NOIR_PICTURES: Record<string, string> = Object.fromEntries(
  NEW_PICTURES.map((item) => [item.name, sized(item.noir ?? spriteSvg(item.sprite), sizeOf(item.sprite, item.scale))]),
);

/** Что показывает панель картинок: имя файла и подпись. Порядок — как в панели */
export const PICTURE_LABELS: { name: string; label: string }[] = [
  ...NEW_PICTURES.map(({ name, label }) => ({ name, label })),
  { name: 'moon.png', label: 'Луна' },
  { name: 'potion.png', label: 'Зелье' },
  { name: 'book.png', label: 'Книга' },
  { name: 'map.png', label: 'Карта' },
  { name: 'merchant.png', label: 'Торговка' },
  { name: 'ruby.png', label: 'Рубин' },
  { name: 'emerald.png', label: 'Изумруд' },
  { name: 'amethyst.png', label: 'Аметист' },
  { name: 'sapphire.png', label: 'Сапфир' },
  { name: 'topaz.png', label: 'Топаз' },
];
