import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'form-05',
  title: 'Печать гильдии',
  dialog: [
    'Форма почти готова, но отправить её нечем: «Отправить» — просто абзац, на него можно хоть сто раз нажать.',
    'Кнопка — тег <button>, type="submit" отправляет форму. А атрибут required не даст отправить форму с пустым полем — браузер сам попросит его заполнить.',
  ],
  task: 'Замени абзац «Отправить» на кнопку `<button type="submit">` и сделай поле имени обязательным — `required`. Нажми кнопку в окне страницы с пустым и с заполненным полем.',
  starterHtml: `<h2>Печать гильдии</h2>
<form>
  <label for="hero">Имя героя</label>
  <input id="hero" name="hero">
  <p>Отправить</p>
</form>
`,
  solutionHtml: `<h2>Печать гильдии</h2>
<form>
  <label for="hero">Имя героя</label>
  <input id="hero" name="hero" required>
  <button type="submit">Отправить</button>
</form>
`,
  goals: [
    { label: 'Кнопка отправки `<button type="submit">`', selector: 'form button[type="submit" i]' },
    { label: 'Поле имени обязательно — `required`', selector: 'input#hero[required]' },
    { label: 'Абзаца-«кнопки» не осталось', selector: 'form p', count: 0 },
  ],
  hints: [
    '`required` — атрибут без значения: просто слово внутри тега `<input>`.',
    'Абзац `<p>Отправить</p>` становится кнопкой `<button type="submit">Отправить</button>`.',
    '`<input id="hero" name="hero" required>` и `<button type="submit">Отправить</button>`',
  ],
  learns: 'button-required',
});
