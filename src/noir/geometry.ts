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
