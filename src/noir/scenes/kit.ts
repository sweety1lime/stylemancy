import { random } from '../random';
import { NIGHT } from '../scene';

export { NIGHT };

/*
  Набор «Сумрака» для сцен уровней: картинки фона (звёзды, луна, лучи, туман, зерно) и силуэты-спрайты.
  Всё — SVG в data-URI: браузер рисует картинку фона один раз, даже с размытием и фильтрами внутри.
  Оформление меняет только картинки и цвета: размеры и отступы предметов — дело кода студента и проверки.
*/

export function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Лунный свет */
export const LIGHT = '#dfe8f5';

/** Звёзды: плитка 800 × 240 повторяется по ширине. Яркие — с ореолом, у горизонта звёзды гаснут */
export const STARS_SVG = (() => {
  const next = random(29);
  const stars = Array.from({ length: 54 }, () => [next() * 800, next() * 230, 0.35 + next() * 0.95] as const);
  const dots = stars
    .map(([x, y, r]) => {
      const o = Math.max(0.15, 0.9 - y / 260).toFixed(2);
      const glow = r > 1.1 ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r * 5).toFixed(1)}" fill="url(#s)" opacity="${o}"/>` : '';
      return `${glow}<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" fill="#dfe7f4" opacity="${o}"/>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 240">
<defs><radialGradient id="s"><stop offset="0" stop-color="#dfe7f4" stop-opacity="0.5"/><stop offset="1" stop-color="#dfe7f4" stop-opacity="0"/></radialGradient></defs>${dots}</svg>`;
})();

/** Луна справа вверху: ореол, лунные моря, облако поперёк диска с серебряной каймой. Плитка 560 × 340, луна — в (476, 50) */
export const MOON = { x: 476, y: 50, r: 26 };
export const MOON_SVG = (() => {
  const { x, y, r } = MOON;
  const top = `M${x - 70} ${y + 18} Q${x - 52} ${y + 8} ${x - 36} ${y + 11} Q${x - 18} ${y + 2} ${x} ${y + 8} Q${x + 22} ${y + 1} ${x + 44} ${y + 9} Q${x + 60} ${y + 6} ${x + 74} ${y + 17}`;
  const cloud = `${top} Q${x + 52} ${y + 26} ${x + 30} ${y + 24} Q${x + 4} ${y + 30} ${x - 24} ${y + 25} Q${x - 52} ${y + 28} ${x - 70} ${y + 18} Z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 340">
<defs>
<radialGradient id="h" gradientUnits="userSpaceOnUse" cx="${x}" cy="${y}" r="250"><stop offset="0" stop-color="#a9bcdc" stop-opacity="0.32"/><stop offset="0.4" stop-color="#7d90b4" stop-opacity="0.1"/><stop offset="1" stop-color="#7d90b4" stop-opacity="0"/></radialGradient>
<radialGradient id="b" gradientUnits="userSpaceOnUse" cx="${x}" cy="${y}" r="80"><stop offset="0" stop-color="${LIGHT}" stop-opacity="0.5"/><stop offset="0.35" stop-color="${LIGHT}" stop-opacity="0.15"/><stop offset="1" stop-color="${LIGHT}" stop-opacity="0"/></radialGradient>
<radialGradient id="m" cx="0.4" cy="0.38" r="0.65"><stop offset="0" stop-color="#f4f7fb"/><stop offset="0.7" stop-color="#cfd8e6"/><stop offset="1" stop-color="#aab6c9"/></radialGradient>
<radialGradient id="l" gradientUnits="userSpaceOnUse" cx="${x}" cy="${y}" r="62"><stop offset="0" stop-color="${LIGHT}" stop-opacity="0.85"/><stop offset="1" stop-color="${LIGHT}" stop-opacity="0"/></radialGradient>
<filter id="c" x="-20%" y="-80%" width="140%" height="260%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
</defs>
<rect width="560" height="340" fill="url(#h)"/>
<circle cx="${x}" cy="${y}" r="80" fill="url(#b)"/>
<circle cx="${x}" cy="${y}" r="${r}" fill="url(#m)"/>
<g fill="#8e9bb2" opacity="0.3" filter="url(#f)"><ellipse cx="${x - 8}" cy="${y - 8}" rx="8" ry="6"/><ellipse cx="${x + 8}" cy="${y - 12}" rx="5" ry="4"/><ellipse cx="${x + 3}" cy="${y + 2}" rx="6" ry="4"/></g>
<path d="${cloud}" fill="#050912" opacity="0.8" filter="url(#c)"/>
<path d="${top}" fill="none" stroke="url(#l)" stroke-width="1"/>
</svg>`;
})();

/** Лучи луны вниз и влево, к острову: тот же кадр 560 × 340, что у луны. Каждый луч гаснет, не доходя до края кадра */
export const SHAFTS_SVG = (() => {
  const shafts: [number, number, number, number][] = [
    [116, 10, 60, 250],
    [128, 16, 90, 300],
    [140, 10, 56, 300],
    [154, 18, 84, 320],
  ];
  const paths = shafts
    .map(([angle, w0, w1, length], i) => {
      const a = (angle * Math.PI) / 180;
      const [dx, dy] = [Math.cos(a), Math.sin(a)];
      const [nx, ny] = [-dy, dx];
      const sx = MOON.x + dx * MOON.r;
      const sy = MOON.y + dy * MOON.r;
      const ex = MOON.x + dx * length;
      const ey = MOON.y + dy * length;
      const p = (px: number, py: number, w: number) => `${(px + nx * w).toFixed(1)} ${(py + ny * w).toFixed(1)}`;
      return `<linearGradient id="g${i}" gradientUnits="userSpaceOnUse" x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"><stop offset="0" stop-color="${LIGHT}" stop-opacity="0.42"/><stop offset="0.45" stop-color="${LIGHT}" stop-opacity="0.13"/><stop offset="1" stop-color="${LIGHT}" stop-opacity="0"/></linearGradient>
<path d="M${p(sx, sy, w0 / 2)} L${p(ex, ey, w1 / 2)} L${p(ex, ey, -w1 / 2)} L${p(sx, sy, -w0 / 2)} Z" fill="url(#g${i})" filter="url(#b)"/>`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 340">
<defs><filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter></defs>
${paths}</svg>`;
})();

/** Туман над морем облаков: длинные размытые полосы, медленно плывут */
export const MIST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 120">
<defs><filter id="m" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="10"/></filter></defs>
<g fill="#3a4560" filter="url(#m)"><ellipse cx="420" cy="54" rx="380" ry="14" opacity="0.5"/><ellipse cx="1180" cy="74" rx="420" ry="16" opacity="0.42"/><ellipse cx="820" cy="96" rx="300" ry="10" opacity="0.25"/></g>
</svg>`;

/** Зерно плёнки: плитка шума, рисуется один раз */
export const GRAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0 0.95 0 0 0 0.2 -0.08"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>`;


/** Поверх кадра — зерно плёнки и виньетка. Мышь проходит насквозь, предметы не сдвигаются */
export const FILM_CSS = `
html::after {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
  background:
    ${svgUrl(GRAIN_SVG)},
    radial-gradient(ellipse 80% 75% at 50% 45%, transparent 55%, rgba(0, 0, 0, 0.5) 100%);
  content: "";
}
`;

/** Ночное небо сцены: звёзды, луна в облаке справа и тёмный градиент. Значение для background */
export function nightSky(gradient = 'linear-gradient(180deg, #010207 0%, #050912 34%, #0d1528 64%, #1a2540 100%)', moon = true): string {
  return [moon && `${svgUrl(MOON_SVG)} right top / 560px 340px no-repeat`, `${svgUrl(STARS_SVG)} left top / 800px 240px repeat-x`, gradient]
    .filter(Boolean)
    .join(',\n    ');
}

/** Контровой свет луны */
export const RIM = '#b9cbe8';

interface SilOptions {
  /** Толщина лунной кромки в единицах рамки */
  rim?: number;
  /** Цвет кромки: от луны — холодный, от факела — тёплый */
  rimColor?: string;
  /** Размытие огоньков */
  glow?: number;
}

/** Фильтры силуэта: кромка света сверху справа и свечение огоньков */
function silDefs({ rim = 0.6, rimColor = RIM, glow = 1.4 }: SilOptions): string {
  return `<defs><filter id="r" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="erode" radius="${rim * 0.6}" result="i"/><feOffset in="i" dx="${-rim}" dy="${rim}" result="s"/><feComposite in="SourceAlpha" in2="s" operator="out" result="e"/><feFlood flood-color="${rimColor}" flood-opacity="0.75"/><feComposite in2="e" operator="in" result="k"/><feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="k"/></feMerge></filter>
<filter id="g" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${glow}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
}

/** Кадр силуэта: тёмная фигура (пути через пробел), поверх — огоньки (готовая разметка SVG) */
export interface SilFrame {
  dark: string;
  lit?: string;
  /** Что лежит под силуэтом: подсветка, ореол */
  under?: string;
  /** Детали поверх силуэта без свечения: узор, полосы */
  detail?: string;
}

function frameBody({ dark, lit = '', under = '', detail = '' }: SilFrame, fill: string): string {
  return `${under}<g filter="url(#r)"><path d="${dark}" fill="${fill}"/></g>${detail}<g filter="url(#g)">${lit}</g>`;
}

/** Спрайт-силуэт w × h; с несколькими кадрами — лист кадров в ряд, как у пиксельных спрайтов */
export function silSvg(w: number, h: number, frames: SilFrame | SilFrame[], options: SilOptions & { fill?: string; extraDefs?: string } = {}): string {
  const list = Array.isArray(frames) ? frames : [frames];
  const fill = options.fill ?? NIGHT;
  const body = list.map((frame, i) => `<g transform="translate(${i * w} 0)">${frameBody(frame, fill)}</g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w * list.length} ${h}" preserveAspectRatio="none">${silDefs(options)}${options.extraDefs ?? ''}${body}</svg>`;
}

/** Кладка из камня: плитка w × h — два ряда кирпичей со сдвигом, верхние кромки чуть светлее */
export function bricksSvg(w: number, h: number, stone: string, mortar: string, edge: string): string {
  const row = h / 2;
  const half = w / 2;
  const brick = (x: number, y: number, bw: number) =>
    `<rect x="${x + 1}" y="${y + 1}" width="${bw - 2}" height="${row - 2}" fill="${stone}"/><rect x="${x + 1}" y="${y + 1}" width="${bw - 2}" height="1" fill="${edge}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="${mortar}"/>${brick(0, 0, w)}${brick(-half, row, w)}${brick(half, row, w)}</svg>`;
}

/** Пылинки в свете факела: тёплые точки, медленно плывут вверх. Для body::after; сам слой задаёт район */
export const EMBER_DUST = `radial-gradient(circle, rgba(255, 196, 130, 0.5) 0 1px, transparent 2px),
    radial-gradient(circle, rgba(255, 176, 103, 0.28) 0 1.5px, transparent 2.5px)`;
