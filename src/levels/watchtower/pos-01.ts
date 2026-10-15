import { defineLevel } from '../../engine/define';

/** Стена с часовыми: часовые стоят у её верхнего края, под ногами — три ряда кладки */
const sceneCss = `
.wall {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 40px;
  box-sizing: border-box;
  width: 480px;
  height: 240px;
  padding: 0 48px 72px;
  background:
    linear-gradient(#e0bd80, #e0bd80) 276px 136px / 48px 4px no-repeat,
    linear-gradient(#d1aa6c, #d1aa6c) 276px 136px / 48px 32px no-repeat,
    linear-gradient(#e0bd80, #e0bd80) 0 168px / 100% 4px no-repeat,
    var(--bricks) 0 100% / 48px 24px repeat-x,
    var(--bricks) 0 calc(100% - 24px) / 48px 24px repeat-x,
    var(--bricks) 0 calc(100% - 48px) / 48px 24px repeat-x;
}

.guard {
  width: 48px;
  height: 64px;
}
`;

export default defineLevel({
  id: 'pos-01',
  title: 'Дозорный',
  dialog: [
    'Капитан Абсолют на посту! Дозорному не видно, что творится за стеной. Пусть поднимется на смотровой камень.',
    'position: relative оставляет блок на его месте в строю, но позволяет сдвинуть его от этого места. Соседи ничего не заметят — для них он стоит где стоял.',
  ],
  task: 'Сдвинь дозорного `.lookout` от его места: на `32px` вверх и на `16px` вправо. Соседи не должны сдвинуться.',
  html: `<div class="wall">
  <div class="guard" data-name="Часовой 1"></div>
  <div class="guard" data-name="Часовой 2"></div>
  <div class="guard lookout" data-name="Дозорный"></div>
  <div class="guard" data-name="Часовой 4"></div>
</div>`,
  sceneCss,
  starterCss: `.lookout {
  /* сдвинь дозорного от его места */
}
`,
  solutionCss: `.lookout {
  position: relative;
  top: -32px;
  left: 16px;
}
`,
  check: { items: '.guard', groupName: 'часовые' },
  require: [
    {
      pattern: 'position\\s*:\\s*relative',
      message: 'Дозорный должен сдвинуться от своего места, а место в строю — остаться за ним. Это position: relative.',
    },
  ],
  hints: [
    'Сначала `position: relative`, потом сдвиг: `top`, `right`, `bottom` или `left`.',
    '`top` — отступ от верхнего края своего места: чтобы подняться, нужно отрицательное значение. `left: 16px` — отступ от левого края, поэтому блок едет вправо.',
    '`position: relative; top: -32px; left: 16px;`',
  ],
  learns: 'position-relative',
});
