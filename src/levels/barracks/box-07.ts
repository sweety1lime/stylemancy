import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'box-07',
  title: 'Сундук с подвохом',
  dialog: [
    'По описи сундук — 200 на 120. Ему добавили обивку и рамку — и он перестал влезать в нишу!',
    'Подвох в том, что width и height по умолчанию — размеры только содержимого. Обивка и рамка прибавляются сверху. Но это можно поменять одним свойством.',
  ],
  task: 'Размеры в описи трогать нельзя. Сделай так, чтобы `width` и `height` сундука `.chest` включали обивку и рамку: `box-sizing: border-box`.',
  html: `<div class="barracks">
  <div class="chest" data-name="Сундук"></div>
</div>`,
  starterCss: `.chest {
  width: 200px;
  height: 120px;
  padding: 20px;
  border: 6px solid #78350f;
}
`,
  solutionCss: `.chest {
  box-sizing: border-box;
  width: 200px;
  height: 120px;
  padding: 20px;
  border: 6px solid #78350f;
}
`,
  check: { items: '.chest' },
  require: [
    {
      pattern: 'box-sizing\\s*:\\s*border-box',
      message: 'Сундук должен остаться 200 на 120, как в описи. Пусть браузер сам включит в эти размеры обивку и рамку.',
    },
  ],
  hints: [
    'Посчитай ширину сундука: 200 + 20 + 20 (обивка) + 6 + 6 (рамка) = 252px. Вот откуда лишние 52px.',
    '`box-sizing` говорит браузеру, что считать шириной: только содержимое (`content-box`, так по умолчанию) или всё до рамки (`border-box`).',
    'Добавь в `.chest`: `box-sizing: border-box;`',
  ],
  learns: 'box-sizing',
});
