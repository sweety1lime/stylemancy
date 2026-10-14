import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-02',
  title: 'Доли света',
  dialog: [
    'Солнечное стекло — главное в этом окне, ему положено вдвое больше света.',
    'Считать пиксели не нужно: в сетке есть единица `fr` — доля свободного места. Окно само разделит ширину.',
  ],
  task: 'Раздели окно на три колонки: средняя вдвое шире крайних. Ширины задай в `fr`.',
  html: `<div class="window">
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane moon" data-name="Луна"></div>
</div>`,
  starterCss: `.window {
  display: grid;
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  require: [{ pattern: '\\dfr', message: 'Здесь нужна единица fr: окна бывают разной ширины, а доли подстроятся под любую.' }],
  hints: [
    '`fr` делит свободное место на доли: `1fr 1fr` — две равные колонки, `1fr 3fr` — вторая втрое шире первой.',
    'Крайним колонкам — по одной доле, средней — две.',
    '`grid-template-columns: 1fr 2fr 1fr;`',
  ],
  learns: 'fr',
});
