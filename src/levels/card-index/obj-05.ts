import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'obj-05',
  title: 'Полка с карточками',
  learns: 'object-array',
  dialog: [
    'Карточки хранят стопками — в массиве. Каждый вагон такого обоза — целая карточка: `shelf[0].price` — цена первого зелья на полке.',
    'Перебирай карточки циклом и бери нужное поле у каждой: `for (const potion of shelf) { … potion.price … }`.',
  ],
  task: 'Напиши рецепт `shelfPrice(shelf)`: пусть возвращает, сколько стоят все зелья на полке вместе. Флаконы проверят разные полки — и пустую.',
  starterJs: `function shelfPrice(shelf) {
  // Сложи цены всех карточек на полке
}
`,
  solutionJs: `function shelfPrice(shelf) {
  // Сложи цены всех карточек на полке
  let sum = 0;
  for (const potion of shelf) {
    sum = sum + potion.price;
  }
  return sum;
}
`,
  check: {},
  calls: ["shelfPrice([{ name: 'Мята', price: 3 }, { name: 'Мёд', price: 7 }])", "shelfPrice([{ name: 'Эликсир', price: 20 }])", 'shelfPrice([])'],
  hints: [
    'Как с весом обоза: копилка с нулём и цикл. Только у каждого вагона берёшь поле `price`.',
    '`for (const potion of shelf) { sum = sum + potion.price; }`',
    '`let sum = 0;`, цикл по полке с `sum = sum + potion.price;` и `return sum;`',
  ],
});
