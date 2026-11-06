import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'order-01',
  title: 'Заказ: Витрина',
  dialog: [
    'Я Торговка Линка, и мне нужна витрина! Три товара, и чтобы покупатель сразу видел: лавка в порядке.',
    'Контуров я не рисую: список «Заказчик хочет» — это всё, что мне важно. Как ты это сделаешь, решай сам, лишь бы всё из списка сбылось.',
  ],
  task: 'Выставь три карточки на доске так, чтобы выполнились все пункты заказа. Решение может быть любым: проверяется результат.',
  html: `<div class="board">
  <div class="card" data-name="Лампа"></div>
  <div class="card" data-name="Свиток"></div>
  <div class="card" data-name="Зелье"></div>
</div>`,
  starterCss: `.board {
}
`,
  solutionCss: `.board {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
`,
  check: {
    items: '.card',
    itemLabel: 'Карточка',
    order: [
      { label: 'Карточки стоят в один ряд', rule: { rule: 'row', items: '.card' } },
      { label: 'Первая карточка — у левого края доски', rule: { rule: 'side', item: '.card:first-child', side: 'left', offset: 16 } },
      { label: 'Последняя карточка — у правого края доски', rule: { rule: 'side', item: '.card:last-child', side: 'right', offset: 16 } },
      { label: 'Промежутки между карточками одинаковые', rule: { rule: 'gap', items: '.card' } },
      { label: 'Ряд стоит посередине доски по высоте', rule: { rule: 'center', item: '.card', axis: 'y' } },
    ],
  },
  hints: [
    'Начни с контейнера: чтобы карточки встали в ряд, доске нужен `display: flex`. Остальное — про то, как раздать свободное место и как выровнять ряд по высоте.',
    'Крайние карточки у краёв и одинаковые промежутки между ними — это одно свойство, а вертикаль по центру — другое. Посмотри на `justify-content` и `align-items`.',
    '`.board { display: flex; justify-content: space-between; align-items: center; }`',
  ],
});
