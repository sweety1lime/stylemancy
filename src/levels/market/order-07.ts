import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'order-07',
  title: 'Заказ: Окно',
  dialog: [
    'Покупатель положил товар в корзину, и посреди лавки должно появиться окошко с подтверждением. Окошко по центру, а кнопка «Закрыть» — в его правом верхнем углу.',
    'Тут коробка в коробке: окошко лежит на доске, а кнопка лежит в окошке. У каждой коробки свои правила для того, что внутри.',
  ],
  task: 'Поставь окошко посередине доски, а кнопку «Закрыть» — в правый верхний угол окошка, вплотную к его рамке: рамка в `3px`, и это и есть тот самый отступ.',
  html: `<div class="board">
  <div class="card" data-name="Окно">
    <div class="cart" data-name="Закрыть"></div>
  </div>
</div>`,
  starterCss: `.board {
}

.card {
}
`,
  solutionCss: `.board {
  display: grid;
  place-content: center;
}

.card {
  display: grid;
  justify-items: end;
  align-items: start;
}
`,
  check: {
    items: '.card, .cart',
    itemLabel: 'Часть',
    order: [
      { label: 'Окно стоит ровно посередине доски', rule: { rule: 'center', item: '.card', axis: 'both' } },
      { label: 'Кнопка — в правом верхнем углу окна: 3px от его верхнего края', rule: { rule: 'side', item: '.cart', side: 'top', offset: 3, in: '.card' } },
      { label: '…и 3px от его правого края', rule: { rule: 'side', item: '.cart', side: 'right', offset: 3, in: '.card' } },
      { label: 'Кнопка не вылезает за окно', rule: { rule: 'inside', item: '.cart', in: '.card' } },
    ],
  },
  hints: [
    'Здесь две коробки: доска и окно внутри неё. Окно ставь посередине доски, а кнопку — внутри окна: у окна свои правила для детей.',
    'Доске подойдут `display: grid` и `place-content: center`. Окно тоже может быть сеткой: выравнивание по ширине — `justify-items`, по высоте — `align-items`.',
    '`.board { display: grid; place-content: center; }` `.card { display: grid; justify-items: end; align-items: start; }`',
  ],
});
