import { defineLevel } from '../../engine/define';

export default defineLevel({
  id: 'sel-06',
  title: 'Указатель-ловушка',
  dialog: [
    'Один из указателей поставил Лорд Дефолт: он уводит прочь из леса, прямо к нему в цитадель. Остальные ведут к своим.',
    'Ссылки отличаются адресом в атрибуте href. Селектор по атрибуту пишут в квадратных скобках: [href="…"] — точное значение, а [href^="https"] — значение, которое начинается с https.',
  ],
  task: 'Зажги красным (`crimson`) только указатель-ловушку: он один ведёт на внешний адрес — его `href` начинается с `https`. Пригодится селектор по атрибуту в квадратных скобках.',
  html: `<nav class="sign">
  <a href="#glades" data-name="Указатель «К полянам»">К Грибным полянам</a>
  <a href="#old-oak" data-name="Указатель «К дубу»">К Старому дубу</a>
  <a href="https://default.lord" data-name="Указатель-ловушка">Короткий путь из леса</a>
  <a href="#cascade" data-name="Указатель «К Древу»">К Древу Каскада</a>
</nav>`,
  starterCss: `a {
  color: crimson;
}
`,
  solutionCss: `a[href^="https"] {
  color: crimson;
}
`,
  check: { items: 'a', groupName: 'указатели', style: 'color' },
  hints: [
    'Все указатели — теги `a`. Отличаются они значением атрибута `href`: открой HTML сцены.',
    'Селектор по атрибуту: `a[href="точное значение"]`. А `^=` значит «начинается с»: `a[href^="https"]`.',
    '`a[href^="https"] { color: crimson; }`',
  ],
  learns: 'selector-attribute',
});
