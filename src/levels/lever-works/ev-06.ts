import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'ev-06',
  title: 'Именная табличка',
  learns: 'input-event',
  dialog: [
    "Новым мастерам Города делают именные таблички. Щелчок тут не нужен: событие `'input'` случается на каждую букву, пока в поле печатают.",
    'Так табличка может меняться прямо вместе с вводом. А если поле стёрли — пусть честно скажет, что имени нет.',
  ],
  task: "Пока в поле `.name` печатают, на табличке `.badge` должно быть `Мастер ` и имя из поля: `Мастер Ада`. Если поле пустое — `Мастер без имени`. Слушай событие `'input'`.",
  starterJs: `let field = document.querySelector('.name');
let badge = document.querySelector('.badge');

`,
  solutionJs: `let field = document.querySelector('.name');
let badge = document.querySelector('.badge');

field.addEventListener('input', () => {
  if (field.value === '') {
    badge.textContent = 'Мастер без имени';
  } else {
    badge.textContent = \`Мастер \${field.value}\`;
  }
});
`,
  check: {},
  page: {
    html: `<p class="badge plate" data-name="табличка">Мастер без имени</p>
<input class="name" data-name="поле" placeholder="твоё имя" autocomplete="off">`,
    css: '.badge { font-size: 20px; } .name { width: 18ch; }',
    watch: '.badge',
  },
  steps: [
    { label: 'Ввели «Ада» — на табличке «Мастер Ада»', type: ['.name', 'Ада'] },
    { label: 'Ввели «Тьюринг» — «Мастер Тьюринг»', type: ['.name', 'Тьюринг'] },
    { label: 'Стёрли имя — снова «Мастер без имени»', type: ['.name', ''] },
  ],
  require: [{ pattern: "addEventListener\\s*\\(\\s*['\"`]input['\"`]", message: "Табличка должна меняться на каждую букву — это событие 'input'." }],
  hints: [
    "Слушай поле: `field.addEventListener('input', () => { … });`",
    '`` badge.textContent = `Мастер ${field.value}`; `` — имя подставится из поля.',
    "Пустое поле — это `field.value === ''`: тогда пиши `Мастер без имени`.",
  ],
});
