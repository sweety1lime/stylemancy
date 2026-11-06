import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'order-03',
  title: 'Заказ: Карточка товара',
  dialog: [
    'Нужна карточка товара, как на настоящих сайтах: слева фото, рядом название, под ним цена, а внизу кнопка «Купить».',
    'Заказчик хочет не всё сразу, а по пунктам. Выполнишь все — карточка готова.',
  ],
  task: 'Собери карточку из четырёх частей по пунктам заказа. Если что-то не сходится, нажми на предмет «Лупой»: она покажет его размеры.',
  html: `<div class="board">
  <div class="photo" data-name="Фото"></div>
  <div class="name" data-name="Название"></div>
  <div class="price" data-name="Цена"></div>
  <div class="buy" data-name="Кнопка"></div>
</div>`,
  starterCss: `.board {
}
`,
  solutionCss: `.board {
  display: grid;
  grid-template-columns: 96px 1fr;
  grid-template-rows: 28px 28px 1fr;
  gap: 8px 16px;
}

.photo {
  grid-row: 1 / 3;
}

.name,
.price {
  grid-column: 2;
}

.buy {
  grid-column: 1 / 3;
  justify-self: center;
  align-self: end;
}
`,
  check: {
    items: '.photo, .name, .price, .buy',
    itemLabel: 'Часть',
    order: [
      { label: 'Фото — слева от названия', rule: { rule: 'leftOf', a: '.photo', b: '.name' } },
      { label: 'Между фото и названием — 16px', rule: { rule: 'gap', items: '.photo, .name', px: 16 } },
      { label: 'Цена — под названием', rule: { rule: 'below', a: '.price', b: '.name' } },
      { label: 'Кнопка — у нижнего края доски', rule: { rule: 'side', item: '.buy', side: 'bottom', offset: 16 } },
      { label: 'Кнопка — посередине доски по ширине', rule: { rule: 'center', item: '.buy', axis: 'x' } },
    ],
  },
  hints: [
    'Здесь удобна сетка: слева колонка под фото, справа — под название и цену, а кнопка занимает обе колонки.',
    'Колонки: `96px 1fr`, промежутки между ними — `16px`. Фото занимает два ряда (`grid-row`), кнопка — обе колонки (`grid-column`). Сама кнопка встаёт вниз (`align-self`) и по центру (`justify-self`).',
    '`.board { display: grid; grid-template-columns: 96px 1fr; grid-template-rows: 28px 28px 1fr; gap: 8px 16px; }` Дальше `.photo { grid-row: 1 / 3; }`, `.name, .price { grid-column: 2; }` и `.buy { grid-column: 1 / 3; justify-self: center; align-self: end; }`',
  ],
});
