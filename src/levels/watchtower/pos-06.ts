import { defineLevel } from '../../engine/define';
import { spriteCssUrl } from '../../pixel/pixelArt';
import { FULL_MOON } from '../../pixel/sprites';
import { DUSK_BANDS, skyBackground } from '../shared/sky';

/** Ночь над башней: луна — сама предмет сцены, поэтому на небе её нет. Внутри башни — окно для дозорного */
const sceneCss = `
body {
  background:
    ${skyBackground(DUSK_BANDS, false)};
}

.tower {
  padding: 40px 56px 0;
  background:
    repeating-linear-gradient(90deg, #2a1d3d 0 8px, #d1aa6c 8px 32px, #2a1d3d 32px 40px) 0 0 / 100% 16px no-repeat,
    linear-gradient(#e0bd80, #e0bd80) 0 16px / 100% 4px no-repeat,
    radial-gradient(circle at 50% 100%, #1a1030 0 24px, transparent 24.5px) 50% 16px / 48px 24px no-repeat,
    linear-gradient(#1a1030, #1a1030) 50% 40px / 48px 40px no-repeat,
    var(--bricks) 0 20px / 48px 24px repeat,
    #8a6236;
}

.guard {
  width: 48px;
  height: 64px;
}

.moon {
  --item-color: #fef3c7;
  position: absolute;
  top: 8px;
  left: 300px;
  width: 64px;
  height: 64px;
  background: ${spriteCssUrl(FULL_MOON)} center / 100% 100% no-repeat;
}
`;

export default defineLevel({
  id: 'pos-06',
  title: 'Испытание: Ночной дозор',
  trial: true,
  dialog: [
    'Ночь, крепость спит. Последнее испытание: подготовь башню к ночному дозору.',
    'Пригодится всё: relative, absolute, fixed и z-index. Не торопись и проверяй каждый приказ.',
  ],
  task: 'Башня `.tower` — точка отсчёта. Дозорный `.lookout` — на `24px` выше своего места, в окне. Флаг `.flag` — над башней: `48px` над верхним краем, `16px` от правого — и впереди луны. Фонарь `.lantern` прибей к окну: `16px` от правого и от нижнего края.',
  html: `<div class="tower">
  <div class="guard lookout" data-name="Дозорный"></div>
  <div class="flag" data-name="Флаг"></div>
  <div class="lantern" data-name="Фонарь"></div>
</div>
<div class="moon" data-name="Луна"></div>`,
  sceneCss,
  starterCss: `/* Башня */
.tower {
}

/* Дозорный */
.lookout {
}

/* Флаг */
.flag {
}

/* Фонарь */
.lantern {
}
`,
  solutionCss: `/* Башня */
.tower {
  position: relative;
}

/* Дозорный */
.lookout {
  position: relative;
  top: -24px;
}

/* Флаг */
.flag {
  position: absolute;
  top: -48px;
  right: 16px;
  z-index: 1;
}

/* Фонарь */
.lantern {
  position: fixed;
  right: 16px;
  bottom: 16px;
}
`,
  check: { items: '.lookout, .flag, .lantern, .moon', groupName: 'предметы', stacking: true },
  require: [
    {
      pattern: 'position\\s*:\\s*fixed',
      message: 'Фонарь должен держаться за окно, а не за башню. Это position: fixed.',
    },
  ],
  hints: [
    'Начни с башни: без точки отсчёта флаг улетит. Потом дозорный, флаг и фонарь — по одному.',
    'Башне — `relative` без сдвигов, дозорному — `relative` со сдвигом, флагу — `absolute`, фонарю — `fixed`. Луна сейчас перекрывает флаг: поможет `z-index`.',
    'Башне: `position: relative;` Дозорному: `position: relative; top: -24px;` Флагу: `position: absolute; top: -48px; right: 16px; z-index: 1;` Фонарю: `position: fixed; right: 16px; bottom: 16px;`',
  ],
});
