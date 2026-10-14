import { spriteCssUrl } from '../../pixel/pixelArt';
import { GEM_SHADOW, GEMS } from '../../pixel/sprites';
import crystalRules from './crystals.css?raw';

/** Кристаллы для сцен: правила из crystals.css и картинки-спрайты как data URI. */
export const crystalsCss = `${crystalRules}
.crystal::after {
  background: ${spriteCssUrl(GEM_SHADOW)} center / 100% 100% no-repeat;
}

${Object.entries(GEMS)
  .map(([name, gem]) => `.${name} { --item-color: ${gem.color}; --item-glow: ${gem.glow}; --sprite: ${spriteCssUrl(gem.sprite)}; }`)
  .join('\n')}
`;
