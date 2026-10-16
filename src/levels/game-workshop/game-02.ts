import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'game-02',
  title: 'Кликер: улучшение',
  learns: 'disabled',
  dialog: [
    'Хороший кликер растёт: монеты копятся, а на них покупают улучшения. Я переписал игру удобнее — всё, что видно на странице, теперь показывает рецепт `update()`.',
    'Кнопку, которую пока нельзя нажать, выключают: `upgrade.disabled = true`. А можно сразу условием — `upgrade.disabled = coins < 5;`',
  ],
  task: 'Добавь в кликер улучшение `.upgrade`. Пока монет меньше 5, кнопка выключена (`disabled`). Щелчок по ней тратит 5 монет и удваивает добычу: была 1 монета за щелчок — стала 2. Добыча — колба `power`.',
  starterJs: `let coins = 0;
let power = 1;
let board = document.querySelector('.coins');
let mine = document.querySelector('.mine');
let upgrade = document.querySelector('.upgrade');

// Показывает всё на странице: табло и кнопку улучшения
function update() {
  board.textContent = \`Монет: \${coins}\`;
  // Улучшение выключено, пока монет меньше 5
}

mine.addEventListener('click', () => {
  coins += 1; // добыча должна зависеть от кирки
  update();
});

// Покупка улучшения

update();
`,
  solutionJs: `let coins = 0;
let power = 1;
let board = document.querySelector('.coins');
let mine = document.querySelector('.mine');
let upgrade = document.querySelector('.upgrade');

// Показывает всё на странице: табло и кнопку улучшения
function update() {
  board.textContent = \`Монет: \${coins}\`;
  // Улучшение выключено, пока монет меньше 5
  upgrade.disabled = coins < 5;
}

mine.addEventListener('click', () => {
  coins += power;
  update();
});

// Покупка улучшения
upgrade.addEventListener('click', () => {
  coins -= 5;
  power *= 2;
  update();
});

update();
`,
  check: {},
  page: {
    html: `<h1 class="title">Кликер</h1>
<p class="coins plate" data-name="табло">Монет: 0</p>
<div class="row">
  <button class="mine" data-name="кирка">⛏ Добыть</button>
  <button class="upgrade" data-name="улучшение">Кирка ×2 — 5 монет</button>
</div>`,
    css: `.title { color: #fbbf24; font-size: 26px; letter-spacing: 0.1em; text-transform: uppercase; }
.coins { font-size: 22px; }
.mine { font-size: 20px; padding: 12px 22px; }`,
    watch: '.coins, .upgrade',
  },
  steps: [
    { label: 'Сразу после запуска — «Монет: 0», улучшение выключено' },
    { label: 'Добыли 4 раза — «Монет: 4», улучшение ещё выключено', click: '.mine', times: 4 },
    { label: 'Пятая монета — улучшение включилось', click: '.mine' },
    { label: 'Купили улучшение — «Монет: 0», кнопка снова выключена', click: '.upgrade' },
    { label: 'Добыли ещё раз — сразу две монеты: «Монет: 2»', click: '.mine' },
  ],
  download: 'clicker.html',
  hints: [
    'В `update()` допиши одну строку: `upgrade.disabled = coins < 5;` — так кнопка сама включится и выключится.',
    'Добыча — колба `power`: в обработчике кирки пиши `coins += power;` вместо `coins += 1;`',
    "Покупка: `upgrade.addEventListener('click', () => { coins -= 5; power *= 2; update(); });`",
  ],
});
