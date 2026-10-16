import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'obj-02',
  title: 'Правка в карточке',
  learns: 'object-change',
  dialog: [
    'Цены меняются, запасы пополняются — и карточку правят прямо на месте: `potion.price = 15;`.',
    'Если такого поля ещё нет, присваивание его заведёт: `potion.stock = 3;` — и на карточке появится новая строка.',
  ],
  task: 'Зелье подорожало до 15 монет, а на складе 3 флакона. Запиши это в карточку: измени `price` и добавь поле `stock`. Карточку заново не переписывай.',
  starterJs: `let potion = { name: 'Зелье силы', price: 12 };
// Цена — 15, на складе — 3

console.log(potion);
`,
  solutionJs: `let potion = { name: 'Зелье силы', price: 12 };
// Цена — 15, на складе — 3
potion.price = 15;
potion.stock = 3;
console.log(potion);
`,
  check: { output: true, vars: ['potion'] },
  require: [
    { pattern: 'potion\\.price\\s*=(?!=)', message: 'Поправь цену прямо в карточке: potion.price = 15;' },
    { pattern: 'potion\\.stock\\s*=(?!=)', message: 'Заведи новое поле присваиванием: potion.stock = 3;' },
  ],
  hints: [
    'Поле меняют присваиванием: карточка, точка, ключ, `=` и новое значение.',
    'Нового поля `stock` ещё нет — присваивание само его заведёт.',
    '`potion.price = 15;` и `potion.stock = 3;` перед `console.log`.',
  ],
});
