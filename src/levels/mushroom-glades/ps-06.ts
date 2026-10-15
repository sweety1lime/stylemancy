import { defineLevel } from '../../engine/define';

const items = (cls: string, name: string, count: number) =>
  Array.from({ length: count }, (_, i) => `    <div class="${cls}" data-name="${name} ${i + 1}"></div>`).join('\n');

export default defineLevel({
  id: 'ps-06',
  title: 'Испытание: Ночь на полянах',
  trial: true,
  dialog: [
    'Ночь на полянах — моё любимое время. Последнее испытание: зажги поляны так, как зажигаю их я.',
    'Пригодится всё: номера детей, «кроме» и «под мышкой». Не забывай поглядывать в оба зеркала.',
  ],
  task: 'Каждый второй фонарь — золотой (`gold`). Все грибы, кроме ядовитых, — салатовые (`lime`). А светлячки загораются золотом только под мышкой.',
  html: `<div class="rows">
  <div class="row">
${items('lantern', 'Фонарь', 6)}
  </div>
  <div class="row">
    <div class="mushroom" data-name="Гриб 1"></div>
    <div class="mushroom poison" data-name="Ядовитый гриб 1"></div>
    <div class="mushroom" data-name="Гриб 2"></div>
    <div class="mushroom" data-name="Гриб 3"></div>
    <div class="mushroom poison" data-name="Ядовитый гриб 2"></div>
  </div>
  <div class="row">
${items('firefly', 'Светлячок', 4)}
  </div>
</div>`,
  starterCss: `/* Фонари — каждый второй */

/* Грибы — все, кроме ядовитых */

/* Светлячки — только под мышкой */
`,
  solutionCss: `/* Фонари — каждый второй */
.lantern:nth-child(even) {
  color: gold;
}

/* Грибы — все, кроме ядовитых */
.mushroom:not(.poison) {
  color: lime;
}

/* Светлячки — только под мышкой */
.firefly:hover {
  color: gold;
}
`,
  check: { items: '.lantern, .mushroom, .firefly', style: 'color', hover: '.firefly' },
  scene: { width: 360, height: 260 },
  hints: [
    'Три правила — три псевдокласса: `:nth-child()`, `:not()` и `:hover`.',
    'Каждый второй — чётные: `:nth-child(even)`. Кроме ядовитых — `:not(.poison)`.',
    '`.lantern:nth-child(even) { color: gold; }` `.mushroom:not(.poison) { color: lime; }` `.firefly:hover { color: gold; }`',
  ],
});
