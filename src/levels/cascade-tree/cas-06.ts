import { defineLevel } from '../../engine/define';
import { leaves } from './leaves';

export default defineLevel({
  id: 'cas-06',
  title: 'Испытание: Древо Каскада',
  trial: true,
  dialog: [
    'Последнее испытание леса. Лорд Дефолт наложил на Древо свои самые хитрые чары.',
    'Вспомни всё: порядок правил, силу селекторов и наследство. И никакого !important.',
  ],
  task: 'Всё Древо `.ancient` — золотое (`gold`): светлячки в кроне возьмут цвет по наследству. Листья — салатовые (`lime`), сильнее чар Лорда Дефолта. А лист-сердце (`id="heart"`) пусть берёт цвет у родителя: `inherit`.',
  html: `<div class="ancient">
  <div class="crown">
    <div class="firefly" data-name="Светлячок 1"></div>
    <div class="firefly" data-name="Светлячок 2"></div>
  </div>
  <ul class="branch">
${leaves(1, 3, { 2: { attrs: ' id="heart"', name: 'Лист-сердце' } })}
  </ul>
  <ul class="branch">
${leaves(4, 5)}
  </ul>
</div>`,
  lockedCss: `.branch li {
  color: gray;
}
`,
  starterCss: `/* Древо — золотое */

/* Листья — салатовые */

/* Лист-сердце — цвет родителя */
`,
  solutionCss: `/* Древо — золотое */
.ancient {
  color: gold;
}

/* Листья — салатовые */
.branch .leaf {
  color: lime;
}

/* Лист-сердце — цвет родителя */
#heart {
  color: inherit;
}
`,
  check: { items: '.firefly, .leaf', style: 'color' },
  require: [
    {
      pattern: 'color\\s*:\\s*inherit',
      message: 'Лист-сердце должен взять цвет у родителя — это значение inherit.',
    },
    {
      pattern: '^(?![\\s\\S]*!\\s*important)',
      message: 'В Древе Каскада !important под запретом — победи чары силой селекторов.',
    },
  ],
  hints: [
    'Начни с Древа: цвет `.ancient` унаследуют все, у кого нет своего. Чары Лорда Дефолта дают свой цвет листьям — их придётся перебить.',
    'У чар `.branch li` один класс и один тег. Два класса сильнее: `.branch .leaf`. А id сильнее классов: `#heart`.',
    '`.ancient { color: gold; }` `.branch .leaf { color: lime; }` `#heart { color: inherit; }`',
  ],
});
