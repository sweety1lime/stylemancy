import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'ev-07',
  title: 'Испытание: мост через пропасть',
  trial: true,
  dialog: [
    'Испытание Механиков! Через пропасть строят мост: сколько досок ввели — столько и кладут. Мост можно перестраивать сколько угодно раз.',
    'Но доски не бесконечные: больше восьми — механизм отказывается и старый мост не трогает.',
  ],
  task: "По щелчку на `.build` возьми число из поля `.planks`. Больше 8 — напиши на табло `.report` `Слишком длинно` и больше ничего не делай. Иначе разбери старый мост (`bridge.textContent = ''`), положи в `.bridge` столько `<div class=\"plank\">`, сколько ввели, и напиши на табло `Досок:` и число — `Досок: 3`.",
  starterJs: `let field = document.querySelector('.planks');
let button = document.querySelector('.build');
let bridge = document.querySelector('.bridge');
let report = document.querySelector('.report');

`,
  solutionJs: `let field = document.querySelector('.planks');
let button = document.querySelector('.build');
let bridge = document.querySelector('.bridge');
let report = document.querySelector('.report');

button.addEventListener('click', () => {
  let count = Number(field.value);
  if (count > 8) {
    report.textContent = 'Слишком длинно';
    return;
  }
  bridge.textContent = '';
  for (let i = 0; i < count; i++) {
    let plank = document.createElement('div');
    plank.classList.add('plank');
    bridge.append(plank);
  }
  report.textContent = \`Досок: \${count}\`;
});
`,
  check: {},
  page: {
    html: `<p class="report plate" data-name="табло">Пропасть</p>
<div class="chasm"><div class="cliff"></div><div class="bridge"></div><div class="cliff"></div></div>
<div class="row">
  <input class="planks" data-name="поле" type="number" min="0" placeholder="досок" autocomplete="off">
  <button class="build" data-name="кнопка">Строить</button>
</div>`,
    css: `.chasm { display: flex; align-items: flex-start; width: 340px; height: 70px; background: linear-gradient(#0b0e14, #000); }
.cliff { width: 30px; height: 70px; background: repeating-linear-gradient(0deg, #57534e 0 8px, #44403c 8px 16px); }
.bridge { display: flex; flex: 1; gap: 2px; padding-top: 2px; }
.plank { width: 30px; height: 14px; background: #a16207; box-shadow: inset 0 -4px 0 #713f12, 0 0 0 2px #1b1406; }`,
    watch: '.report, .bridge > *',
  },
  steps: [
    { label: 'Ввели 3 — мост из трёх досок, «Досок: 3»', type: ['.planks', '3'], click: '.build' },
    { label: 'Ввели 5 — мост перестроен: пять досок, «Досок: 5»', type: ['.planks', '5'], click: '.build' },
    { label: 'Ввели 12 — «Слишком длинно», мост остался из пяти досок', type: ['.planks', '12'], click: '.build' },
  ],
  hints: [
    "Всё — в обработчике щелчка по кнопке. Первым делом число: `let count = Number(field.value);`",
    "Проверь длину раньше всего: `if (count > 8) { report.textContent = 'Слишком длинно'; return; }` — return выходит из рецепта.",
    "Дальше: `bridge.textContent = '';`, цикл `for (let i = 0; i < count; i++)` с `createElement('div')` и классом `plank`, а в конце табло.",
  ],
});
