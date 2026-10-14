import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'sem-07',
  title: 'Испытание: Ратуша',
  trial: true,
  dialog: [
    'Сайт ратуши Лорд Дефолт собрал из одних коробок. Но старые названия классов подсказывают, чем был каждый блок.',
    'Верни ратуше смысл: шапка, меню, главная часть с новостью и разделом законов, сторожка и подвал.',
  ],
  task: 'Замени все `<div>` на подходящие теги: `header`, `nav`, `main`, `article`, `section`, `aside`, `footer`.',
  starterHtml: `<div class="header">
  <h1>Ратуша</h1>
  <div class="menu">
    <a href="#news">Новости</a>
    <a href="#laws">Законы</a>
  </div>
</div>
<div class="main">
  <div class="article" id="news">
    <h2>Новости</h2>
    <p>На площади поставили новый фонтан из тегов.</p>
  </div>
  <div class="section" id="laws">
    <h2>Законы</h2>
    <p>Каждый тег обязан закрываться.</p>
  </div>
</div>
<div class="aside">
  <p>Приём жителей — по средам.</p>
</div>
<div class="footer">
  <p>Ратуша Города Семантики</p>
</div>
`,
  solutionHtml: `<header>
  <h1>Ратуша</h1>
  <nav>
    <a href="#news">Новости</a>
    <a href="#laws">Законы</a>
  </nav>
</header>
<main>
  <article id="news">
    <h2>Новости</h2>
    <p>На площади поставили новый фонтан из тегов.</p>
  </article>
  <section id="laws">
    <h2>Законы</h2>
    <p>Каждый тег обязан закрываться.</p>
  </section>
</main>
<aside>
  <p>Приём жителей — по средам.</p>
</aside>
<footer>
  <p>Ратуша Города Семантики</p>
</footer>
`,
  goals: [
    { label: '`<div>` не осталось ни одного', selector: 'div', count: 0 },
    { label: 'Шапка `<header>` с меню `<nav>`', selector: 'header > nav' },
    { label: 'Новость — `<article>` в главной части `<main>`', selector: 'main > article#news' },
    { label: 'Законы — раздел `<section>` в `<main>`', selector: 'main > section#laws' },
    { label: 'Сторожка `<aside>` рядом с `<main>`', selector: 'main + aside' },
    { label: 'Подвал `<footer>` в самом низу', selector: 'footer:last-child' },
  ],
  hints: [
    'Классы подсказывают: `class="header"` — шапка, `class="menu"` — меню и так далее. Класс можно оставить или убрать.',
    'Меняй пары тегов по одной и следи за закрывающими: у вложенных коробок `</div>` идут подряд.',
    '`header` с `nav` внутри, `main` с `article` и `section`, после него `aside` и `footer`.',
  ],
});
