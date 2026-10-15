import { defineLevel } from '../../engine/define';

/** Лестница внутри башни: высокая, прокручивается колёсиком. Окно — вся сцена */
const sceneCss = `
body {
  background: linear-gradient(rgba(26, 16, 48, 0.55), rgba(26, 16, 48, 0.55)), var(--bricks) 0 0 / 48px 24px repeat, #3b2814;
}

.stairs {
  position: relative;
  overflow-y: auto;
  box-sizing: border-box;
  width: 360px;
  height: 296px;
  padding: 16px 16px 0;
  background: #2a1d3d;
  box-shadow: 0 0 0 4px #c49a5c, 0 0 0 8px #1a1030;
  scrollbar-width: thin;
  scrollbar-color: #c49a5c #2a1d3d;
}

/* Этаж: ступени наискосок и подпись */
.floor {
  box-sizing: border-box;
  height: 220px;
  margin-bottom: 16px;
  padding: 12px;
  color: #fef3c7;
  font: 700 14px/1.2 system-ui, sans-serif;
  background:
    repeating-linear-gradient(135deg, transparent 0 22px, rgba(0, 0, 0, 0.35) 22px 24px),
    linear-gradient(135deg, #8a6236 0 50%, #6b4a28 50%);
  box-shadow: inset 0 0 0 4px #4a3219;
}
`;

export default defineLevel({
  id: 'pos-05',
  title: 'Фонарь на лестнице',
  dialog: [
    'На лестнице башни темно, хоть глаз выколи. Фонарь надо повесить так, чтобы он светил всегда — на каком этаже ни стой.',
    'position: fixed прибивает блок к окну. Координаты — от краёв окна, и при прокрутке он остаётся на месте. Так делают закреплённые шапки и кнопку «наверх».',
  ],
  task: 'Прибей фонарь `.lantern` к окну: `16px` от верхнего края и `16px` от правого. Потом прокрути лестницу колёсиком — фонарь не должен уезжать.',
  html: `<div class="stairs">
  <div class="lantern" data-name="Фонарь"></div>
  <div class="floor">Верхний этаж</div>
  <div class="floor">Средний этаж</div>
  <div class="floor">Нижний этаж</div>
</div>`,
  sceneCss,
  starterCss: `.lantern {
  /* прибей фонарь к окну */
}
`,
  solutionCss: `.lantern {
  position: fixed;
  top: 16px;
  right: 16px;
}
`,
  check: { items: '.lantern' },
  require: [
    {
      pattern: 'position\\s*:\\s*fixed',
      message: 'Фонарь должен держаться за окно, а не за лестницу: при прокрутке он остаётся на месте. Это position: fixed.',
    },
  ],
  hints: [
    'Лестница — точка отсчёта для `absolute`: с ней фонарь уедет вместе с этажами. А нужно держаться за само окно.',
    'Значение `fixed` отсчитывает координаты от краёв окна: `top` — от верхнего, `right` — от правого.',
    '`position: fixed; top: 16px; right: 16px;`',
  ],
  learns: 'position-fixed',
});
