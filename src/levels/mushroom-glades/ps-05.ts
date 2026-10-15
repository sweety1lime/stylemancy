import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'ps-05',
  title: 'Все, кроме ядовитых',
  dialog: [
    'Сегодня ярмарка грибников: зажечь нужно все съедобные грибы. Ядовитые пусть остаются в тени.',
    ':not(…) значит «кроме»: .mushroom:not(.poison) найдёт все грибы, у которых нет класса poison.',
  ],
  task: 'Зажги салатовым (`lime`) все грибы, кроме ядовитых: псевдокласс `:not(.poison)`.',
  html: `<div class="glade">
  <div class="mushroom" data-name="Гриб 1"></div>
  <div class="mushroom poison" data-name="Ядовитый гриб 1"></div>
  <div class="mushroom" data-name="Гриб 2"></div>
  <div class="mushroom" data-name="Гриб 3"></div>
  <div class="mushroom poison" data-name="Ядовитый гриб 2"></div>
  <div class="mushroom" data-name="Гриб 4"></div>
</div>`,
  starterCss: `.mushroom {
  color: lime;
}
`,
  solutionCss: `.mushroom:not(.poison) {
  color: lime;
}
`,
  check: { items: '.mushroom', groupName: 'грибы', style: 'color' },
  hints: [
    'Перечислять съедобные грибы по одному не нужно — проще исключить ядовитые.',
    'В скобках `:not()` пишут селектор тех, кого исключить: `:not(.poison)`.',
    '`.mushroom:not(.poison) { color: lime; }`',
  ],
  learns: 'not',
});
