import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'ev-05',
  title: 'Кодовый замок',
  learns: 'input-value',
  dialog: [
    'Хранилище Механиков заперто на кодовый замок. Код набирают в поле, а что в нём набрано, лежит в `field.value`.',
    "Только помни: value — всегда строка, даже если там цифры. `'4217'` и `4217` для `===` — разные вещи.",
  ],
  task: "По щелчку на `.try` сравни код из поля `.code` с `'4217'`. Совпал — добавь хранилищу `.vault` класс `open` и напиши на табло `.sign` `Открыто`. Не совпал — напиши `Неверный код`. После любой попытки очисти поле.",
  starterJs: `let field = document.querySelector('.code');
let button = document.querySelector('.try');
let vault = document.querySelector('.vault');
let sign = document.querySelector('.sign');

`,
  solutionJs: `let field = document.querySelector('.code');
let button = document.querySelector('.try');
let vault = document.querySelector('.vault');
let sign = document.querySelector('.sign');

button.addEventListener('click', () => {
  if (field.value === '4217') {
    vault.classList.add('open');
    sign.textContent = 'Открыто';
  } else {
    sign.textContent = 'Неверный код';
  }
  field.value = '';
});
`,
  check: {},
  page: {
    html: `<div class="gate vault" data-name="хранилище"></div>
<p class="sign plate" data-name="табло">Введите код</p>
<div class="row">
  <input class="code" data-name="поле" placeholder="код" maxlength="4" autocomplete="off">
  <button class="try" data-name="кнопка">Открыть</button>
</div>`,
    watch: '.vault, .sign, .code',
  },
  steps: [
    { label: 'Набрали 1111 — «Неверный код», хранилище закрыто, поле очищено', type: ['.code', '1111'], click: '.try' },
    { label: 'Набрали 4217 — «Открыто», хранилище открылось', type: ['.code', '4217'], click: '.try' },
  ],
  require: [{ pattern: '\\.value\\b', message: 'Код возьми из поля: field.value.' }],
  hints: [
    "Обработчик на кнопку: `button.addEventListener('click', () => { … });` Внутри — `if`.",
    "Сравнивай строку со строкой: `if (field.value === '4217') { … } else { … }` — код в кавычках.",
    "Очистка поля — после `if`, чтобы сработала при любом ответе: `field.value = '';`",
  ],
});
