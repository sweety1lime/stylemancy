import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'ev-01',
  title: 'Первый рычаг',
  learns: 'addEventListener',
  dialog: [
    'Я — Механик Клик! До сих пор механизмы менялись сразу, как запускался код. А настоящий механизм ждёт, пока дёрнут рычаг.',
    "`lever.addEventListener('click', openGate)` — «когда по рычагу щёлкнут, позови рецепт openGate». Рецепт пишут без скобок: позовёт его браузер, потом, когда щёлкнут.",
  ],
  task: 'Сделай так, чтобы ворота `.gate` открывались по щелчку на рычаг `.lever`: в рецепте `openGate` добавь воротам класс `open`, а рецепт повесь на щелчок. Пока рычаг не тронули, ворота должны стоять закрытыми!',
  starterJs: `let lever = document.querySelector('.lever');
let gate = document.querySelector('.gate');

function openGate() {
  // Открой ворота
}

// Повесь рецепт на щелчок по рычагу

`,
  solutionJs: `let lever = document.querySelector('.lever');
let gate = document.querySelector('.gate');

function openGate() {
  // Открой ворота
  gate.classList.add('open');
}

// Повесь рецепт на щелчок по рычагу
lever.addEventListener('click', openGate);
`,
  check: {},
  page: {
    html: `<div class="gate" data-name="ворота"></div>
<button class="lever" data-name="рычаг">Дёрнуть рычаг</button>`,
    watch: '.gate',
  },
  steps: [{ label: 'Сразу после запуска — ворота закрыты' }, { label: 'Щёлкнули по рычагу — ворота открылись', click: '.lever' }],
  require: [{ pattern: 'addEventListener\\s*\\(', message: "Повесь рецепт на щелчок: lever.addEventListener('click', openGate)." }],
  hints: [
    "В рецепте открой ворота: `gate.classList.add('open');`",
    "Под рецептом — обработчик: `lever.addEventListener('click', openGate);` Имя события — `'click'` в кавычках.",
    'Рецепт — без скобок: `openGate`, а не `openGate()`. Со скобками он сработает сразу, а не по щелчку.',
  ],
});
