import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'box-03',
  title: 'Широкая обивка',
  dialog: [
    'Меч положили на такую же обивку, как у щита. Но меч длинный и плоский: сверху и снизу слишком много места!',
    'У padding можно задать стороны по отдельности. Два значения — это «сверху и снизу», а потом «слева и справа».',
  ],
  task: 'Сделай обивку стойки `.rack` такой: сверху и снизу — `8px`, слева и справа — `24px`. Хватит одного свойства `padding`.',
  html: `<div class="barracks">
  <div class="rack" data-name="Стойка для меча">
    <div class="sword" data-name="Меч"></div>
  </div>
</div>`,
  starterCss: `.rack {
  padding: 24px;
}
`,
  solutionCss: `.rack {
  padding: 8px 24px;
}
`,
  check: { items: '.rack, .sword' },
  hints: [
    'Сейчас у `padding` одно значение, и оно для всех сторон. Нужно два разных.',
    'Если у `padding` два значения, первое — сверху и снизу, второе — слева и справа.',
    '`padding: 8px 24px;`',
  ],
  learns: 'padding-sides',
});
