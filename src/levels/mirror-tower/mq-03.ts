import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'mq-03',
  title: 'Тайный кристалл',
  dialog: [
    'В узком зеркале четырём кристаллам тесно: они вылезают за раму. Тайный топаз в узком зале можно и спрятать — главное, чтобы в широком он остался.',
    'Спрятанный элемент не занимает места, и соседи сдвигаются на его место.',
  ],
  task: 'Спрячь `.secret` на экранах до 599px включительно. В широком зеркале он должен остаться.',
  html: `<div class="hall">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal topaz secret" data-name="Тайный топаз"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.hall {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}
`,
  solutionCss: `.hall {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

@media (max-width: 599px) {
  .secret {
    display: none;
  }
}
`,
  check: { items: '.crystal', groupName: 'кристаллы', viewports: [360, 720] },
  hints: [
    'Совсем убрать элемент со страницы можно через `display: none`.',
    'Условие «экран не шире 599px» — `(max-width: 599px)`. В таком медиазапросе правило сработает только в узком зеркале.',
    '`@media (max-width: 599px) { .secret { display: none; } }`',
  ],
  learns: 'media-hide',
});
