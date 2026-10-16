import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'obj-03',
  title: 'Ключ к ящику',
  learns: 'brackets',
  dialog: [
    'Иногда имя поля заранее неизвестно — его приносят в колбе. Тогда точка не поможет: `card.field` ищет поле, которое так и называется — «field».',
    'Квадратные скобки берут поле по имени из колбы: `card[field]`. А `card[\'price\']` — то же самое, что `card.price`.',
  ],
  task: 'Лорд Дефолт подсунул в рецепт `lookup(card, field)` точку вместо скобок, и тот находит пустоту. Почини: пусть возвращает значение поля, чьё имя лежит в `field`.',
  starterJs: `function lookup(card, field) {
  return card.field;
}
`,
  solutionJs: `function lookup(card, field) {
  return card[field];
}
`,
  check: {},
  calls: [
    "lookup({ name: 'Мята', price: 3 }, 'price')",
    "lookup({ name: 'Мята', price: 3 }, 'name')",
    "lookup({ color: 'синий', size: 2 }, 'color')",
  ],
  hints: [
    '`card.field` ищет поле с именем «field», а такого на карточках нет.',
    'Имя поля лежит в колбе `field` — подставь её в квадратные скобки.',
    '`return card[field];`',
  ],
});
