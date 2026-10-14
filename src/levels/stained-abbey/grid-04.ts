import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'grid-04',
  title: 'Повтор узора',
  dialog: [
    'Восемь стёкол — четыре колонки по одной доле. Писать `1fr` четыре раза? Мастера так не делают.',
    'Заклинание `repeat()` повторяет колонку столько раз, сколько скажешь.',
  ],
  task: 'Раздели окно на четыре равные колонки с помощью `repeat()`.',
  html: `<div class="window">
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane drop" data-name="Капля"></div>
  <div class="pane leaf" data-name="Лист"></div>
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane crown" data-name="Корона"></div>
</div>`,
  starterCss: `.window {
  display: grid;
}
`,
  solutionCss: `.window {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
`,
  check: { items: '.pane', groupName: 'стёкла' },
  require: [{ pattern: 'repeat\\(', message: 'Здесь нужна функция repeat(): она повторяет одну и ту же колонку нужное число раз.' }],
  hints: [
    'Колонки по-прежнему задаёт `grid-template-columns`, только вместо списка — повтор.',
    'В `repeat()` два значения через запятую: сколько раз повторить и что повторить.',
    '`grid-template-columns: repeat(4, 1fr);`',
  ],
  learns: 'repeat',
});
