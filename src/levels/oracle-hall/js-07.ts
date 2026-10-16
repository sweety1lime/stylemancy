import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'js-07',
  title: 'Арифметика Оракула',
  learns: 'arithmetic',
  dialog: [
    'Кроме `+` у меня есть `-`, `*` — умножить, `/` — разделить и `%` — остаток от деления.',
    'Остаток — самый хитрый: `17 % 5` — это 2. Ровно столько кристаллов останется, если разложить 17 по мешкам по 5.',
  ],
  task: 'Зелье стоит `price` монет, гость берёт `count` зелий — посчитай в колбе `total`, сколько он заплатит. Кристаллы `gems` раскладывают по мешкам по 5 — посчитай в колбе `left`, сколько останется, через `%`. Готовые числа не пиши — пусть считает Оракул.',
  starterJs: `let price = 7;
let count = 3;
// Сколько заплатит гость?
let total = 0;

let gems = 17;
// Сколько кристаллов останется, если разложить их по мешкам по 5?
let left = 0;

console.log(total);
console.log(left);
`,
  solutionJs: `let price = 7;
let count = 3;
// Сколько заплатит гость?
let total = price * count;

let gems = 17;
// Сколько кристаллов останется, если разложить их по мешкам по 5?
let left = gems % 5;

console.log(total);
console.log(left);
`,
  check: { output: true, vars: ['total', 'left'] },
  require: [
    { pattern: 'price\\s*\\*\\s*count|count\\s*\\*\\s*price', message: 'Стоимость — это цена, умноженная на количество: price * count.' },
    { pattern: 'gems\\s*%\\s*5', message: 'Остаток считай через %: gems % 5.' },
  ],
  hints: [
    'Умножение — `*`, остаток от деления — `%`.',
    '`total` — это `price * count`, а `left` — `gems % 5`.',
    '`let total = price * count;` и `let left = gems % 5;`',
  ],
});
