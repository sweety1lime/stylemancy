import { defineLevel } from '../../engine/define';
import { leaves } from './leaves';

export default defineLevel({
  id: 'cas-01',
  title: 'Кто ниже, тот и прав',
  dialog: [
    'Ш-ш-ш… Я Древень Каскад. Мне тысяча лет, и я знаю главный закон леса: когда два правила спорят, побеждает то, что записано ниже.',
    'Лорд Дефолт дописал своё правило после твоего — вот листья и посерели. Ничего не стирай: просто поменяй правила местами.',
  ],
  task: 'Листья должны стать салатовыми (`lime`). Правило Лорда Дефолта не удаляй — поставь своё правило ниже него.',
  html: `<div class="ancient">
  <ul class="branch">
${leaves(1, 5)}
  </ul>
  <ul class="branch">
${leaves(6, 9)}
  </ul>
</div>`,
  starterCss: `.leaf {
  color: lime;
}

/* Лорд Дефолт дописал своё правило ниже, и листья посерели */
.leaf {
  color: gray;
}
`,
  solutionCss: `/* Лорд Дефолт дописал своё правило ниже, и листья посерели */
.leaf {
  color: gray;
}

.leaf {
  color: lime;
}
`,
  check: { items: '.leaf', groupName: 'листья', style: 'color' },
  require: [
    {
      pattern: 'color\\s*:\\s*gray',
      message: 'Правило Лорда Дефолта стирать нельзя — переставь своё правило ниже него.',
    },
  ],
  hints: [
    'У обоих правил одинаковый селектор `.leaf`. Когда селекторы равны, побеждает правило, которое ниже.',
    'Перенеси правило с `lime` в самый конец файла.',
    'Сначала `.leaf { color: gray; }`, а под ним — `.leaf { color: lime; }`.',
  ],
  learns: 'cascade-order',
});
