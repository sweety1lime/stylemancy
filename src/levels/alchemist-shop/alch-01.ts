import { defineJsLevel } from '../../engine/define';

export default defineJsLevel({
  id: 'alch-01',
  title: 'Вывеска',
  learns: 'concat',
  dialog: [
    'Я — Алхимик Тайпоф, хозяин лавки. Здесь смешивают значения, и первое зелье — самое простое: строка плюс строка.',
    'Знак `+` между строками склеивает их вплотную: `\'Лавка\' + \'Алхимика\'` даёт `\'ЛавкаАлхимика\'`. Пробел сам не появится — его тоже приклеивают: `\' \'`.',
  ],
  task: 'Лорд Дефолт перевесил вывеску, и Оракул читает `ЛавкаАлхимика`. Почини колбу `sign`: склей `shop` и `owner` с пробелом между ними, чтобы Оракул сказал `Лавка Алхимика`.',
  starterJs: `let shop = 'Лавка';
let owner = 'Алхимика';
let sign = shop + owner;
console.log(sign);
`,
  solutionJs: `let shop = 'Лавка';
let owner = 'Алхимика';
let sign = shop + ' ' + owner;
console.log(sign);
`,
  check: { output: true, vars: ['sign'] },
  require: [{ pattern: 'sign\\s*=[^;\\n]*\\bshop\\b[^;\\n]*\\bowner\\b', message: "Склей вывеску из колб: shop + ' ' + owner." }],
  reject: [{ pattern: '[\'"`]Лавка Алхимика[\'"`]', message: 'Не пиши вывеску готовой строкой — склей её из колб shop и owner.' }],
  hints: [
    'Плюс склеивает строки вплотную, поэтому между словами нет пробела.',
    'Пробел — это тоже строка: `\' \'`. Приклей её между колбами.',
    '`let sign = shop + \' \' + owner;`',
  ],
});
