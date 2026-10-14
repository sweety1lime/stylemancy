import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'mq-02',
  title: 'Сетка растёт',
  dialog: [
    'Мастера адаптива начинают с самого узкого экрана: там раскладка проще всего. А для экранов пошире добавляют медиазапросы.',
    'Основа для узкого зеркала уже готова. В широком места больше — пусть стёкла встанут в три колонки и раздвинутся пошире.',
  ],
  task: 'Добавь медиазапрос для экранов от 600px: три колонки и промежутки 24px.',
  html: `<div class="hall">
  <div class="pane sun" data-name="Солнце"></div>
  <div class="pane moon" data-name="Луна"></div>
  <div class="pane star" data-name="Звезда"></div>
  <div class="pane tree" data-name="Дерево"></div>
  <div class="pane rose" data-name="Роза"></div>
  <div class="pane drop" data-name="Капля"></div>
</div>`,
  starterCss: `/* Основа — узкое зеркало: две колонки */
.hall {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
`,
  solutionCss: `/* Основа — узкое зеркало: две колонки */
.hall {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 600px) {
  .hall {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}
`,
  check: { items: '.pane', groupName: 'стёкла', viewports: [360, 720] },
  hints: [
    'Основу не трогай: она нужна узкому зеркалу. Всё новое — внутри `@media (min-width: 600px) { … }`.',
    'В медиазапросе достаточно переопределить два свойства `.hall`: число колонок и промежутки. Остальное возьмётся из основы.',
    '`@media (min-width: 600px) { .hall { grid-template-columns: repeat(3, 1fr); gap: 24px; } }`',
  ],
  learns: 'mobile-first',
});
