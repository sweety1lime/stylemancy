import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-12',
  title: 'Мост через поле',
  dialog: [
    'Магистр строит мост через всё поле острова, но камней всего три.',
    'Средний камень — рунический: дай ему зелье роста, и он растянется на всё свободное место.',
  ],
  task: 'Пусть средний камень растянется и займёт всё свободное место, а крайние окажутся у краёв острова.',
  html: `<div class="island">
  <div class="stone" data-name="Левый камень"></div>
  <div class="stone middle" data-name="Средний камень"></div>
  <div class="stone" data-name="Правый камень"></div>
</div>`,
  starterCss: `.island {
  display: flex;
  align-items: center;
}
`,
  solutionCss: `.island {
  display: flex;
  align-items: center;
}

.middle {
  flex-grow: 1;
}
`,
  check: { items: '.stone', groupName: 'камни' },
  hints: [
    'Свободное место в контейнере можно отдать одному элементу — пусть он «растёт».',
    'Рост элемента задаёт свойство `flex-grow`. Его пишут самому элементу.',
    '`.middle { flex-grow: 1; }`',
  ],
  learns: 'flex-grow',
});
