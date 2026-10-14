import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-05',
  title: 'Свинцовые прожилки',
  dialog: [
    'Между стёклами витража идут свинцовые прожилки. Без них стёкла трутся друг о друга и трескаются.',
    'По чертежу прожилки между колонками вдвое толще, чем между строками.',
  ],
  task: 'Раздвинь стёкла: между строками — 12px, между колонками — 24px.',
  html: `<div class="window">
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane drop" data-name="Капля"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane leaf" data-name="Лист"></div>
</div>`,
  starterCss: `.window {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 24px;
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  hints: [
    'Промежутки в сетке задаёт `gap` — то же заклинание, что и во Flexbox.',
    'Если у `gap` два значения, первое — между строками, второе — между колонками. Можно и по отдельности: `row-gap` и `column-gap`.',
    '`gap: 12px 24px;`',
  ],
  learns: 'grid-gap',
});
