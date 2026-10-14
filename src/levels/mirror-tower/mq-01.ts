import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'mq-01',
  title: 'Два отражения',
  dialog: [
    'Взгляни в зеркала: узкое показывает зал так, как его увидят на телефоне, широкое — как на большом мониторе.',
    'В узком зеркале кристаллы стоят столбиком — так им и положено. А широкому нужна своя магия: медиазапрос, который срабатывает только на широком экране.',
  ],
  task: 'Напиши медиазапрос для экранов от 600px: в нём `.hall` выстраивает кристаллы в ряд.',
  html: `<div class="hall">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.hall {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

/* Широкое зеркало: экраны от 600px */
`,
  solutionCss: `.hall {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

/* Широкое зеркало: экраны от 600px */
@media (min-width: 600px) {
  .hall {
    flex-direction: row;
  }
}
`,
  check: { items: '.crystal', groupName: 'кристаллы', viewports: [360, 720] },
  hints: [
    'Медиазапрос — это блок `@media (условие) { … }`: правила внутри работают, только когда условие выполняется.',
    'Условие «экран не уже 600px» пишется как `(min-width: 600px)`. Внутри — обычное правило для `.hall`: в широком зеркале нужно повернуть ось.',
    '`@media (min-width: 600px) { .hall { flex-direction: row; } }`',
  ],
  learns: 'media-query',
});
