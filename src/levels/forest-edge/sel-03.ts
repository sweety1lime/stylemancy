import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-03',
  title: 'Старый дуб',
  dialog: [
    'Посреди опушки стоит Старый дуб — самое древнее дерево леса. Его крона должна зазеленеть первой.',
    'Класс бывает у многих элементов сразу. А у Старого дуба есть имя — id. Имя одно на всю страницу, и селектор по нему пишут с решёткой.',
  ],
  task: 'Зажги салатовым (`lime`) крону только Старого дуба: у него `id="old-oak"`. Селектор по id начинается с `#`.',
  html: `<div class="glade">
  <div class="tree" data-name="Дуб 1"></div>
  <div class="tree" id="old-oak" data-name="Старый дуб"></div>
  <div class="tree" data-name="Дуб 2"></div>
</div>`,
  starterCss: `.tree {
  color: lime;
}
`,
  solutionCss: `#old-oak {
  color: lime;
}
`,
  check: { items: '.tree', groupName: 'деревья', style: 'color' },
  hints: [
    'Класс `.tree` есть у всех деревьев. Нужен селектор, который найдёт одно-единственное.',
    'Селектор по id — решётка и имя: `#old-oak`.',
    '`#old-oak { color: lime; }`',
  ],
  learns: 'selector-id',
});
