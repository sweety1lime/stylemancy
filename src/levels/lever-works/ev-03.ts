import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'ev-03',
  title: 'Счётчик оборотов',
  dialog: [
    'Механику нужно знать, сколько раз провернули колесо. Значит, где-то должна жить колба со счётом.',
    'Важно где: снаружи обработчика. Колба внутри рецепта создаётся заново на каждый щелчок, и каждый раз начинает с нуля.',
  ],
  task: 'По каждому щелчку на колесо `.wheel` прибавляй к счёту единицу и пиши на табло `.turns`: `Оборотов: 1`, `Оборотов: 2`, `Оборотов: 3`…',
  starterJs: `let wheel = document.querySelector('.wheel');
let turns = document.querySelector('.turns');

`,
  solutionJs: `let wheel = document.querySelector('.wheel');
let turns = document.querySelector('.turns');
let count = 0;

wheel.addEventListener('click', () => {
  count++;
  turns.textContent = \`Оборотов: \${count}\`;
});
`,
  check: {},
  page: {
    html: `<p class="turns plate" data-name="табло">Оборотов: 0</p>
<div class="gear"></div>
<button class="wheel" data-name="колесо">Провернуть колесо</button>`,
    css: '.gear { width: 72px; height: 72px; }',
    watch: '.turns',
  },
  steps: [
    { label: 'Сразу после запуска — «Оборотов: 0»' },
    { label: 'Первый щелчок — «Оборотов: 1»', click: '.wheel' },
    { label: 'Второй щелчок — «Оборотов: 2»', click: '.wheel' },
    { label: 'Третий щелчок — «Оборотов: 3»', click: '.wheel' },
  ],
  hints: [
    'Заведи колбу счёта рядом с остальными, снаружи обработчика: `let count = 0;`',
    'В обработчике щелчка сначала `count++;`, потом перепиши табло.',
    '`` turns.textContent = `Оборотов: ${count}`; `` — шаблон подставит число сам.',
  ],
});
