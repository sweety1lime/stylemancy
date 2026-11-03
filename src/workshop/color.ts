/** Цвет как четыре канала 0–255: так их можно сравнивать и класть в PNG. */
export type Rgba = [number, number, number, number];

let probe: CanvasRenderingContext2D | null = null;

/** Цвет из CSS: hex и rgba() разбираются сами, остальное (имена цветов) — через canvas. */
export function parseColor(css: string): Rgba {
  const value = css.trim().toLowerCase();
  const hex = /^#([0-9a-f]{3,8})$/.exec(value)?.[1];
  if (hex && (hex.length === 3 || hex.length === 6 || hex.length === 8)) {
    const full = hex.length === 3 ? [...hex].map((ch) => ch + ch).join('') : hex;
    const channel = (i: number) => parseInt(full.slice(i * 2, i * 2 + 2), 16);
    return [channel(0), channel(1), channel(2), full.length === 8 ? channel(3) : 255];
  }
  const fn = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+)(%?))?\s*\)$/.exec(value);
  if (fn) {
    const alpha = fn[4] === undefined ? 1 : Number(fn[4]) / (fn[5] ? 100 : 1);
    return [Number(fn[1]), Number(fn[2]), Number(fn[3]), Math.round(alpha * 255)];
  }
  probe ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return [0, 0, 0, 255];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a];
}

const hex2 = (n: number) => n.toString(16).padStart(2, '0');

/** Цвет в том виде, в каком его пишут в sprites.ts: #rrggbb или rgba(r, g, b, a). */
export function cssOf([r, g, b, a]: Rgba): string {
  if (a >= 255) return `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  return `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 100) / 100})`;
}

/** Ключ для сравнения: одинаковые цвета, записанные по-разному (#FFF и #ffffff), совпадают. */
export function colorKey(css: string): string {
  return cssOf(parseColor(css));
}

export function sameColor(a: Rgba, b: Rgba, tolerance = 1): boolean {
  return a.every((value, i) => Math.abs(value - b[i]) <= tolerance);
}

function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** OKLab: в нём расстояние между цветами близко к тому, как разницу видит глаз. */
export function oklab([r, g, b]: Rgba): [number, number, number] {
  const lr = linear(r);
  const lg = linear(g);
  const lb = linear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/**
 * Разница цветов ×100: меньше 2 глаз почти не различает, 5 — заметно рядом, 10 — разные оттенки.
 * Разница прозрачности тоже считается.
 */
export function deltaE(a: Rgba, b: Rgba): number {
  const [l1, a1, b1] = oklab(a);
  const [l2, a2, b2] = oklab(b);
  const alpha = (a[3] - b[3]) / 255;
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2, alpha) * 100;
}

/** Оттенок и светлота — для сортировки палитры: серые отдельно, цветные по кругу. */
export function hueOrder(color: Rgba): [number, number, number] {
  const [l, a, b] = oklab(color);
  const chroma = Math.hypot(a, b);
  if (chroma < 0.03) return [0, 0, l];
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  // Шаг 30°: внутри одной полосы оттенка — от тёмного к светлому
  return [1, Math.floor(((hue + 360 + 15) % 360) / 30), l];
}
