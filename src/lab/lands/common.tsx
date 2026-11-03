import { HERO_NOIR } from '../figuresNoir';
import { random } from '../voronoi';
import { Silhouette } from '../kits/silParts';
import type { Light } from '../kits/silLights';

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
