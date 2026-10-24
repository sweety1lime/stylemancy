import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-08',
  title: 'Корзинка',
  dialog: [
    'Грибник оставил под дубом корзинку. Грибы в ней уже сорваны — им светиться незачем. А вот те, что растут прямо у корней, надо найти.',
    'Знак > значит «прямо внутри»: .oak > .mushroom — только грибы, которые лежат в дубе непосредственно, а не в корзинке внутри него.',
  ],
  task: 'Зажги оранжевым только грибы, что растут прямо у дуба, а не лежат в корзинке. Пригодится селектор дочернего элемента: `>`.',
  html: `<div class="glade">
  <div class="tree oak" data-name="Дуб">
    <div class="mushroom" data-name="Гриб у дуба 1"></div>
    <div class="basket">
      <div class="mushroom" data-name="Гриб в корзинке 1"></div>
      <div class="mushroom" data-name="Гриб в корзинке 2"></div>
    </div>
    <div class="mushroom" data-name="Гриб у дуба 2"></div>
  </div>
</div>`,
  starterCss: `.oak .mushroom {
  color: orange;
}
`,
  solutionCss: `.oak > .mushroom {
  color: orange;
}
`,
  check: { items: '.mushroom', groupName: 'грибы', style: 'color' },
  hints: [
    'Сейчас пробел находит грибы на любой глубине, и в корзинке тоже.',
    '`>` вместо пробела: `.oak > .mushroom` — только прямые потомки дуба, его дети.',
    '`.oak > .mushroom { color: orange; }`',
  ],
  learns: 'selector-child',
});
