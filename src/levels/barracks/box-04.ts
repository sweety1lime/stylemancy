import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'box-04',
  title: 'Каменная рамка',
  dialog: [
    'Портрет коменданта висит без рамки — непорядок! Капитан Абсолют будет недоволен.',
    'Рамка, border, рисуется вокруг обивки и тоже прибавляется к размеру блока. У неё три части: толщина, стиль и цвет.',
  ],
  task: 'Обведи портрет `.portrait` каменной рамкой: толщина `12px`, стиль `solid`, цвет `#78716c`.',
  html: `<div class="barracks">
  <div class="portrait" data-name="Портрет"></div>
</div>`,
  starterCss: `.portrait {
  /* обведи рамкой */
}
`,
  solutionCss: `.portrait {
  border: 12px solid #78716c;
}
`,
  check: { items: '.portrait' },
  require: [
    {
      pattern: 'border(-(width|top|right|bottom|left))?\\s*:',
      message: 'Портрету нужна каменная рамка — это свойство border.',
    },
  ],
  hints: [
    'Рамку задаёт свойство `border`. В нём через пробел пишут толщину, стиль и цвет.',
    'Стиль `solid` — сплошная линия. Без стиля рамки не будет вовсе, даже если указать толщину.',
    '`border: 12px solid #78716c;`',
  ],
  learns: 'border',
});
