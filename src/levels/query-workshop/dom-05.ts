import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'dom-05',
  title: 'Новые детали',
  learns: 'createElement',
  dialog: [
    "Привезли новые детали — их ещё нет на странице. Элемент можно создать: `document.createElement('li')` — новый `<li>`, пока он нигде не висит.",
    "Наполни его (`item.textContent = 'винт'`), дай класс и повесь на место: `shelf.append(item)` добавляет элемент в конец полки.",
  ],
  task: 'Для каждой детали из массива `delivery` создай `<li>` с классом `part`, напиши в нём имя детали и добавь на полку `.shelf`.',
  starterJs: `let delivery = ['пружина', 'винт', 'рычаг'];
let shelf = document.querySelector('.shelf');
// Каждую деталь — новым <li class="part"> на полку

`,
  solutionJs: `let delivery = ['пружина', 'винт', 'рычаг'];
let shelf = document.querySelector('.shelf');
// Каждую деталь — новым <li class="part"> на полку
for (const name of delivery) {
  let item = document.createElement('li');
  item.classList.add('part');
  item.textContent = name;
  shelf.append(item);
}
`,
  check: {},
  page: {
    html: `<p class="plate">Полка деталей</p>
<ul class="shelf">
  <li class="part">шестерня</li>
</ul>`,
    css: `.shelf { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; min-height: 40px; margin: 0; padding: 12px; list-style: none; background: #2a2116; box-shadow: 0 0 0 3px #c8a24a; }
.shelf > * { padding: 6px 10px; background: #475569; color: #e2e8f0; box-shadow: 0 0 0 3px #1b1406; }
.shelf > .part { background: #334155; }`,
    watch: '.shelf > *',
  },
  steps: [{ label: 'Сразу после запуска — на полке четыре детали: шестерня, пружина, винт и рычаг' }],
  require: [{ pattern: 'createElement\\s*\\(', message: "Создай элемент: document.createElement('li')." }],
  reject: [{ pattern: 'innerHTML', message: 'Здесь — без innerHTML: создай элементы через document.createElement, так нагляднее и безопаснее.' }],
  hints: [
    'Перебери `delivery` циклом `for (const name of delivery) { … }` — внутри создавай по элементу.',
    "`let item = document.createElement('li');` — потом `item.classList.add('part');` и `item.textContent = name;`.",
    'Последний шаг в цикле — повесить деталь на полку: `shelf.append(item);`',
  ],
});
