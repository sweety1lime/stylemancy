import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'arr-04',
  title: 'Перекличка',
  learns: 'array-loop',
  dialog: [
    'Перед дорогой — перекличка: каждый вагон называет свой номер и груз. Вагонов много, по одному их не переберёшь.',
    'Цикл по обозу: `for (let i = 0; i < train.length; i++)` — `i` пробегает все номера от 0 до последнего, а `train[i]` — груз под этим номером.',
  ],
  task: 'Проведи перекличку: для каждого вагона Оракул говорит `Вагон 0: уголь`, `Вагон 1: руда` и так далее — номер и груз. Обоз длинный, так что нужен цикл.',
  starterJs: `let train = ['уголь', 'руда', 'кристаллы', 'мёд', 'шерсть'];
// Перекличка: номер и груз каждого вагона

`,
  solutionJs: `let train = ['уголь', 'руда', 'кристаллы', 'мёд', 'шерсть'];
// Перекличка: номер и груз каждого вагона
for (let i = 0; i < train.length; i++) {
  console.log(\`Вагон \${i}: \${train[i]}\`);
}
`,
  check: { output: true },
  require: [{ pattern: '\\b(for|while)\\b', message: 'Перекличку ведёт цикл: for (let i = 0; i < train.length; i++).' }],
  reject: [{ pattern: 'console\\.log[\\s\\S]*console\\.log', message: 'Одного console.log внутри цикла хватит на весь обоз.' }],
  hints: [
    'Цикл от 0, пока `i < train.length`.',
    'Внутри цикла — номер `i` и груз `train[i]` в шаблоне.',
    '`` for (let i = 0; i < train.length; i++) { console.log(`Вагон ${i}: ${train[i]}`); } ``',
  ],
});
