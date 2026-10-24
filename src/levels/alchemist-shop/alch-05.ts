import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'alch-05',
  title: 'Шут NaN',
  learns: 'nan',
  dialog: [
    'Слышишь бубенцы? Это шут NaN, подручный Лорда Дефолта. Он подсовывает `Number` строки, которые числом не прочесть.',
    '`Number(\'12 монет\')` — это `NaN`, «не число»: мешают буквы. Всё, что смешали с `NaN`, тоже становится `NaN`. Зато `parseInt(\'12 монет\')` читает число в начале строки, и выходит 12.',
  ],
  task: 'Шут подменил ценник: в колбе `tag` — `\'12 монет\'`, и счёт за 3 зелья вышел `NaN`. Достань цену из ценника через `parseInt(tag)`, чтобы Оракул сказал `36`. Вторая строка — тип счёта: заметь, что даже у `NaN` он `number`.',
  starterJs: `let tag = '12 монет';
// Шут NaN подменил ценник: Number не может прочесть «12 монет»
let price = Number(tag);
let total = price * 3;
console.log(total);
console.log(typeof total);
`,
  solutionJs: `let tag = '12 монет';
// Шут NaN подменил ценник: Number не может прочесть «12 монет»
let price = parseInt(tag);
let total = price * 3;
console.log(total);
console.log(typeof total);
`,
  check: { output: true, vars: ['price', 'total'] },
  require: [{ pattern: '\\bparseInt\\s*\\(\\s*tag\\s*\\)', message: 'Достань число из ценника: parseInt(tag) читает число в начале строки.' }],
  reject: [{ pattern: '\\b36\\b', message: 'Не пиши 36 готовым числом — пусть Оракул посчитает: price * 3.' }],
  hints: [
    'Свиток говорит `NaN` — значит, `Number` не смог прочесть строку. Найди, где цена превращается в число.',
    '`parseInt` читает число в начале строки и не обращает внимания на слово «монет».',
    '`let price = parseInt(tag);`',
  ],
});
