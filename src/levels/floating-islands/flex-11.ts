import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-11',
  title: 'Тяжёлый рубин',
  dialog: [
    'Все кристаллы любят парить под самым небом. Все, кроме Рубина: он тяжёлый и тянется к земле.',
    'Опусти его — но только его одного.',
  ],
  task: 'Опусти к нижнему краю острова только Рубин — остальные кристаллы пусть остаются наверху.',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.island {
  display: flex;
  justify-content: space-between;
}
`,
  solutionCss: `.island {
  display: flex;
  justify-content: space-between;
}

.ruby {
  align-self: flex-end;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    '`align-items` двигает сразу все элементы. Нужно свойство, которое меняет выравнивание одного элемента.',
    'Это `align-self` — его пишут самому элементу, а не контейнеру.',
    '`.ruby { align-self: flex-end; }`',
  ],
  learns: 'align-self',
});
