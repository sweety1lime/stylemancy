import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'obj-01',
  title: 'Карточка',
  learns: 'object',
  dialog: [
    'Я — Архивариус Кей. В моей Картотеке у каждой вещи своя карточка: на ней поля, у каждого — имя и значение. Это объект: `{ name: \'Мята\', price: 3 }`.',
    'Поле берут через точку: `potion.name` — значение поля `name`. Имя поля называют ключом.',
  ],
  task: 'Назови Оракулу имя зелья и его цену из карточки `potion` — `Зелье силы`, потом `12`. Бери значения через точку, словами не пиши.',
  starterJs: `let potion = { name: 'Зелье силы', price: 12, color: 'красный' };
// Имя и цена зелья

`,
  solutionJs: `let potion = { name: 'Зелье силы', price: 12, color: 'красный' };
// Имя и цена зелья
console.log(potion.name);
console.log(potion.price);
`,
  check: { output: true, vars: ['potion'] },
  reject: [
    { pattern: 'console\\.log\\(\\s*([\'"`]Зелье|12\\b)', message: 'Не пиши значения сам — возьми их из карточки: potion.name и potion.price.' },
  ],
  hints: ['Поле берут через точку: имя карточки, точка, ключ.', 'Имя — `potion.name`, цена — `potion.price`.', '`console.log(potion.name);` и `console.log(potion.price);`'],
});
