import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'disp-01',
  title: 'Строчные солдаты',
  dialog: [
    'Смирно! Это мои солдаты. Точнее, были ими — Лорд Дефолт сделал их строчными, как слова в тексте.',
    'Строчному элементу не прикажешь «ширина 48»: он размером со своё содержимое — с номер на шлеме. А строчно-блочный стоит в строке, но слушается размеров.',
  ],
  task: 'Сделай солдат `.soldier` строчно-блочными: `display: inline-block`. Они останутся в одной строке, но получат свои ширину и высоту.',
  html: `<div class="parade">
  <span class="soldier" data-name="Солдат 1">1</span>
  <span class="soldier" data-name="Солдат 2">2</span>
  <span class="soldier" data-name="Солдат 3">3</span>
  <span class="soldier" data-name="Солдат 4">4</span>
</div>`,
  starterCss: `.soldier {
  /* солдаты сжались до размера своих номеров */
}
`,
  solutionCss: `.soldier {
  display: inline-block;
}
`,
  check: { items: '.soldier', groupName: 'солдаты' },
  hints: [
    'Ширина и высота у солдат уже заданы — но `span` строчный и их не слушается. Нужно поменять тип элемента.',
    'Тип задаёт свойство `display`. Значение `inline-block` — «в строке, но со своими размерами».',
    '`display: inline-block;`',
  ],
  learns: 'inline-block',
});
