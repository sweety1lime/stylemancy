import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'box-08',
  title: 'Испытание: Смотр казармы',
  trial: true,
  dialog: [
    'Завтра смотр! Капитан Абсолют проверит каждый ящик и каждую доску.',
    'Пригодится всё, что ты узнал о коробках: размеры, обивка, рамка, отступы — и box-sizing.',
  ],
  task: 'Доска приказов `.board`: ширина `240px` вместе с обивкой и рамкой, обивка `16px`, рамка `6px solid #78716c`, по центру и с отступом `20px` снизу. Ящики `.crate`: `56px` на `56px`, отступ слева — `24px`, снизу — `12px`.',
  html: `<div class="barracks">
  <div class="board" data-name="Доска приказов">
    <div class="order" data-name="Приказ"></div>
  </div>
  <div class="crate" data-name="Ящик 1"></div>
  <div class="crate" data-name="Ящик 2"></div>
</div>`,
  starterCss: `/* Доска приказов */
.board {
}

/* Ящики */
.crate {
}
`,
  solutionCss: `/* Доска приказов */
.board {
  box-sizing: border-box;
  width: 240px;
  padding: 16px;
  border: 6px solid #78716c;
  margin: 0 auto;
  margin-bottom: 20px;
}

/* Ящики */
.crate {
  width: 56px;
  height: 56px;
  margin-left: 24px;
  margin-bottom: 12px;
}
`,
  check: { items: '.board, .order, .crate', groupName: 'предметы' },
  hints: [
    'Разбей задачу на шаги: сначала доска — размер, обивка, рамка, — потом её место, а в конце ящики.',
    'Чтобы ширина `240px` включала обивку и рамку, нужен `box-sizing: border-box`. По центру ставит `margin: 0 auto`, а отступ снизу можно дописать отдельно — `margin-bottom`.',
    'Доске: `box-sizing: border-box; width: 240px; padding: 16px; border: 6px solid #78716c; margin: 0 auto 20px;` Ящикам: `width: 56px; height: 56px; margin-left: 24px; margin-bottom: 12px;`',
  ],
});
