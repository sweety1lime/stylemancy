import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'lair-02',
  title: 'Финал: последний механизм',
  trial: true,
  dialog: [
    'Ты дошёл до моего пульта?! Это последний механизм Скриптории — список дел. По умолчанию он пуст, неподвижен и перезагружается от каждого чиха. Идеально!',
    'Попробуй-ка заставить его работать: добавлять дела, вычёркивать их щелчком и считать, сколько осталось. Без перезагрузок. Не сможешь!',
  ],
  task: 'Форма `.task-form` по `submit` (без перезагрузки!) добавляет в список `.tasks` пункт `<li>` с текстом из поля `.task` и очищает поле. Пустой текст не добавляй. Щелчок по пункту переключает у него класс `done`. На табло `.left` всегда — сколько пунктов не выполнено: `Осталось: 2`.',
  starterJs: `let form = document.querySelector('.task-form');
let field = document.querySelector('.task');
let tasks = document.querySelector('.tasks');
let left = document.querySelector('.left');

`,
  solutionJs: `let form = document.querySelector('.task-form');
let field = document.querySelector('.task');
let tasks = document.querySelector('.tasks');
let left = document.querySelector('.left');

// Сколько пунктов ещё не выполнено
function updateLeft() {
  let rest = tasks.querySelectorAll('li:not(.done)').length;
  left.textContent = \`Осталось: \${rest}\`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (field.value === '') {
    return;
  }
  let item = document.createElement('li');
  item.textContent = field.value;
  item.addEventListener('click', () => {
    item.classList.toggle('done');
    updateLeft();
  });
  tasks.append(item);
  field.value = '';
  updateLeft();
});
`,
  check: {},
  page: {
    html: `<p class="left plate" data-name="табло">Осталось: 0</p>
<form class="task-form row">
  <input class="task" data-name="поле" placeholder="новое дело" autocomplete="off">
  <button>Добавить</button>
</form>
<ul class="tasks"></ul>`,
    css: `.task { width: 20ch; }
.tasks { display: grid; gap: 6px; min-width: 280px; margin: 0; padding: 0; list-style: none; }
.tasks > * { padding: 6px 12px; background: #1e293b; box-shadow: 0 0 0 3px #c8a24a; cursor: pointer; text-align: left; }
.tasks > *::before { content: "○ "; color: #fbbf24; }
.tasks > .done { color: #64748b; text-decoration: line-through; box-shadow: 0 0 0 3px #3b4252; }
.tasks > .done::before { content: "✓ "; color: #4ade80; }`,
    watch: '.left, .task, .tasks > *',
  },
  steps: [
    { label: 'Добавили «Починить фонари» — один пункт, «Осталось: 1»', type: ['.task', 'Починить фонари'], submit: '.task-form' },
    { label: 'Отправили пустое — ничего не добавилось', type: ['.task', ''], submit: '.task-form' },
    { label: 'Добавили «Смазать шестерни» — «Осталось: 2»', type: ['.task', 'Смазать шестерни'], submit: '.task-form' },
    { label: 'Щёлкнули по первому пункту — он выполнен, «Осталось: 1»', click: '.tasks > :nth-child(1)' },
    { label: 'Щёлкнули по второму — «Осталось: 0»', click: '.tasks > :nth-child(2)' },
    { label: 'Ещё раз по первому — снова не выполнен, «Осталось: 1»', click: '.tasks > :nth-child(1)' },
  ],
  require: [{ pattern: 'preventDefault\\s*\\(', message: 'Форма не должна перезагружать страницу: event.preventDefault().' }],
  hints: [
    "Начни с формы: `form.addEventListener('submit', (event) => { event.preventDefault(); … });` Пустое поле — `if (field.value === '') { return; }`.",
    "Новому пункту сразу повесь свой обработчик: `item.addEventListener('click', () => { item.classList.toggle('done'); … });`",
    "Считать удобно рецептом: невыполненные — `tasks.querySelectorAll('li:not(.done)').length`. Зови его после добавления и после каждого щелчка.",
  ],
});
