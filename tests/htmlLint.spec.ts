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

// Здесь проверяется движок, а не картинка: лёгкие эффекты, чтобы фон карты не отнимал время у кода в странице
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('cascadia.settings.v1', JSON.stringify({ sound: false, effects: 'light' })));
});

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

/** В «Моей земле» внутри <svg> проверяются свои теги и атрибуты, а в HTML-уровнях правила прежние */
test('проверка HTML знает рисунки svg, если её об этом попросили', async ({ page }) => {
  await page.goto('/');
  const svg = `<svg viewBox="0 0 100 60" width="200" height="120" xmlns="http://www.w3.org/2000/svg">
  <defs><linearGradient id="g"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="blue"/></linearGradient></defs>
  <rect x="0" y="0" width="100" height="60" fill="url(#g)"/>
  <circle cx="30" cy="30" r="14" fill="#ffd479" stroke-width="2"></circle>
  <path d="M50 50 L70 20 L90 50 Z"/>
  <text x="5" y="55">Привет</text>
</svg>`;
  const result = await page.evaluate<{ plain: string[]; land: string[]; typo: string[]; unclosed: string[]; strict: string[] }>(`import('/src/engine/htmlLint.ts').then(({ lintHtml }) => {
    const svg = ${JSON.stringify(svg)};
    const messages = (code, options) => lintHtml(code, options).map((problem) => problem.message);
    return {
      plain: messages(svg),
      land: messages(svg, { svg: true }),
      typo: messages('<svg><recct width="5"/></svg>', { svg: true }),
      unclosed: messages('<svg><g><circle r="5"/></svg>', { svg: true }),
      // Вне рисунка правила прежние: <rect> там не тег HTML, а лишний атрибут у <p> по-прежнему замечается
      strict: messages('<rect width="5"></rect><p viewbox="0">а</p>', { svg: true }),
    };
  })`);
  // Без режима svg рисунок подчёркивается, как в HTML-уровнях
  expect(result.plain.some((message) => message.includes('Тега <rect> в HTML нет'))).toBe(true);
  // В земле честный рисунок чист
  expect(result.land).toEqual([]);
  expect(result.typo.some((message) => message.includes('Такого тега в рисунке <svg> нет: <recct>. Может, <rect>?'))).toBe(true);
  expect(result.unclosed.some((message) => message.includes('Тег <g> не закрыт'))).toBe(true);
  expect(result.strict.some((message) => message.includes('Тега <rect> в HTML нет'))).toBe(true);
  expect(result.strict.some((message) => message.includes('У <p> нет атрибута «viewbox»'))).toBe(true);
});
