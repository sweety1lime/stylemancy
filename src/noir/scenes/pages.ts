import cyrillic from '@fontsource/cormorant-garamond/files/cormorant-garamond-cyrillic-600-normal.woff2?url';
import latin from '@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2?url';
import { BOOK, GEMS, MAP, MOON, PORTRAITS, POTION } from '../../pixel/sprites';
import type { Sprite } from '../../pixel/pixelArt';
import { bustSvg } from './bust';
import { gemSvg } from './islands';
import { GRAIN_SVG, svgUrl } from './kit';

/*
  Страницы Долины Тегов в «Сумраке» — ночная рукопись: тёмная бумага, янтарные заголовки шрифтом игры,
  текст цвета слоновой кости. Текст без тегов по-прежнему «проклят»: Times New Roman, только тусклый.
  Проверка HTML-уровней смотрит на разметку, а не на размеры, но шрифт текста оставляем прежним —
  чтобы страница не прыгала при переключении вида.
*/

/** Шрифт заголовков игры: iframe не видит шрифтов самой игры */
export const NOIR_FONT_CSS = `
@font-face {
  font-family: "Cormorant Garamond";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("${cyrillic}") format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Cormorant Garamond";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("${latin}") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;

const HEADINGS = `"Cormorant Garamond", Georgia, serif`;

/** Общее для страниц: тёмная бумага в свете свечи, проклятый текст тусклый, заголовки — янтарь */
const PAGE = `${NOIR_FONT_CSS}
html {
  color-scheme: dark;
  background-color: #0e0c0a;
  background-image:
    ${svgUrl(GRAIN_SVG)},
    radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255, 207, 150, 0.09), transparent),
    radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.45));
  /* Свет и виньетка — по окну, а не по высоте текста: иначе на холсте они повторяются полосами */
  background-repeat: repeat, no-repeat, no-repeat;
  background-attachment: scroll, fixed, fixed;
}

body {
  color: #8f877a;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: ${HEADINGS};
  font-weight: 600;
  letter-spacing: 0.04em;
  text-shadow: 0 0 16px rgba(240, 200, 144, 0.2);
}

h1 {
  color: #f0c890;
}

h2 {
  color: #e0a060;
}

h3 {
  color: #c9a27a;
}

p,
li,
td,
th {
  color: #ddd4c4;
}

strong {
  background: rgba(224, 160, 96, 0.16);
  color: #f0c890;
}

em {
  color: #c9b6ff;
}

a {
  color: #8fc0ff;
}

hr {
  background: repeating-linear-gradient(90deg, rgba(240, 200, 144, 0.5) 0 8px, transparent 8px 16px);
}

img,
figure {
  background: #15110d;
  box-shadow: 0 0 0 1px rgba(240, 200, 144, 0.4);
}

::selection {
  background: rgba(224, 160, 96, 0.35);
}
`;

const VILLAGE = `${PAGE}
h1 {
  border-bottom-color: rgba(240, 200, 144, 0.45);
  text-shadow: 0 0 18px rgba(240, 200, 144, 0.3);
}
`;

/** Ярмарка: полосатый навес сверху — тёмно-красный, ссылки светятся голубым, как цепочка Торговки */
const FAIR = `${PAGE}
html {
  background-image:
    repeating-linear-gradient(90deg, #4a141c 0 24px, #1a0f10 24px 48px),
    ${svgUrl(GRAIN_SVG)},
    radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255, 207, 150, 0.09), transparent);
  background-size: 100% 14px, auto, auto;
  background-repeat: no-repeat, repeat, no-repeat;
  background-attachment: scroll, scroll, fixed;
}

li::marker {
  color: #e0a060;
}

a:hover {
  background: rgba(143, 192, 255, 0.12);
  color: #bfdbff;
}

table {
  background: #14110d;
  box-shadow: 0 0 0 1px rgba(240, 200, 144, 0.35);
}

th,
td {
  border-color: #3a3026;
}

th {
  background: #2e2112;
  color: #f0c890;
  font-family: ${HEADINGS};
}
`;

/** Город Семантики: безликий div — серая тень; у семантических домов свой свет */
const CITY = `${PAGE}
div {
  background: #18191e;
  color: #7d7f8a;
  box-shadow: inset 0 0 0 2px #262830;
}

