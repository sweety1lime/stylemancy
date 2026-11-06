import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'order-02',
  title: 'Заказ: Плитки',
  dialog: [
    'Четыре плитки на прилавок: лампа, свиток, зелье и ключ. Каждая знает своё место, а ты — не знаешь?',
    'Тут нужна сетка: два ряда по две плитки, ровная, с промежутками. Сколько писать заклинаний, не считаю.',
  ],
  task: 'Собери четыре плитки в сетку два на два по пунктам заказа. Лупа поможет увидеть размеры и промежутки.',
  html: `<div class="board">
  <div class="tile a" data-name="Лампа"></div>
  <div class="tile b" data-name="Свиток"></div>
  <div class="tile c" data-name="Зелье"></div>
  <div class="tile d" data-name="Ключ"></div>
</div>`,
  starterCss: `.board {
}
`,
  solutionCss: `.board {
  display: grid;
  grid-template-columns: repeat(2, 96px);
  gap: 8px;
  place-content: center;
}
`,
  check: {
    items: '.tile',
    itemLabel: 'Плитка',
    order: [
      { label: 'Верхний ряд: «Лампа» и «Свиток» рядом', rule: { rule: 'row', items: '.a, .b' } },
      { label: 'Нижний ряд: «Зелье» и «Ключ» рядом', rule: { rule: 'row', items: '.c, .d' } },
      { label: '«Лампа» стоит над «Зельем»', rule: { rule: 'column', items: '.a, .c' } },
      { label: 'Промежутки по горизонтали — 8px', rule: { rule: 'gap', items: '.a, .b', px: 8 } },
      { label: 'Промежутки по вертикали — 8px', rule: { rule: 'gap', items: '.a, .c', px: 8 } },
      { label: 'Вся сетка — посередине доски', rule: { rule: 'center', item: '.tile', axis: 'both' } },
    ],
  },
  hints: [
    'Сетка делается у контейнера: `display: grid`. Дальше — сколько колонок и какой они ширины.',
    'Колонок две, обе по `96px` — по ширине плитки. Для этого есть `grid-template-columns` и `repeat()`; промежутки задаёт `gap`.',
    '`.board { display: grid; grid-template-columns: repeat(2, 96px); gap: 8px; place-content: center; }` Последнее свойство ставит всю сетку посередине доски.',
  ],
});
