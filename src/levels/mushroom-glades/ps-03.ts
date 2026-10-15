import { defineLevel } from '../../engine/define';

const flowers = Array.from({ length: 8 }, (_, i) => `  <div class="flower" data-name="Цветок ${i + 1}"></div>`).join('\n');

export default defineLevel({
  id: 'ps-03',
  title: 'Через один',
  dialog: [
    'Цветы на этой поляне светятся через один — так их высадила ещё моя бабушка.',
    ':nth-child(…) находит ребёнка по номеру, а номера начинаются с единицы. odd — нечётные: 1, 3, 5…; even — чётные: 2, 4, 6…',
  ],
  task: 'Зажги фиолетовым (`violet`) цветы через один, начиная с первого: 1-й, 3-й, 5-й и 7-й. Пригодится `:nth-child()` со словом `odd` — «нечётные».',
  html: `<div class="glade">
${flowers}
</div>`,
  sceneCss: '.glade { gap: 16px; }',
  starterCss: `.flower {
  color: violet;
}
`,
  solutionCss: `.flower:nth-child(odd) {
  color: violet;
}
`,
  check: { items: '.flower', groupName: 'цветы', style: 'color' },
  hints: [
    'Номера детей начинаются с единицы. Нужны 1, 3, 5 и 7 — нечётные.',
    'Нечётные — `:nth-child(odd)`, чётные — `:nth-child(even)`.',
    '`.flower:nth-child(odd) { color: violet; }`',
  ],
  learns: 'nth-child',
});
