import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'js-03',
  title: 'Первая колба',
  learns: 'let',
  dialog: [
    'Видишь полку? Это кладовая Скриптории. Колбы на ней — переменные: у каждой есть имя на этикетке и значение внутри.',
    '`let gems = 5;` — возьми новую колбу, подпиши «gems» и налей 5. Потом колбу можно показать мне: `console.log(gems)` — по имени, без кавычек.',
  ],
  task: 'Создай колбу `gems` с числом `5` и покажи её Оракулу — пусть он скажет, что внутри.',
  starterJs: `// Создай колбу gems с числом 5

// Покажи её Оракулу

`,
  solutionJs: `// Создай колбу gems с числом 5
let gems = 5;
// Покажи её Оракулу
console.log(gems);
`,
  check: { output: true, vars: ['gems'] },
  require: [
    { pattern: '\\blet\\s+gems\\b', message: 'Колбу создают приказом let: let gems = 5;' },
    { pattern: 'console\\.log\\(\\s*gems\\s*\\)', message: 'Покажи Оракулу саму колбу: console.log(gems) — без кавычек и без готового числа.' },
  ],
  hints: [
    'Новая колба: `let`, имя, знак `=` и значение.',
    'Сначала `let gems = 5;`, а чтобы показать колбу, назови её имя без кавычек.',
    '`let gems = 5;` и `console.log(gems);`',
  ],
});
