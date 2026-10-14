import { spriteCssUrl, type Sprite } from '../../pixel/pixelArt';
import { ISLAND_ROCK, RUNE_STONE, STONE } from '../../pixel/sprites';
import { crystalsCss } from '../shared/crystals';
import { skyBackground } from '../shared/sky';

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
    ${skyBackground()};
}

.island::after {
  background: ${spriteCssUrl(ISLAND_ROCK)} center / 100% 100% no-repeat;
}

${crystalsCss}

.stone {
  ${threeSlice(STONE.left, STONE.middle, STONE.right)}
}

.stone.middle {
  ${threeSlice(RUNE_STONE.left, RUNE_STONE.middle, RUNE_STONE.right)}
}
`;
