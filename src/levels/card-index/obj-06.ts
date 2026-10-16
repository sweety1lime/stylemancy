import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'obj-06',
  title: 'Испытание: Инвентаризация',
  trial: true,
  dialog: [
    'Перед закрытием Мастерской — инвентаризация. На полке карточки зелий, и у каждой поле `stock` — сколько флаконов на складе.',
    'Нужен список того, что есть в наличии. Сито `filter` и перегонка `map` тебе в помощь — а можно и циклом.',
  ],
  task: 'Напиши рецепт `inStock(shelf)`: пусть возвращает обоз из имён тех зелий, которых на складе больше нуля. Порядок — как на полке.',
  starterJs: `// Имена зелий, которые есть на складе

`,
  solutionJs: `// Имена зелий, которые есть на складе
function inStock(shelf) {
  return shelf.filter((potion) => potion.stock > 0).map((potion) => potion.name);
}
`,
  check: {},
  calls: [
    "inStock([{ name: 'Мята', stock: 2 }, { name: 'Мёд', stock: 0 }, { name: 'Полынь', stock: 5 }])",
    "inStock([{ name: 'Эликсир', stock: 0 }])",
    "inStock([{ name: 'Сон-трава', stock: 1 }])",
  ],
  hints: [
    'Сначала оставь карточки, где `stock > 0`, потом возьми у них только имена.',
    '`filter` просеивает карточки, `map` превращает карточку в её имя: `(potion) => potion.name`.',
    '`return shelf.filter((potion) => potion.stock > 0).map((potion) => potion.name);`',
  ],
});
