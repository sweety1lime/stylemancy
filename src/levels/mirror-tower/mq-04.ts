import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'mq-04',
  title: 'Бесконечная галерея',
  dialog: [
    'Экранов на свете тысячи, и на каждый медиазапрос не напишешь. Высшая магия — сетка, которая сама решает, сколько колонок поместится.',
    'Скажи ей только, какой ширины может быть стекло, — остальное она посчитает.',
  ],
  task: 'Без медиазапросов: пусть в сетке будет столько колонок, сколько поместится, каждая не уже 120px, а лишнее место делится поровну.',
  html: `<div class="hall">
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane leaf" data-name="Лист"></div>
  <div class="pane crown" data-name="Корона"></div>
  <div class="pane drop" data-name="Капля"></div>
</div>`,
  starterCss: `.hall {
  display: grid;
  gap: 12px;
}
`,
  solutionCss: `.hall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
`,
  check: { items: '.pane', groupName: 'стёкла', viewports: [360, 720] },
  require: [
    {
      pattern: 'auto-(fill|fit)',
      message: 'Здесь нужна сетка без медиазапросов: repeat(auto-fill, minmax(…)) сама подбирает число колонок под ширину.',
    },
  ],
  hints: [
    '`minmax(120px, 1fr)` — колонка не уже 120px и не шире одной доли свободного места.',
    'Вместо числа в `repeat()` можно написать `auto-fill` — «повтори столько раз, сколько поместится».',
    '`grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));`',
  ],
  learns: 'auto-fill',
});
