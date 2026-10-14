import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'form-02',
  title: 'Тайное слово',
  dialog: [
    'Лорд Дефолт подглядывает за паролями: поле пароля показывает всё, что в него пишут. А в поле почты можно вписать что угодно.',
    'У <input> есть атрибут type. type="email" — почта (телефон покажет клавиатуру с @), type="password" — пароль: буквы прячутся за точками. А placeholder — бледная подсказка внутри пустого поля.',
  ],
  task: 'Сделай поле почты типом `email` с подсказкой `placeholder`, а поле пароля — типом `password`. Попробуй напечатать в них что-нибудь в окне страницы.',
  starterHtml: `<h2>Вход в гильдию</h2>
<form>
  <label for="mail">Почта</label>
  <input id="mail" name="mail">
  <label for="secret">Тайное слово</label>
  <input id="secret" name="secret">
</form>
`,
  solutionHtml: `<h2>Вход в гильдию</h2>
<form>
  <label for="mail">Почта</label>
  <input id="mail" name="mail" type="email" placeholder="hero@kaskadia.example">
  <label for="secret">Тайное слово</label>
  <input id="secret" name="secret" type="password">
</form>
`,
  goals: [
    { label: 'Поле почты — `type="email"`', selector: 'input#mail[type="email" i]' },
    { label: 'В поле почты подсказка `placeholder`', selector: 'input#mail[placeholder]:not([placeholder=""])' },
    { label: 'Поле тайного слова — `type="password"`', selector: 'input#secret[type="password" i]' },
  ],
  hints: [
    'Тип поля задаёт атрибут `type` в теге `<input>`.',
    'Почте — `type="email" placeholder="…"`, паролю — `type="password"`.',
    '`<input id="mail" name="mail" type="email" placeholder="hero@kaskadia.example">` и `<input id="secret" name="secret" type="password">`',
  ],
  learns: 'input-types',
});
