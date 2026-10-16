import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'fn-01',
  title: 'Первый рецепт',
  learns: 'function',
  dialog: [
    'Я — Шеф Ретёрн, хозяин Котла Функций. Рецепт — это функция: шаги записывают один раз, а готовят по ним сколько угодно.',
    '`function stir() { … }` — рецепт по имени `stir`. Сам по себе он ничего не делает, пока его не позовут по имени со скобками: `stir();`.',
  ],
  task: 'Рецепт `stir` уже записан: он говорит Оракулу «Помешиваю!». Позови его три раза — пусть Оракул скажет это трижды.',
  starterJs: `function stir() {
  console.log('Помешиваю!');
}
// Позови рецепт три раза

`,
  solutionJs: `function stir() {
  console.log('Помешиваю!');
}
// Позови рецепт три раза
stir();
stir();
stir();
`,
  check: { output: true },
  require: [{ pattern: '^\\s*stir\\s*\\(\\s*\\)', message: 'Позови рецепт по имени со скобками: stir();' }],
  reject: [{ pattern: 'console\\.log[\\s\\S]*console\\.log', message: 'Не повторяй console.log — позови рецепт три раза: stir();' }],
  hints: [
    'Рецепт зовут по имени со скобками.',
    'Каждый вызов `stir();` — одна строчка на свитке.',
    '`stir();` три раза, каждый на своей строке.',
  ],
});
