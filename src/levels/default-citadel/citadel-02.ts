import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'citadel-02',
  title: 'Испытание: Падение Лорда Дефолта',
  trial: true,
  dialog: [
    'Последний рубеж! Моя цитадель — страница без единого стиля: шапка, меню, главная часть, боковая колонка и подвал.',
    'Собери её так, чтобы она работала и на телефоне, и на мониторе. Получится — проклятие спадёт. Но ты не сможешь!',
  ],
  task: 'Флаги — в ряд по центру, промежутки 8px. В узком зеркале спрячь Башню. На экранах от 600px — колонки `72px 1fr 160px`: Знамя сверху и Ворота снизу во всю ширину, между ними флаги столбиком, Тронный зал и Башня.',
  html: `<div class="citadel">
  <header class="banner" data-name="Знамя">Знамя</header>
  <nav class="flags">
    <div class="flag" data-name="Красный флаг"></div>
    <div class="flag" data-name="Жёлтый флаг"></div>
    <div class="flag" data-name="Зелёный флаг"></div>
  </nav>
  <main class="hall" data-name="Тронный зал">Тронный зал</main>
  <aside class="tower" data-name="Башня">Башня</aside>
  <footer class="gate" data-name="Ворота">Ворота</footer>
</div>`,
  starterCss: `.citadel {
  display: grid;
  gap: 12px;
}

/* Флаги — в ряд по центру, промежутки 8px */

/* В узком зеркале для башни нет места */

/* Широкое зеркало: экраны от 600px */
`,
  solutionCss: `.citadel {
  display: grid;
  gap: 12px;
}

/* Флаги — в ряд по центру, промежутки 8px */
.flags {
  display: flex;
  justify-content: center;
  gap: 8px;
}

/* В узком зеркале для башни нет места */
@media (max-width: 599px) {
  .tower {
    display: none;
  }
}

/* Широкое зеркало: экраны от 600px */
@media (min-width: 600px) {
  .citadel {
    grid-template-columns: 72px 1fr 160px;
    grid-template-areas:
      "banner banner banner"
      "flags  hall   tower"
      "gate   gate   gate";
  }

  .banner { grid-area: banner; }
  .flags { grid-area: flags; flex-direction: column; }
  .hall { grid-area: hall; }
  .tower { grid-area: tower; }
  .gate { grid-area: gate; }
}
`,
  check: { items: '.banner, .flag, .hall, .tower, .gate', groupName: 'блоки цитадели', viewports: [360, 800] },
  scene: { width: 800, height: 440 },
  hints: [
    'Иди по шагам: сначала флаги (Flexbox), потом Башня в узком зеркале (`display: none` в медиазапросе с `max-width`), в конце — карта для широкого зеркала.',
    'Имена областей (`grid-area`) пиши внутри медиазапроса для широкого экрана: в узком зеркале карты нет. Там же поверни ось флагов — `flex-direction: column`.',
    '`.flags { display: flex; justify-content: center; gap: 8px; }`, `@media (max-width: 599px) { .tower { display: none; } }`, а в `@media (min-width: 600px)` — `.citadel { grid-template-columns: 72px 1fr 160px; grid-template-areas: "banner banner banner" "flags hall tower" "gate gate gate"; }`, имена областей и `.flags { flex-direction: column; }`',
  ],
});
