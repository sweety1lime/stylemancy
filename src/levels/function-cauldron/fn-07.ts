import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'fn-07',
  title: 'Стрелочный рецепт',
  learns: 'arrow',
  dialog: [
    'Короткие рецепты пишут стрелкой: `const double = (n) => n * 2;`. Слева — параметры в скобках, после `=>` — что вернуть.',
    'Ни `function`, ни `return`, ни фигурных скобок — стрелка сама возвращает то, что справа. Но если поставишь фигурные скобки, `return` снова понадобится.',
  ],
  task: 'Перепиши рецепт `half` стрелкой: `const half = (n) => …`. Флаконы проверят, что он по-прежнему делит пополам.',
  starterJs: `function half(n) {
  return n / 2;
}
`,
  solutionJs: `const half = (n) => n / 2;
`,
  check: {},
  calls: ['half(10)', 'half(3)', 'half(0)'],
  require: [{ pattern: '=>', message: 'Перепиши рецепт стрелкой: const half = (n) => n / 2;' }],
  hints: [
    'Стрелка: `const half = (параметры) => что вернуть;`.',
    'Вместо трёх строк с `function` и `return` — одна строка.',
    '`const half = (n) => n / 2;`',
  ],
});
