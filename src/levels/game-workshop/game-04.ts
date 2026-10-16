import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'game-04',
  title: 'Испытание: новая игра',
  learns: 'hidden',
  trial: true,
  dialog: [
    'Испытание Мастерской игр! Сфинкс отгадан — а дальше? Игра должна честно закончиться и предложить сыграть ещё.',
    'Спрятанный элемент показывают через `hidden`: `again.hidden = false`. А поле и кнопку после победы выключи — `disabled`, — чтобы не гадать впустую.',
  ],
  task: 'Когда число угадано, выключи поле `.answer` и кнопку `.guess` (`disabled`) и покажи спрятанную кнопку `.again` (`hidden = false`). Щелчок по `.again` начинает игру заново: новое `secret`, попытки — с нуля, поле и кнопка снова работают, `.again` прячется, а на табло — `Я загадал новое число`.',
  starterJs: `// Сфинкс загадывает число от 1 до 100 — эту строку не меняй
let secret = Math.floor(Math.random() * 100) + 1;
let field = document.querySelector('.answer');
let button = document.querySelector('.guess');
let says = document.querySelector('.says');
let again = document.querySelector('.again');
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

// Новая игра
`,
  solutionJs: `// Сфинкс загадывает число от 1 до 100 — эту строку не меняй
let secret = Math.floor(Math.random() * 100) + 1;
let field = document.querySelector('.answer');
let button = document.querySelector('.guess');
let says = document.querySelector('.says');
let again = document.querySelector('.again');
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
    field.disabled = true;
    button.disabled = true;
    again.hidden = false;
  }
  field.value = '';
});

// Новая игра
again.addEventListener('click', () => {
  secret = Math.floor(Math.random() * 100) + 1;
  tries = 0;
  field.disabled = false;
  button.disabled = false;
  again.hidden = true;
  says.textContent = 'Я загадал новое число';
});
`,
  check: {},
  page: {
    html: `<h1 class="title">Загадка Сфинкса</h1>
<p class="says plate" data-name="табло">Я загадал число от 1 до 100</p>
<div class="row">
  <input class="answer" data-name="поле" type="number" min="1" max="100" placeholder="число" autocomplete="off">
  <button class="guess" data-name="кнопка">Назвать</button>
</div>
<button class="again" data-name="ещё раз" hidden>Сыграть ещё</button>`,
    css: `.title { color: #fbbf24; font-size: 24px; letter-spacing: 0.08em; }
.title::before { content: "?"; display: block; margin: 0 auto 6px; color: #a78bfa; font-size: 44px; text-shadow: 0 0 16px #7c3aed; }
.says { min-width: 24ch; font-size: 18px; }
input:disabled { opacity: 0.5; }`,
    watch: '.says, .answer, .guess, .again',
  },
  steps: [
    { label: 'Угадали с первой попытки — поле и кнопка выключены, «Сыграть ещё» видна', type: ['.answer', '43'], click: '.guess' },
    { label: 'Нажали «Сыграть ещё» — «Я загадал новое число», всё снова работает', click: '.again' },
    { label: 'Назвали 50 — «Меньше!»', type: ['.answer', '50'], click: '.guess' },
    { label: 'Угадали новое число — «Угадал! Попыток: 2»: счёт начался заново', type: ['.answer', '18'], click: '.guess' },
  ],
  download: 'sphinx.html',
  hints: [
    'В ветке «угадал» добавь три строки: `field.disabled = true;`, `button.disabled = true;` и `again.hidden = false;`',
    "Новая игра — обработчик на `again`: `again.addEventListener('click', () => { … });`",
    'Внутри: `secret = Math.floor(Math.random() * 100) + 1;` (без let — колба уже есть), `tries = 0;`, снова включи поле и кнопку, спрячь `again` и перепиши табло.',
  ],
});
