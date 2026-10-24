import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'arr-08',
  title: 'Испытание: Тяжёлый обоз',
  trial: true,
  dialog: [
    'Последний обоз в пути. На мосту взвешивают только тяжёлые вагоны — тяжелее пяти, остальные идут бесплатно.',
    'Хочешь — просей обоз через `filter` и сложи остаток, хочешь — сложи в цикле с проверкой. Главное — верный вес.',
  ],
  task: 'Напиши рецепт `heavyTotal(weights)`: пусть возвращает общий вес только тех вагонов, что тяжелее 5. Флаконы проверят разные обозы, в том числе пустой.',
  starterJs: `// Общий вес вагонов тяжелее 5

`,
  solutionJs: `// Общий вес вагонов тяжелее 5
function heavyTotal(weights) {
  let sum = 0;
  for (const w of weights) {
    if (w > 5) {
      sum = sum + w;
    }
  }
  return sum;
}
`,
  check: {},
  calls: ['heavyTotal([3, 8, 6, 1])', 'heavyTotal([1, 2])', 'heavyTotal([10, 5, 7])', 'heavyTotal([])'],
  hints: [
    'Копилка с нулём, цикл по вагонам и проверка `w > 5` внутри.',
    'Доливай в копилку только тяжёлые вагоны: `if (w > 5) { sum = sum + w; }`.',
    '`let sum = 0;`, цикл `for (const w of weights) { if (w > 5) { sum = sum + w; } }` и `return sum;`',
  ],
});
