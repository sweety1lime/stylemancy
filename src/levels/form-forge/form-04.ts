import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'form-04',
  title: 'Свиток пожеланий',
  dialog: [
    'Оружие новички вписывают от руки — и пишут кто во что горазд: «мечь», «посох волшебный», «лютня бардова». Пусть лучше выбирают из списка!',
    'Список вариантов — <select>, каждый вариант в нём — <option>. А для длинного текста одной строки <input> мало: нужно многострочное поле <textarea>.',
  ],
  task: 'Замени поле оружия на список `<select>` с тремя вариантами: меч, посох и лютня. Поле пожелания сделай многострочным `<textarea>`. Сохрани `id` и `name`.',
  starterHtml: `<h2>Свиток пожеланий</h2>
<form>
  <label for="weapon">Оружие</label>
  <input id="weapon" name="weapon">
  <label for="wish">Пожелание кузнецу</label>
  <input id="wish" name="wish">
</form>
`,
  solutionHtml: `<h2>Свиток пожеланий</h2>
<form>
  <label for="weapon">Оружие</label>
  <select id="weapon" name="weapon">
    <option>Меч</option>
    <option>Посох</option>
    <option>Лютня</option>
  </select>
  <label for="wish">Пожелание кузнецу</label>
  <textarea id="wish" name="wish" rows="3"></textarea>
</form>
`,
  goals: [
    { label: 'Оружие — список `<select id="weapon" name="weapon">`', selector: 'select#weapon[name="weapon"]' },
    { label: 'В списке три варианта `<option>`', selector: 'select#weapon > option', count: 3 },
    { label: 'Пожелание — многострочное поле `<textarea id="wish" name="wish">`', selector: 'textarea#wish[name="wish"]' },
  ],
  hints: [
    '`<select>` и `<textarea>` — парные теги, в отличие от `<input>`.',
    'Внутри `<select>` — варианты `<option>Меч</option>` и так далее. `<textarea>` можно оставить пустым: `<textarea …></textarea>`.',
    '`<select id="weapon" name="weapon"><option>Меч</option><option>Посох</option><option>Лютня</option></select>` и `<textarea id="wish" name="wish" rows="3"></textarea>`',
  ],
  learns: 'select-textarea',
});
