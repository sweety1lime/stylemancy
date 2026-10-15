import { spriteCssUrl } from '../../pixel/pixelArt';
import { MOON, SKY_SPARK, SKY_STAR } from '../../pixel/sprites';

/** Звёзды на небе сцены: [x %, y %, крупная?] */
const STARS: [number, number, boolean][] = [
  [8, 12, false],
  [23, 70, false],
  [37, 7, true],
  [58, 20, false],
  [72, 64, false],
  [93, 42, true],
  [5, 88, false],
  [47, 93, false],
  [84, 86, false],
];

const starLayers = STARS.map(([x, y, big]) => {
  const size = big ? 20 : 12;
  return `${spriteCssUrl(big ? SKY_SPARK : SKY_STAR)} ${x}% ${y}% / ${size}px ${size}px no-repeat`;
});

/** Полосы ночного неба — от тёмного верха к светлому низу */
export const NIGHT_BANDS =
  'linear-gradient(180deg, #0d0821 0 22%, #120b2e 22% 44%, #1a1040 44% 64%, #23154f 64% 82%, #2d1b5e 82% 100%)';

/** Ночь в Лесу Селекторов — тёмно-зелёная, сквозь кроны */
export const FOREST_BANDS =
  'linear-gradient(180deg, #071a14 0 22%, #0a231b 22% 44%, #0d2c22 44% 64%, #10362a 64% 82%, #134032 82% 100%)';

/** Сумерки над Крепостью Блоков — теплее, чем небо над островами */
export const DUSK_BANDS =
  'linear-gradient(180deg, #0d0821 0 22%, #1a1040 22% 44%, #2d1b5e 44% 64%, #4a2c6e 64% 82%, #6b3a6e 82% 100%)';

/** Фон сцены: звёзды, луна и полосы неба. Значение для свойства background. Без луны — если луна сама предмет сцены. */
export function skyBackground(bands = NIGHT_BANDS, moon = true): string {
  const layers = moon ? [...starLayers, `${spriteCssUrl(MOON)} 90% 9% / 40px 40px no-repeat`] : starLayers;
  return [...layers, bands].join(',\n    ');
}

/** Звёзды, которые мерцают поверх неба: две группы гаснут и загораются по очереди. */
const TWINKLES: [number, number][][] = [
  [
    [14, 24],
    [52, 12],
    [86, 66],
  ],
  [
    [32, 58],
    [70, 36],
    [22, 84],
  ],
];

const twinkleLayer = (stars: [number, number][]) =>
  stars.map(([x, y]) => `${spriteCssUrl(SKY_SPARK)} ${x}% ${y}% / 14px 14px no-repeat`).join(', ');

/** Живое небо: звёзды мерцают. Слой позади предметов, мышь и проверку не задевает. */
export const twinkleCss = `
body::before,
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  animation: twinkle 2.8s steps(1, end) infinite;
}

body::before {
  background: ${twinkleLayer(TWINKLES[0])};
}

body::after {
  background: ${twinkleLayer(TWINKLES[1])};
  animation-delay: -1.4s;
}

@keyframes twinkle {
  0% {
    opacity: 0.95;
  }

  50% {
    opacity: 0.1;
  }
}
`;
