import { spriteCssUrl } from '../../pixel/pixelArt';
import { GLASS } from '../../pixel/sprites';
import glassRules from './glass.css?raw';

/** Стёкла для сцен: правила из glass.css и узоры-спрайты. Класс стекла — по узору: .sun, .moon… */
export const glassCss = `${glassRules}
${Object.entries(GLASS)
  .map(([name, glass]) => `.${name} { --item-color: ${glass.color}; --item-glow: ${glass.glow}; --motif: ${spriteCssUrl(glass.motif)}; }`)
  .join('\n')}
`;
