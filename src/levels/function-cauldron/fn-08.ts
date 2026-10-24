import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'fn-08',
  title: 'Испытание: Заказ',
  trial: true,
  dialog: [
    'Последний рецепт Котла — цена заказа. Гость берёт `count` зелий по `cost` монет, а кто берёт 5 зелий и больше, получает скидку — 10 монет.',
    'Внутри рецепта можно всё: колбы, условия и циклы, а `return` отдаёт итог.',
  ],
  task: 'Напиши рецепт `orderPrice(count, cost)`: пусть возвращает цену заказа (`count * cost`), а от 5 зелий — на 10 монет меньше. Флаконы проверят разные заказы.',
  starterJs: `// Цена заказа: count зелий по cost монет, от 5 зелий — скидка 10 монет

`,
  solutionJs: `// Цена заказа: count зелий по cost монет, от 5 зелий — скидка 10 монет
function orderPrice(count, cost) {
  let total = count * cost;
  if (count >= 5) {
    total = total - 10;
  }
  return total;
}
`,
  check: {},
  calls: ['orderPrice(2, 12)', 'orderPrice(5, 10)', 'orderPrice(10, 3)', 'orderPrice(4, 20)', 'orderPrice(0, 7)'],
  hints: [
    'Сначала посчитай `count * cost`, потом проверь, положена ли скидка.',
    'Скидка — от пяти зелий: `if (count >= 5) { … }`.',
    'Колба `let total = count * cost;`, при `count >= 5` — `total = total - 10;`, а в конце `return total;`.',
  ],
});
