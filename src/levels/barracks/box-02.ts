import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'box-02',
  title: 'Мягкая обивка',
  dialog: [
    'Щит стоит на голой стойке и бьётся о края. Ему нужна обивка!',
    'Внутренний отступ, padding, отодвигает содержимое от краёв блока. Заметь: стойка станет больше, а щит останется прежним.',
  ],
  task: 'Добавь стойке `.stand` внутренний отступ `24px` со всех сторон — щит отодвинется от её краёв.',
  html: `<div class="barracks">
  <div class="stand" data-name="Стойка">
    <div class="shield" data-name="Щит"></div>
  </div>
</div>`,
  starterCss: `.stand {
  /* обивка — внутренний отступ */
}
`,
  solutionCss: `.stand {
  padding: 24px;
}
`,
  check: { items: '.stand, .shield' },
  hints: [
    'Обивка — это внутренний отступ: место между краем блока и его содержимым.',
    'Внутренний отступ задаёт свойство `padding`. Одно значение — для всех четырёх сторон сразу.',
    '`padding: 24px;`',
  ],
  learns: 'padding',
});
