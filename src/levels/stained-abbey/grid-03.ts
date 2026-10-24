import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-03',
  title: 'Высокие и низкие',
  dialog: [
    'У сетки есть не только колонки, но и строки. Сейчас окно делит высоту поровну, а по старому чертежу верхние стёкла вдвое выше нижних.',
    'Высоты строк задаются так же, как ширины колонок, и `fr` здесь тоже работает.',
  ],
  task: 'Задай строки окна через `grid-template-rows`: верхняя строка вдвое выше нижней.',
  html: `<div class="window">
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane leaf" data-name="Лист"></div>
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane tree" data-name="Дерево"></div>
</div>`,
  starterCss: `.window {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 2fr 1fr;
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  hints: [
    'Колонки уже есть. Не хватает второго чертежа — для строк.',
    '`grid-template-rows` перечисляет высоты строк сверху вниз. Две доли сверху, одна снизу.',
    '`grid-template-rows: 2fr 1fr;`',
  ],
  learns: 'grid-rows',
});
