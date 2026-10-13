import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-07',
  title: 'Подножие водопада',
  dialog: [
    'Струя водопада тянет кристаллы вниз, к самому подножию.',
    'Осторожно: ось теперь вертикальная — знакомые заклинания работают по-новому.',
  ],
  task: 'Опусти столбик кристаллов к нижнему краю острова, оставив его по центру.',
  scene: { width: 600, height: 420 },
  sceneCss: '.island { height: 260px; }',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal sapphire" data-name="Сапфир"></div>
</div>`,
  starterCss: `.island {
  display: flex;
  flex-direction: column;
  align-items: center;
}
`,
  solutionCss: `.island {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    'Главная ось теперь идёт сверху вниз — ведь у острова `flex-direction: column`.',
    'Вдоль главной оси элементы распределяет `justify-content` — даже когда ось вертикальная.',
    '`justify-content: flex-end;`',
  ],
  learns: 'flex-axes',
});
