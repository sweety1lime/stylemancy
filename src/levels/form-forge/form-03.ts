import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'form-03',
  title: 'Выбор пути',
  dialog: [
    'Новичок должен выбрать один путь — маг, воин или бард. Но Лорд Дефолт дал переключателям разные имена, и теперь можно выбрать все три сразу. Проверь в окне страницы!',
    'Переключатели type="radio" с одинаковым name — одна группа: выбрать можно только один. А согласие с уставом — это галочка type="checkbox", а не текстовое поле.',
  ],
  task: 'Дай всем трём переключателям одно имя `name="path"`, а поле согласия с уставом сделай галочкой `type="checkbox"`.',
  starterHtml: `<h2>Выбор пути</h2>
<form>
  <p>Путь героя:</p>
  <label><input type="radio" name="path" value="mage"> Маг</label>
  <label><input type="radio" name="path2" value="warrior"> Воин</label>
  <label><input type="radio" name="path3" value="bard"> Бард</label>
  <p><label><input type="text" name="rules"> Принимаю устав гильдии</label></p>
</form>
`,
  solutionHtml: `<h2>Выбор пути</h2>
<form>
  <p>Путь героя:</p>
  <label><input type="radio" name="path" value="mage"> Маг</label>
  <label><input type="radio" name="path" value="warrior"> Воин</label>
  <label><input type="radio" name="path" value="bard"> Бард</label>
  <p><label><input type="checkbox" name="rules"> Принимаю устав гильдии</label></p>
</form>
`,
  goals: [
    { label: 'Три переключателя — одна группа `name="path"`', selector: 'input[type="radio" i][name="path"]', count: 3 },
    { label: 'Согласие с уставом — галочка `type="checkbox"`', selector: 'input[type="checkbox" i][name="rules"]' },
  ],
  hints: [
    'Группу переключателей связывает одинаковый `name` — `value` у каждого остаётся свой.',
    'Поменяй `name="path2"` и `name="path3"` на `name="path"`, а у согласия `type="text"` — на `type="checkbox"`.',
    '`<input type="radio" name="path" value="warrior">` … `<input type="checkbox" name="rules">`',
  ],
  learns: 'checkbox-radio',
});
