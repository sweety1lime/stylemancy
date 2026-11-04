import { cumulus, GEM, GEM_COLORS, ridge, type GemKind, type Puff } from './geometry';
import { NOIR_REGIONS } from './look';
import { random } from './random';
import { NIGHT, NOIR_ROCK } from './scene';

/*
  «Сумрак» для сцен уровней. Подключается после оформления района и до кода студента,
  меняет только картинки и фоны: размеры и отступы предметов не трогает — по ним идёт проверка.

  Кадр собран из планов, как карта мира: небо со звёздами, луна в облаке, лучи, хребты и море облаков
  под островом, туман, а поверх всего — виньетка и зерно плёнки. Неподвижные планы — картинки фона:
  браузер рисует их один раз. Двигаются только туман (сдвиг) и лучи (прозрачность) — это работа видеокарты.
*/

function svgUrl(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Кристалл: тёмная грань, светлая середина, белый блик и цветное свечение вокруг */
function gemSvg(kind: GemKind): string {
  const c = GEM_COLORS[kind];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -14 68 90">
<defs><radialGradient id="g"><stop offset="0" stop-color="${c.light}" stop-opacity="0.75"/><stop offset="0.45" stop-color="${c.main}" stop-opacity="0.25"/><stop offset="1" stop-color="${c.main}" stop-opacity="0"/></radialGradient></defs>
<circle cx="20" cy="28" r="33" fill="url(#g)"/>
<path d="${GEM.outer}" fill="${c.dark}"/><path d="${GEM.mid}" fill="${c.main}"/>
<path d="M20 10 L24 20 L20 46 L16 20 Z" fill="#fff" opacity="0.85"/></svg>`;
}

/** Скала под полем острова: зубчатый силуэт с холодной кромкой сверху */
const ROCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 18 412 138" preserveAspectRatio="none">
<path d="${NOIR_ROCK}" fill="${NIGHT}" stroke="#4a5a7a" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

/** Лунный свет */
const LIGHT = '#dfe8f5';

/** Звёзды: плитка 800 × 240 повторяется по ширине. Яркие — с ореолом, у горизонта звёзды гаснут */
const STARS_SVG = (() => {
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
const MOON = { x: 476, y: 50, r: 26 };
const MOON_SVG = (() => {
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
const SHAFTS_SVG = (() => {
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

/**
 * Дальний план под островом: дымка у горизонта, два хребта и море облаков. Плитка 1600 × 300, прижата к низу.
 * Каждый клуб — дважды: светлый, а поверх тело со сдвигом вниз — на макушке остаётся серп лунного света.
 */
const SEA_SVG = (() => {
  const rows: { base: number; puffs: Puff[]; top: string; bottom: string; blur: number }[] = [
    { base: 170, puffs: cumulus(13, 170, 8, 26, -40, 1640), top: '#3a4868', bottom: '#151d33', blur: 1.2 },
    { base: 206, puffs: cumulus(17, 206, 12, 36, -40, 1640), top: '#2a3652', bottom: '#0f1626', blur: 1.6 },
    { base: 250, puffs: cumulus(19, 250, 18, 50, -40, 1640), top: '#1b2438', bottom: '#080b14', blur: 2.2 },
  ];
  const circles = (puffs: Puff[], shift: boolean) =>
    puffs.map(([x, y, r]) => `<circle cx="${(shift ? x + r * 0.06 : x).toFixed(1)}" cy="${(shift ? y + r * 0.12 : y).toFixed(1)}" r="${r.toFixed(1)}"/>`).join('');
  const body = rows
    .map((row, i) => {
      const top = Math.min(...row.puffs.map(([, y, r]) => y - r));
      return `<linearGradient id="s${i}" gradientUnits="userSpaceOnUse" x1="0" y1="${top.toFixed(1)}" x2="0" y2="${row.base + 30}"><stop offset="0" stop-color="${row.top}"/><stop offset="1" stop-color="${row.bottom}"/></linearGradient>
<filter id="f${i}" x="-5%" y="-30%" width="110%" height="160%"><feGaussianBlur stdDeviation="${row.blur}"/></filter>
<g filter="url(#f${i})"><g fill="url(#rim)" opacity="${(1 - i * 0.35).toFixed(2)}">${circles(row.puffs, false)}</g><g fill="url(#s${i})">${circles(row.puffs, true)}<rect x="-40" y="${row.base}" width="1680" height="${300 - row.base + 20}"/></g></g>`;
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 300">
<defs>
<radialGradient id="rim" gradientUnits="userSpaceOnUse" cx="1150" cy="170" r="900"><stop offset="0" stop-color="${LIGHT}" stop-opacity="0.3"/><stop offset="0.6" stop-color="${LIGHT}" stop-opacity="0.08"/><stop offset="1" stop-color="${LIGHT}" stop-opacity="0"/></radialGradient>
<filter id="haze" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="far" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="1"/></filter>
</defs>
<ellipse cx="800" cy="158" rx="900" ry="30" fill="#56688f" opacity="0.5" filter="url(#haze)"/>
<g filter="url(#far)"><path d="${ridge(47, 160, 44, -40, 1640, 320)}" fill="#1a2440"/><path d="${ridge(53, 176, 28, -40, 1640, 320)}" fill="#121a2f"/></g>
${body}
</svg>`;
})();

