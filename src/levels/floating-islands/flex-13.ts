import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-13',
  title: 'Испытание: Звёздная корона',
  dialog: [
    'Последнее испытание Парящих островов! Собери Звёздную корону.',
    'Пригодится всё, что ты уже знаешь о Flexbox.',
  ],
  task: 'Собери корону: группа по центру и у нижнего края, промежутки по 16px, а Сапфир — наверху, как главный камень.',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal sapphire" data-name="Сапфир"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
  <div class="crystal topaz" data-name="Топаз"></div>
</div>`,
  starterCss: `.island {
  display: flex;
}
`,
  solutionCss: `.island {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
}

.sapphire {
  align-self: flex-start;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    'Разбей задачу на шаги: сначала группа в центр, потом вниз, потом промежутки — и в конце Сапфир.',
    'Понадобятся `justify-content`, `align-items`, `gap` и `align-self`.',
    'У острова: `justify-content: center; align-items: flex-end; gap: 16px;` А у `.sapphire`: `align-self: flex-start;`',
  ],
});
