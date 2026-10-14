import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-09',
  title: 'Испытание: Большая розетка',
  trial: true,
  dialog: [
    'Последнее окно обители — Большая розетка. Его собирали самые старые мастера.',
    'Пригодится всё, что ты знаешь о сетке. Способ выбирай сам.',
  ],
  task: 'Собери розетку: колонки в пропорции 1 : 2 : 1, промежутки 12px. Роза — в средней колонке на две строки, Корона — внизу во всю ширину.',
  html: `<div class="window">
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane leaf" data-name="Лист"></div>
  <div class="pane crown" data-name="Корона"></div>
</div>`,
  starterCss: `.window {
  display: grid;
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 12px;
}

.rose {
  grid-column: 2;
  grid-row: 1 / 3;
}

.crown {
  grid-column: 1 / -1;
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  hints: [
    'Начни с окна: колонки в долях `fr` и промежутки `gap`. Потом займись Розой и Короной.',
    'Розе нужны и колонка, и строки: `grid-column` и `grid-row`. Корону растяни от первой линии до последней — последняя линия всегда -1.',
    'У окна: `grid-template-columns: 1fr 2fr 1fr; gap: 12px;` У `.rose`: `grid-column: 2; grid-row: 1 / 3;` У `.crown`: `grid-column: 1 / -1;`',
  ],
});
