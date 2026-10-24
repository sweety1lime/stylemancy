import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-05',
  title: 'Сердце острова',
  dialog: [
    'В самой середине острова бьётся его магическое сердце.',
    'Собери кристаллы вокруг него — точно в центре поля.',
  ],
  task: 'Поставь кристаллы точно в центр острова: и по горизонтали, и по вертикали.',
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
  justify-content: center;
  align-items: center;
}
`,
  check: { items: '.crystal', groupName: 'кристаллы' },
  hints: [
    'Центрировать нужно по обеим осям сразу — значит, понадобятся два свойства.',
    '`justify-content` работает вдоль главной оси, `align-items` — поперёк неё.',
    '`justify-content: center;` и `align-items: center;`',
  ],
  learns: 'flex-centering',
});
