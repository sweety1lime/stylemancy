import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-04',
  title: 'Огоньки',
  dialog: [
    'Ночью на опушке светят фонари и светлячки — одним и тем же золотым светом.',
    'Писать два одинаковых правила незачем: селекторы можно перечислить через запятую, и правило подействует на всех сразу.',
  ],
  task: 'Зажги золотом и фонари `.lantern`, и светлячков `.firefly` — одним правилом: перечисли селекторы через запятую. Гриб не трогай.',
  html: `<div class="glade">
  <div class="lantern" data-name="Фонарь 1"></div>
  <div class="firefly" data-name="Светлячок 1"></div>
  <div class="mushroom" data-name="Гриб"></div>
  <div class="firefly" data-name="Светлячок 2"></div>
  <div class="lantern" data-name="Фонарь 2"></div>
</div>`,
  starterCss: `.lantern {
  color: gold;
}
`,
  solutionCss: `.lantern, .firefly {
  color: gold;
}
`,
  check: { items: '.lantern, .firefly, .mushroom', style: 'color' },
  require: [
    {
      pattern: '\\.(lantern|firefly)\\s*,\\s*\\.(lantern|firefly)',
      message: 'Здесь нужно одно правило на двоих: селекторы через запятую.',
    },
  ],
  hints: [
    'Чтобы одно правило подействовало на разные элементы, их селекторы перечисляют через запятую.',
    'Допиши к `.lantern` второй селектор: `.lantern, .firefly`.',
    '`.lantern, .firefly { color: gold; }`',
  ],
  learns: 'selector-group',
});
