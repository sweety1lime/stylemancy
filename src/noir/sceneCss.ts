import { GEM, GEM_COLORS, type GemKind } from './geometry';
import { NOIR_REGIONS } from './look';
import { NIGHT, NOIR_ROCK } from './scene';

/*
  «Сумрак» для сцен уровней. Подключается после оформления района и до кода студента,
  меняет только картинки и фоны: размеры и отступы предметов не трогает — по ним идёт проверка.
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

/** Звёзды неба: [x %, y %] */
const STARS: [number, number][] = [
  [8, 10],
  [21, 26],
  [34, 8],
  [47, 18],
  [62, 6],
  [74, 30],
  [14, 44],
  [55, 38],
];

const SKY = [
  ...STARS.map(([x, y]) => `radial-gradient(1.4px 1.4px at ${x}% ${y}%, #dfe7f4 60%, transparent 70%)`),
  'radial-gradient(circle at 88% 13%, #eef3f8 0 20px, rgba(185, 203, 232, 0.35) 21px, rgba(125, 144, 180, 0.12) 70px, transparent 160px)',
  'linear-gradient(180deg, #04060b 0%, #0d1322 45%, #1b2437 78%, #2a3244 100%)',
].join(',\n    ');

const ISLANDS_CSS = `
html {
  background: ${NIGHT};
}

body {
  background:
    ${SKY};
}

/* Пиксельные мерцающие звёзды не нужны: небо уже нарисовано */
body::before,
body::after {
  background: none;
}

/* Магическое поле острова: тёмное стекло с холодной кромкой */
.island {
  background-color: rgba(14, 19, 32, 0.55);
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
