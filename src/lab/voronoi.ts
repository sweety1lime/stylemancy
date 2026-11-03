/*
  Осколки витража: прямоугольник режется на ячейки Вороного — у каждой точки своя область,
  куда ближе всего именно она. Затем ячейки обрезаются формой детали (clipPath),
  поэтому витражом становится любой силуэт, в том числе из готового набора.
*/

export type Point = [number, number];

/** Повторяемый «случай»: один и тот же seed — тот же узор при каждом запуске. */
export function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Оставить часть многоугольника, где a·x + b·y ≤ c (отсечение Сазерленда — Ходжмана). */
function clip(polygon: Point[], a: number, b: number, c: number): Point[] {
  const out: Point[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i];
    const q = polygon[(i + 1) % polygon.length];
    const pIn = a * p[0] + b * p[1] <= c;
    const qIn = a * q[0] + b * q[1] <= c;
    if (pIn) out.push(p);
    if (pIn !== qIn) {
      const t = (c - a * p[0] - b * p[1]) / (a * (q[0] - p[0]) + b * (q[1] - p[1]));
      out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
    }
  }
  return out;
}

export interface Cell {
  polygon: Point[];
  /** Центр ячейки — по нему стиль выбирает оттенок */
  center: Point;
  /** Случайное число ячейки 0–1: разброс оттенков стекла */
  jitter: number;
}

/** Ячейки Вороного в прямоугольнике x, y, width, height из count случайных точек. */
export function voronoi(x: number, y: number, width: number, height: number, count: number, seed: number): Cell[] {
  const next = random(seed);
  const seeds: Point[] = Array.from({ length: count }, () => [x + next() * width, y + next() * height]);
  const box: Point[] = [
    [x, y],
    [x + width, y],
    [x + width, y + height],
    [x, y + height],
  ];
  return seeds.map((s, i) => {
    let polygon = box;
    for (let j = 0; j < seeds.length && polygon.length; j++) {
      if (j === i) continue;
      const o = seeds[j];
      // Ближе к s, чем к o: (o − s)·p ≤ (|o|² − |s|²) / 2
      polygon = clip(polygon, o[0] - s[0], o[1] - s[1], (o[0] ** 2 + o[1] ** 2 - s[0] ** 2 - s[1] ** 2) / 2);
    }
    return { polygon, center: s, jitter: next() };
  });
}

export function polygonPath(polygon: Point[]): string {
  return `M${polygon.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L')} Z`;
}

/** Светлее (amount > 0) или темнее (amount < 0) цвет #rrggbb. */
export function shade(hex: string, amount: number): string {
  const value = parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const target = amount > 0 ? 255 : 0;
  const k = Math.abs(amount);
  return `#${channels.map((ch) => Math.round(ch + (target - ch) * k).toString(16).padStart(2, '0')).join('')}`;
}
