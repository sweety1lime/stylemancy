import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'game-01',
  title: 'Кликер',
  dialog: [
    'Тик-так! Я — Мастер Игр Тик-Так. Знаешь, из чего сделаны игры? Из того, что ты уже умеешь: колбы, условия, события и страница.',
    'Первая игра — кликер: щёлкаешь — добываешь монеты. Готовую игру можно скачать кнопкой под сценой и открыть в любом браузере. Покажи друзьям!',
  ],
  task: 'Каждый щелчок по кнопке `.mine` — плюс одна монета. На табло `.coins` — `Монет: 1`, `Монет: 2`… Когда монет станет 5 или больше, добавь табло класс `rich` — оно засияет золотом.',
  starterJs: `let coins = 0;
let board = document.querySelector('.coins');
let mine = document.querySelector('.mine');

`,
  solutionJs: `let coins = 0;
let board = document.querySelector('.coins');
let mine = document.querySelector('.mine');

mine.addEventListener('click', () => {
  coins++;
  board.textContent = \`Монет: \${coins}\`;
  if (coins >= 5) {
    board.classList.add('rich');
  }
});
`,
  check: {},
  page: {
    html: `<h1 class="title">Кликер</h1>
<p class="coins plate" data-name="табло">Монет: 0</p>
<button class="mine" data-name="кирка">⛏ Добыть</button>`,
    css: `.title { color: #fbbf24; font-size: 26px; letter-spacing: 0.1em; text-transform: uppercase; }
.coins { font-size: 22px; transition: background 0.3s; }
.coins.rich { background: #fbbf24; color: #1b1406; box-shadow: 0 0 0 3px #fff3c4, 0 0 0 6px #1b1406, 0 0 24px #fbbf24; }
.mine { font-size: 20px; padding: 12px 22px; }`,
    watch: '.coins',
  },
  steps: [
    { label: 'Сразу после запуска — «Монет: 0»' },
    { label: 'Первый щелчок — «Монет: 1»', click: '.mine' },
    { label: 'Ещё три щелчка — «Монет: 4», табло пока не сияет', click: '.mine', times: 3 },
    { label: 'Пятый щелчок — «Монет: 5», табло засияло', click: '.mine' },
  ],
  download: 'clicker.html',
  hints: [
    "Обработчик на кнопку: `mine.addEventListener('click', () => { … });` Внутри — `coins++` и табло.",
    '`` board.textContent = `Монет: ${coins}`; ``',
    "После табло — проверка: `if (coins >= 5) { board.classList.add('rich'); }`",
  ],
});
