import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'disp-05',
  title: 'Испытание: Парад',
  trial: true,
  dialog: [
    'Парад! Знамя впереди, солдаты ровной строкой. А шпион опять тут как тут.',
    'На этот раз прятать его не нужно — уведи из строя совсем, и пусть солдаты сомкнут ряды.',
  ],
  task: 'Знамя `.banner` — во всю ширину над строем. Солдаты `.soldier` — в одну строку и со своими размерами. Шпиона `.spy` убери совсем, чтобы строй сомкнулся.',
  html: `<div class="parade">
  <span class="banner" data-name="Знамя">Парад Крепости Блоков</span>
  <span class="soldier" data-name="Солдат 1">1</span>
  <span class="soldier" data-name="Солдат 2">2</span>
  <span class="soldier spy" data-name="Шпион">?</span>
  <span class="soldier" data-name="Солдат 3">3</span>
  <span class="soldier" data-name="Солдат 4">4</span>
</div>`,
  starterCss: `.banner {
}

.soldier {
}

.spy {
}
`,
  solutionCss: `.banner {
  display: block;
}

.soldier {
  display: inline-block;
}

.spy {
  display: none;
}
`,
  check: { items: '.banner, .soldier', groupName: 'знамя и солдаты' },
  hints: [
    'Три правила — три значения `display`: блок, строчный блок и «нет совсем».',
    'Знамени — `block`, солдатам — `inline-block`. А шпиону — `none`: `visibility: hidden` оставит дыру в строю.',
    '`.banner { display: block; }` `.soldier { display: inline-block; }` `.spy { display: none; }`',
  ],
});
