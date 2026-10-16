import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'fn-03',
  title: 'Котёл отдаёт',
  learns: 'return',
  dialog: [
    'Рецепт может не только говорить, но и отдавать — как котёл отдаёт готовое зелье. Для этого есть `return`.',
    '`return n * 2;` возвращает значение туда, где рецепт позвали: `let big = double(5);` — и в колбе `big` будет 10. Рецепты проверяют флаконы на конвейере: каждый зовёт рецепт и смотрит, что вернулось.',
  ],
  task: 'Допиши рецепт `double(n)`: пусть он возвращает число вдвое больше. По конвейеру поедут флаконы `double(2)`, `double(5)`, `double(0)` и `double(-3)`.',
  starterJs: `function double(n) {
  // Верни число вдвое больше n
}
`,
  solutionJs: `function double(n) {
  // Верни число вдвое больше n
  return n * 2;
}
`,
  check: {},
  calls: ['double(2)', 'double(5)', 'double(0)', 'double(-3)'],
  hints: ['`return` отдаёт значение из рецепта.', 'Вдвое больше — это `n * 2`.', '`return n * 2;`'],
});
