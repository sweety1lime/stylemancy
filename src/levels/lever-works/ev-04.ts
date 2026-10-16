import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'ev-04',
  title: 'Пульт сигналов',
  learns: 'event-target',
  dialog: [
    'На пульте четыре кнопки-сигнала. Писать четыре одинаковых рецепта — скучно. Повесь один и тот же рецепт на каждую кнопку циклом.',
    'А какую кнопку нажали, подскажет событие: обработчик получает его первым параметром — `(event) => { … }`. `event.target` — элемент, по которому щёлкнули.',
  ],
  task: 'По щелчку на любую кнопку `.signal` пиши её текст на табло `.board`. Повесь обработчик на каждую кнопку в цикле, а текст возьми у той, по которой щёлкнули: `event.target.textContent`.',
  starterJs: `let board = document.querySelector('.board');
let signals = document.querySelectorAll('.signal');

`,
  solutionJs: `let board = document.querySelector('.board');
let signals = document.querySelectorAll('.signal');

for (const signal of signals) {
  signal.addEventListener('click', (event) => {
    board.textContent = event.target.textContent;
  });
}
`,
  check: {},
  page: {
    html: `<p class="board plate" data-name="табло">—</p>
<div class="row">
  <button class="signal">Тревога</button>
  <button class="signal">Отбой</button>
  <button class="signal">Обед</button>
  <button class="signal">Полный вперёд</button>
</div>`,
    css: '.board { min-width: 16ch; font-size: 20px; }',
    watch: '.board',
  },
  steps: [
    { label: 'Сразу после запуска — на табло «—»' },
    { label: 'Нажали «Отбой» — на табло «Отбой»', click: '.signal:nth-child(2)' },
    { label: 'Нажали «Полный вперёд» — «Полный вперёд»', click: '.signal:nth-child(4)' },
    { label: 'Нажали «Тревога» — «Тревога»', click: '.signal:nth-child(1)' },
  ],
  require: [{ pattern: '\\.target\\b', message: 'Возьми текст у той кнопки, по которой щёлкнули: event.target.textContent.' }],
  hints: [
    'Перебери кнопки: `for (const signal of signals) { … }` — и в цикле повесь обработчик на каждую.',
    "`signal.addEventListener('click', (event) => { … });` — параметр `event` и есть событие.",
    '`board.textContent = event.target.textContent;`',
  ],
});
