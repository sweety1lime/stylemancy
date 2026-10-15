import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-05',
  title: 'Ядовитые грибы',
  dialog: [
    'Лорд Дефолт рассадил по опушке ядовитое — и грибы, и цветы. Сегодня метим только грибы, до цветов дойдёт черёд потом.',
    'Если написать два класса слитно, без пробела, — .mushroom.poison, — селектор найдёт элементы, у которых есть оба класса сразу.',
  ],
  task: 'Зажги фиолетовым (`violet`) только ядовитые грибы: у них два класса — `mushroom` и `poison`. Ядовитые цветы не трогай. Классы в селекторе пишутся слитно.',
  html: `<div class="glade">
  <div class="mushroom poison" data-name="Ядовитый гриб 1"></div>
  <div class="flower poison" data-name="Ядовитый цветок 1"></div>
  <div class="mushroom" data-name="Гриб"></div>
  <div class="mushroom poison" data-name="Ядовитый гриб 2"></div>
  <div class="flower" data-name="Цветок"></div>
  <div class="flower poison" data-name="Ядовитый цветок 2"></div>
</div>`,
  starterCss: `.poison {
  color: violet;
}
`,
  solutionCss: `.mushroom.poison {
  color: violet;
}
`,
  check: { items: '.mushroom, .flower', style: 'color' },
  hints: [
    '`.poison` находит всё ядовитое — и грибы, и цветы. Нужно, чтобы элемент был сразу и грибом, и ядовитым.',
    'Два класса подряд без пробела: `.mushroom.poison`. С пробелом это значило бы совсем другое — «ядовитое внутри гриба».',
    '`.mushroom.poison { color: violet; }`',
  ],
  learns: 'selector-compound',
});
