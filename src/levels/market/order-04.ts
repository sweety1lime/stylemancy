import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'order-04',
  title: 'Заказ: Шапка лавки',
  trial: true,
  dialog: [
    'Последний заказ — шапка для вывески: слева логотип, справа корзина, а меню строго посередине. Строго!',
    'Логотип и корзина разной ширины, так что просто раздвинуть по краям не выйдет: меню уедет. Придумай, как удержать его по центру.',
  ],
  task: 'Собери шапку по пунктам заказа: логотип, меню и корзина в один ряд, а меню ровно посередине, хотя соседи у него разной ширины.',
  html: `<div class="header">
  <div class="logo" data-name="Логотип"></div>
  <div class="menu" data-name="Меню"></div>
  <div class="cart" data-name="Корзина"></div>
</div>`,
  starterCss: `.header {
}
`,
  solutionCss: `.header {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.cart {
  justify-self: end;
}
`,
  check: {
    items: '.logo, .menu, .cart',
    itemLabel: 'Часть шапки',
    order: [
      { label: 'Логотип, меню и корзина стоят в один ряд', rule: { rule: 'row', items: '.logo, .menu, .cart' } },
      { label: 'Логотип — у левого края шапки', rule: { rule: 'side', item: '.logo', side: 'left', offset: 16 } },
      { label: 'Корзина — у правого края шапки', rule: { rule: 'side', item: '.cart', side: 'right', offset: 16 } },
      { label: 'Меню — ровно посередине шапки по ширине', rule: { rule: 'center', item: '.menu', axis: 'x' } },
      { label: 'Весь ряд — посередине шапки по высоте', rule: { rule: 'center', item: '.logo, .menu, .cart', axis: 'y' } },
    ],
  },
  hints: [
    'Если раздвинуть три предмета по краям поровну, меню окажется посередине свободного места, а не посередине шапки: слева у него логотип в 96px, справа корзина в 64px.',
    'Нужно, чтобы по бокам от меню оставалось поровну места. В сетке это две одинаковые гибкие колонки по краям и колонка по размеру меню посередине: `1fr auto 1fr`.',
    '`.header { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; }` и корзине ещё `justify-self: end;`',
  ],
});
