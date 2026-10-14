import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'form-06',
  title: 'Испытание: Вступление в гильдию',
  trial: true,
  dialog: [
    'Последнее испытание Долины Тегов! Лорд Дефолт испортил главную форму гильдии: подпись не находит поле, почта с опечаткой, гильдии в разных группах, а звания рассыпались.',
    'Почини форму так, чтобы её можно было заполнить и отправить. Подчёркивания в редакторе помогут.',
  ],
  task: 'У поля имени — `id="name"` и `name="name"`, почта — `type="email"`, обе гильдии — в группе `name="guild"`, звания — варианты списка `<select id="rank" name="rank">`. И ни одной ошибки.',
  starterHtml: `<h2>Вступление в гильдию</h2>
<form>
  <label for="name">Имя</label>
  <input id="hero-name">
  <label for="mail">Почта</label>
  <input id="mail" name="mail" type="mail">
  <p>Гильдия:</p>
  <label><input type="radio" name="guild" value="mages"> Маги</label>
  <label><input type="radio" name="guilds" value="smiths"> Кузнецы</label>
  <label for="rank">Звание</label>
  <option>Новичок</option>
  <option>Подмастерье</option>
  <button type="submit">Вступить</button>
</form>
`,
  solutionHtml: `<h2>Вступление в гильдию</h2>
<form>
  <label for="name">Имя</label>
  <input id="name" name="name">
  <label for="mail">Почта</label>
  <input id="mail" name="mail" type="email">
  <p>Гильдия:</p>
  <label><input type="radio" name="guild" value="mages"> Маги</label>
  <label><input type="radio" name="guild" value="smiths"> Кузнецы</label>
  <label for="rank">Звание</label>
  <select id="rank" name="rank">
    <option>Новичок</option>
    <option>Подмастерье</option>
  </select>
  <button type="submit">Вступить</button>
</form>
`,
  goals: [
    { label: 'В разметке нет ни одной ошибки', clean: true },
    { label: 'Подпись «Имя» находит поле: `id="name"`, а у поля `name="name"`', selector: 'label[for="name"] + input#name[name="name"]' },
    { label: 'Почта — `type="email"`', selector: 'input#mail[type="email" i]' },
    { label: 'Обе гильдии — одна группа `name="guild"`', selector: 'input[type="radio" i][name="guild"]', count: 2 },
    { label: 'Звания — варианты списка `<select id="rank" name="rank">`', selector: 'select#rank[name="rank"] > option', count: 2 },
  ],
  hints: [
    'Пройди по полям сверху вниз. Подсказки редактора видят опечатку в `type` и варианты `<option>` без списка.',
    'Поле имени: `id="name" name="name"`. У второй гильдии `name="guilds"` → `name="guild"`. Варианты званий оберни в `<select id="rank" name="rank">`.',
    '`<input id="name" name="name">`, `type="email"`, `name="guild"` и `<select id="rank" name="rank"><option>Новичок</option><option>Подмастерье</option></select>`',
  ],
});
