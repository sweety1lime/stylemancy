import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'js-06',
  title: 'Этикетки',
  learns: 'naming',
  dialog: [
    'Лорд Дефолт перепутал этикетки: одни с пробелом, другие начинаются с цифры. Таких имён JavaScript не понимает.',
    'Имя колбы — одно слово латиницей: буквы, цифры, `_` и `$`, но не с цифры. Длинные имена склеивают «верблюдом»: `magicPower` — каждое новое слово с большой буквы.',
  ],
  task: 'Почини этикетки: `magic power` → `magicPower`, `2ndGem` → `secondGem`. Имена поменяй и там, где колбы показывают Оракулу. Он должен сказать `100` и `ruby`.',
  starterJs: `let magic power = 100;
let 2ndGem = 'ruby';
console.log(magic power);
console.log(2ndGem);
`,
  solutionJs: `let magicPower = 100;
let secondGem = 'ruby';
console.log(magicPower);
console.log(secondGem);
`,
  check: { output: true, vars: ['magicPower', 'secondGem'] },
  hints: [
    'Пробел разрывает имя на два слова, а с цифры имя начинаться не может.',
    '`magicPower` — слова склеены, второе с большой буквы. Вместо `2nd` — слово `second`.',
    '`let magicPower = 100;`, `let secondGem = \'ruby\';` — и те же имена в `console.log`.',
  ],
});
