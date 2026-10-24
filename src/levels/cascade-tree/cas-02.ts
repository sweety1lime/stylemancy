import { defineLevel } from '../../engine/define';
import { leaves } from './leaves';

export default defineLevel({
  id: 'cas-02',
  title: 'Класс сильнее тега',
  dialog: [
    'Лорд Дефолт наложил чары на все li. Его чары всегда записаны после твоего кода — при равных селекторах они побеждают.',
    'Но селекторы не равны по силе! Класс сильнее тега, и тогда уже неважно, кто ниже. Сила селектора называется специфичностью.',
  ],
  task: 'Твоё правило `li` проигрывает чарам Лорда Дефолта: они ниже. Возьми селектор сильнее: по классу `.leaf`. Тогда листья позеленеют (`lime`).',
  html: `<div class="ancient">
  <ul class="branch">
${leaves(1, 5)}
  </ul>
  <ul class="branch">
${leaves(6, 9)}
  </ul>
</div>`,
  lockedCss: `li {
  color: gray;
}
`,
  starterCss: `li {
  color: lime;
}
`,
  solutionCss: `.leaf {
  color: lime;
}
`,
  check: { items: '.leaf', groupName: 'листья', style: 'color' },
  hints: [
    'Чары Лорда Дефолта не стереть и не обогнать по порядку: они всегда ниже твоего кода.',
    'Класс сильнее тега. У листьев есть класс `leaf`.',
    '`.leaf { color: lime; }`',
  ],
  learns: 'specificity',
});
