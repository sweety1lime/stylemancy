import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-01',
  title: 'Первые створки',
  dialog: [
    'Добро пожаловать в Витражную обитель! Проклятие выбило стёкла из рамы: теперь они лежат полосами, одно под другим.',
    'Видишь контуры? Это четыре высокие створки. Flexbox выстроил бы стёкла в линию, а витражу нужна сетка — магия Grid.',
  ],
  task: 'Сделай `.window` сеткой (`display: grid`) из четырёх колонок по 120px — их ширины перечисляет `grid-template-columns`.',
  html: `<div class="window">
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane tree" data-name="Дерево"></div>
</div>`,
  starterCss: `.window {
  /* преврати окно в сетку */
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: 120px 120px 120px 120px;
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  hints: [
    'Стёкла сейчас — обычные блоки: каждое занимает всю ширину окна. Окну нужна сетка с колонками.',
    '`display: grid` превращает окно в сетку, а `grid-template-columns` перечисляет ширины колонок через пробел.',
    '`display: grid; grid-template-columns: 120px 120px 120px 120px;`',
  ],
  learns: 'grid-columns',
});
