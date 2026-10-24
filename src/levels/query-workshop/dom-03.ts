import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'dom-03',
  title: 'Все шестерни',
  learns: 'querySelectorAll',
  dialog: [
    'Главный механизм стоит: шестерни замерли. Их много, а querySelector находит только первую.',
    "`document.querySelectorAll('.gear')` находит все и возвращает их списком. У списка нет classList: класс добавляют каждой шестерне по очереди, циклом `for (const gear of gears) { … }`.",
  ],
  task: 'Запусти главный механизм: найди все шестерни через `querySelectorAll(\'.gear\')` и в цикле добавь каждой класс `spin`.',
  starterJs: `let gears = document.querySelectorAll('.gear');
// Каждой шестерне — класс spin

`,
  solutionJs: `let gears = document.querySelectorAll('.gear');
// Каждой шестерне — класс spin
for (const gear of gears) {
  gear.classList.add('spin');
}
`,
  check: {},
  page: {
    html: `<p class="plate">Главный механизм</p>
<div class="row engine">
  <div class="gear" data-name="шестерня"></div>
  <div class="gear" data-name="шестерня"></div>
  <div class="gear" data-name="шестерня"></div>
  <div class="gear" data-name="шестерня"></div>
  <div class="gear" data-name="шестерня"></div>
  <div class="gear" data-name="шестерня"></div>
</div>`,
    css: `.engine { gap: 4px; }
.gear:nth-child(even) { width: 44px; height: 44px; margin-top: 30px; }
.gear:nth-child(even).spin { animation-direction: reverse; }`,
    watch: '.gear',
  },
  steps: [{ label: 'Сразу после запуска — крутятся все шесть шестерён' }],
  require: [
    { pattern: 'querySelectorAll\\s*\\(', message: "Найди все шестерни сразу: document.querySelectorAll('.gear')." },
    { pattern: '\\bfor\\b|forEach', message: 'Шестерён много — перебери их циклом for…of.' },
  ],
  hints: [
    'Список шестерён уже в колбе `gears`. Перебери его: `for (const gear of gears) { … }`.',
    'Внутри цикла `gear` — одна шестерня. Ей и добавляй класс.',
    "`for (const gear of gears) { gear.classList.add('spin'); }`",
  ],
});
