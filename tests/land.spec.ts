import { expect, test } from '@playwright/test';

/** Земля — чужой код на нашей странице: проверяем и санитайзер, и второй слой защиты (песочница с политикой CSP) */

const IMAGES = { 'house.png': 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%2F%3E' };

/** [название, разметка]: после санитайзера в ней не должно остаться ничего, что запускает код или ходит в сеть */
const HTML_ATTACKS: [string, string][] = [
  ['script', '<p>ok</p><script>parent.postMessage("pwn","*")</script>'],
  ['onerror и onclick', '<img src="x" onerror="alert(1)"><p onclick="alert(1)">t</p>'],
  ['javascript: в ссылке', '<a href="javascript:alert(1)">x</a><a href=" JaVaScRiPt:alert(1)">y</a>'],
  ['внешняя ссылка', '<a href="https://evil.example/">x</a>'],
  ['iframe', '<iframe src="https://evil.example"></iframe><iframe srcdoc="<script>alert(1)</script>"></iframe>'],
  ['object и embed', '<object data="https://evil.example/x.swf"></object><embed src="https://evil.example/x">'],
  ['script в svg', '<svg><script>alert(1)</script><circle r="5" onload="alert(1)"/></svg>'],
  ['use и image в svg', '<svg><use href="https://evil.example/x.svg#a"/><image href="https://evil.example/x.png"/></svg>'],
  ['foreignObject', '<svg><foreignObject><iframe src="https://evil.example"></iframe></foreignObject></svg>'],
  ['ссылка и анимация в svg', '<svg><a href="javascript:alert(1)"><circle r="5"/></a><animate attributeName="href" values="javascript:alert(1)"/></svg>'],
  ['math', '<math><mi xlink:href="javascript:alert(1)">x</mi></math>'],
  [
    'форма',
    '<form action="https://evil.example" method="post"><input name="a" type="password"><input type="file"><input type="hidden" name="b"><button formaction="https://evil.example">go</button></form>',
  ],
  ['адрес в style', '<p style="background:url(https://evil.example/x.png);color:red">t</p>'],
  ['выход из style за скобку', '<p style="color:red}body{background:url(//evil.example)">t</p>'],
  ['тег style', '<style>body{background:url(//evil.example)}</style><p>t</p>'],
  ['meta и base', '<meta http-equiv="refresh" content="0;url=https://evil.example"><base href="https://evil.example/">'],
  ['noscript (мутация)', '<noscript><p title="</noscript><img src=x onerror=alert(1)>">'],
  ['style в svg (мутация)', '<svg></p><style><a title="</style><img src onerror=alert(1)>">'],
  ['комментарий (мутация)', '<!--><img src=x onerror=alert(1)>-->'],
  ['template', '<template><img src=x onerror=alert(1)></template>'],
  ['картинка снаружи', '<img src="https://evil.example/pixel.gif" alt="">'],
  ['srcset', '<img srcset="https://evil.example/x.png 2x" src="house.png">'],
  ['formaction', '<button type="submit" formaction="javascript:alert(1)">x</button>'],
];

/** CSS, в котором после санитайзера должен остаться только безвредный красный цвет */
const CSS_ATTACKS: [string, string][] = [
  ['@import', '@import url(https://evil.example/x.css); p { color: red }'],
  ['url() в background', 'body { background: url("https://evil.example/x.png"); color: red }'],
  ['url() с экранированием', 'body { background: u\\72l(https://evil.example/x.png); color: red }'],
  ['url() в переменной', ':root { --x: url(https://evil.example/x.png) } body { background: var(--x); color: red }'],
  ['@font-face', '@font-face { font-family: x; src: url(https://evil.example/x.woff) } p { font-family: x; color: red }'],
  ['</style> в строке', 'p::before { content: "</style><script>alert(1)</script>"; color: red }'],
  ['cursor', 'p { cursor: url(https://evil.example/c.cur), auto; color: red }'],
  ['image-set', 'p { background-image: image-set("https://evil.example/x.png" 1x); color: red }'],
  ['list-style', 'p { list-style: url(https://evil.example/x.png); color: red }'],
  ['behavior и -moz-binding', 'p { behavior: url(x.htc); -moz-binding: url(x.xml#a); color: red }'],
  ['url() в @media', '@media (min-width: 600px) { p { background: url(//evil.example/a.png); color: red } }'],
  ['url() в @keyframes', '@keyframes k { from { background: url(//evil.example/a.png); color: red } to { color: red } } p { animation: k 1s }'],
  ['expression', 'p { width: expression(alert(1)); color: red }'],
  ['@namespace', '@namespace url(http://evil.example); p { color: red }'],
];

interface Run {
  html: Record<string, { html: string; notes: string[] }>;
  css: Record<string, { css: string; notes: string[] }>;
}

test('санитайзер: вредные вставки убираются, а честная разметка остаётся', async ({ page }) => {
  await page.goto('/');
  const run = await page.evaluate<Run>(`import('/src/land/sanitize.ts').then(({ sanitizeLand }) => {
    const images = ${JSON.stringify(IMAGES)};
    const html = {};
    for (const [name, code] of ${JSON.stringify(HTML_ATTACKS)}) {
      const safe = sanitizeLand({ html: code, css: '' }, images);
      html[name] = { html: safe.html, notes: safe.notes };
    }
    const css = {};
    for (const [name, code] of ${JSON.stringify(CSS_ATTACKS)}) {
      const safe = sanitizeLand({ html: '', css: code }, images);
      css[name] = { css: safe.css, notes: safe.notes };
    }
    return { html, css };
  })`);

  const DANGER = /evil|script|onerror|onload|onclick|javascript|<iframe|<object|<embed|<style|<meta|<base|<use|<image|foreignObject|animate|formaction|action=|srcset|password|type="file"|type="hidden"|<math|<template|\son\w+=/i;
  for (const [name] of HTML_ATTACKS) {
    expect.soft(run.html[name].html, `разметка «${name}»`).not.toMatch(DANGER);
  }
  // Честные части вставок остаются: игра не вырезает всё подряд
  expect(run.html['script'].html).toContain('<p>ok</p>');
  expect(run.html['srcset'].html).toContain('src="house.png"');
  expect(run.html['внешняя ссылка'].html).toContain('x');
  expect(run.html['форма'].html).toContain('<form');
  expect(run.html['форма'].html).toContain('<button');
  // Игроку объясняют, что убрано и почему
  expect(run.html['script'].notes.join(' ')).toContain('Тег <script> убран');
  expect(run.html['внешняя ссылка'].notes.join(' ')).toContain('только якоря');
  expect(run.html['картинка снаружи'].notes.join(' ')).toContain('не из библиотеки');
  expect(run.html['onerror и onclick'].notes.join(' ')).toContain('нет JavaScript');

  const CSS_DANGER = /evil|@import|@font-face|@namespace|<\/style|<script|expression|behavior|binding/i;
  for (const [name] of CSS_ATTACKS) {
    expect.soft(run.css[name].css, `CSS «${name}»`).not.toMatch(CSS_DANGER);
    expect.soft(run.css[name].css, `CSS «${name}»: безвредное осталось`).toContain('red');
  }
  expect(run.css['@import'].notes.join(' ')).toContain('@import');
  expect(run.css['@font-face'].notes.join(' ')).toContain('шрифты');
  expect(run.css['url() в background'].notes.join(' ')).toContain('библиотеки');
});

test('санитайзер: честная земля проходит целиком', async ({ page }) => {
  await page.goto('/');
  const html = `<header><h1 id="top">Моя земля</h1><nav><a href="#about">О земле</a></nav></header>
<main><section id="about"><p>Привет, <strong>путник</strong>!</p><img src="img/House.PNG" alt="Дом"></section>
<ul><li>раз</li><li>два</li></ul>
<svg viewBox="0 0 10 10" width="40" height="40"><defs><linearGradient id="g"><stop offset="0" stop-color="red"/><stop offset="1" stop-color="blue"/></linearGradient></defs><circle cx="5" cy="5" r="4" fill="url(#g)"/></svg>
<p style="color: teal; margin: 8px 0">Подпись</p>
<form><label for="n">Имя</label><input id="n" type="text" placeholder="Имя"><button type="button">Ок</button></form></main>`;
  const css = `body { background: url(house.png) #fdf6e3; font-family: Georgia, serif }
.card { display: grid; gap: 8px; &:hover { color: red } .inner { color: blue } }
@media (max-width: 600px) { h1 { font-size: 20px } }
@keyframes glow { from { opacity: 0.5 } to { opacity: 1 } }
svg { filter: url(#blur) }`;
  const safe = await page.evaluate<{ html: string; css: string; notes: string[] }>(`import('/src/land/sanitize.ts').then(({ sanitizeLand }) =>
    sanitizeLand({ html: ${JSON.stringify(html)}, css: ${JSON.stringify(css)} }, ${JSON.stringify(IMAGES)}))`);

  for (const part of [
    '<h1 id="top">Моя земля</h1>',
    'href="#about"',
    '<strong>путник</strong>',
    // Путь и регистр в имени картинки прощаются, как в уровнях
    'src="house.png"',
    'alt="Дом"',
    '<linearGradient id="g">',
    'fill="url(#g)"',
    'viewBox="0 0 10 10"',
    'style="color: teal; margin: 8px 0px"',
    '<label for="n">',
    'type="text"',
    'type="button"',
  ]) {
    expect.soft(safe.html, part).toContain(part);
  }
  expect(safe.notes).toEqual([]);

  expect(safe.css).toContain('url("house.png")');
  expect(safe.css).toContain('font-family');
  expect(safe.css).toContain('@media (max-width: 600px)');
  expect(safe.css).toContain('@keyframes glow');
  expect(safe.css).toContain('url(#blur)');
  // Вложенные правила не теряются
  expect(safe.css).toMatch(/color: red/);
  expect(safe.css).toMatch(/color: blue/);
});

test('санитайзер: лимиты на число и глубину тегов', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate<{ many: string; deep: string; notes: string[] }>(`import('/src/land/sanitize.ts').then(({ sanitizeLand }) => {
    const many = sanitizeLand({ html: '<i></i>'.repeat(850), css: '' }, {});
    const deep = sanitizeLand({ html: '<div>'.repeat(80), css: '' }, {});
    return { many: many.html, deep: deep.html, notes: [...many.notes, ...deep.notes] };
  })`);
  expect(result.many.split('<i>').length - 1).toBeLessThanOrEqual(700);
  expect(result.deep.split('<div>').length - 1).toBeLessThanOrEqual(40);
  expect(result.notes.join(' ')).toContain('слишком сложная');
});

