import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'alch-06',
  title: 'Колокольчик',
  learns: 'alert',
  dialog: [
    'Когда в лавку заходит гость, звенит колокольчик. `console.log` пишет в журнал — его видит только алхимик. А чтобы увидел гость, нужно окно — `alert(…)`.',
    '`alert(\'Привет!\')` показывает окно с сообщением. На свитке такие слова Оракул помечает: alert.',
  ],
  task: 'Пусть колокольчик звенит для гостя: покажи окном `alert` приветствие `Добро пожаловать, Лира!` — имя возьми шаблоном из колбы `guest`. Потом запиши в журнал через `console.log`: `Гость: Лира`.',
  starterJs: `let guest = 'Лира';
// Окно для гостя — alert, запись в журнал — console.log

`,
  solutionJs: `let guest = 'Лира';
// Окно для гостя — alert, запись в журнал — console.log
alert(\`Добро пожаловать, \${guest}!\`);
console.log(\`Гость: \${guest}\`);
`,
  check: { output: true },
  require: [{ pattern: '\\balert\\s*\\(', message: 'Гость видит только окно — поприветствуй его через alert(…).' }],
  reject: [{ pattern: '(alert|console\\.log)\\s*\\([^)]*Лира', message: 'Не пиши имя вручную — возьми его из колбы guest: ${guest}.' }],
  hints: [
    'Окно для гостя — `alert(…)`, запись в журнал — `console.log(…)`. Сначала окно.',
    'Имя бери из колбы шаблоном: `` `Добро пожаловать, ${guest}!` ``.',
    '`` alert(`Добро пожаловать, ${guest}!`); `` и `` console.log(`Гость: ${guest}`); ``',
  ],
});
