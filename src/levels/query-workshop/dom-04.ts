import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'dom-04',
  title: 'Табло кладовой',
  learns: 'textContent',
  dialog: [
    'Кладовщик просит пересчитать детали на полке. Список из querySelectorAll знает свою длину: `parts.length` — как у массива.',
    'Табло пишет то, что положишь в textContent. Шаблон в обратных кавычках подставит число сам: `` `Деталей: ${parts.length}` ``.',
  ],
  task: 'Напиши на табло `.counter`, сколько на полке деталей `.part`: `Деталей: 5` — число возьми из `length`, сам не пиши. А ещё почисти ржавые детали: убери у каждой детали класс `rusty`.',
  starterJs: `let parts = document.querySelectorAll('.part');
let counter = document.querySelector('.counter');
// Напиши на табло, сколько деталей

// Почисти ржавые детали — убери класс rusty

`,
  solutionJs: `let parts = document.querySelectorAll('.part');
let counter = document.querySelector('.counter');
// Напиши на табло, сколько деталей
counter.textContent = \`Деталей: \${parts.length}\`;
// Почисти ржавые детали — убери класс rusty
for (const part of parts) {
  part.classList.remove('rusty');
}
`,
  check: {},
  page: {
    html: `<p class="counter plate" data-name="табло">Деталей: ?</p>
<ul class="shelf">
  <li class="part" data-name="деталь">шестерня</li>
  <li class="part rusty" data-name="деталь">пружина</li>
  <li class="part" data-name="деталь">винт</li>
  <li class="part rusty" data-name="деталь">рычаг</li>
  <li class="part" data-name="деталь">ось</li>
</ul>`,
    css: `.shelf { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 0; padding: 0; list-style: none; }
.part { padding: 6px 10px; background: #334155; color: #e2e8f0; box-shadow: 0 0 0 3px #1b1406; }
.part.rusty { background: #7c2d12; color: #fdba74; text-decoration: underline wavy #fb923c; }`,
    watch: '.counter, .part',
  },
  steps: [{ label: 'Сразу после запуска — на табло «Деталей: 5», ржавчины нет' }],
  reject: [{ pattern: 'Деталей:\\s*5', message: 'Не пиши число сам — возьми его из parts.length: деталей на полке может стать больше.' }],
  hints: [
    'Сколько деталей — `parts.length`. Подставь в шаблон: `` `Деталей: ${parts.length}` ``.',
    "`` counter.textContent = `Деталей: ${parts.length}`; `` — табло покажет строку. А ржавчину снимай в цикле: `part.classList.remove('rusty')`.",
    "`for (const part of parts) { part.classList.remove('rusty'); }` — у чистых деталей remove ничего не сломает.",
  ],
});
