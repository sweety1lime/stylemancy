import { defineLevel } from '../../engine/define';

const row = (n: number) =>
  [1, 2, 3, 4].map((i) => `    <div class="mushroom" data-name="Ряд ${n}, гриб ${i}"></div>`).join('\n');

export default defineLevel({
  id: 'ps-02',
  title: 'Крайние грибы',
  dialog: [
    'Грибы на поляне растут рядами, а крайние в каждом ряду — сторожа. Им положено светиться.',
    'Псевдоклассы :first-child и :last-child находят первого и последнего ребёнка у родителя. У каждого ряда они свои.',
  ],
  task: 'Зажги оранжевым первый и последний гриб в каждом ряду: `:first-child` и `:last-child`. Оба селектора — в одно правило через запятую.',
  html: `<div class="rows">
  <div class="row">
${row(1)}
  </div>
  <div class="row">
${row(2)}
  </div>
  <div class="row">
${row(3)}
  </div>
</div>`,
  starterCss: `.mushroom {
  color: orange;
}
`,
  solutionCss: `.mushroom:first-child,
.mushroom:last-child {
  color: orange;
}
`,
  check: { items: '.mushroom', groupName: 'грибы', style: 'color' },
  hints: [
    '`:first-child` — «первый ребёнок у своего родителя». У каждого ряда он свой.',
    'Два селектора через запятую: `.mushroom:first-child, .mushroom:last-child`.',
    '`.mushroom:first-child, .mushroom:last-child { color: orange; }`',
  ],
  learns: 'first-child',
});
