import { spriteCssUrl } from '../../pixel/pixelArt';
import { sheetCssUrl } from '../../pixel/sheet';
import { GUARD_FRAMES, SAND_BRICKS, SPY_FRAMES } from '../../pixel/sprites';
import fortressRules from './fortress.css?raw';

/** Песчаная кладка крепости — фон сцены. Значение для свойства background. */
export const SAND_WALL = `${spriteCssUrl(SAND_BRICKS)} 0 0 / 48px 24px repeat, #3b2814`;

/** Общее для районов Крепости Блоков: правила из fortress.css и спрайты часовых. */
export const fortressCss = `${fortressRules}
.guard,
.soldier {
  --sprite: ${sheetCssUrl(GUARD_FRAMES)};
}

.spy {
  --sprite: ${sheetCssUrl(SPY_FRAMES)};
}
`;

/** Пылинки в лучах света: медленно плывут вверх. Для Казарм и Плаца — там нет неба. */
export const dustCss = `
body::after {
  content: "";
  position: fixed;
  inset: -40px;
  z-index: 1;
  pointer-events: none;
  background-image:
    radial-gradient(circle, rgba(254, 243, 199, 0.55) 0 1px, transparent 2px),
    radial-gradient(circle, rgba(254, 243, 199, 0.35) 0 1.5px, transparent 2.5px);
  background-size: 170px 130px, 240px 260px;
  background-position: 30px 40px, 120px 70px;
  animation: dust 30s linear infinite;
}

/* Сдвиг на высоту плитки узора — круг замыкается без рывка */
@keyframes dust {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-260px);
  }
}
`;
