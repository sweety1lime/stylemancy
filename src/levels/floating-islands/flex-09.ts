import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'flex-09',
  title: 'Разлив',
  dialog: [
    'Из глубин поднялись новые кристаллы — и в один ряд им тесно: они сжимаются и тускнеют.',
    'Пусть те, кому не хватило места, переходят в новый ряд.',
  ],
  task: 'Разреши кристаллам переноситься на новую строку, чтобы они не сжимались.',
  html: `<div class="island">
  <div class="crystal amethyst"></div>
  <div class="crystal emerald"></div>
  <div class="crystal ruby"></div>
  <div class="crystal sapphire"></div>
  <div class="crystal topaz"></div>
  <div class="crystal amethyst"></div>
  <div class="crystal emerald"></div>
  <div class="crystal ruby"></div>
  <div class="crystal sapphire"></div>
</div>`,
  starterCss: `.island {
  display: flex;
}
`,
  solutionCss: `.island {
  display: flex;
  flex-wrap: wrap;
}
`,
  check: { items: '.crystal', itemLabel: 'Кристалл', groupName: 'кристаллы' },
  hints: [
    'Флекс-контейнер по умолчанию втискивает все элементы в одну строку, даже если им приходится сжиматься.',
    'Перенос на новую строку включает свойство `flex-wrap`.',
    '`flex-wrap: wrap;`',
  ],
  learns: 'flex-wrap',
});
