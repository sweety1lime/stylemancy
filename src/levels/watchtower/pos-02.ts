import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'pos-02',
  title: 'Флаг над башней',
  dialog: [
    'Флаг крепости валяется внутри башни, а должен реять над ней!',
    'position: absolute вынимает блок из потока и ставит по координатам — от краёв ближайшего предка с position. Башне я уже приказал: relative. Теперь она — точка отсчёта.',
  ],
  task: 'Подними флаг `.flag` над башней: `position: absolute`, на `48px` выше верхнего края башни и в `16px` от её правого края.',
  html: `<div class="tower">
  <div class="flag" data-name="Флаг"></div>
</div>`,
  starterCss: `.tower {
  position: relative; /* точка отсчёта для флага */
}

.flag {
  /* подними флаг над башней */
}
`,
  solutionCss: `.tower {
  position: relative; /* точка отсчёта для флага */
}

.flag {
  position: absolute;
  top: -48px;
  right: 16px;
}
`,
  check: { items: '.flag' },
  require: [
    {
      pattern: 'position\\s*:\\s*absolute',
      message: 'Флаг должен встать по координатам башни — это position: absolute.',
    },
  ],
  hints: [
    'Координаты у `absolute` отсчитываются от краёв башни: `top` — от верхнего, `right` — от правого.',
    'Чтобы флаг оказался над башней, `top` должен быть отрицательным: `-48px` — ровно на высоту флага.',
    '`position: absolute; top: -48px; right: 16px;`',
  ],
  learns: 'position-absolute',
});