header {
  background: linear-gradient(180deg, #13203f, #0c1529);
  color: #dfe8f5;
  box-shadow:
    inset 0 -2px 0 #f0c890,
    inset 0 -8px 12px -6px rgba(240, 200, 144, 0.35);
}

header h1 {
  color: #f0c890;
}

nav a {
  background: rgba(223, 232, 245, 0.07);
  color: #dfe8f5;
  font-family: ${HEADINGS};
}

main {
  background: #111216;
}

section {
  background: #141727;
  box-shadow: inset 4px 0 0 #8fa0ff;
}

article {
  background: #17140f;
  box-shadow: 0 0 0 2px #3a3026;
}

aside {
  background: #0f1a16;
  box-shadow: inset 0 0 0 2px #2f8a68;
}

aside h3 {
  color: #8ff0c8;
}

footer {
  background: #0a0c11;
  color: #9aa3b5;
}

figcaption {
  color: #e0a060;
  font-family: ${HEADINGS};
}
`;

/** Кузница Форм: тёмная кованая плита, поля — чёрный металл, кнопка — раскалённая заготовка */
const FORGE = `${PAGE}
html {
  background-image:
    ${svgUrl(GRAIN_SVG)},
    radial-gradient(ellipse 80% 50% at 50% 110%, rgba(255, 140, 60, 0.18), transparent),
    radial-gradient(ellipse 90% 80% at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.45));
  background-repeat: repeat, no-repeat, no-repeat;
  background-attachment: scroll, fixed, fixed;
}

h2,
h3 {
  color: #ff9a5a;
  text-shadow: 0 0 16px rgba(255, 154, 90, 0.3);
}

form {
  background: #151519;
  box-shadow:
    inset 0 0 0 1px #2c2c33,
    inset 0 1px 0 1px rgba(185, 203, 232, 0.08),
    0 0 0 3px #08080a,
    0 10px 30px rgba(0, 0, 0, 0.55);
}

label {
  color: #f0c890;
}

input,
select,
textarea {
  background: #0b0b0e;
  color: #e4dccd;
  box-shadow: inset 0 0 0 1px #3a3a44;
}

input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #ff9a5a;
}

