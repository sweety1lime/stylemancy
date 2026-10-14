import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'fair-07',
  title: 'Прайс-лист',
  dialog: [
    'Цены на ярмарке висят на доске — это таблица. Таблица — тег <table>, строки — <tr>, ячейки — <td>.',
    'Ячейки шапки пишут тегом <th>: браузер выделит их как заголовки столбцов. Шапку и первую строку я уже заполнила — допиши остальное.',
  ],
  task: 'Допиши в таблицу ещё две строки: «Мёд — 5 монет» и «Свеча — 1 монета».',
  starterHtml: `<h2>Цены</h2>
<table>
  <tr>
    <th>Товар</th>
    <th>Цена</th>
  </tr>
  <tr>
    <td>Хлеб</td>
    <td>2 монеты</td>
  </tr>
</table>
`,
  solutionHtml: `<h2>Цены</h2>
<table>
  <tr>
    <th>Товар</th>
    <th>Цена</th>
  </tr>
  <tr>
    <td>Хлеб</td>
    <td>2 монеты</td>
  </tr>
  <tr>
    <td>Мёд</td>
    <td>5 монет</td>
  </tr>
  <tr>
    <td>Свеча</td>
    <td>1 монета</td>
  </tr>
</table>
`,
  goals: [
    { label: 'Шапка: две ячейки `<th>`', selector: 'tr > th', count: 2 },
    { label: 'Три строки с товарами', selector: 'tr > td:first-child', count: 3 },
    { label: 'Мёд стоит 5 монет', selector: 'td', text: '5 монет' },
    { label: 'Свеча стоит 1 монету', selector: 'td', text: '1 монета' },
  ],
  hints: [
    'Каждая строка — `<tr>`, а в ней две ячейки `<td>`: товар и цена.',
    'Скопируй строку с хлебом и поменяй текст в ячейках. Новые строки — до `</table>`.',
    '`<tr><td>Мёд</td><td>5 монет</td></tr>` и `<tr><td>Свеча</td><td>1 монета</td></tr>`',
  ],
  learns: 'tables',
});
