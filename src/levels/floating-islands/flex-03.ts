import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-03',
  title: 'Равновесие',
  dialog: [
    'Остров кренится — все кристаллы сбились в одну кучу.',
    'Чтобы удержать равновесие, крайние кристаллы должны встать у самых краёв, а средний — ровно посередине.',
  ],
  task: 'Распредели кристаллы: крайние — вплотную к краям острова, а свободное место — поровну между кристаллами.',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.island {
  display: flex;
}
`,
  solutionCss: `.island {
  display: flex;
  justify-content: space-between;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    'Снова распределяем кристаллы вдоль главной оси — свойство тебе уже знакомо.',
    'У `justify-content` есть значения, которые делят свободное место между элементами. Их названия начинаются на `space-`.',
    '`justify-content: space-between;`',
  ],
  learns: 'space-between',
});