/** Туман над морем облаков: длинные размытые полосы, медленно плывут */
const MIST_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 120">
<defs><filter id="m" x="-20%" y="-100%" width="140%" height="300%"><feGaussianBlur stdDeviation="10"/></filter></defs>
<g fill="#3a4560" filter="url(#m)"><ellipse cx="420" cy="54" rx="380" ry="14" opacity="0.5"/><ellipse cx="1180" cy="74" rx="420" ry="16" opacity="0.42"/><ellipse cx="820" cy="96" rx="300" ry="10" opacity="0.25"/></g>
</svg>`;

/** Зерно плёнки: плитка шума, рисуется один раз */
const GRAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0 0.95 0 0 0 0.2 -0.08"/></filter><rect width="100%" height="100%" filter="url(#g)"/></svg>`;

const ISLANDS_CSS = `
/* Небо — фон body. У html своего фона нет: тогда фон body переходит на весь холст,
   а туман и лучи (body::before и ::after, они позади предметов) видны поверх него */
html {
  background: none;
}

body {
  background:
    ${svgUrl(SEA_SVG)} center bottom / auto 230px no-repeat,
    ${svgUrl(MOON_SVG)} right top / 560px 340px no-repeat,
    ${svgUrl(STARS_SVG)} left top / 800px 240px repeat-x,
    linear-gradient(180deg, #010207 0%, #050912 30%, #0d1528 58%, #1e2a46 74%, #090d18 100%);
}

/* Туман плывёт над морем облаков */
body::before {
  background: ${svgUrl(MIST_SVG)} center bottom 34px / auto 110px no-repeat;
  animation: noir-mist 24s ease-in-out infinite alternate;
}

/* Лучи луны дышат: по ним будто проходят облака */
body::after {
  background: ${svgUrl(SHAFTS_SVG)} right top / 560px 340px no-repeat;
  animation: noir-shafts 12s ease-in-out infinite alternate;
}

/* Поверх кадра — виньетка и зерно плёнки. Мышь проходит насквозь, предметы не сдвигаются */
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

@keyframes noir-mist {
  from {
    transform: translateX(-24px);
  }

  to {
    transform: translateX(24px);
  }
}

@keyframes noir-shafts {
  from {
    opacity: 0.45;
  }

  to {
    opacity: 1;
  }
}

/* Магическое поле острова: тёмное стекло с холодной кромкой, сквозь него видна ночь */
.island {
  background-color: rgba(10, 14, 26, 0.42);
  background-image: none;
  box-shadow:
    0 0 0 1px rgba(185, 203, 232, 0.3),
    inset 0 0 40px rgba(110, 130, 180, 0.14);
}

.island::after {
  height: 110px;
  background: ${svgUrl(ROCK_SVG)} center top / 100% 100% no-repeat;
}

/* Кристаллы покачиваются плавно, а не в два кадра */
.crystal::before {
  animation-timing-function: ease-in-out;
}

.crystal::after {
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.55), transparent);
}

${(Object.keys(GEM_COLORS) as GemKind[]).map((kind) => `.${kind} { --sprite: ${svgUrl(gemSvg(kind))}; }`).join('\n')}

/* Камни моста: тёмный камень с лунной кромкой; средний — руна светится */
.stone {
  background-image: linear-gradient(180deg, #2b3446 0%, #161c2a 100%);
  background-size: auto;
  background-repeat: no-repeat;
  background-origin: border-box;
  background-clip: border-box;
  box-shadow:
    inset 0 1px 0 rgba(185, 203, 232, 0.4),
    inset 0 -3px 0 rgba(0, 0, 0, 0.45);
}

.stone.middle {
  background-image: linear-gradient(180deg, #33305a 0%, #1a1832 100%);
  box-shadow:
    inset 0 1px 0 rgba(196, 181, 253, 0.55),
    0 0 14px rgba(167, 139, 250, 0.35);
}
`;

/** Оформление «Сумрака» для сцен района; пустая строка — у района его пока нет */
export function noirSceneCss(regionId: string): string {
  return NOIR_REGIONS.has(regionId) ? ISLANDS_CSS : '';
}
