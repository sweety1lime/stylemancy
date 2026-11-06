import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'order-05',
  title: 'Заказ: Подвал',
  dialog: [
    'Внизу лавки нужен подвал: контакты, адрес и часы работы. Три плитки, и у каждой своя колонка.',
    'Колонки равные, а плитка стоит посередине своей: так подвал выглядит спокойно, и покупатель сразу находит, что искал.',
  ],
  task: 'Расставь три плитки по пунктам заказа: колонки равные, каждая плитка посередине своей колонки. Доска делится на три доли, поэтому от краёв доски до крайних плиток по `39px`.',
  html: `<div class="board">
  <div class="tile a" data-name="Контакты"></div>
  <div class="tile b" data-name="Адрес"></div>
  <div class="tile c" data-name="Часы"></div>
</div>`,
  starterCss: `.board {
}
`,
  solutionCss: `.board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  justify-items: center;
  align-content: center;
}
`,
  check: {
    items: '.tile',
    itemLabel: 'Плитка',
    order: [
      { label: 'Три плитки стоят в один ряд', rule: { rule: 'row', items: '.tile' } },
      { label: 'Левая плитка — в 39px от левого края доски', rule: { rule: 'side', item: '.a', side: 'left', offset: 39 } },
      { label: 'Правая плитка — в 39px от правого края доски', rule: { rule: 'side', item: '.c', side: 'right', offset: 39 } },
      { label: 'Средняя плитка — ровно посередине доски по ширине', rule: { rule: 'center', item: '.b', axis: 'x' } },
      { label: 'Промежутки между плитками одинаковые', rule: { rule: 'gap', items: '.tile' } },
      { label: 'Ряд стоит посередине доски по высоте', rule: { rule: 'center', item: '.tile', axis: 'y' } },
    ],
  },
  hints: [
    'Три равные колонки — это сетка: `display: grid` и `grid-template-columns` с `repeat()`. «Поровну» записывается долей `fr`.',
    'Плитка меньше колонки, поэтому её нужно поставить посередине колонки: за выравнивание по ширине колонки отвечает `justify-items`. А ряд по высоте ставит `align-content`.',
    '`.board { display: grid; grid-template-columns: repeat(3, 1fr); justify-items: center; align-content: center; }` Тот же результат даёт и Flexbox: `display: flex; justify-content: space-around; align-items: center;`',
  ],
});
