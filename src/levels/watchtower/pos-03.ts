import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'pos-03',
  title: 'Флаг улетел',
  dialog: [
    'Лорд Дефолт стёр у башни одно-единственное свойство, и флаг сорвало ветром. Он улетел за край неба!',
    'Запомни: absolute ищет ближайшего предка, у которого есть position. Не нашёл — отсчитывает от краёв окна. Верни башне её приказ.',
  ],
  task: 'Флаг `.flag` отсчитывает координаты от края окна, потому что у башни нет `position`. Сделай башню `.tower` точкой отсчёта, не сдвигая её с места.',
  html: `<div class="tower">
  <div class="flag" data-name="Флаг"></div>
</div>`,
  starterCss: `.tower {
  /* Лорд Дефолт стёр отсюда одно свойство */
}

.flag {
  position: absolute;
  top: -48px;
  right: 16px;
}
`,
  solutionCss: `.tower {
  position: relative;
}

.flag {
  position: absolute;
  top: -48px;
  right: 16px;
}
`,
  check: { items: '.flag' },
  hints: [
    'Код флага верный — дело в башне. Флаг ищет ближайшего предка с `position`, а у башни его нет.',
    'Башня должна остаться на месте. Какое значение `position` не сдвигает блок, если не писать `top` и `left`?',
    '`.tower { position: relative; }`',
  ],
  learns: 'absolute-parent',
});
