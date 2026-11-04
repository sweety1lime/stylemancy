import { HERO_NOIR } from '../../noir/figures';
import { gear, spruce } from '../../noir/geometry';
import { random } from '../voronoi';

export { gear, spruce };
import { Silhouette } from '../../noir/light';
import type { Light } from '../../noir/lights';

/* Общее для сцен «Света земель»: контровой свет нужного цвета, ель, шестерня, герой в кадре */

/**
 * Контровой свет: край силуэта со стороны главного света подсвечен его цветом.
 * dx, dy — куда сдвинута «тень» внутри фигуры: край виден с противоположной стороны.
 */
export function rimFilter(id: string, color: string, dx: number, dy: number, opacity = 0.65) {
  return (
    <filter key={id} id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feMorphology in="SourceAlpha" operator="erode" radius="0.35" result="inner" />
      <feOffset in="inner" dx={dx} dy={dy} result="shifted" />
      <feComposite in="SourceAlpha" in2="shifted" operator="out" result="edge" />
      <feFlood floodColor={color} floodOpacity={opacity} />
      <feComposite in2="edge" operator="in" result="rim" />
      <feGaussianBlur in="rim" stdDeviation="0.3" result="soft" />
      <feMerge>
        <feMergeNode in="SourceGraphic" />
        <feMergeNode in="soft" />
      </feMerge>
    </filter>
  );
}

export function blurFilter(id: string, deviation: number) {
  return (
    <filter key={id} id={id} x="-30%" y="-60%" width="160%" height="220%">
      <feGaussianBlur stdDeviation={deviation} />
    </filter>
  );
}

/** Ряд елей с разной высотой: одинаковый при каждом запуске */
export function forestRow(seed: number, base: number, minH: number, maxH: number, step: number): string {
  const next = random(seed);
  const out: string[] = [];
  for (let x = -10; x < 820; x += step * (0.7 + next() * 0.6)) {
    const h = minH + next() * (maxH - minH);
    out.push(spruce(x, base + next() * 6, h, h * 0.5, Math.floor(next() * 1e6)));
  }
  return out.join(' ');
}

/** Герой в кадре: x, y — где стоят ноги, scale — масштаб от рамки 100 × 140 */
export function heroAt(x: number, y: number, scale: number, rim: string, light: Light = 'ice') {
  return (
    <g transform={`translate(${x - 46 * scale} ${y - 136 * scale}) scale(${scale})`}>
      <g className="a-bob">
        <Silhouette figure={HERO_NOIR} rim={rim} fill="#05060a" lit={{ crystal: '#eef8ff' }} light={light} />
      </g>
    </g>
  );
}
