import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'box-05',
  title: 'Строй часовых',
  dialog: [
    'Часовые прижались к стене и друг к другу — так и до драки недалеко!',
    'Внешний отступ, margin, — пустое место снаружи от рамки. Он отталкивает соседей и края родителя. Его можно задать с одной стороны: margin-left, margin-bottom…',
  ],
  task: 'Отодвинь часовых `.guard` от стены: внешний отступ слева — `40px`. И раздвинь их: снизу у каждого — `16px`.',
  html: `<div class="barracks">
  <div class="guard" data-name="Часовой 1"></div>
  <div class="guard" data-name="Часовой 2"></div>
  <div class="guard" data-name="Часовой 3"></div>
</div>`,
  starterCss: `.guard {
  /* внешний отступ */
}
`,
  solutionCss: `.guard {
  margin-left: 40px;
  margin-bottom: 16px;
}
`,
  check: { items: '.guard', groupName: 'часовые' },
  hints: [
    'Внешний отступ задаёт свойство `margin`. Отступ с одной стороны — `margin-` и название стороны: `top`, `right`, `bottom`, `left`.',
    'Слева — `margin-left`, снизу — `margin-bottom`.',
    '`margin-left: 40px; margin-bottom: 16px;`',
  ],
  learns: 'margin',
});
