import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-08',
  title: 'Расступитесь!',
  dialog: [
    'Кристаллы слиплись и мешают друг другу светить.',
    'Пусть между соседями будет по 24 пикселя пустоты — а вся группа останется в центре.',
  ],
  task: 'Сделай промежутки между кристаллами по 24px, не сдвигая группу с центра острова.',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.island {
  display: flex;
  justify-content: center;
  align-items: center;
}
`,
  solutionCss: `.island {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    'Промежутки между флекс-элементами задаются одним свойством контейнера — отступы самим кристаллам не нужны.',
    'Это свойство называется `gap`.',
    '`gap: 24px;`',
  ],
  learns: 'gap',
});
