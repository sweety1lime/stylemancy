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

/** Фон сцены: звёзды, луна и полосы неба. Значение для свойства background. */
export function skyBackground(bands = NIGHT_BANDS): string {
  return [...starLayers, `${spriteCssUrl(MOON)} 90% 9% / 40px 40px no-repeat`, bands].join(',\n    ');
}
