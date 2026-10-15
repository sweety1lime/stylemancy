import { defineLevel } from '../../engine/define';
import { recolor, spriteCssUrl } from '../../pixel/pixelArt';
import { GLASS } from '../../pixel/sprites';

/** Зал башни: знамёна развешаны по координатам и заходят друг на друга */
const sceneCss = `
.hall {
  position: relative;
  isolation: isolate;
  width: 400px;
  height: 280px;
  background:
    linear-gradient(#e0bd80, #e0bd80) 0 100% / 100% 8px no-repeat,
    linear-gradient(rgba(26, 16, 48, 0.45), rgba(26, 16, 48, 0.45)),
    var(--bricks) 0 0 / 48px 24px repeat;
  box-shadow: 0 0 0 4px #2a1d3d;
}

.standard {
  width: 128px;
  background: var(--motif) 50% 12px / 56px 56px no-repeat, var(--banner);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% calc(100% - 24px), 0 100%);
}

.royal {
  --motif: ${spriteCssUrl(recolor(GLASS.crown.motif, { w: '#f6c453' }))};
  --banner: #6d28d9;
  --item-color: #fbbf24;
  left: 136px;
  top: 8px;
  height: 224px;
}

.west {
  --motif: ${spriteCssUrl(GLASS.tree.motif)};
  --banner: #15803d;
  --item-color: #86efac;
  left: 80px;
  top: 56px;
  height: 176px;
}

.east {
  --motif: ${spriteCssUrl(GLASS.star.motif)};
  --banner: #1d4ed8;
  --item-color: #93c5fd;
  left: 192px;
  top: 56px;
  height: 176px;
}
`;

export default defineLevel({
  id: 'pos-04',
  title: 'Королевское знамя',
  dialog: [
    'Королевское знамя повесили позади других — какой позор! Видны одни зубцы короны.',
    'Когда позиционированные блоки заходят друг на друга, сверху тот, кто позже в разметке. А порядок слоёв можно поменять: z-index. У кого он больше — тот ближе к нам.',
  ],
  task: 'Знамёна уже развешаны: у каждого `position: absolute` и свои координаты. Выведи королевское знамя `.royal` вперёд, поверх остальных.',
  html: `<div class="hall">
  <div class="standard royal" data-name="Королевское знамя"></div>
  <div class="standard west" data-name="Знамя Запада"></div>
  <div class="standard east" data-name="Знамя Востока"></div>
</div>`,
  sceneCss,
  starterCss: `.standard {
  position: absolute;
}

.royal {
  /* королевское знамя — впереди всех */
}
`,
  solutionCss: `.standard {
  position: absolute;
}

.royal {
  z-index: 1;
}
`,
  check: { items: '.standard', groupName: 'знамёна', stacking: true },
  hints: [
    'Двигать знамёна не нужно — только поменять, кто кого закрывает.',
    'Порядок слоёв задаёт `z-index`: число побольше — ближе к нам. У остальных знамён его нет, так что хватит и единицы.',
    '`.royal { z-index: 1; }`',
  ],
  learns: 'z-index',
});
