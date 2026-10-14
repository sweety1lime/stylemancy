import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'sem-03',
  title: 'Центральная площадь',
  dialog: [
    'Всё самое важное в городе — на центральной площади. На странице это главная часть: тег <main>, он на странице один.',
    'Внутри главной части — разделы со своими заголовками: тег <section>. Рынок — один раздел, ратуша — другой.',
  ],
  task: 'Внешнюю коробку замени на `<main>`, а две коробки внутри — на разделы `<section>`.',
  starterHtml: `<header>
  <h1>Город Семантики</h1>
</header>
<div>
  <div>
    <h2>Рынок</h2>
    <p>Торгуют всем, что можно разметить.</p>
  </div>
  <div>
    <h2>Ратуша</h2>
    <p>Здесь решают, какой тег куда ставить.</p>
  </div>
</div>
<footer>
  <p>Город Семантики</p>
</footer>
`,
  solutionHtml: `<header>
  <h1>Город Семантики</h1>
</header>
<main>
  <section>
    <h2>Рынок</h2>
    <p>Торгуют всем, что можно разметить.</p>
  </section>
  <section>
    <h2>Ратуша</h2>
    <p>Здесь решают, какой тег куда ставить.</p>
  </section>
</main>
<footer>
  <p>Город Семантики</p>
</footer>
`,
  goals: [
    { label: 'Главная часть `<main>` — одна на странице', selector: 'main', count: 1 },
    { label: 'Два раздела `<section>` внутри `<main>`', selector: 'main > section', count: 2 },
    { label: 'У каждого раздела свой заголовок', selector: 'section > h2', count: 2 },
    { label: '`<div>` не осталось', selector: 'div', count: 0 },
  ],
  hints: [
    'Снаружи — одна большая коробка, внутри — две поменьше. Большая станет `<main>`, маленькие — `<section>`.',
    'Следи за закрывающими тегами: последний `</div>` перед `<footer>` закрывает внешнюю коробку — он станет `</main>`.',
    '`<main><section><h2>Рынок</h2>…</section><section><h2>Ратуша</h2>…</section></main>`',
  ],
  learns: 'main-section',
});
