import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'alch-04',
  title: 'Весы врут',
  learns: 'to-number',
  dialog: [
    'Мои весы показывают вес строками: `\'5\'`, `\'3\'`. А плюс со строками не складывает, а склеивает — вот и выходит `\'53\'` вместо 8.',
    'Превратить строку в число может `Number(…)`: `Number(\'5\')` — это уже число 5, с ним можно считать.',
  ],
  task: 'На весах две гири — `first` и `second`, вес записан строками. Почини колбу `total`: преврати гири в числа через `Number`, чтобы Оракул сказал `8`, а не `53`.',
  starterJs: `let first = '5';
let second = '3';
// Весы склеивают, а нужно складывать
let total = first + second;
console.log(total);
`,
  solutionJs: `let first = '5';
let second = '3';
// Весы склеивают, а нужно складывать
let total = Number(first) + Number(second);
console.log(total);
`,
  check: { output: true, vars: ['total'] },
  require: [{ pattern: '\\b(Number|parseInt|parseFloat)\\s*\\(', message: 'Строку в число превращает Number: Number(first).' }],
  reject: [
    { pattern: '\\b(first|second)\\s*=\\s*\\d', message: 'Гири весят строками — так их отдают весы. Не переписывай first и second, а превращай их в числа через Number.' },
    { pattern: '\\b8\\b', message: 'Не пиши 8 готовым числом — пусть весы сложат гири сами.' },
  ],
  hints: [
    'Плюс склеивает строки. Сначала преврати каждую гирю в число.',
    '`Number(first)` — это число 5, а `Number(second)` — число 3.',
    '`let total = Number(first) + Number(second);`',
  ],
});
