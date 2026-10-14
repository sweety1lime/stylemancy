import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-07',
  title: 'Розетка по линиям',
  dialog: [
    'Роза — сердце окна, её место точно в центре. «Растянуться на две» тут мало: нужно сказать, от какой линии и до какой.',
    'Линии сетки нумеруются с единицы: вертикальные — слева направо, горизонтальные — сверху вниз.',
  ],
  task: 'Поставь `.rose` в центр окна: от 2-й до 4-й вертикальной линии и от 1-й до 3-й горизонтальной.',
  html: `<div class="window">
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane leaf" data-name="Лист"></div>
</div>`,
  starterCss: `.window {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.rose {
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.rose {
  grid-column: 2 / 4;
  grid-row: 1 / 3;
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  require: [
    {
      pattern: '\\d\\s*/\\s*-?\\d|grid-(column|row)-(start|end)',
      message: 'Здесь нужны номера линий: grid-column: 2 / 4 — от второй вертикальной линии до четвёртой.',
    },
  ],
  hints: [
    'У четырёх колонок пять вертикальных линий, у двух строк — три горизонтальные. Края окна — тоже линии.',
    '`grid-column: начало / конец` — между какими вертикальными линиями стоит стекло, `grid-row` — между какими горизонтальными.',
    '`.rose { grid-column: 2 / 4; grid-row: 1 / 3; }`',
  ],
  learns: 'grid-lines',
});
