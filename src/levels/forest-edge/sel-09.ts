import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-09',
  title: 'Тропа',
  dialog: [
    'На тропе за каждым камнем прячется гриб, а после старого пня собираются светлячки.',
    'Соседей ищут знаками: + — «сразу следом», ~ — «где-то следом». Оба смотрят только вперёд по разметке и только среди детей одного родителя.',
  ],
  task: 'Зажги оранжевым гриб, который стоит сразу за камнем (знак `+`), а золотом — всех светлячков после пня (знак `~`).',
  html: `<div class="trail">
  <div class="stone"></div>
  <div class="mushroom" data-name="Гриб за камнем 1"></div>
  <div class="mushroom" data-name="Гриб 2"></div>
  <div class="stone"></div>
  <div class="mushroom" data-name="Гриб за камнем 2"></div>
  <div class="firefly" data-name="Светлячок 1"></div>
  <div class="stump"></div>
  <div class="mushroom" data-name="Гриб 4"></div>
  <div class="firefly" data-name="Светлячок 2"></div>
  <div class="firefly" data-name="Светлячок 3"></div>
</div>`,
  starterCss: `/* Гриб сразу за камнем */
.mushroom {
  color: orange;
}

/* Светлячки после пня */
.firefly {
  color: gold;
}
`,
  solutionCss: `/* Гриб сразу за камнем */
.stone + .mushroom {
  color: orange;
}

/* Светлячки после пня */
.stump ~ .firefly {
  color: gold;
}
`,
  check: { items: '.mushroom, .firefly', style: 'color' },
  hints: [
    '`+` — сосед, который идёт сразу следом. `~` — все соседи, которые идут следом, не обязательно сразу.',
    'Слева от знака — тот, за кем идут: `.stone + .mushroom`, `.stump ~ .firefly`.',
    '`.stone + .mushroom { color: orange; }` и `.stump ~ .firefly { color: gold; }`',
  ],
  learns: 'selector-siblings',
});