button {
  background: linear-gradient(180deg, #e2722e, #b4451a);
  color: #1a0f08;
  font-family: ${HEADINGS};
  box-shadow:
    inset 0 1px 0 rgba(255, 220, 180, 0.4),
    0 0 14px rgba(255, 120, 50, 0.45);
}
`;

export const PAGE_SCENES: Record<string, string> = {
  'tag-village': VILLAGE,
  'link-fair': FAIR,
  'semantic-city': CITY,
  'form-forge': FORGE,
};

/* Картинки для <img>: те же имена и размеры, что у пиксельных, рисунки — «Сумрака» */

/** Ширина и высота пиксельной картинки: страница не должна прыгать при смене вида */
function sizeOf(sprite: Sprite, scale = 4): [number, number] {
  return [Math.max(...sprite.rows.map((row) => row.length)) * scale, sprite.rows.length * scale];
}

function sized(svg: string, [width, height]: [number, number]): string {
  const sizedSvg = svg.replace('<svg ', `<svg width="${width}" height="${height}" `);
  return `data:image/svg+xml,${encodeURIComponent(sizedSvg)}`;
}

const MOON_PICTURE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 80 80"><defs>
<radialGradient id="h"><stop offset="0.3" stop-color="#dfe8f5" stop-opacity="0.4"/><stop offset="1" stop-color="#dfe8f5" stop-opacity="0"/></radialGradient>
<radialGradient id="m" cx="0.4" cy="0.38" r="0.65"><stop offset="0" stop-color="#f4f7fb"/><stop offset="0.7" stop-color="#cfd8e6"/><stop offset="1" stop-color="#aab6c9"/></radialGradient>
<filter id="f"><feGaussianBlur stdDeviation="1.4"/></filter></defs>
<circle cx="32" cy="32" r="40" fill="url(#h)"/><circle cx="32" cy="32" r="22" fill="url(#m)"/>
<g fill="#8e9bb2" opacity="0.35" filter="url(#f)"><ellipse cx="26" cy="25" rx="7" ry="5"/><ellipse cx="39" cy="22" rx="4" ry="3"/><ellipse cx="35" cy="37" rx="5" ry="3.4"/></g></svg>`;

const BOOK_PICTURE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<path d="M3 5.5 Q7.5 4 12 6.5 Q16.5 4 21 5.5 V19 Q16.5 17.5 12 20 Q7.5 17.5 3 19 Z" fill="#1d1712"/>
<path d="M3 5.5 Q7.5 4 12 6.5 Q16.5 4 21 5.5 V19 Q16.5 17.5 12 20 Q7.5 17.5 3 19 Z M12 6.5 V20 M6 9 Q8 8.6 10 9.4 M6 12 Q8 11.6 10 12.4 M14 9.4 Q16 8.6 18 9 M14 12.4 Q16 11.6 18 12" fill="none" stroke="#f0c890" stroke-width="0.9" stroke-linejoin="round" filter="url(#g)"/></svg>`;

/** Склянка с зельем: тёмное стекло, жидкость светится изумрудом */
const POTION_PICTURE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48"><defs>
<radialGradient id="l"><stop offset="0" stop-color="#5dffb0" stop-opacity="0.55"/><stop offset="1" stop-color="#5dffb0" stop-opacity="0"/></radialGradient>
<filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<circle cx="20" cy="32" r="18" fill="url(#l)"/>
<path d="M16 4 H24 V16 Q34 21 34 31 A14 14 0 0 1 6 31 Q6 21 16 16 Z" fill="#0b0d14" stroke="#b9cbe8" stroke-opacity="0.5" stroke-width="1"/>
<path d="M8.4 30 Q20 26 31.6 30 A12 12 0 0 1 8.4 30 Z" fill="#5dffb0" opacity="0.85" filter="url(#g)"/>
<rect x="14.5" y="1.5" width="11" height="4" rx="1" fill="#2a1d12"/>
<circle cx="16" cy="33" r="1.2" fill="#d6fff0"/><circle cx="23" cy="35" r="0.8" fill="#d6fff0"/></svg>`;

/** Карта: тёмный пергамент, тропа светится, крест — цель */
const MAP_PICTURE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 40"><defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<path d="M3 6 L16 3 L32 7 L45 4 V34 L32 37 L16 33 L3 36 Z" fill="#1d1712" stroke="#b9cbe8" stroke-opacity="0.35" stroke-width="0.8"/>
<path d="M16 3 V33 M32 7 V37" stroke="#000" stroke-opacity="0.45" stroke-width="0.8"/>
<path d="M8 29 Q14 22 20 25 Q27 28 30 19 Q33 12 39 12" fill="none" stroke="#f0c890" stroke-width="1.2" stroke-dasharray="2.4 2" filter="url(#g)"/>
<path d="M36.5 9.5 L41.5 14.5 M41.5 9.5 L36.5 14.5" stroke="#ff7b98" stroke-width="1.4" filter="url(#g)"/></svg>`;

const GEM_PICTURES = Object.fromEntries(
  (['ruby', 'emerald', 'amethyst', 'sapphire', 'topaz'] as const).map((kind) => [`${kind}.png`, sized(gemSvg(kind), sizeOf(GEMS[kind].sprite))]),
);

/** Картинки страниц в «Сумраке»: имена те же, что в IMAGE_LIBRARY */
export const NOIR_IMAGE_LIBRARY: Record<string, string> = {
  ...GEM_PICTURES,
  'moon.png': sized(MOON_PICTURE, sizeOf(MOON)),
  'book.png': sized(BOOK_PICTURE, sizeOf(BOOK, 3)),
  'potion.png': sized(POTION_PICTURE, sizeOf(POTION)),
  'map.png': sized(MAP_PICTURE, sizeOf(MAP)),
  'merchant.png': sized(bustSvg('merchant'), sizeOf(PORTRAITS.merchant)),
};
