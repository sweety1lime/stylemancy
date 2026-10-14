import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'form-01',
  title: 'Первое поле',
  dialog: [
    'В Кузнице Форм куют то, во что люди пишут: поля, галочки, кнопки. Всё это живёт внутри тега <form>.',
    'Поле ввода — одиночный тег <input>, а подпись к нему — <label>. Свяжи их: у подписи for, у поля такой же id. Тогда клик по подписи ставит курсор в поле.',
  ],
  task: 'Добавь в форму подпись `<label for="hero">` «Имя героя» и поле `<input>` с `id="hero"` и `name="hero"`. Потом нажми на подпись в окне страницы.',
  starterHtml: `<h2>Запись в гильдию</h2>
<form>
  <!-- подпись и поле для имени -->
</form>
`,
  solutionHtml: `<h2>Запись в гильдию</h2>
<form>
  <label for="hero">Имя героя</label>
  <input id="hero" name="hero">
</form>
`,
  goals: [
    { label: 'Подпись `<label for="hero">` «Имя героя»', selector: 'form label[for="hero"]', text: 'Имя героя' },
    { label: 'Поле `<input id="hero">` — его ищет подпись', selector: 'form input#hero' },
    { label: 'У поля имя `name="hero"` — под ним значение уйдёт на сервер', selector: 'input#hero[name="hero"]' },
  ],
  hints: [
    '`<label>` — парный тег с текстом подписи, `<input>` — одиночный, закрывать его не нужно.',
    'Связь такая: `for` у подписи равен `id` у поля. А `name` — имя, под которым форма отправит то, что ввели.',
    '`<label for="hero">Имя героя</label>` и `<input id="hero" name="hero">`',
  ],
  learns: 'label-input',
});
