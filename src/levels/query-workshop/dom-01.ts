import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'dom-01',
  title: 'Вывеска',
  learns: 'querySelector',
  dialog: [
    'Добро пожаловать в Город Механизмов! Я — Мастер Квери. Здесь всё живёт на страницах: таблички, фонари, шестерни. А двигает их JavaScript.',
    'Сначала механизм надо найти. `document` — вся страница целиком, а `document.querySelector(\'.sign\')` находит на ней первый элемент по селектору — такому же, как в CSS.',
    'Нашёл — меняй. `textContent` — текст внутри элемента: `sign.textContent = \'Новый текст\';`',
  ],
  task: 'Лорд Дефолт повесил на мастерскую табличку «Закрыто навсегда». Найди вывеску `.sign` через `document.querySelector` и напиши на ней `Мастерская открыта`.',
  starterJs: `// Найди вывеску по классу .sign и смени надпись

`,
  solutionJs: `// Найди вывеску по классу .sign и смени надпись
let sign = document.querySelector('.sign');
sign.textContent = 'Мастерская открыта';
`,
  check: {},
  page: {
    html: `<h1 class="sign plate" data-name="вывеска">Закрыто навсегда</h1>
<div class="row">
  <div class="gear"></div>
  <div class="gear"></div>
  <div class="gear"></div>
</div>`,
    css: '.sign { font-size: 22px; }',
    watch: '.sign',
  },
  steps: [{ label: 'Сразу после запуска — на вывеске «Мастерская открыта»' }],
  require: [{ pattern: 'querySelector\\s*\\(', message: "Найди вывеску через document.querySelector('.sign')." }],
  hints: [
    "Сначала найди: `document.querySelector('.sign')` — селектор как в CSS, класс с точкой.",
    "Положи находку в колбу: `let sign = document.querySelector('.sign');`",
    "Потом смени текст: `sign.textContent = 'Мастерская открыта';`",
  ],
});
