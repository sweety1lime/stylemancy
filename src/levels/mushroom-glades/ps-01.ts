import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'ps-01',
  title: 'Светлячки под рукой',
  dialog: [
    'Хи-хи! На моих полянах всё живое: светлячки загораются, только когда к ним подносишь руку.',
    'Псевдокласс :hover — состояние «под мышкой». Правило с ним работает, пока на элемент наведён курсор. Во втором зеркале мышь как будто над каждым — смотри туда.',
  ],
  task: 'Пусть светлячки горят золотом только под мышкой: добавь к селектору псевдокласс `:hover`. Гриб не должен загораться даже под мышкой.',
  html: `<div class="glade">
  <div class="firefly" data-name="Светлячок 1"></div>
  <div class="firefly" data-name="Светлячок 2"></div>
  <div class="mushroom" data-name="Гриб"></div>
  <div class="firefly" data-name="Светлячок 3"></div>
</div>`,
  sceneCss: '.glade { min-width: 280px; }',
  starterCss: `.firefly {
  color: gold;
}
`,
  solutionCss: `.firefly:hover {
  color: gold;
}
`,
  check: { items: '.firefly, .mushroom', style: 'color', hover: '.firefly, .mushroom' },
  scene: { width: 360, height: 240 },
  hints: [
    'Сейчас светлячки горят всегда. Нужно, чтобы правило срабатывало только при наведении мыши.',
    'Псевдокласс пишется сразу после селектора, через двоеточие и без пробела: `.firefly:hover`.',
    '`.firefly:hover { color: gold; }`',
  ],
  learns: 'hover',
});