test('второй слой: даже необезвреженная страница не запускает код и не ходит в сеть', async ({ page }) => {
  const beacons: string[] = [];
  await page.route('**/__beacon/**', (route) => {
    beacons.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'image/gif', body: '' });
  });
  await page.goto('/');
  const origin = new URL(page.url()).origin;
  // В документ нарочно попадает «как есть» то, что санитайзер убрал бы: проверяем песочницу и политику CSP сами по себе
  const raw = {
    html:
      '<p id="p">видно</p><script>parent.postMessage("pwn-script","*")</script>' +
      '<img src="x" onerror="parent.postMessage(\'pwn-onerror\',\'*\')">' +
      `<img src="${origin}/__beacon/img.gif"><iframe src="${origin}/__beacon/frame"></iframe>` +
      '<a id="out" href="https://evil.example/">наружу</a>',
    css: `body { background: url(${origin}/__beacon/bg.gif) } p::before { content: url(${origin}/__beacon/before.gif) }`,
  };
  const messages = await page.evaluate<string[]>(`import('/src/land/sanitize.ts').then(({ landDocument }) => new Promise((resolve) => {
    const seen = [];
    addEventListener('message', (event) => seen.push(String(event.data)));
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', '');
    frame.srcdoc = landDocument(${JSON.stringify(raw)}, {});
    frame.onload = () => setTimeout(() => resolve(seen), 800);
    document.body.append(frame);
  }))`);
  expect(messages).toEqual([]);
  expect(beacons).toEqual([]);
});
