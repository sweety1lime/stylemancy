import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-13',
  title: 'Испытание: Звёздная корона',
  trial: true,
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
    'Разбей задачу на шаги: сначала группа в центр, потом вниз, потом промежутки, а в конце Сапфир.',
    'Понадобятся `justify-content`, `align-items`, `gap` и `align-self`.',
    'У острова: `justify-content: center; align-items: flex-end; gap: 16px;` А у `.sapphire`: `align-self: flex-start;`',
  ],
  /*
    Реванш Лорда Дефолта: он трижды ломает корону чарами, которые записаны ниже кода студента. Сначала переворачивает ось
    острова, потом заставляет кристаллы расти, потом отправляет Сапфир в конец ряда и прижимает ко дну через !important.
    Чинить надо силой селектора. Чары каждого натиска включают прежние, поэтому поломки накапливаются.
  */
  rematch: {
    title: 'Реванш: Дефолт ломает корону',
    xp: 30,
    victory: 'Ось, рост и порядок снова твои, а Сапфир сияет наверху. Ты управляешь флексом лучше меня… Пока что!',
    stages: [
      {
        say: 'Ха! Я перевернул ось: теперь твоя корона — столб из камней, да ещё и из острова вылезла!',
        task: 'Лорд Дефолт приказал острову `flex-direction: column`, и кристаллы встали в столбик. Верни корону: группа по центру и у нижнего края, промежутки по 16px, Сапфир наверху. Чары Лорда Дефолта записаны ниже твоего кода, порядком их не обойти.',
        hints: [
          'Твоё правило `.island` и чары Дефолта равны по силе, и побеждает тот, кто записан ниже. «Лупа» умеет разбирать и сам остров: нажми на его край, где нет кристаллов, и увидишь, кто победил.',
          'Сделай селектор сильнее: к классу добавь тег, получится `div.island`. Направление в нём верни обратно: `flex-direction: row`.',
          '`div.island { display: flex; flex-direction: row; justify-content: center; align-items: flex-end; gap: 16px; }`',
        ],
        lockedCss: `.island {
  flex-direction: column;
}
`,
        solutionCss: `div.island {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
}

.sapphire {
  align-self: flex-start;
}
`,
        defeated: 'Хм… Ось на месте. Но камни я заставлю расти!',
      },
      {
        say: 'Камни слишком тощие! Я велел им расти: теперь они расползлись по всему острову.',
        task: 'Лорд Дефолт приказал кристаллам `flex-grow: 1`, и они растянулись вдоль острова, заняв всё свободное место. Верни им прежний размер, а корону оставь как была.',
        hints: [
          'Растут кристаллы из-за `flex-grow`. Нажми «Лупой» на любой кристалл и найди это свойство среди чар Дефолта.',
          'У чар Дефолта селектор `.crystal` силы `0,1,0`. Нужен сильнее: `.island .crystal`, и в нём `flex-grow: 0`.',
          '`.island .crystal { flex-grow: 0; }` — остальное, как в первом натиске.',
        ],
        lockedCss: `.island {
  flex-direction: column;
}

.crystal {
  flex-grow: 1;
}
`,
        solutionCss: `div.island {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
}

.island .crystal {
  flex-grow: 0;
}

.sapphire {
  align-self: flex-start;
}
`,
        defeated: 'Размер вернули… Но Сапфир я так просто не отдам!',
      },
      {
        say: 'Сапфир — главный камень? Больше нет: я отправил его в конец ряда и прижал ко дну, а `!important` у меня тоже найдётся!',
        task: 'Лорд Дефолт отправил Сапфир в конец ряда (`order: 9`) и прижал ко дну (`align-self: flex-end !important`). Верни его на место: третьим по порядку и наверх, как главный камень. Остальное оставь как есть.',
        hints: [
          'Порядок решает `order`: у остальных кристаллов он `0`, а у Сапфира Дефолт поставил `9`. А против `!important` обычное правило бессильно.',
          'Возьми селектор сильнее чар Дефолта (`.island .sapphire`) и добавь `!important` там, где он стоит у Дефолта.',
          '`.island .sapphire { order: 0; align-self: flex-start !important; }`',
        ],
        lockedCss: `.island {
  flex-direction: column;
}

.crystal {
  flex-grow: 1;
}

.sapphire {
  order: 9;
  align-self: flex-end !important;
}
`,
        solutionCss: `div.island {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
}

.island .crystal {
  flex-grow: 0;
}

.island .sapphire {
  order: 0;
  align-self: flex-start !important;
}
`,
        defeated: 'Нет… Сапфир снова наверху, а чары мои повержены.',
      },
    ],
  },
});
