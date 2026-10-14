import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-08',
  title: 'Карта витража',
  dialog: [
    'Самое красивое заклинание сетки — карта. Каждая строка в кавычках — строка окна, а слова — ячейки. Одинаковые слова сливаются в одно стекло.',
    'Лорд Дефолт перепутал слова на карте этого окна. Перерисуй её — и стёкла сами встанут по местам.',
  ],
  task: 'Перерисуй `grid-template-areas`: Луна — слева во всю высоту, Солнце — сверху справа на две колонки, Роза — так же снизу, Дерево и Звезда — посередине.',
  html: `<div class="window">
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane rose" data-name="Роза"></div>
</div>`,
  starterCss: `.window {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  grid-template-areas:
    "sun  sun  sun"
    "moon tree star"
    "rose rose rose";
}

.sun { grid-area: sun; }
.moon { grid-area: moon; }
.tree { grid-area: tree; }
.star { grid-area: star; }
.rose { grid-area: rose; }
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  grid-template-areas:
    "moon sun  sun"
    "moon tree star"
    "moon rose rose";
}

.sun { grid-area: sun; }
.moon { grid-area: moon; }
.tree { grid-area: tree; }
.star { grid-area: star; }
.rose { grid-area: rose; }
`,
  check: { items: '.pane', groupName: 'стёкла' },
  hints: [
    'Стёкла уже знают свои имена (`grid-area`) — менять нужно только карту в `.window`.',
    'Луна занимает левую колонку во всех трёх строках — значит, каждая строка карты начинается со слова `moon`.',
    '`"moon sun sun" "moon tree star" "moon rose rose"`',
  ],
  learns: 'grid-areas',
});
