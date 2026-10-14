import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'sem-02',
  title: 'Главная улица',
  dialog: [
    'От ворот расходятся главные улицы — меню сайта. Сейчас ссылки меню свалены в безликую коробку.',
    'Меню навигации — тег <nav>. Так браузер и экранный диктор понимают: здесь главные пути по сайту.',
  ],
  task: 'Замени коробку со ссылками в шапке на меню `<nav>`.',
  starterHtml: `<header>
  <h1>Город Семантики</h1>
  <div>
    <a href="#square">Площадь</a>
    <a href="#market">Рынок</a>
    <a href="#tower">Башня</a>
  </div>
</header>
`,
  solutionHtml: `<header>
  <h1>Город Семантики</h1>
  <nav>
    <a href="#square">Площадь</a>
    <a href="#market">Рынок</a>
    <a href="#tower">Башня</a>
  </nav>
</header>
`,
  goals: [
    { label: 'Меню `<nav>` в шапке', selector: 'header > nav' },
    { label: 'В меню три ссылки', selector: 'nav a', count: 3 },
    { label: '`<div>` не осталось', selector: 'div', count: 0 },
  ],
  hints: [
    'Ссылки остаются как есть — меняется только коробка вокруг них.',
    '`<div>` вокруг ссылок становится `<nav>`, а `</div>` — `</nav>`.',
    '`<nav><a href="#square">Площадь</a> … </nav>`',
  ],
  learns: 'nav',
});
