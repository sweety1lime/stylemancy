import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'box-01',
  title: 'Ящик по мерке',
  dialog: [
    'Добро пожаловать в Казармы! У меня тут всё было по мерке — пока Лорд Дефолт не сбросил размеры. Смотри: ящик растёкся по стене, как доска.',
    'Блок без размеров растягивается на всю ширину родителя, а в высоту — по содержимому. Задай ему ширину и высоту сам.',
  ],
  task: 'Задай ящику `.crate` ширину `160px` и высоту `96px`.',
  html: `<div class="barracks">
  <div class="crate" data-name="Ящик"></div>
</div>`,
  starterCss: `.crate {
  /* задай ширину и высоту */
}
`,
  solutionCss: `.crate {
  width: 160px;
  height: 96px;
}
`,
  check: { items: '.crate' },
  hints: [
    'Размеры блока задают два свойства: одно — ширину, другое — высоту.',
    'Ширина — `width`, высота — `height`. Значения пишутся в пикселях: `160px`.',
    '`width: 160px; height: 96px;`',
  ],
  learns: 'width-height',
});
