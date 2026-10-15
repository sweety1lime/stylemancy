import { defineLevel } from '../../engine/define';
import { leaves } from './leaves';

export default defineLevel({
  id: 'cas-03',
  title: 'Сила имени',
  dialog: [
    'Лорд Дефолт усилил чары: .branch .leaf — два класса сразу. Твой .leaf с одним классом против них не устоит.',
    'Силу считают так: id — сотни, классы и псевдоклассы — десятки, теги — единицы. Видишь? Золотой лист уже горит: у него id, а он сильнее любых классов.',
  ],
  task: 'Золотой лист уже победил — у него `id`. Сделай селектор для остальных листьев сильнее чар Лорда Дефолта: у чар два класса, значит, тебе нужно три.',
  html: `<div class="ancient">
  <ul class="branch">
${leaves(1, 5, { 3: { attrs: ' id="golden-leaf"', name: 'Золотой лист' } })}
  </ul>
  <ul class="branch">
${leaves(6, 9)}
  </ul>
</div>`,
  lockedCss: `.branch .leaf {
  color: gray;
}
`,
  starterCss: `/* Все листья — салатовые */
.leaf {
  color: lime;
}

/* Золотой лист — золотой */
#golden-leaf {
  color: gold;
}
`,
  solutionCss: `/* Все листья — салатовые */
.ancient .branch .leaf {
  color: lime;
}

/* Золотой лист — золотой */
#golden-leaf {
  color: gold;
}
`,
  check: { items: '.leaf', groupName: 'листья', style: 'color' },
  hints: [
    'Посчитай: у `.branch .leaf` два класса. Чары ниже твоего кода, поэтому ничья — за ними. Нужно больше классов.',
    'Добавь ещё одного предка с классом: `.ancient .branch .leaf` — три класса.',
    '`.ancient .branch .leaf { color: lime; }`',
  ],
  learns: 'specificity-count',
});
