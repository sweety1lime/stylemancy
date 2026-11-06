import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-10',
  title: 'Испытание: Ночная тропа',
  trial: true,
  dialog: [
    'Последнее испытание Опушки: зажги ночную тропу, чтобы путники не заблудились.',
    'Свойства теперь пишешь ты сам. Пригодится всё: классы, id, запятая и «внутри».',
  ],
  task: 'Фонари и Королева светлячков (`id="queen"`) — золотые (`gold`), гриб под елью — оранжевый (`orange`), мухомор — красный (`crimson`). Остальное пусть спит.',
  html: `<div class="glade">
  <div class="lantern" data-name="Фонарь 1"></div>
  <div class="tree spruce" data-name="Ель">
    <div class="mushroom" data-name="Гриб под елью"></div>
    <div class="firefly" data-name="Светлячок под елью"></div>
  </div>
  <div class="mushroom" data-name="Гриб на поляне"></div>
  <div class="mushroom amanita" data-name="Мухомор"></div>
  <div class="firefly" id="queen" data-name="Королева светлячков"></div>
  <div class="lantern" data-name="Фонарь 2"></div>
</div>`,
  starterCss: `/* Фонари и Королева светлячков — золотые */

/* Гриб под елью — оранжевый */

/* Мухомор — красный */
`,
  solutionCss: `/* Фонари и Королева светлячков — золотые */
.lantern, #queen {
  color: gold;
}

/* Гриб под елью — оранжевый */
.spruce .mushroom {
  color: orange;
}

/* Мухомор — красный */
.amanita {
  color: crimson;
}
`,
  check: { items: '.tree, .lantern, .mushroom, .firefly', style: 'color' },
  hints: [
    'Три правила — три цвета. Начни с самого простого.',
    'Фонари и королеву объедини запятой: `.lantern, #queen`. Гриб под елью — потомок `.spruce`. У мухомора свой класс.',
    '`.lantern, #queen { color: gold; }` `.spruce .mushroom { color: orange; }` `.amanita { color: crimson; }`',
  ],
  /*
    Реванш Лорда Дефолта: он трижды гасит ночную тропу чарами, которые записаны ниже кода студента, и каждый раз иначе.
    Сначала равной силой (решает порядок, а он у Дефолта ниже), потом через !important (решает сила селектора),
    потом через id (id тяжелее любого класса). Чары каждого натиска включают прежние, поэтому поломки накапливаются.
  */
  rematch: {
    title: 'Реванш: Дефолт гасит тропу',
    xp: 30,
    victory: 'Фонари золотые, Королева светится, гриб оранжевый, мухомор красный. Ты знаешь силу селекторов лучше меня… Пока что!',
    stages: [
      {
        say: 'Фонари? Я их погасил! Мой `.lantern { color: dimgray }` записан ниже твоего кода, а при равной силе побеждает тот, кто ниже.',
        task: 'Лорд Дефолт погасил фонари: `.lantern { color: dimgray }`. Верни им золото. Остальное, как в испытании: Королева светлячков золотая, гриб под елью оранжевый, мухомор красный.',
        hints: [
          'У твоего правила и у чар Дефолта селектор `.lantern` одинаковой силы, и побеждает тот, кто записан ниже. Нажми «Лупой» на фонарь: она покажет, кто победил и почему.',
          'Сделай свой селектор сильнее: фонари лежат внутри `.glade`, значит подойдёт `.glade .lantern`.',
          '`.glade .lantern, #queen { color: gold; }`',
        ],
        lockedCss: `.lantern {
  color: dimgray;
}
`,
        solutionCss: `/* Фонари и Королева светлячков — золотые */
.glade .lantern, #queen {
  color: gold;
}

/* Гриб под елью — оранжевый */
.spruce .mushroom {
  color: orange;
}

/* Мухомор — красный */
.amanita {
  color: crimson;
}
`,
        defeated: 'Хм… Фонари снова золотые. Но грибы я не отдам!',
      },
      {
        say: 'Грибы — мои! Все до единого серые, а я приказал это с `!important`, так что обычными правилами их не оживить.',
        task: 'Лорд Дефолт покрасил все грибы в серый и запечатал это `!important`: `.mushroom { color: dimgray !important }`. Верни цвета: гриб под елью оранжевый, мухомор красный. Гриб на поляне пусть остаётся серым: он так и не проснулся.',
        hints: [
          'Обычное правило против `!important` бессильно. Между двумя `!important` решает сила селектора. «Лупа» покажет оба правила и их силу.',
          'У Дефолта `.mushroom`, сила `0,1,0`. Нужно сильнее: `.spruce .mushroom` для гриба под елью и `.mushroom.amanita` для мухомора. И в обоих добавь `!important`.',
          '`.spruce .mushroom { color: orange !important; }` `.mushroom.amanita { color: crimson !important; }`',
        ],
        lockedCss: `.lantern {
  color: dimgray;
}

.mushroom {
  color: dimgray !important;
}
`,
        solutionCss: `.glade .lantern, #queen {
  color: gold;
}

.spruce .mushroom {
  color: orange !important;
}

.mushroom.amanita {
  color: crimson !important;
}
`,
        defeated: '`!important` против `!important`, и всё решила сила селектора… Но Королеву светлячков я не отпущу!',
      },
      {
        say: 'Королева — моя пленница! Её держит `#queen` с `!important`, а id сильнее любого класса.',
        task: 'Лорд Дефолт погасил Королеву светлячков: `#queen { color: dimgray !important }`. Зажги её золотом снова, а всё остальное оставь как есть.',
        hints: [
          'Против id с `!important` класс не поможет: id тяжелее всех классов вместе взятых. Нужен тоже id, и ещё что-нибудь в селекторе. Силу сравнивай по трём числам в «Лупе»: id, классы, теги.',
          'Добавь предка: `.glade #queen` сильнее, чем просто `#queen`. И не забудь `!important`.',
          '`.glade #queen { color: gold !important; }`',
        ],
        lockedCss: `.lantern {
  color: dimgray;
}

.mushroom {
  color: dimgray !important;
}

#queen {
  color: dimgray !important;
}
`,
        solutionCss: `.glade .lantern {
  color: gold;
}

.glade #queen {
  color: gold !important;
}

.spruce .mushroom {
  color: orange !important;
}

.mushroom.amanita {
  color: crimson !important;
}
`,
        defeated: 'Нет… Королева снова светится, а мои чары повержены.',
      },
    ],
  },
});
