import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'order-06',
  title: 'Заказ: Полка',
  dialog: [
    'На полку помещается четыре товара в ряд, а у меня их семь. Лишние пусть не сжимаются в крошки, а встают на вторую полку.',
    'Размер товара священен: что было девяносто шесть на шестьдесят четыре, то и останется.',
  ],
  task: 'Расставь семь плиток по пунктам заказа: четыре на верхней полке, три на нижней, плитки не сжимаются, а промежутки между ними по `8px`.',
  html: `<div class="board">
  <div class="tile a" data-name="Лампа"></div>
  <div class="tile b" data-name="Свиток"></div>
  <div class="tile c" data-name="Зелье"></div>
  <div class="tile d" data-name="Ключ"></div>
  <div class="tile e" data-name="Карта"></div>
  <div class="tile f" data-name="Перо"></div>
  <div class="tile g" data-name="Книга"></div>
</div>`,
  starterCss: `.board {
}
`,
  solutionCss: `.board {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
`,
  check: {
    items: '.tile',
    itemLabel: 'Плитка',
    order: [
      { label: 'Первые четыре плитки стоят в один ряд', rule: { rule: 'row', items: '.a, .b, .c, .d' } },
      { label: '«Карта», «Перо» и «Книга» — во втором ряду', rule: { rule: 'row', items: '.e, .f, .g' } },
      { label: '«Карта» стоит под «Лампой»', rule: { rule: 'column', items: '.a, .e' } },
      { label: 'Промежутки между плитками первого ряда — 8px', rule: { rule: 'gap', items: '.a, .b, .c, .d', px: 8 } },
      { label: 'Плитки не сжались: «Лампа» осталась 96×64', rule: { rule: 'size', item: '.a', w: 96, h: 64 } },
      { label: 'Первая плитка — у левого края доски', rule: { rule: 'side', item: '.a', side: 'left', offset: 16 } },
    ],
  },
  hints: [
    'Чтобы плитки встали рядом, доске нужен `display: flex`. А чтобы лишние не сжимались до крошек, а переходили на новую строку, есть `flex-wrap`.',
    'Промежутки между плитками — `gap`: он работает и по горизонтали, и по вертикали сразу. Размер плитки не трогай: проверь «Лупой», что она осталась `96×64`.',
    '`.board { display: flex; flex-wrap: wrap; gap: 8px; }`',
  ],
});
