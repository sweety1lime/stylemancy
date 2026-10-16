import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'js-05',
  title: 'Запечатанная колба',
  learns: 'const',
  dialog: [
    'Есть колбы, которые запечатывают навсегда, — `const`. Их значение не поменять, и это защита: такую колбу Лорд Дефолт не подменит.',
    'Но он схитрил: запечатал колбу, которая должна меняться. Скрипт падает с ошибкой — найди её на свитке и почини.',
  ],
  task: 'Скрипт считает жизни героя, но падает. Колбу `lives` нужно менять — объяви её через `let`. Имя `hero` не меняется — пусть остаётся в `const`. Оракул должен сказать `3`, потом `2`.',
  starterJs: `const hero = 'Странник';
const lives = 3;
console.log(lives);
// Герой оступился — минус одна жизнь
lives = lives - 1;
console.log(lives);
`,
  solutionJs: `const hero = 'Странник';
let lives = 3;
console.log(lives);
// Герой оступился — минус одна жизнь
lives = lives - 1;
console.log(lives);
`,
  check: { output: true, vars: ['hero', 'lives'] },
  require: [{ pattern: '\\bconst\\s+hero\\b', message: 'Имя героя не меняется — оставь его запечатанным: const hero.' }],
  hints: [
    'Свиток показывает, на какой строке код остановился: там меняют запечатанную колбу.',
    'Колбу, значение которой меняется, объявляют через `let`, а не `const`.',
    'Замени `const lives = 3;` на `let lives = 3;`',
  ],
});
