import { circle, ellipse } from './geometry';

/* Короткие помощники для путей SVG: рисунки «Сумрака» собираются из простых фигур */

export const C = circle;
export const E = ellipse;

/** Прямоугольник */
export const R = (x: number, y: number, w: number, h: number) => `M${x} ${y} h${w} v${h} h${-w} Z`;

/** Многоугольник по парам координат */
export function P(...n: number[]): string {
  const points: string[] = [];
  for (let i = 0; i < n.length; i += 2) points.push(`${+n[i].toFixed(2)} ${+n[i + 1].toFixed(2)}`);
  return `M${points.join(' L')} Z`;
}

/** Кольцо толщиной w: внутренний круг — дырка при заливке evenodd */
export const ring = (cx: number, cy: number, r: number, w: number) => `${C(cx, cy, r)} ${C(cx, cy, r - w)}`;
