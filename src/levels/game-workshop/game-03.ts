import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'game-03',
  title: 'Загадка Сфинкса',
  learns: 'random',
  dialog: [
    'Новая игра — классика! Механический Сфинкс загадывает число от 1 до 100. Ты называешь — он отвечает «больше» или «меньше».',
    'Число загадывает `Math.random()` — случайная дробь от 0 до 1. `Math.floor(Math.random() * 100) + 1` превращает её в целое от 1 до 100. Эта строка уже в коде.',
  ],
  task: 'По щелчку на `.guess` сравни число из поля `.answer` с загаданным `secret`. Названное меньше — пиши на табло `.says` `Больше!`, больше — `Меньше!`, угадал — `Угадал! Попыток: 3` (считай попытки). После каждой попытки очищай поле.',
  starterJs: `// Сфинкс загадывает число от 1 до 100 — эту строку не меняй
let secret = Math.floor(Math.random() * 100) + 1;
let field = document.querySelector('.answer');
let button = document.querySelector('.guess');
let says = document.querySelector('.says');

`,
  solutionJs: `// Сфинкс загадывает число от 1 до 100 — эту строку не меняй
let secret = Math.floor(Math.random() * 100) + 1;
let field = document.querySelector('.answer');
let button = document.querySelector('.guess');
let says = document.querySelector('.says');
let tries = 0;

button.addEventListener('click', () => {
  let guess = Number(field.value);
  tries++;
  if (guess < secret) {
    says.textContent = 'Больше!';
  } else if (guess > secret) {
    says.textContent = 'Меньше!';
  } else {
    says.textContent = \`Угадал! Попыток: \${tries}\`;
  }
  field.value = '';
});
`,
  check: {},
  page: {
    html: `<h1 class="title">Загадка Сфинкса</h1>
<p class="says plate" data-name="табло">Я загадал число от 1 до 100</p>
<div class="row">
  <input class="answer" data-name="поле" type="number" min="1" max="100" placeholder="число" autocomplete="off">
  <button class="guess" data-name="кнопка">Назвать</button>
</div>`,
    css: `.title { color: #fbbf24; font-size: 24px; letter-spacing: 0.08em; }
.title::before { content: "?"; display: block; margin: 0 auto 6px; color: #a78bfa; font-size: 44px; text-shadow: 0 0 16px #7c3aed; }
.says { min-width: 24ch; font-size: 18px; }`,
    watch: '.says, .answer',
  },
  steps: [
    { label: 'Назвали 50 — «Меньше!», поле очищено', type: ['.answer', '50'], click: '.guess' },
    { label: 'Назвали 20 — «Больше!»', type: ['.answer', '20'], click: '.guess' },
    { label: 'Назвали загаданное число — «Угадал! Попыток: 3»', type: ['.answer', '43'], click: '.guess' },
  ],
  download: 'sphinx.html',
  hints: [
    'В обработчике щелчка: `let guess = Number(field.value);` и `tries++` — колбу `tries` заведи снаружи, с нуля.',
    "Три ветки: `if (guess < secret) { … } else if (guess > secret) { … } else { … }` — меньше значит «Больше!».",
    "Победа: `` says.textContent = `Угадал! Попыток: ${tries}`; `` — и после всех веток `field.value = '';`",
  ],
});
