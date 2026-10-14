import { expect, test } from '@playwright/test';

interface Case {
  code: string;
  document?: boolean;
  /** Ожидаемые сообщения (кусок текста); пустой список — ошибок и предупреждений нет */
  expect: string[];
}

const CASES: Case[] = [
  { code: '<p>Текст</p>', expect: [] },
  { code: '<p>Текст', expect: ['Тег <p> не закрыт — не хватает </p>.'] },
  { code: '<p><strong>важно</p></strong>', expect: ['Теги перепутаны: сначала закрой </strong>, потом </p>'] },
  { code: '<p><strong>важно</p>', expect: ['Тег <strong> не закрыт: поставь </strong> перед </p>.'] },
  { code: '<bold>важно</bold>', expect: ['Тега <bold> в HTML нет. Может, <strong>?'] },
  { code: '<li>пункт</li>', expect: ['<li> — пункт списка'] },
  { code: '<ul><p>пункт</p></ul>', expect: ['Внутри <ul> сразу идут только пункты <li>.'] },
  { code: '<ul>пункт</ul>', expect: ['Текст «пункт» оберни в <li>…</li>.'] },
  { code: '<p>текст<ul><li>пункт</li></ul></p>', expect: ['Внутри абзаца <p> не бывает <ul>'] },
  { code: '<ul><li>Один<li>Два</li></ul>', expect: ['Тег <li> не закрыт: поставь </li> перед следующим <li>.'] },
  { code: '<p>строка</br></p>', expect: ['У <br> нет закрывающего тега'] },
  { code: '<img src="ruby.png">', expect: ['У картинки нет alt'] },
  { code: '<img scr="ruby.png" alt="Рубин">', expect: ['У <img> нет атрибута «scr». Может, src?', 'У <img> нет src'] },
  { code: '<a>Ярмарка</a>', expect: ['У ссылки нет href'] },
  { code: '<img src=ruby.png alt=Красный кристалл>', expect: ['Значение с пробелами пишут в кавычках'] },
  { code: '<p class="a" class="b">текст</p>', expect: ['Атрибут class указан дважды'] },
  { code: 'p>Текст</p>', expect: ['перед «p>» пропущен знак <', '</p> лишний'] },
  { code: '<h1>Указ</h2>', expect: ['</h2> лишний', 'Тег <h1> не закрыт'] },
  { code: '<input type="mail">', expect: ['Поля с типом «mail» нет — может, email?'] },
  { code: '<div/>текст', expect: ['<div /> так не закрывается'] },
  { code: '<!-- заметка', expect: ['Комментарий не закрыт'] },
  { code: '<center>центр</center>', expect: ['Тег <center> устарел'] },
  { code: '<p><a src="#prices">Цены</a></p>', expect: ['У <a> нет атрибута «src»', 'У ссылки нет href'] },
  {
    code: '<table><tr><td>Карта</td><td>10</td>\n<tr><td>Компас</td><td>7</td></tr></table>',
    expect: ['Тег <tr> не закрыт: поставь </tr> перед следующим <tr>.'],
  },
  { code: '<table><td>Карта</td></table>', expect: ['<td> — ячейка: она стоит внутри строки <tr>.'] },
  { code: '<label for="name">Имя</label><input id="hero">', expect: ['Подпись ищет поле с id="name", а такого поля на странице нет.'] },
  { code: '<label for="hero">Имя</label><input id="hero" name="hero">', expect: [] },
  { code: '<select><p>Меч</p></select>', expect: ['Внутри <select> — только варианты <option>.'] },
  {
    code: '<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<title>Деревня</title>\n</head>\n<body>\n<h1>Привет</h1>\n</body>\n</html>',
    document: true,
    expect: [],
  },
  { code: '<html><head><h1>Привет</h1></head></html>', document: true, expect: ['<h1> — видимая часть страницы: её пишут в <body>'] },
];

test('проверка HTML объясняет типичные ошибки студентов', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(
    `import('/src/engine/htmlLint.ts').then((m) => ${JSON.stringify(CASES)}.map((c) => m.lintHtml(c.code, { document: c.document }).map((p) => p.message)))`,
  );
  CASES.forEach((item, i) => {
    const messages = (results as string[][])[i];
    if (!item.expect.length) {
      expect.soft(messages, `«${item.code}» — без замечаний`).toEqual([]);
      return;
    }
    for (const part of item.expect) {
      expect.soft(messages.some((message) => message.includes(part)), `«${item.code}»: ждём «${part}», есть: ${messages.join(' | ')}`).toBe(true);
    }
  });
});
