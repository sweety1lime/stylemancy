import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'arr-07',
  title: 'Сито',
  learns: 'filter',
  dialog: [
    'Сито! `filter` пропускает только те вагоны, для которых маленький рецепт ответил `true`, и собирает из них новый обоз.',
    '`weights.filter((w) => w > 5)` — остаются вагоны тяжелее пяти, остальные отсеиваются.',
  ],
  task: 'Напиши рецепт `heavy(weights)`: пусть возвращает обоз только из вагонов тяжелее 5. Используй `filter`.',
  starterJs: `function heavy(weights) {
  // Просей обоз: только вагоны тяжелее 5
}
`,
  solutionJs: `function heavy(weights) {
  // Просей обоз: только вагоны тяжелее 5
  return weights.filter((w) => w > 5);
}
`,
  check: {},
  calls: ['heavy([3, 8, 6, 1])', 'heavy([1, 2])', 'heavy([10, 5, 6])'],
  require: [{ pattern: '\\.filter\\s*\\(', message: 'Просеивают обоз через filter: weights.filter((w) => w > 5).' }],
  hints: [
    'Рецепт для одного вагона отвечает `true` или `false`: оставить вагон или отсеять.',
    'Тяжелее пяти — `w > 5`. Вагон весом ровно 5 не проходит.',
    '`return weights.filter((w) => w > 5);`',
  ],
});
