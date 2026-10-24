import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'arr-05',
  title: 'Вес обоза',
  dialog: [
    'На весах — весь обоз. Чтобы узнать общий вес, бери колбу-копилку с нулём и доливай в неё вес каждого вагона.',
    '`let sum = 0;` перед циклом, `sum = sum + weights[i];` внутри, а после цикла — `return sum;`. Пустой обоз весит 0.',
  ],
  task: 'Напиши рецепт `totalWeight(weights)`: пусть возвращает общий вес всех вагонов. Флаконы проверят обозы разной длины, даже пустой.',
  starterJs: `function totalWeight(weights) {
  // Сложи вес всех вагонов
}
`,
  solutionJs: `function totalWeight(weights) {
  // Сложи вес всех вагонов
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum = sum + weights[i];
  }
  return sum;
}
`,
  check: {},
  calls: ['totalWeight([3, 5, 2])', 'totalWeight([10])', 'totalWeight([])', 'totalWeight([1, 1, 1, 1])'],
  hints: [
    'Копилка `let sum = 0;` — до цикла, а `return sum;` — после.',
    'Внутри цикла доливай вес вагона: `sum = sum + weights[i];`.',
    '`let sum = 0;`, цикл `for (let i = 0; i < weights.length; i++) { sum = sum + weights[i]; }` и `return sum;`',
  ],
});
