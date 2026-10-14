import { defineHtmlLevel } from '../../engine/define';

export default defineHtmlLevel({
  id: 'tag-06',
  title: 'Скелет свитка',
  document: true,
  dialog: [
    'Любая страница — это свиток из двух частей: <head> — служебная, её не видно, и <body> — всё, что видно на странице.',
    'В head пишут название для вкладки браузера — <title> — и кодировку, чтобы буквы не превратились в кракозябры. А самой первой строкой идёт <!doctype html>.',
  ],
  task: 'Собери документ целиком: `<!doctype html>`, `<html lang="ru">`, в `<head>` — кодировка и `<title>` «Деревня Тегов», в `<body>` — заголовок `<h1>`.',
  starterHtml: `<!-- собери скелет страницы здесь -->
`,
  solutionHtml: `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Деревня Тегов</title>
</head>
<body>
  <h1>Добро пожаловать!</h1>
</body>
</html>
`,
  goals: [
    { label: 'Первая строка — `<!doctype html>`', doctype: true },
    { label: 'Язык страницы: `<html lang="ru">`', selector: 'html[lang="ru" i]' },
    { label: 'Кодировка `<meta charset="utf-8">` в `<head>`', selector: 'head meta[charset="utf-8" i]' },
    { label: 'Название вкладки `<title>` — «Деревня Тегов»', selector: 'head title', text: 'Деревня Тегов' },
    { label: 'Заголовок `<h1>` в `<body>`', selector: 'body h1' },
  ],
  hints: [
    'Порядок такой: `<!doctype html>`, потом `<html lang="ru">`, внутри него — `<head>` и `<body>`. Посмотри на вкладку над страницей: туда попадёт `<title>`.',
    'В head: `<meta charset="utf-8">` и `<title>Деревня Тегов</title>`. В body — `<h1>` с любым приветствием.',
    '`<!doctype html>` `<html lang="ru">` `<head><meta charset="utf-8"><title>Деревня Тегов</title></head>` `<body><h1>Добро пожаловать!</h1></body>` `</html>`',
  ],
  learns: 'doc-skeleton',
});
