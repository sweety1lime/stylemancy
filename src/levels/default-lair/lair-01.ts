import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'lair-01',
  title: 'Письмо в Логово',
  learns: 'preventDefault',
  dialog: [
    'Ха! Добро пожаловать в моё Логово. Здесь правлю я — поведение по умолчанию. Видишь форму? Нажмёшь «Отправить» — и я перезагружу страницу. Всё, что ты сделал, исчезнет!',
    'Таков закон: форма по умолчанию отправляется и перезагружает страницу. И не вздумай звать в обработчике `event.preventDefault()` — он отменяет поведение по умолчанию. То есть… меня. Ой.',
  ],
  task: 'Форма `.letter-form` добавляет письма в список `.letters`: по событию `submit` создаёт `<li>` с текстом из поля `.letter` и очищает поле. Но Лорд Дефолт перезагружает страницу, и письма пропадают. Отмени перезагрузку: первой строкой обработчика — `event.preventDefault()`.',
  starterJs: `let form = document.querySelector('.letter-form');
let field = document.querySelector('.letter');
let letters = document.querySelector('.letters');

form.addEventListener('submit', (event) => {
  let item = document.createElement('li');
  item.textContent = field.value;
  letters.append(item);
  field.value = '';
});
`,
  solutionJs: `let form = document.querySelector('.letter-form');
let field = document.querySelector('.letter');
let letters = document.querySelector('.letters');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  let item = document.createElement('li');
  item.textContent = field.value;
  letters.append(item);
  field.value = '';
});
`,
  check: {},
  page: {
    html: `<p class="plate">Письма Лорду Дефолту</p>
<form class="letter-form row">
  <input class="letter" data-name="поле" placeholder="текст письма" autocomplete="off">
  <button>Отправить</button>
</form>
<ul class="letters"></ul>`,
    css: `.letter { width: 20ch; }
.letters { display: grid; gap: 6px; min-width: 260px; margin: 0; padding: 0; list-style: none; }
.letters > * { padding: 6px 12px; background: #f5e6c8; color: #3b2a14; box-shadow: 3px 3px 0 #7c4a1e; }`,
    watch: '.letter, .letters > *',
  },
  steps: [
    { label: 'Отправили «Сдавайся!» — письмо в списке, поле пустое', type: ['.letter', 'Сдавайся!'], submit: '.letter-form' },
    { label: 'Отправили «Город свободен» — писем уже два', type: ['.letter', 'Город свободен'], submit: '.letter-form' },
  ],
  require: [{ pattern: 'preventDefault\\s*\\(', message: 'Отмени перезагрузку: event.preventDefault() в обработчике submit.' }],
  hints: [
    'Обработчик уже получает событие — параметр `event`. Ему и нужно сказать «не надо по умолчанию».',
    'Первой строкой обработчика: `event.preventDefault();` — со скобками, это приказ.',
    'Попробуй отправить форму на сцене без этой строки: страница мигнёт и всё сотрёт. Это и есть поведение по умолчанию.',
  ],
});
