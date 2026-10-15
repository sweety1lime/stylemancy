import { spriteCssUrl } from '../../pixel/pixelArt';
import { GUARD, SAND_BRICKS, SPY } from '../../pixel/sprites';
import fortressRules from './fortress.css?raw';

/** Песчаная кладка крепости — фон сцены. Значение для свойства background. */
export const SAND_WALL = `${spriteCssUrl(SAND_BRICKS)} 0 0 / 48px 24px repeat, #3b2814`;

/** Общее для районов Крепости Блоков: правила из fortress.css и спрайты часовых. */
export const fortressCss = `${fortressRules}
.guard,
.soldier {
  --sprite: ${spriteCssUrl(GUARD)};
}

.spy {
  --sprite: ${spriteCssUrl(SPY)};
}
`;
