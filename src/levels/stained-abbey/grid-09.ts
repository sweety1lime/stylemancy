import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-09',
  title: 'Испытание: Большая розетка',
  trial: true,
  dialog: [
    'Последнее окно обители — Большая розетка. Его собирали самые старые мастера.',
    'Пригодится всё, что ты знаешь о сетке. Способ выбирай сам.',
  ],
  task: 'Собери розетку: колонки в пропорции 1 : 2 : 1, промежутки 12px. Роза — в средней колонке на две строки, Корона — внизу во всю ширину.',
  html: `<div class="window">
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane leaf" data-name="Лист"></div>
  <div class="pane crown" data-name="Корона"></div>
</div>`,
  starterCss: `.window {
  display: grid;
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 12px;
}

.rose {
  grid-column: 2;
  grid-row: 1 / 3;
}

.crown {
  grid-column: 1 / -1;
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  hints: [
    'Начни с окна: колонки в долях `fr` и промежутки `gap`. Потом займись Розой и Короной.',
    'Розе нужны и колонка, и строки: `grid-column` и `grid-row`. Корону растяни от первой линии до последней — последняя линия всегда -1.',
    'У окна: `grid-template-columns: 1fr 2fr 1fr; gap: 12px;` У `.rose`: `grid-column: 2; grid-row: 1 / 3;` У `.crown`: `grid-column: 1 / -1;`',
  ],
  /*
    Реванш Лорда Дефолта: он трижды ломает розетку чарами, которые записаны ниже кода студента. Сначала сжимает сетку
    до двух колонок, потом сводит Розу к одной строке через !important, потом укорачивает Корону.
    Чинить надо силой селектора. Чары каждого натиска включают прежние, поэтому поломки накапливаются.
  */
  rematch: {
    title: 'Реванш: Дефолт ломает розетку',
    xp: 30,
    victory: 'Колонки, строки и линии снова на своих местах. Ты держишь сетку крепче, чем я рвал её… Пока что!',
    stages: [
      {
        say: 'Три колонки? Слишком много для розетки! Я оставил две.',
        task: 'Лорд Дефолт переписал колонки: `repeat(2, 1fr)`. Верни розетку: колонки в пропорции 1 : 2 : 1, промежутки 12px, Роза в средней колонке на две строки, Корона внизу во всю ширину. Чары Лорда Дефолта записаны ниже твоего кода, порядком их не обойти.',
        hints: [
          'Твоё правило `.window` и чары Дефолта равны по силе, и побеждает тот, кто записан ниже. «Лупа» умеет разбирать и сама окно: нажми на промежуток между стёклами, и она покажет, чьё правило победило.',
          'Сделай селектор сильнее: к классу добавь тег, получится `div.window`.',
          '`div.window { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 12px; }`',
        ],
        lockedCss: `.window {
  grid-template-columns: repeat(2, 1fr);
}
`,
        solutionCss: `div.window {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 12px;
}

.rose {
  grid-column: 2;
  grid-row: 1 / 3;
}

.crown {
  grid-column: 1 / -1;
}
`,
        defeated: 'Хм… Колонки снова три. Но Розу я сожму!',
      },
      {
        say: 'Роза не будет двойной! Я свёл её к одной строке и запечатал `!important`.',
        task: 'Лорд Дефолт свёл Розу к одной строке: `grid-row: auto !important`. Верни ей две строки в средней колонке, а колонки и промежутки оставь как были.',
        hints: [
          'Против `!important` обычное правило бессильно. Между двумя `!important` решает сила селектора: нажми «Лупой» на Розу, и она покажет оба правила.',
          'Возьми селектор сильнее чар Дефолта: `.window .rose`. И поставь `!important` там, где он стоит у Дефолта.',
          '`.window .rose { grid-column: 2; grid-row: 1 / 3 !important; }`',
        ],
        lockedCss: `.window {
  grid-template-columns: repeat(2, 1fr);
}

.rose {
  grid-row: auto !important;
}
`,
        solutionCss: `div.window {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 12px;
}

.window .rose {
  grid-column: 2;
  grid-row: 1 / 3 !important;
}

.crown {
  grid-column: 1 / -1;
}
`,
        defeated: '`!important` против `!important`, и всё решила сила селектора… Но Корону я укорочу!',
      },
      {
        say: 'Корона слишком длинная для моей розетки! Я оставил ей две колонки из трёх.',
        task: 'Лорд Дефолт укоротил Корону: `grid-column: 1 / 3`, и она закрывает только две колонки. Растяни её снова во всю ширину, а остальное оставь как есть.',
        hints: [
          'Линии сетки считаются с единицы, а `1 / 3` кончается на третьей линии из четырёх. «Лупа» покажет, что правило Дефолта победило твоё: они равны по силе, а он записан ниже.',
          'Сделай селектор сильнее: `.window .crown`. А последняя линия сетки — всегда `-1`.',
          '`.window .crown { grid-column: 1 / -1; }`',
        ],
        lockedCss: `.window {
  grid-template-columns: repeat(2, 1fr);
}

.rose {
  grid-row: auto !important;
}

.crown {
  grid-column: 1 / 3;
}
`,
        solutionCss: `div.window {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 12px;
}

.window .rose {
  grid-column: 2;
  grid-row: 1 / 3 !important;
}

.window .crown {
  grid-column: 1 / -1;
}
`,
        defeated: 'Нет… Корона снова во всю ширину, а мои чары повержены.',
      },
    ],
  },
});
