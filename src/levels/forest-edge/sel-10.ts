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
});
