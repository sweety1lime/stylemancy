import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'fair-04',
  title: 'Дорога к соседям',
  dialog: [
    'Указатели на ярмарке — это ссылки: нажал — и ты уже в другом месте.',
    'Ссылка — тег <a>, а адрес, куда она ведёт, пишут в атрибуте href. Наведи на ссылку в окне страницы — внизу появится её адрес.',
  ],
  task: 'Сделай «Деревня Тегов» ссылкой на адрес `https://kaskadia.example`.',
  starterHtml: `<h2>Соседи</h2>
<p>Загляни к соседям: Деревня Тегов.</p>
`,
  solutionHtml: `<h2>Соседи</h2>
<p>Загляни к соседям: <a href="https://kaskadia.example">Деревня Тегов</a>.</p>
`,
  goals: [
    { label: 'Ссылка `<a>` с текстом «Деревня Тегов»', selector: 'a', text: 'Деревня Тегов' },
    { label: 'Ссылка ведёт на `https://kaskadia.example`', selector: 'a[href^="https://kaskadia.example"]' },
  ],
  hints: [
    'Ссылка оборачивает текст, как `<strong>`: `<a>…</a>`.',
    'Адрес пишут в открывающем теге: `<a href="адрес">`. Значение — в кавычках.',
    '`<a href="https://kaskadia.example">Деревня Тегов</a>`',
  ],
  learns: 'links',
});
