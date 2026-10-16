import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'obj-04',
  title: 'Ценник из карточки',
  dialog: [
    'Рецепту можно отдать целую карточку. Внутри поля берут как обычно: `potion.name`, `potion.price`.',
    'Помнишь ценники из Лавки Алхимика? Теперь ценник собирает рецепт — для любой карточки.',
  ],
  task: 'Напиши рецепт `label(potion)`: пусть возвращает ценник вида `Зелье силы: 12 монет` — имя и цена из карточки.',
  starterJs: `function label(potion) {
  // Верни ценник: имя и цена из карточки
}
`,
  solutionJs: `function label(potion) {
  // Верни ценник: имя и цена из карточки
  return \`\${potion.name}: \${potion.price} монет\`;
}
`,
  check: {},
  calls: ["label({ name: 'Зелье силы', price: 12 })", "label({ name: 'Мятный чай', price: 5 })", "label({ name: 'Пустой флакон', price: 0 })"],
  hints: [
    'Рецепт возвращает строку, собранную из полей карточки.',
    'Шаблон: `` `${potion.name}: ${potion.price} монет` ``.',
    '`` return `${potion.name}: ${potion.price} монет`; ``',
  ],
});
