import { spriteCssUrl, type Sprite } from '../../pixel/pixelArt';
import { GEM_SHADOW, GEMS, ISLAND_ROCK, MOON, RUNE_STONE, SKY_SPARK, SKY_STAR, STONE } from '../../pixel/sprites';

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

const skyLayers = STARS.map(([x, y, big]) => {
  const size = big ? 20 : 12;
  return `${spriteCssUrl(big ? SKY_SPARK : SKY_STAR)} ${x}% ${y}% / ${size}px ${size}px no-repeat`;
});

function threeSlice(left: Sprite, middle: Sprite, right: Sprite): string {
  return `background-image: ${spriteCssUrl(left)}, ${spriteCssUrl(right)}, ${spriteCssUrl(middle)};
  background-position: left top, right top, left top;
  background-size: 16px 56px, 16px 56px, 32px 56px;
  background-repeat: no-repeat, no-repeat, repeat-x;`;
}

/** CSS с картинками района: пиксельные спрайты вставлены как data URI. */
export const spriteCss = `
body {
  background:
    ${skyLayers.join(',\n    ')},
    ${spriteCssUrl(MOON)} 90% 9% / 40px 40px no-repeat,
    linear-gradient(180deg, #0d0821 0 22%, #120b2e 22% 44%, #1a1040 44% 64%, #23154f 64% 82%, #2d1b5e 82% 100%);
}

.island::after {
  background: ${spriteCssUrl(ISLAND_ROCK)} center / 100% 100% no-repeat;
}

.crystal::after {
  background: ${spriteCssUrl(GEM_SHADOW)} center / 100% 100% no-repeat;
}

${Object.entries(GEMS)
  .map(([name, gem]) => `.${name} { --item-color: ${gem.color}; --item-glow: ${gem.glow}; --sprite: ${spriteCssUrl(gem.sprite)}; }`)
  .join('\n')}

.stone {
  ${threeSlice(STONE.left, STONE.middle, STONE.right)}
}

.stone.middle {
  ${threeSlice(RUNE_STONE.left, RUNE_STONE.middle, RUNE_STONE.right)}
}
`;
