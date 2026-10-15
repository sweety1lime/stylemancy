import { defineLevel } from '../../engine/define';

const lanterns = Array.from({ length: 9 }, (_, i) => `  <div class="lantern" data-name="Фонарь ${i + 1}"></div>`).join('\n');

export default defineLevel({
  id: 'ps-04',
  title: 'Каждый третий',
  dialog: [
    'Фонари вдоль тропы зажигают через два на третий — так и светло, и светлячкам не обидно.',
    'В скобках :nth-child можно написать формулу. 3n — каждый третий: n по очереди становится 1, 2, 3…, а браузер находит всех, чей номер подходит.',
  ],
  task: 'Зажги золотом каждый третий фонарь: 3-й, 6-й и 9-й. Формула для `:nth-child()` — `3n`.',
  html: `<div class="glade">
${lanterns}
</div>`,
  sceneCss: '.glade { gap: 14px; }',
  starterCss: `.lantern {
  color: gold;
}
`,
  solutionCss: `.lantern:nth-child(3n) {
  color: gold;
}
`,
  check: { items: '.lantern', groupName: 'фонари', style: 'color' },
  hints: [
    '3n — это 3, 6, 9: n по очереди равно 1, 2, 3.',
    'Формула пишется прямо в скобках: `:nth-child(3n)`.',
    '`.lantern:nth-child(3n) { color: gold; }`',
  ],
  learns: 'nth-child-formula',
});
