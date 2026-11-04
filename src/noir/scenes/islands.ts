import { cumulus, GEM, GEM_COLORS, ridge, type GemKind, type Puff } from '../geometry';
import { GRAIN_SVG, LIGHT, MIST_SVG, MOON_SVG, SHAFTS_SVG, STARS_SVG, svgUrl } from './kit';
import { NIGHT, NOIR_ROCK } from '../scene';

/*
  «Сумрак» для сцен уровней. Подключается после оформления района и до кода студента,
  меняет только картинки и фоны: размеры и отступы предметов не трогает — по ним идёт проверка.

  Кадр собран из планов, как карта мира: небо со звёздами, луна в облаке, лучи, хребты и море облаков
  под островом, туман, а поверх всего — виньетка и зерно плёнки. Неподвижные планы — картинки фона:
  браузер рисует их один раз. Двигаются только туман (сдвиг) и лучи (прозрачность) — это работа видеокарты.
*/

/** Кристалл: тёмная грань, светлая середина, белый блик и цветное свечение вокруг */
export function gemSvg(kind: GemKind): string {
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

/** Небо над островами: облака, луна, лучи, туман и плёнка — для всех районов Парящих земель под открытым небом */
export const ISLAND_SKY_CSS = `
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

`;

/** Кристаллы «Сумрака»: огранка со свечением вместо пиксельных спрайтов */
export const CRYSTALS_CSS = `
/* Кристаллы покачиваются плавно, а не в два кадра */
.crystal::before {
  animation-timing-function: ease-in-out;
}

.crystal::after {
  background: radial-gradient(closest-side, rgba(0, 0, 0, 0.55), transparent);
}

${(Object.keys(GEM_COLORS) as GemKind[]).map((kind) => `.${kind} { --sprite: ${svgUrl(gemSvg(kind))}; }`).join('\n')}

`;

const ISLANDS_CSS = `${ISLAND_SKY_CSS}
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

${CRYSTALS_CSS}
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


export const ISLANDS_SCENES: Record<string, string> = {
  'floating-islands': ISLANDS_CSS,
};
