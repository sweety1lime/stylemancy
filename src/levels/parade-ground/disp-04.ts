import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'disp-04',
  title: 'Шпион в строю',
  dialog: [
    'Тревога! В строй пробрался шпион Лорда Дефолта — серый, как его плащ.',
    'Если убрать шпиона совсем, соседи сомкнутся и строй собьётся. Нужно, чтобы его не было видно, а место в строю осталось пустым.',
  ],
  task: 'Спрячь шпиона `.spy` так, чтобы его место в строю осталось пустым и солдаты не сдвинулись.',
  html: `<div class="parade">
  <span class="soldier" data-name="Солдат 1">1</span>
  <span class="soldier" data-name="Солдат 2">2</span>
  <span class="soldier spy" data-name="Шпион">?</span>
  <span class="soldier" data-name="Солдат 3">3</span>
  <span class="soldier" data-name="Солдат 4">4</span>
</div>`,
  starterCss: `.soldier {
  display: inline-block;
}

.spy {
  /* спрячь шпиона, но не ломай строй */
}
`,
  solutionCss: `.soldier {
  display: inline-block;
}

.spy {
  visibility: hidden;
}
`,
  check: { items: '.soldier', groupName: 'солдаты' },
  hints: [
    '`display: none` убирает элемент вместе с его местом — соседи сдвинутся. Нужен другой способ спрятать.',
    'Свойство `visibility` прячет элемент, а место оставляет: значение `hidden`.',
    '`.spy { visibility: hidden; }`',
  ],
  learns: 'visibility',
});
