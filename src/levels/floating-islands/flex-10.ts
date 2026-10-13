import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-10',
  title: 'Порядок в строю',
  dialog: [
    'По древнему закону островов первым в строю стоит Рубин, за ним Изумруд, а Аметист замыкает строй.',
    'Но переставлять кристаллы в разметке нельзя — только магией.',
  ],
  task: 'Перестрой кристаллы: Рубин — первым, Изумруд — вторым, Аметист — последним. HTML не меняется.',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.island {
  display: flex;
  justify-content: center;
  align-items: center;
}
`,
  solutionCss: `.island {
  display: flex;
  justify-content: center;
  align-items: center;
}

.ruby {
  order: -1;
}

.amethyst {
  order: 1;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  // Иначе уровень обходится разворотом ряда, а он про order
  forbid: ['flex-direction', 'flex-flow'],
  hints: [
    'Порядок флекс-элементов на экране можно поменять, не трогая HTML: каждому кристаллу можно дать свой «номер в строю».',
    'Номер в строю — свойство `order`. Чем меньше число, тем раньше стоит элемент. По умолчанию у всех 0.',
    '`.ruby { order: -1; }` и `.amethyst { order: 1; }`',
  ],
  learns: 'order',
});
