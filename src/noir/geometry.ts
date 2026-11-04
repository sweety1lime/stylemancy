import { random } from './random';

/*
  Геометрия «Сумрака»: простые фигуры для путей SVG и кристалл.
  Самоцветы те же, что в игре: аметист, изумруд, рубин, сапфир и топаз.
*/

export function ellipse(cx: number, cy: number, rx: number, ry: number): string {
  return `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${rx * 2} 0 a${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z`;
}

export function circle(cx: number, cy: number, r: number): string {
  return ellipse(cx, cy, r, r);
}

/** Звезда с points лучами; inner — толщина лучей. */
export function star(cx: number, cy: number, r: number, points = 5, inner = 0.45): string {
  const corners: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 ? r * inner : r;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    corners.push(`${(cx + Math.cos(angle) * radius).toFixed(2)} ${(cy + Math.sin(angle) * radius).toFixed(2)}`);
  }
  return `M${corners.join(' L')} Z`;
}

/** Четырёхлучевая искра. */
export function sparkle(cx: number, cy: number, r: number): string {
  return star(cx, cy, r, 4, 0.22);
}

/** Кристалл. Рамка 40 × 56. */
export const GEM = {
  outer: 'M20 2 L36 17 L36 39 L20 54 L4 39 L4 17 Z',
  left: 'M20 2 L12 17 L12 39 L20 54 L4 39 L4 17 Z',
  mid: 'M20 2 L28 17 L28 39 L20 54 L12 39 L12 17 Z',
  right: 'M20 2 L36 17 L36 39 L20 54 L28 39 L28 17 Z',
  top: 'M20 2 L28 17 L12 17 Z',
  sparkle: sparkle(12, 11, 5),
};

export const GEM_COLORS = {
  amethyst: { light: '#ddd0ff', main: '#a78bfa', dark: '#6d4fd8' },
  emerald: { light: '#b7f5d8', main: '#34d399', dark: '#059669' },
  ruby: { light: '#ffd1d8', main: '#fb7185', dark: '#be123c' },
  sapphire: { light: '#cfe3ff', main: '#60a5fa', dark: '#1d4ed8' },
  topaz: { light: '#feeaa0', main: '#fbbf24', dark: '#b45309' },
};

export type GemKind = keyof typeof GEM_COLORS;

/**
 * Ель: силуэт с неровными ярусами веток — концы лап торчат в стороны и чуть свисают.
 * x — середина, base — низ кроны, h — высота, w — ширина у земли, seed — свой узор веток.
 */
export function spruce(x: number, base: number, h: number, w: number, seed = 1): string {
  const next = random(seed);
  const tiers = 7;
  const top = base - h;
  const right: string[] = [];
  const left: string[] = [];
  for (let i = 1; i <= tiers; i++) {
    const t = i / tiers;
    const y = top + h * 0.92 * t;
    const half = (w / 2) * t ** 0.85 * (0.85 + next() * 0.3);
    const notch = half * (0.45 + next() * 0.15);
    // Конец лапы свисает на пару пикселей, потом ствол-выемка
    right.push(`L${(x + half).toFixed(1)} ${(y + 2).toFixed(1)} L${(x + notch).toFixed(1)} ${(y - h * 0.03).toFixed(1)}`);
    left.unshift(`L${(x - notch).toFixed(1)} ${(y - h * 0.03).toFixed(1)} L${(x - half).toFixed(1)} ${(y + 2).toFixed(1)}`);
  }
  const trunk = `M${(x - w * 0.04).toFixed(1)} ${(base - h * 0.06).toFixed(1)} h${(w * 0.08).toFixed(1)} V${base + h * 0.1} h${(-w * 0.08).toFixed(1)} Z`;
  return `M${x} ${top.toFixed(1)} ${right.join(' ')} L${x} ${(base - h * 0.04).toFixed(1)} ${left.join(' ')} Z ${trunk}`;
}

/**
 * Облачный вал: верх из круглых клубов от x0 до x1 вдоль линии base, снизу закрыт на bottom.
 * rMin–rMax — размер клубов, seed — свой узор. Клубы соседей сходятся острыми впадинами, как у кучевых облаков.
 */
export function billows(x0: number, x1: number, base: number, rMin: number, rMax: number, seed: number, bottom: number): string {
  const next = random(seed);
  let x = x0;
  let d = `M${x0} ${bottom} L${x0} ${base}`;
  while (x < x1) {
    const r = rMin + next() * (rMax - rMin);
    const nx = x + r * 1.9;
    const ny = base + (next() - 0.5) * r * 0.5;
    d += ` A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${nx.toFixed(1)} ${ny.toFixed(1)}`;
    x = nx;
  }
  return `${d} L${x.toFixed(1)} ${bottom} Z`;
}

/** Клуб облака: центр и радиус */
export type Puff = [number, number, number];

/**
 * Кучевой вал моря облаков: клубы разного размера вдоль линии base от x0 до x1, крупные редки.
 * Снизу их подпирает сплошная тень — её рисует тот, кто рисует вал.
 */
export function cumulus(seed: number, base: number, rMin: number, rMax: number, x0 = -100, x1 = 1100): Puff[] {
  const next = random(seed);
  const puffs: Puff[] = [];
  for (let x = x0; x < x1; ) {
    const r = rMin + next() ** 2 * (rMax - rMin);
    puffs.push([x, base + r * 0.4 + (next() - 0.5) * r * 0.5, r]);
    x += r * (0.6 + next() * 0.6);
  }
  return puffs;
}

/** Горный хребет вдали: вершины разной высоты, у каждой — отроги по склонам. Снизу закрыт на bottom */
export function ridge(seed: number, base: number, height: number, x0 = -60, x1 = 1060, bottom = 760): string {
  const next = random(seed);
  let x = x0;
  let d = `M${x0} ${bottom} L${x0} ${base}`;
  const at = (px: number, py: number) => ` L${px.toFixed(1)} ${py.toFixed(1)}`;
  while (x < x1) {
    const w = 50 + next() ** 1.5 * 220;
    const h = height * (0.25 + next() ** 1.3 * 0.75);
    d += at(x + w * 0.25, base - h * (0.3 + next() * 0.2));
    d += at(x + w * 0.42, base - h * (0.7 + next() * 0.15));
    d += at(x + w * 0.5, base - h);
    d += at(x + w * 0.63, base - h * (0.72 + next() * 0.12));
    d += at(x + w * 0.8, base - h * (0.3 + next() * 0.2));
    d += at(x + w, base - next() * height * 0.12);
    x += w;
  }
  return `${d} L${x.toFixed(1)} ${bottom} Z`;
}

/** Шестерня: зубцы по кругу и отверстие (заливка evenodd) */
export function gear(cx: number, cy: number, r: number, teeth: number): string {
  const points: string[] = [];
  const inner = r * 0.84;
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth;
    const corners: [number, number][] = [
      [inner, a],
      [r, a + step * 0.12],
      [r, a + step * 0.45],
      [inner, a + step * 0.57],
    ];
    for (const [radius, angle] of corners) points.push(`${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`);
  }
  const hole = r * 0.32;
  return `M${points.join(' L')} Z M${cx - hole} ${cy} a${hole} ${hole} 0 1 0 ${hole * 2} 0 a${hole} ${hole} 0 1 0 ${-hole * 2} 0 Z`;
}
