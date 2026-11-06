import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'order-08',
  title: 'Заказ: Лента меню',
  dialog: [
    'Нужна лента над вывеской: слева логотип, справа корзина, а всё место между ними пусть займёт меню. Никаких дыр!',
    'Само меню не растянется: ему надо сказать, что оно имеет право расти.',
  ],
  task: 'Собери ленту по пунктам заказа: логотип и корзина у краёв, а меню занимает всё свободное место между ними вплотную.',
  html: `<div class="header">
  <div class="logo" data-name="Логотип"></div>
  <div class="menu" data-name="Меню"></div>
  <div class="cart" data-name="Корзина"></div>
</div>`,
  starterCss: `.header {
}
`,
  solutionCss: `.header {
  display: flex;
  align-items: center;
}

.menu {
  flex-grow: 1;
}
`,
  check: {
    items: '.logo, .menu, .cart',
    itemLabel: 'Часть ленты',
    order: [
      { label: 'Логотип, меню и корзина стоят в один ряд', rule: { rule: 'row', items: '.logo, .menu, .cart' } },
      { label: 'Логотип — у левого края ленты', rule: { rule: 'side', item: '.logo', side: 'left', offset: 16 } },
      { label: 'Корзина — у правого края ленты', rule: { rule: 'side', item: '.cart', side: 'right', offset: 16 } },
      { label: 'Между логотипом и меню нет просвета', rule: { rule: 'gap', items: '.logo, .menu', px: 0 } },
      { label: 'Между меню и корзиной нет просвета', rule: { rule: 'gap', items: '.menu, .cart', px: 0 } },
    ],
  },
  hints: [
    'Чтобы три предмета встали в ряд, ленте нужен `display: flex`. А вот растянуть меню — отдельное заклинание: оно знакомо тебе по островам.',
    'Предмету можно разрешить занять всё свободное место: это `flex-grow`. Записывай его не ленте, а самому меню.',
    '`.header { display: flex; align-items: center; }` `.menu { flex-grow: 1; }`',
  ],
});
