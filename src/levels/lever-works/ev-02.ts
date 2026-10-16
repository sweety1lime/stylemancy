import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'ev-02',
  title: 'Выключатель',
  learns: 'toggle',
  dialog: [
    'Фонарь на мосту должен и зажигаться, и гаснуть — одной и той же кнопкой. Можно спросить у `if`, горит ли он, но у classList есть приём проще.',
    "`lamp.classList.toggle('on')` переключает класс: нет — добавит, есть — уберёт. А рецепт можно написать прямо в обработчике: `button.addEventListener('click', () => { … });`",
  ],
  task: 'Каждый щелчок по выключателю `.switch` переключает фонарь `.lamp`: погашен — загорается, горит — гаснет. Свет — это класс `on`.',
  starterJs: `let lamp = document.querySelector('.lamp');
let button = document.querySelector('.switch');

`,
  solutionJs: `let lamp = document.querySelector('.lamp');
let button = document.querySelector('.switch');

button.addEventListener('click', () => {
  lamp.classList.toggle('on');
});
`,
  check: {},
  maxLines: 4,
  page: {
    html: `<div class="lamp" data-name="фонарь"></div>
<button class="switch" data-name="выключатель">Щёлк</button>`,
    css: '.lamp { width: 64px; height: 96px; }',
    watch: '.lamp',
  },
  steps: [
    { label: 'Сразу после запуска — фонарь погашен' },
    { label: 'Первый щелчок — фонарь горит', click: '.switch' },
    { label: 'Второй щелчок — погас', click: '.switch' },
    { label: 'Третий щелчок — снова горит', click: '.switch' },
  ],
  hints: [
    "Повесь обработчик на выключатель: `button.addEventListener('click', () => { … });`",
    "Внутри — одна строка: `lamp.classList.toggle('on');`",
    'Если зажигаешь через `add`, второй щелчок фонарь не погасит: класс уже есть. Для «туда-сюда» нужен `toggle`.',
  ],
});
