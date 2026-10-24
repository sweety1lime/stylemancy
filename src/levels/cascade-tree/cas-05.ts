import { defineLevel } from '../../engine/define';
import { leaves } from './leaves';

const spring = (n: number) => ({ className: 'spring', name: `Весенний лист ${n}` });

export default defineLevel({
  id: 'cas-05',
  title: 'Война !important',
  dialog: [
    'Когда-то я сам поддался гневу и наложил на листья заклятие !important: «серые навсегда». Теперь весна, а молодые листья не зеленеют.',
    '!important ставит объявление выше любой силы селекторов. Перебить его можно только другим !important, и тогда начинается война. Лучшее лекарство — убрать его.',
  ],
  task: 'Весенние листья `.leaf.spring` не зеленеют: старое правило с `!important` перебивает любые селекторы. Убери `!important` — пусть каскад снова решает сам.',
  html: `<div class="ancient">
  <ul class="branch">
${leaves(1, 6, { 1: spring(1), 3: spring(2), 5: spring(3) })}
  </ul>
</div>`,
  starterCss: `/* Старое заклятие: «все листья — серые навсегда» */
.leaf {
  color: gray !important;
}

/* Весенние листья — салатовые */
.leaf.spring {
  color: lime;
}
`,
  solutionCss: `/* Старое заклятие: «все листья — серые навсегда» */
.leaf {
  color: gray;
}

/* Весенние листья — салатовые */
.leaf.spring {
  color: lime;
}
`,
  check: { items: '.leaf', groupName: 'листья', style: 'color' },
  require: [
    {
      pattern: '^(?![\\s\\S]*!\\s*important)',
      message: 'Не отвечай !important на !important — это война без конца. Убери его совсем.',
    },
  ],
  hints: [
    'Селектор `.leaf.spring` сильнее `.leaf`, но `!important` важнее любой силы селектора.',
    'Удали слово `!important` из первого правила — точку с запятой оставь.',
    'Первое правило: `.leaf { color: gray; }`',
  ],
  learns: 'important',
});
