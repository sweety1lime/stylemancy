import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-01',
  title: 'Пробуждение',
  dialog: [
    'Беда! Проклятие Лорда Дефолта сбросило кристаллы: теперь они висят друг под другом, как скучные блоки.',
    'Видишь светящиеся контуры? Пробуди магию левитации — и кристаллы встанут в ряд, точно на свои места.',
  ],
  task: 'Сделай `.island` флекс-контейнером, чтобы кристаллы выстроились в один ряд.',
  html: `<div class="island">
  <div class="crystal amethyst" data-name="Аметист"></div>
  <div class="crystal emerald" data-name="Изумруд"></div>
  <div class="crystal ruby" data-name="Рубин"></div>
</div>`,
  starterCss: `.island {
  /* напиши заклинание здесь */
}
`,
  solutionCss: `.island {
  display: flex;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    'Сейчас кристаллы — обычные блочные элементы: каждый занимает целую строку. Остров нужно превратить во флекс-контейнер.',
    'Тип контейнера задаёт свойство `display`.',
    '`display: flex;`',
  ],
  learns: 'display-flex',
});
