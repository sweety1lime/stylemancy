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
  task: 'Башня `.tower` — точка отсчёта. Дозорный `.lookout` — на `24px` выше своего места, в окне. Флаг `.flag` — над башней: `48px` над верхним краем, `16px` от правого, впереди луны. Фонарь `.lantern` прибей к окну: `16px` от правого и от нижнего края.',
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
  /*
    Реванш Лорда Дефолта: после победы он трижды ломает башню чарами, которые записаны ниже кода студента.
    Код остаётся прежним, а чинить его надо силой селектора, а не порядком и не одним лишь !important.
    Чары каждого натиска включают прежние, поэтому прошлые поломки никуда не деваются.
  */
  rematch: {
    title: 'Реванш: Дефолт ломает башню',
    xp: 30,
    victory: 'Башня стоит, флаг над луной, фонарь у окна. Ты читаешь каскад лучше меня… Пока что!',
    stages: [
      {
        say: 'Ха! Один `position: static` — и твой флаг лежит на земле. Для него `top` и `right` теперь пустой звук. А мои чары записаны ниже твоих!',
        task: 'Лорд Дефолт сбросил флагу `position`, и тот упал. Верни `.flag` на место: `48px` над верхним краем башни, `16px` от правого, впереди луны. Чары Лорда Дефолта записаны ниже твоего кода, так что порядком их не обойти.',
        hints: [
          'Твоё правило `.flag` и чары Лорда Дефолта равны по силе селектора, а при равенстве побеждает тот, кто ниже. Открой «Лупу» и нажми на флаг: она покажет, кто победил.',
          'Сделай селектор сильнее: флаг лежит внутри башни, значит подойдёт `.tower .flag`.',
          '`.tower .flag { position: absolute; top: -48px; right: 16px; z-index: 1; }`',
        ],
        lockedCss: `.flag {
  position: static;
}
`,
        solutionCss: `.tower {
  position: relative;
}

.lookout {
  position: relative;
  top: -24px;
}

.tower .flag {
  position: absolute;
  top: -48px;
  right: 16px;
  z-index: 1;
}

.lantern {
  position: fixed;
  right: 16px;
  bottom: 16px;
}
`,
        defeated: 'Хм… Перебил силой селектора, а не порядком. Ладно, но фонарь тебе не удержать!',
      },
      {
        say: 'Фонарь не прибьёшь! Я приказал ему `position: absolute !important` — теперь он висит на башне, а не на окне.',
        task: 'Лорд Дефолт приказал фонарю `position: absolute !important`, и тот съехал с окна. Верни `.lantern` к окну: `16px` от правого и нижнего края окна. Флаг должен остаться на месте.',
        hints: [
          '`!important` в твоём правиле не спасёт, если оно слабее по селектору: между двумя `!important` решает сила селектора. «Лупа» покажет оба.',
          'Возьми селектор сильнее чар Дефолта и тоже добавь `!important`: подойдёт `.tower .lantern`.',
          '`.tower .lantern { position: fixed !important; right: 16px; bottom: 16px; }`',
        ],
        lockedCss: `.flag {
  position: static;
}

.lantern {
  position: absolute !important;
}
`,
        solutionCss: `.tower {
  position: relative;
}

.lookout {
  position: relative;
  top: -24px;
}

.tower .flag {
  position: absolute;
  top: -48px;
  right: 16px;
  z-index: 1;
}

.tower .lantern {
  position: fixed !important;
  right: 16px;
  bottom: 16px;
}
`,
        defeated: '`!important` против `!important`, и решила сила селектора… Но луну я так просто не отдам!',
      },
      {
        say: 'Луна — моя! У неё `z-index: 5`, и твой флаг снова под ней. Пересчитай-ка слои!',
        task: 'Лорд Дефолт поднял луну: у неё `z-index: 5`, и она закрыла флаг. Подними `.flag` над луной, а всё остальное оставь как есть.',
        hints: [
          'Слои сравниваются по числам: у кого `z-index` больше, тот сверху. Нажми «Лупой» на флаг и на луну и сравни их числа.',
          'У флага `z-index: 1`, и записан он в правиле `.tower .flag`, которое ты писал в первом натиске. Нужно число больше пяти.',
          '`.tower .flag { position: absolute; top: -48px; right: 16px; z-index: 6; }`',
        ],
        lockedCss: `.flag {
  position: static;
}

.lantern {
  position: absolute !important;
}

.moon {
  z-index: 5;
}
`,
        solutionCss: `.tower {
  position: relative;
}

.lookout {
  position: relative;
  top: -24px;
}

.tower .flag {
  position: absolute;
  top: -48px;
  right: 16px;
  z-index: 6;
}

.tower .lantern {
  position: fixed !important;
  right: 16px;
  bottom: 16px;
}
`,
        defeated: 'Нет… флаг над луной, фонарь у окна, а чары мои повержены.',
      },
    ],
  },
});
