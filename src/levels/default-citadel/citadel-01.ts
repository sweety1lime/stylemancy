import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'citadel-01',
  title: 'Тронный зал',
  dialog: [
    'Ха! Добро пожаловать в мою цитадель. Здесь всё как в браузере по умолчанию: блоки друг под другом — и никаких стилей!',
    'На телефоне пусть стоят столбиком, так и быть. Но на мониторе тронный зал тебе не собрать!',
  ],
  task: 'Карта для узкого зеркала уже готова. Добавь медиазапрос для экранов от 600px: колонки `2fr` и `1fr`, Знамя и Ворота — во всю ширину, Тронный зал и Башня — рядом.',
  html: `<div class="citadel">
  <header class="banner" data-name="Знамя">Знамя</header>
  <main class="hall" data-name="Тронный зал">Тронный зал</main>
  <aside class="tower" data-name="Башня">Башня</aside>
  <footer class="gate" data-name="Ворота">Ворота</footer>
</div>`,
  starterCss: `.citadel {
  display: grid;
  gap: 12px;
  grid-template-areas:
    "banner"
    "hall"
    "tower"
    "gate";
}

.banner { grid-area: banner; }
.hall { grid-area: hall; }
.tower { grid-area: tower; }
.gate { grid-area: gate; }

/* Широкое зеркало: экраны от 600px */
`,
  solutionCss: `.citadel {
  display: grid;
  gap: 12px;
  grid-template-areas:
    "banner"
    "hall"
    "tower"
    "gate";
}

.banner { grid-area: banner; }
.hall { grid-area: hall; }
.tower { grid-area: tower; }
.gate { grid-area: gate; }

/* Широкое зеркало: экраны от 600px */
@media (min-width: 600px) {
  .citadel {
    grid-template-columns: 2fr 1fr;
    grid-template-areas:
      "banner banner"
      "hall   tower"
      "gate   gate";
  }
}
`,
  check: { items: '.banner, .hall, .tower, .gate', groupName: 'блоки цитадели', viewports: [360, 800] },
  scene: { width: 800, height: 440 },
  hints: [
    'Имена областей (`grid-area`) уже есть. В медиазапросе достаточно задать колонки и перерисовать карту `.citadel`.',
    'В широкой карте две колонки и три строки: `"banner banner"`, потом `"hall tower"`, потом `"gate gate"`.',
    '`@media (min-width: 600px) { .citadel { grid-template-columns: 2fr 1fr; grid-template-areas: "banner banner" "hall tower" "gate gate"; } }`',
  ],
  learns: 'media-areas',
});
