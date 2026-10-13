import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-02',
  title: 'Попутный ветер',
  dialog: [
    'Получилось! Кристаллы снова парят. Но ветер прибил их к левому краю острова.',
    'Отправь их к правому краю — контуры уже ждут.',
  ],
  task: 'Прижми кристаллы к правому краю острова.',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.island {
  display: flex;
}
`,
  solutionCss: `.island {
  display: flex;
  justify-content: flex-end;
}
`,
  check: { items: '.crystal' },
  hints: [
    'Кристаллы стоят вдоль главной оси — в ряду это горизонталь. Нужно свойство, которое распределяет элементы вдоль неё.',
    'Это свойство называется `justify-content`.',
    '`justify-content: flex-end;`',
  ],
  learns: 'justify-content',
});
