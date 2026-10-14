import cyrillic from '@fontsource/tiny5/files/tiny5-cyrillic-400-normal.woff2?url';
import latin from '@fontsource/tiny5/files/tiny5-latin-400-normal.woff2?url';

/** Пиксельный шрифт игры для страниц-сцен: iframe не видит шрифтов, подключённых к самой игре. */
export const pixelFontCss = `
@font-face {
  font-family: "Tiny5";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("${cyrillic}") format("woff2");
  unicode-range: U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
@font-face {
  font-family: "Tiny5";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("${latin}") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;
