import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'arr-06',
  title: 'Перегонка',
  learns: 'map',
  dialog: [
    'Перегонка! `map` проводит каждый вагон через перегонный куб и собирает из того, что вышло, новый обоз. Старый обоз при этом не меняется.',
    '`weights.map((w) => w * 2)` — каждый вес `w` удваивается. В скобках у `map` — маленький стрелочный рецепт для одного вагона.',
  ],
  task: 'Напиши рецепт `doubled(weights)`: пусть возвращает новый обоз, где каждый вес вдвое больше. Используй `map`.',
  starterJs: `function doubled(weights) {
  // Перегони каждый вагон: вес вдвое больше
}
`,
  solutionJs: `function doubled(weights) {
  // Перегони каждый вагон: вес вдвое больше
  return weights.map((w) => w * 2);
}
`,
  check: {},
  calls: ['doubled([1, 2, 3])', 'doubled([5])', 'doubled([])'],
  require: [{ pattern: '\\.map\\s*\\(', message: 'Перегоняют обоз через map: weights.map((w) => w * 2).' }],
  hints: [
    '`map` вернёт новый обоз — его и нужно вернуть из рецепта.',
    'Рецепт для одного вагона: `(w) => w * 2`.',
    '`return weights.map((w) => w * 2);`',
  ],
});
