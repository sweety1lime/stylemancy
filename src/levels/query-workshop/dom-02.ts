import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'dom-02',
  title: 'Фонари у ворот',
  learns: 'classList',
  dialog: [
    'Вечереет, а фонари погашены. Свет — это оформление, а оформление живёт в CSS. Мастера не красят элементы из кода: они добавляют класс, а CSS уже знает, как его показать.',
    "`lamp.classList.add('on')` добавляет класс, `lamp.classList.remove('on')` — убирает. Имя класса — без точки: точка бывает только в селекторе.",
    "А найти элемент по id можно через решётку: `document.querySelector('#gate-lamp')`.",
  ],
  task: 'Зажги фонари `#gate-lamp` и `#tower-lamp` — добавь им класс `on`. А фонарь в подвале `#cellar-lamp` Лорд Дефолт зажёг зря: погаси его — убери класс `on`.',
  starterJs: `// Зажги фонари у ворот и на башне, погаси в подвале

`,
  solutionJs: `// Зажги фонари у ворот и на башне, погаси в подвале
let gateLamp = document.querySelector('#gate-lamp');
let towerLamp = document.querySelector('#tower-lamp');
let cellarLamp = document.querySelector('#cellar-lamp');
gateLamp.classList.add('on');
towerLamp.classList.add('on');
cellarLamp.classList.remove('on');
`,
  check: {},
  page: {
    html: `<div class="row">
  <figure><div class="lamp" id="gate-lamp" data-name="фонарь у ворот"></div><figcaption>ворота</figcaption></figure>
  <figure><div class="lamp" id="tower-lamp" data-name="фонарь на башне"></div><figcaption>башня</figcaption></figure>
  <figure><div class="lamp on" id="cellar-lamp" data-name="фонарь в подвале"></div><figcaption>подвал</figcaption></figure>
</div>`,
    css: `figure { display: grid; justify-items: center; gap: 8px; margin: 0 10px; }
figcaption { color: #c8b98f; font-size: 13px; }`,
    watch: '.lamp',
  },
  steps: [{ label: 'Сразу после запуска — у ворот и на башне светло, в подвале темно' }],
  require: [
    { pattern: 'classList\\.add\\s*\\(', message: "Зажигай через classList.add('on')." },
    { pattern: 'classList\\.remove\\s*\\(', message: "Гаси через classList.remove('on')." },
  ],
  hints: [
    "Найди каждый фонарь по id: `document.querySelector('#gate-lamp')` — с решёткой.",
    "Зажечь — `gateLamp.classList.add('on');`, погасить — `cellarLamp.classList.remove('on');`. Класс пишется без точки.",
    "`document.querySelector('#tower-lamp').classList.add('on');` — можно и без колбы, одной строкой.",
  ],
});
