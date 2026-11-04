import { GLASS } from '../../pixel/sprites';
import { CRYSTALS_CSS, ISLAND_SKY_CSS } from './islands';
import { bricksSvg, FILM_CSS, svgUrl } from './kit';
import { motifUrl, type Motif } from './motifs';

/*
  Парящие земли в «Сумраке», кроме самих островов: Витражная обитель, Зеркальная башня и Цитадель.
  Витраж — тёмный собор, стёкла светятся луной изнутри. Башня — стеклянный зал над морем облаков.
  Цитадель — серые стены Лорда Дефолта: пока блок не на месте, он погашен; встал — загорается своим цветом.
*/

/** Холодный камень обители и цитадели */
const COLD_STONE = svgUrl(bricksSvg(48, 24, '#14161e', '#07080c', '#262a36'));

/** Стёкла витражей: цветное стекло, луна светит сквозь него сверху справа; знак — светлая линия */
const GLASS_CSS = `
.pane {
  background:
    var(--motif) center / 36px 36px no-repeat,
    radial-gradient(ellipse at 75% 15%, rgba(255, 255, 255, 0.4), transparent 65%),
    repeating-linear-gradient(180deg, rgba(0, 0, 0, 0.14) 0 4px, transparent 4px 8px),
    linear-gradient(160deg, var(--item-color), color-mix(in srgb, var(--item-color) 30%, #05060a));
  box-shadow:
    inset 0 0 0 4px #07060b,
    inset 0 0 0 5px rgba(255, 255, 255, 0.14),
    inset 0 0 18px rgba(0, 0, 0, 0.55);
  opacity: 0.6;
}

.pane[data-in-place] {
  opacity: 1;
  filter: drop-shadow(0 0 10px var(--item-glow));
}

${(Object.keys(GLASS) as Motif[]).map((name) => `.${name} { --motif: ${motifUrl(name, '#fff7e6', 0.1)}; }`).join('\n')}
`;

const ABBEY = `${FILM_CSS}
html {
  background: #07080c;
}

/* Стена обители: холодный камень, сверху лунный свет, у окна — цветные отсветы стёкол */
body {
  background:
    radial-gradient(ellipse 45% 30% at 50% 82%, rgba(167, 139, 250, 0.12), transparent),
    radial-gradient(ellipse 60% 50% at 50% 40%, rgba(96, 165, 250, 0.08), transparent),
    linear-gradient(180deg, rgba(185, 203, 232, 0.06), transparent 40%),
    ${COLD_STONE} 0 0 / 48px 24px repeat,
    #07080c;
}

/* Окно: за стёклами ночь, рама — тёмный камень с лунной кромкой */
.window {
  background-color: #03050b;
  background-image:
    radial-gradient(ellipse at 80% 0%, rgba(185, 203, 232, 0.22), transparent 60%),
    linear-gradient(160deg, rgba(167, 139, 250, 0.1), transparent 60%);
  box-shadow:
    0 0 0 4px #1d212c,
    0 0 0 5px rgba(185, 203, 232, 0.3),
    0 0 0 14px #10121a,
    0 0 0 18px #050608;
}

.window::before {
  background: linear-gradient(180deg, #1d212c, #10121a);
}

.window::after {
  background: #10121a;
  box-shadow:
    inset 0 1px 0 rgba(185, 203, 232, 0.4),
    inset 0 -4px 0 #050608;
}
${GLASS_CSS}`;

const MIRROR = `${ISLAND_SKY_CSS}
/* Стеклянный зал над облаками: тонкая холодная рама, по стеклу — блики луны */
.hall {
  background-color: rgba(185, 203, 232, 0.04);
  background-image: linear-gradient(
    115deg,
    transparent 0 18%,
    rgba(223, 232, 245, 0.07) 18% 24%,
    transparent 24% 58%,
    rgba(223, 232, 245, 0.05) 58% 61%,
    transparent 61%
  );
  box-shadow:
    0 0 0 1px rgba(185, 203, 232, 0.5),
    0 0 0 4px #070a12,
    0 0 0 5px rgba(185, 203, 232, 0.18),
    inset 0 0 40px rgba(110, 130, 180, 0.12);
}
${CRYSTALS_CSS}${GLASS_CSS}`;

const CITADEL = `${FILM_CSS}
html {
  background: #06070a;
}

body {
  background:
    linear-gradient(180deg, rgba(185, 203, 232, 0.07), transparent 45%),
    ${COLD_STONE} 0 0 / 48px 24px repeat,
    #06070a;
}

.citadel {
  background: rgba(4, 5, 8, 0.7);
  box-shadow:
    0 0 0 4px #1d212c,
    0 0 0 5px rgba(185, 203, 232, 0.28),
    0 0 0 8px #050608;
}

/* Блоки под проклятием: серый камень, буквы едва видны */
.banner,
.hall,
.tower,
.gate {
  color: #6b7080;
  background: #13151c;
  box-shadow: inset 0 0 0 1px #2a2e3a;
}

.flag {
  background: #2a2e3a;
}

/* Блок на месте — загорается своим цветом: тёмное стекло, цветная кромка и свечение */
.banner[data-in-place],
.hall[data-in-place],
.tower[data-in-place],
.gate[data-in-place] {
  color: var(--item-color);
  background:
    radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--item-color) 28%, transparent), transparent 75%),
    #0c0e15;
  box-shadow:
    inset 0 0 0 1px var(--item-color),
    0 0 16px var(--item-glow);
  text-shadow: 0 0 8px var(--item-glow);
}

.flag[data-in-place] {
  background: linear-gradient(180deg, var(--item-color), color-mix(in srgb, var(--item-color) 40%, #05060a));
  filter: drop-shadow(0 0 6px var(--item-color));
}
`;

export const FLOATING_SCENES: Record<string, string> = {
  'stained-abbey': ABBEY,
  'mirror-tower': MIRROR,
  'default-citadel': CITADEL,
};
