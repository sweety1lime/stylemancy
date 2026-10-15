import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-07',
  title: 'Грибы под дубом',
  dialog: [
    'Под дубом растут самые вкусные грибы — их и зажжём. А те, что под елью, пусть спят.',
    'Пробел между селекторами значит «внутри»: .oak .mushroom — грибы, которые лежат где-то внутри дуба, на любой глубине.',
  ],
  task: 'Зажги оранжевым (`orange`) только грибы под дубом. Селектор «гриб внутри `.oak`» пишется через пробел. Сами деревья не трогай.',
  html: `<div class="glade">
  <div class="tree oak" data-name="Дуб">
    <div class="roots">
      <div class="mushroom" data-name="Гриб под дубом 1"></div>
      <div class="mushroom" data-name="Гриб под дубом 2"></div>
    </div>
  </div>
  <div class="tree spruce" data-name="Ель">
    <div class="roots">
      <div class="mushroom" data-name="Гриб под елью 1"></div>
      <div class="mushroom" data-name="Гриб под елью 2"></div>
    </div>
  </div>
</div>`,
  starterCss: `.mushroom {
  color: orange;
}
`,
  solutionCss: `.oak .mushroom {
  color: orange;
}
`,
  check: { items: '.tree, .mushroom', style: 'color' },
  hints: [
    'Грибы под дубом лежат внутри элемента `.oak` — посмотри HTML сцены.',
    'Селектор потомка: сначала предок, потом пробел, потом сам элемент — `.oak .mushroom`.',
    '`.oak .mushroom { color: orange; }`',
  ],
  learns: 'selector-descendant',
});
