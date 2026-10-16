import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'dom-06',
  title: 'Испытание: сборка механизма',
  trial: true,
  dialog: [
    'Испытание Мастерской! Механизм собирают из карточек-деталей: у каждой есть имя и отметка, готова ли она.',
    'Выложи все детали на полку, готовые отметь зелёным, недостающие — красным, и посчитай готовые на табло. Всё, чему научился, — в одном скрипте.',
  ],
  task: 'Для каждой карточки из `parts` создай на полке `.shelf` элемент `<li>` с именем детали и классом `part`. Готовой детали (`ready: true`) добавь ещё класс `ready`, неготовой — `missing`. На табло `.board` напиши `Готово: 3 из 4` — оба числа посчитай.',
  starterJs: `let parts = [
  { name: 'шестерня', ready: true },
  { name: 'пружина', ready: false },
  { name: 'ось', ready: true },
  { name: 'маятник', ready: true },
];
let shelf = document.querySelector('.shelf');
let board = document.querySelector('.board');

`,
  solutionJs: `let parts = [
  { name: 'шестерня', ready: true },
  { name: 'пружина', ready: false },
  { name: 'ось', ready: true },
  { name: 'маятник', ready: true },
];
let shelf = document.querySelector('.shelf');
let board = document.querySelector('.board');

let done = 0;
for (const part of parts) {
  let item = document.createElement('li');
  item.textContent = part.name;
  item.classList.add('part');
  if (part.ready) {
    item.classList.add('ready');
    done++;
  } else {
    item.classList.add('missing');
  }
  shelf.append(item);
}
board.textContent = \`Готово: \${done} из \${parts.length}\`;
`,
  check: {},
  page: {
    html: `<p class="board plate" data-name="табло">Готово: ?</p>
<ul class="shelf"></ul>`,
    css: `.shelf { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; min-height: 40px; margin: 0; padding: 12px; list-style: none; background: #2a2116; box-shadow: 0 0 0 3px #c8a24a; }
.shelf > * { padding: 6px 10px; background: #475569; color: #e2e8f0; box-shadow: 0 0 0 3px #1b1406; }
.part.ready { background: #166534; color: #dcfce7; }
.part.missing { background: #7f1d1d; color: #fecaca; text-decoration: line-through; }`,
    watch: '.board, .shelf > *',
  },
  steps: [{ label: 'Сразу после запуска — четыре детали с отметками и табло «Готово: 3 из 4»' }],
  reject: [{ pattern: 'Готово:\\s*3', message: 'Числа на табло посчитай кодом: деталей и готовых может стать больше.' }],
  hints: [
    'Начни как с новыми деталями: цикл по `parts`, в нём `createElement`, класс `part`, текст `part.name` и `shelf.append`.',
    "Отметка — через `if (part.ready) { …add('ready') } else { …add('missing') }`. Готовые считай в колбе: `done++`.",
    'После цикла: `` board.textContent = `Готово: ${done} из ${parts.length}`; ``',
  ],
});
