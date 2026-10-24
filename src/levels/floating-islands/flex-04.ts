import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-04',
  title: 'Притяжение',
  dialog: [
    'Наступает ночь, и кристаллы тянутся к земле — так они набираются сил.',
    'Опусти их к нижнему краю поля. По горизонтали они уже стоят где нужно.',
  ],
  task: 'Опусти кристаллы к нижнему краю острова, не сдвигая их по горизонтали.',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.island {
  display: flex;
  justify-content: center;
}
`,
  solutionCss: `.island {
  display: flex;
  justify-content: center;
  align-items: flex-end;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    'Вдоль главной оси (по горизонтали) кристаллы уже на месте. Теперь их нужно сдвинуть поперёк: по поперечной оси.',
    'Поперечной осью управляет `align-items`.',
    '`align-items: flex-end;`',
  ],
  learns: 'align-items',
});
