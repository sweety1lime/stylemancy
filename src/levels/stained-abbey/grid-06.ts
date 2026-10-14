import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-06',
  title: 'Широкое стекло',
  dialog: [
    'Не всем стёклам хватает одной ячейки. Солнце — широкое, на две колонки, а Луна — высокая, на две строки.',
    'Остальные стёкла подвинутся сами: сетка найдёт им свободные ячейки.',
  ],
  task: 'Растяни `.sun` на две колонки, а `.moon` — на две строки.',
  html: `<div class="window">
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane star" data-name="Звезда"></div>
</div>`,
  starterCss: `.window {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.sun {
}

.moon {
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.sun {
  grid-column: span 2;
}

.moon {
  grid-row: span 2;
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  hints: [
    'Сколько ячеек занимает элемент, решает он сам: колонки — `grid-column`, строки — `grid-row`.',
    '`span 2` значит «растянуться на две».',
    '`.sun { grid-column: span 2; }` и `.moon { grid-row: span 2; }`',
  ],
  learns: 'grid-span',
});
