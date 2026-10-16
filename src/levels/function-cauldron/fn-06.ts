import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'fn-06',
  title: 'Рецепт из рецептов',
  dialog: [
    'Рецепты складывают из других рецептов: готовый рецепт зовут внутри нового, как обычную команду.',
    'Рецепт `square(n)` уже умеет возводить в квадрат. Не повторяй его — позови: `square(a)`.',
  ],
  task: 'Допиши рецепт `sumSquares(a, b)`: пусть возвращает сумму квадратов `a` и `b`, а квадраты считает готовый рецепт `square`.',
  starterJs: `function square(n) {
  return n * n;
}

function sumSquares(a, b) {
  // Верни сумму квадратов a и b — с помощью square
}
`,
  solutionJs: `function square(n) {
  return n * n;
}

function sumSquares(a, b) {
  // Верни сумму квадратов a и b — с помощью square
  return square(a) + square(b);
}
`,
  check: {},
  calls: ['sumSquares(2, 3)', 'sumSquares(1, 1)', 'sumSquares(4, 0)'],
  require: [
    {
      pattern: 'square\\s*\\(\\s*a\\s*\\)[\\s\\S]*square\\s*\\(\\s*b\\s*\\)|square\\s*\\(\\s*b\\s*\\)[\\s\\S]*square\\s*\\(\\s*a\\s*\\)',
      message: 'Позови готовый рецепт: square(a) + square(b).',
    },
  ],
  hints: [
    'Квадрат уже считает `square` — его можно позвать прямо внутри нового рецепта.',
    '`square(a)` — квадрат `a`, `square(b)` — квадрат `b`.',
    '`return square(a) + square(b);`',
  ],
});
