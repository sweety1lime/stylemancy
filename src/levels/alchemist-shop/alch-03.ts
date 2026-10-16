import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'alch-03',
  title: 'Что в колбе?',
  learns: 'typeof',
  dialog: [
    'Прежде чем смешивать, алхимик узнаёт, что в колбе. На вид `42` и `\'42\'` похожи, а смешиваются по-разному.',
    'Для этого есть моё заклинание — `typeof`. `typeof gems` называет тип значения: `number` — число, `string` — строка, `boolean` — да или нет, `undefined` — пусто.',
  ],
  task: 'Шут NaN сорвал этикетки с четырёх колб. Пусть Оракул скажет тип каждой — по порядку `a`, `b`, `c` и `d`. Названия типов не пиши сам — спроси у `typeof`.',
  starterJs: `let a = 42;
let b = '42';
let c = true;
let d;
// Узнай тип каждой колбы

`,
  solutionJs: `let a = 42;
let b = '42';
let c = true;
let d;
// Узнай тип каждой колбы
console.log(typeof a);
console.log(typeof b);
console.log(typeof c);
console.log(typeof d);
`,
  check: { output: true },
  require: [{ pattern: '\\btypeof\\b', message: 'Тип колбы узнают заклинанием typeof: console.log(typeof a);' }],
  reject: [{ pattern: '[\'"`](number|string|boolean|undefined)[\'"`]', message: 'Не подсказывай Оракулу названия типов — пусть их скажет typeof.' }],
  hints: [
    '`typeof` ставят перед именем колбы: `typeof a`.',
    'Чтобы Оракул сказал тип, оберни его в `console.log`: `console.log(typeof a);`',
    'Четыре строки: `console.log(typeof a);` и так же для `b`, `c` и `d`.',
  ],
});
