import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-06',
  title: 'Водопад',
  dialog: [
    'Над островом открылся магический водопад! Кристаллы должны выстроиться столбиком прямо под его струёй.',
    'Пока левитация тянет их в ряд — поверни её.',
  ],
  task: 'Выстрой кристаллы столбиком по центру острова.',
  // Высокий остров: столбик из трёх кристаллов должен поместиться
  scene: { width: 600, height: 420 },
  sceneCss: '.island { height: 260px; }',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.island {
  display: flex;
  align-items: center;
}
`,
  solutionCss: `.island {
  display: flex;
  flex-direction: column;
  align-items: center;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    'Флекс-элементы выстраиваются вдоль главной оси. Сейчас она горизонтальная — её нужно повернуть вертикально.',
    'Направление главной оси задаёт `flex-direction`.',
    'Сначала `flex-direction: column;`, а потом посмотри, куда теперь двигает кристаллы `align-items`!',
  ],
  learns: 'flex-direction',
});
