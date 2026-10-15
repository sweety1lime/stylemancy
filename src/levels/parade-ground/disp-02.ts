import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'disp-02',
  title: 'Знамёна полков',
  dialog: [
    'Знамёна полков сбились в одну строку, как слова в предложении. Ни полков не видно, ни их цветов!',
    'Блочный элемент начинается с новой строки и занимает всю ширину родителя. И высота с отступами у него работают.',
  ],
  task: 'Сделай знамёна `.banner` блочными — каждое с новой строки и во всю ширину плаца.',
  html: `<div class="parade">
  <span class="banner north" data-name="Знамя Севера">Север</span>
  <span class="banner south" data-name="Знамя Юга">Юг</span>
  <span class="banner west" data-name="Знамя Запада">Запад</span>
</div>`,
  starterCss: `.banner {
  /* каждое знамя — с новой строки */
}
`,
  solutionCss: `.banner {
  display: block;
}
`,
  check: { items: '.banner', groupName: 'знамёна' },
  hints: [
    '`span` по умолчанию строчный. А нужен такой элемент, как `div` или `p`: с новой строки и во всю ширину.',
    'Значение `display` для такого элемента — `block`.',
    '`display: block;`',
  ],
  learns: 'display-block',
});
