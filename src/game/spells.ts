/** Живой пример заклинания: варианты объявлений подставляются в одно правило. */
export interface ValueExample {
  /** Разметка; по умолчанию — контейнер .box с тремя блоками .item */
  html?: string;
  /** Постоянные стили примера */
  css?: string;
  /** Правило, в котором меняется значение */
  selector: string;
  /** Варианты — объявления «свойство: значение» (можно несколько через «;») */
  options: string[];
  /** Какой вариант показать сразу — самый наглядный */
  initial?: number;
}

/** Пример с медиазапросом: код готов целиком, а меняется ширина «экрана». */
export interface WidthExample {
  html?: string;
  css?: string;
  /** Показываемый код — вместе с @media */
  code: string;
  /** Ширины экрана, между которыми можно переключаться */
  widths: number[];
  initial?: number;
}

/** Пример с разметкой: кнопки переключают варианты HTML, мини-страница показывает, что выйдет. */
export interface MarkupExample {
  markup: { label: string; html: string }[];
  initial?: number;
}

/** Пример с вариантами CSS целиком: кнопки переключают правила — видно, какой селектор кого находит и какое правило побеждает. */
export interface VariantsExample {
  html?: string;
  css?: string;
  variants: { label: string; css: string }[];
  initial?: number;
}

/** Пример-скрипт: кнопки переключают варианты кода, а Оракул сразу говорит, что выведет каждый. */
export interface ScriptExample {
  /** inputs — ответы на prompt по порядку */
  scripts: { label: string; code: string; inputs?: string[] }[];
  initial?: number;
}

export type SpellExample = ValueExample | WidthExample | MarkupExample | VariantsExample | ScriptExample;

export interface Spell {
  name: string;
  description: string;
  example: SpellExample;
}

function numberedItems(count: number): string {
  return `<div class="box">${Array.from({ length: count }, (_, i) => `<div class="item">${i + 1}</div>`).join('')}</div>`;
}

const FOUR_ITEMS = numberedItems(4);
const SIX_ITEMS = numberedItems(6);
const NINE_ITEMS = numberedItems(9);
const AREA_ITEMS = '<div class="box"><div class="item a">a</div><div class="item b">b</div><div class="item c">c</div></div>';
const ONE_ITEM = numberedItems(1);
/** Строчные блоки: span вместо div */
const SPAN_ITEMS = '<div class="box"><span class="item">1</span> <span class="item">2</span> <span class="item">3</span></div>';
/** Контейнер по размеру содержимого — чтобы были видны отступы и рамка */
const FIT_BOX_CSS = '.box { width: fit-content; height: auto; }';

/**
 * Примеры про селекторы и каскад: ячейки в ряд, погасшие. Их вид задан через :where() — у него нет силы,
 * поэтому любой селектор примера его перебивает (обычные .item раскрашены через :nth-child и сильнее класса).
 */
const PICK_CSS =
  '.box { display: flex; flex-wrap: wrap; align-content: flex-start; gap: 8px; } ' +
  ':where(.cell) { width: 40px; height: 40px; display: grid; place-items: center; font: bold 16px/1 monospace; ' +
  'color: #a5a3c4; background: #3b3363; box-shadow: inset -3px -3px 0 rgba(0, 0, 0, 0.25), inset 3px 3px 0 rgba(255, 255, 255, 0.35); }';

function cells(count: number): string {
  return `<div class="box">${Array.from({ length: count }, (_, i) => `<div class="cell">${i + 1}</div>`).join('')}</div>`;
}

/** Варианты-селекторы: правило одно и то же, меняется только селектор. */
function picks(...selectors: string[]): { label: string; css: string }[] {
  return selectors.map((selector) => ({ label: selector, css: `${selector} {\n  background: gold;\n  color: #1a1030;\n}` }));
}

/** Сетка в примерах: блоки без своего размера заполняют ячейки целиком */
const GRID_CSS = '.box { display: grid; gap: 4px; } .item { width: auto; height: auto; }';
const AREAS_CSS = '.a { grid-area: a; } .b { grid-area: b; } .c { grid-area: c; }';

/** Заклинания гримуара. Ключ — поле learns в уровне. */
export const SPELLS: Record<string, Spell> = {
  'display-flex': {
    name: 'display: flex',
    description:
      'Превращает элемент во флекс-контейнер: его дочерние элементы выстраиваются вдоль главной оси — по умолчанию в ряд, слева направо.',
    example: { selector: '.box', options: ['display: block', 'display: flex'], initial: 1 },
  },
  'justify-content': {
    name: 'justify-content',
    description:
      'Распределяет элементы вдоль главной оси: `flex-start` — к началу, `center` — по центру, `flex-end` — к концу.',
    example: {
      css: '.box { display: flex; }',
      selector: '.box',
      options: [
        'justify-content: flex-start',
        'justify-content: center',
        'justify-content: flex-end',
        'justify-content: space-between',
      ],
      initial: 2,
    },
  },
  'space-between': {
    name: 'justify-content: space-between',
    description: 'Крайние элементы прижимаются к краям контейнера, а свободное место делится поровну между соседями.',
    example: {
      css: '.box { display: flex; }',
      selector: '.box',
      options: ['justify-content: space-between', 'justify-content: space-around', 'justify-content: space-evenly'],
    },
  },
  'align-items': {
    name: 'align-items',
    description:
      'Выравнивает элементы поперёк главной оси: `flex-start` — к началу, `center` — по центру, `flex-end` — к концу, `stretch` — растягивает на всю высоту.',
    example: {
      css: '.box { display: flex; justify-content: center; gap: 8px; } .item { height: auto; min-height: 40px; }',
      selector: '.box',
      options: ['align-items: flex-start', 'align-items: center', 'align-items: flex-end', 'align-items: stretch'],
      initial: 1,
    },
  },
  'flex-centering': {
    name: 'justify-content + align-items: center',
    description: 'Классический способ поставить содержимое точно в центр контейнера — по обеим осям сразу.',
    example: {
      css: '.box { display: flex; }',
      selector: '.box',
      options: ['justify-content: center', 'align-items: center', 'justify-content: center; align-items: center'],
      initial: 2,
    },
  },
  'flex-direction': {
    name: 'flex-direction',
    description:
      'Поворачивает главную ось: `row` — слева направо, `column` — сверху вниз, `row-reverse` и `column-reverse` — в обратную сторону.',
    example: {
      css: '.box { display: flex; gap: 4px; }',
      selector: '.box',
      options: ['flex-direction: row', 'flex-direction: column', 'flex-direction: row-reverse', 'flex-direction: column-reverse'],
      initial: 1,
    },
  },
  'flex-axes': {
    name: 'Главная и поперечная оси',
    description:
      '`justify-content` всегда работает вдоль главной оси, а `align-items` — поперёк неё. Поверни ось через `flex-direction` — и они поменяются направлениями.',
    example: {
      css: '.box { display: flex; gap: 4px; }',
      selector: '.box',
      options: [
        'justify-content: flex-end',
        'flex-direction: column; justify-content: flex-end',
        'align-items: flex-end',
        'flex-direction: column; align-items: flex-end',
      ],
      initial: 1,
    },
  },
  gap: {
    name: 'gap',
    description: 'Задаёт промежутки между флекс-элементами — только между соседями, не у краёв контейнера.',
    example: { css: '.box { display: flex; }', selector: '.box', options: ['gap: 0', 'gap: 8px', 'gap: 24px', 'gap: 48px'], initial: 2 },
  },
  'flex-wrap': {
    name: 'flex-wrap',
    description:
      '`wrap` разрешает переносить элементы на новую строку, когда им не хватает места. По умолчанию `nowrap`: все в одну строку, даже если приходится сжиматься.',
    example: {
      html: NINE_ITEMS,
      css: '.box { display: flex; }',
      selector: '.box',
      options: ['flex-wrap: nowrap', 'flex-wrap: wrap', 'flex-wrap: wrap-reverse'],
      initial: 1,
    },
  },
  order: {
    name: 'order',
    description: 'Меняет место элемента в строю, не трогая HTML: чем меньше `order`, тем раньше. По умолчанию у всех 0.',
    example: {
      css: '.box { display: flex; gap: 8px; }',
      selector: '.item:first-child',
      options: ['order: 0', 'order: 1', 'order: -1'],
      initial: 1,
    },
  },
  'align-self': {
    name: 'align-self',
    description: 'Выравнивание поперёк главной оси для одного элемента — перекрывает `align-items` контейнера.',
    example: {
      css: '.box { display: flex; justify-content: center; gap: 8px; align-items: flex-start; } .item { height: auto; min-height: 40px; }',
      selector: '.item:nth-child(2)',
      options: ['align-self: auto', 'align-self: center', 'align-self: flex-end', 'align-self: stretch'],
      initial: 2,
    },
  },
  'flex-grow': {
    name: 'flex-grow',
    description:
      'Сколько свободного места забирает элемент. `flex-grow: 1` — растянуться на всё свободное место; если растут несколько элементов, место делится пропорционально.',
    example: {
      css: '.box { display: flex; gap: 8px; } .item:nth-child(3) { flex-grow: 1; }',
      selector: '.item:nth-child(2)',
      options: ['flex-grow: 0', 'flex-grow: 1', 'flex-grow: 2'],
      initial: 2,
    },
  },

  // ——— Витражная обитель: Grid ———

  'grid-columns': {
    name: 'display: grid + grid-template-columns',
    description:
      '`display: grid` превращает элемент в сетку, а `grid-template-columns` перечисляет ширины колонок через пробел: `100px 100px` — две колонки по 100px. Сколько значений — столько колонок.',
    example: {
      html: SIX_ITEMS,
      css: GRID_CSS,
      selector: '.box',
      options: ['grid-template-columns: 80px 80px', 'grid-template-columns: 80px 80px 80px', 'grid-template-columns: 40px 120px 80px'],
      initial: 1,
    },
  },
  fr: {
    name: 'Единица fr',
    description:
      '`fr` — доля свободного места в сетке. `1fr 2fr 1fr`: место делится на четыре доли, средней колонке достаются две. Считать пиксели не нужно.',
    example: {
      html: SIX_ITEMS,
      css: GRID_CSS,
      selector: '.box',
      options: [
        'grid-template-columns: 1fr 1fr 1fr',
        'grid-template-columns: 1fr 2fr 1fr',
        'grid-template-columns: 2fr 1fr',
        'grid-template-columns: 100px 1fr',
      ],
      initial: 1,
    },
  },
  'grid-rows': {
    name: 'grid-template-rows',
    description: 'Задаёт высоты строк сетки — так же, как `grid-template-columns` задаёт ширины колонок. Работают и пиксели, и `fr`.',
    example: {
      html: SIX_ITEMS,
      css: `${GRID_CSS} .box { grid-template-columns: repeat(3, 1fr); }`,
      selector: '.box',
      options: ['grid-template-rows: 1fr 1fr', 'grid-template-rows: 2fr 1fr', 'grid-template-rows: 30px 1fr'],
      initial: 1,
    },
  },
  repeat: {
    name: 'repeat()',
    description: 'Повторяет колонку нужное число раз: `repeat(4, 1fr)` — то же самое, что `1fr 1fr 1fr 1fr`. Удобно, когда колонок много.',
    example: {
      html: SIX_ITEMS,
      css: GRID_CSS,
      selector: '.box',
      options: [
        'grid-template-columns: repeat(2, 1fr)',
        'grid-template-columns: repeat(3, 1fr)',
        'grid-template-columns: repeat(6, 1fr)',
        'grid-template-columns: repeat(2, 1fr 2fr)',
      ],
      initial: 1,
    },
  },
  'grid-gap': {
    name: 'gap в сетке',
    description:
      'Промежутки между ячейками сетки. Одно значение — для строк и колонок сразу, два — сначала между строками, потом между колонками. Можно и по отдельности: `row-gap` и `column-gap`.',
    example: {
      html: SIX_ITEMS,
      css: '.box { display: grid; grid-template-columns: repeat(3, 1fr); } .item { width: auto; height: auto; }',
      selector: '.box',
      options: ['gap: 0', 'gap: 8px', 'gap: 4px 24px', 'row-gap: 16px'],
      initial: 2,
    },
  },
  'grid-span': {
    name: 'span',
    description:
      '`grid-column: span 2` растягивает элемент на две колонки, `grid-row: span 2` — на две строки. Остальные элементы сетка расставит по свободным ячейкам сама.',
    example: {
      html: SIX_ITEMS,
      css: `${GRID_CSS} .box { grid-template-columns: repeat(3, 1fr); }`,
      selector: '.item:first-child',
      options: ['grid-column: span 1', 'grid-column: span 2', 'grid-column: span 3', 'grid-row: span 2'],
      initial: 1,
    },
  },
  'grid-lines': {
    name: 'Линии сетки',
    description:
      'Линии сетки нумеруются с 1: вертикальные — слева направо, горизонтальные — сверху вниз. `grid-column: 2 / 4` ставит элемент от второй линии до четвёртой, а `-1` — всегда последняя линия.',
    example: {
      html: SIX_ITEMS,
      css: `${GRID_CSS} .box { grid-template-columns: repeat(4, 1fr); }`,
      selector: '.item:first-child',
      options: ['grid-column: 1 / 3', 'grid-column: 2 / 4', 'grid-column: 1 / -1', 'grid-column: 2 / 4; grid-row: 1 / 3'],
      initial: 1,
    },
  },
  'grid-areas': {
    name: 'grid-template-areas',
    description:
      'Карта сетки словами: каждая строка в кавычках — строка сетки, одинаковые слова сливаются в одну область. Элемент встаёт в свою область через `grid-area: имя`.',
    example: {
      html: AREA_ITEMS,
      css: `${GRID_CSS} .box { grid-template-columns: repeat(3, 1fr); } ${AREAS_CSS}`,
      selector: '.box',
      options: ['grid-template-areas: "a a b" "c c b"', 'grid-template-areas: "a b c" "a b c"', 'grid-template-areas: "a a a" "b c c"'],
    },
  },

  // ——— Зеркальная башня и Цитадель: адаптив ———

  'media-query': {
    name: '@media (min-width: …)',
    description:
      'Медиазапрос: правила внутри него работают, только когда условие выполняется. `(min-width: 600px)` — экран шириной 600px и больше. Переключай ширину экрана и смотри, когда правило срабатывает.',
    example: {
      code: `.box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

@media (min-width: 600px) {
  .box {
    flex-direction: row;
    justify-content: center;
  }
}`,
      widths: [360, 720],
    },
  },
  'mobile-first': {
    name: 'Сначала узкий экран',
    description:
      'Адаптивные сайты обычно пишут так: основа — для телефона, где раскладка проще, а медиазапросы с `min-width` добавляют колонки на экранах пошире.',
    example: {
      html: SIX_ITEMS,
      css: '.item { width: auto; height: auto; }',
      code: `.box {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (min-width: 600px) {
  .box {
    grid-template-columns: repeat(3, 1fr);
  }
}`,
      widths: [360, 720],
    },
  },
  'media-hide': {
    name: 'display: none в медиазапросе',
    description:
      '`display: none` убирает элемент совсем: он не занимает места, и соседи сдвигаются. В медиазапросе с `max-width` элемент прячется только на узких экранах.',
    example: {
      html: FOUR_ITEMS,
      code: `.box {
  display: flex;
  justify-content: center;
  gap: 12px;
}

@media (max-width: 599px) {
  .item:nth-child(3) {
    display: none;
  }
}`,
      widths: [360, 720],
    },
  },
  'auto-fill': {
    name: 'repeat(auto-fill, minmax())',
    description:
      'Сетка без медиазапросов: `minmax(96px, 1fr)` — колонка не уже 96px, а `auto-fill` ставит столько таких колонок, сколько поместится. Лишнее место делится поровну.',
    example: {
      html: NINE_ITEMS,
      css: '.item { width: auto; height: auto; }',
      code: `.box {
  display: grid;
  grid-template-columns:
    repeat(auto-fill, minmax(96px, 1fr));
  gap: 12px;
}`,
      widths: [360, 540, 720],
    },
  },
  'media-areas': {
    name: 'Карта в медиазапросе',
    description:
      'Чтобы перестроить сетку на широком экране, достаточно перерисовать `grid-template-areas` внутри медиазапроса: области останутся теми же, а раскладка поменяется целиком.',
    example: {
      html: AREA_ITEMS,
      css: `.item { width: auto; height: auto; } ${AREAS_CSS}`,
      code: `.box {
  display: grid;
  gap: 8px;
  grid-template-areas:
    "a"
    "b"
    "c";
}

@media (min-width: 600px) {
  .box {
    grid-template-columns: 2fr 1fr;
    grid-template-areas:
      "a a"
      "b c";
  }
}`,
      widths: [360, 720],
    },
  },

  // ——— Деревня Тегов: HTML ———

  'tag-pair': {
    name: 'Парный тег',
    description:
      'Тег — слово в угловых скобках. Большинство тегов парные: открывающий `<p>` и закрывающий `</p>` с косой чертой, а между ними — содержимое. `<p>` — абзац.',
    example: {
      markup: [
        { label: 'без тегов', html: 'Первый абзац о деревне.\nВторой абзац о рынке.' },
        { label: 'с <p>', html: '<p>Первый абзац о деревне.</p>\n<p>Второй абзац о рынке.</p>' },
      ],
      initial: 1,
    },
  },
  headings: {
    name: 'Заголовки h1–h6',
    description:
      'Шесть уровней заголовков: `<h1>` — самый главный, `<h6>` — самый мелкий. Обычно на странице один `<h1>`, а `<h2>`–`<h6>` делят текст на разделы.',
    example: {
      markup: [
        { label: 'h1', html: '<h1>Деревня Тегов</h1>' },
        { label: 'h2', html: '<h2>Деревня Тегов</h2>' },
        { label: 'h3', html: '<h3>Деревня Тегов</h3>' },
        { label: 'h6', html: '<h6>Деревня Тегов</h6>' },
      ],
    },
  },
  'strong-em': {
    name: 'strong и em',
    description:
      '`<strong>` отмечает важное — браузер показывает его жирным. `<em>` — смысловое ударение, по умолчанию курсивом. Их ставят внутри абзаца вокруг нужных слов.',
    example: {
      markup: [
        { label: 'strong', html: '<p>Не кормите <strong>дракона</strong> после заката.</p>' },
        { label: 'em', html: '<p>Он <em>очень</em> капризный.</p>' },
        { label: 'вместе', html: '<p><strong>Не кормите дракона:</strong> он <em>очень</em> капризный.</p>' },
      ],
      initial: 2,
    },
  },
  nesting: {
    name: 'Вложенность',
    description:
      'Теги вкладываются друг в друга, как матрёшки: тег, открытый последним, закрывается первым — `<p><strong>…</strong></p>`. Перепутанные теги браузер чинит по-своему, и страница ломается.',
    example: {
      markup: [
        { label: 'правильно', html: '<p>Хлеб <strong>каждое утро</strong> и пирожки.</p>' },
        { label: 'перепутано', html: '<p>Хлеб <strong>каждое утро</p></strong> и пирожки.' },
      ],
    },
  },
  'void-tags': {
    name: 'Одиночные теги br и hr',
    description:
      'У некоторых тегов нет закрывающей пары. `<br>` — перенос строки внутри абзаца, `<hr>` — черта между частями текста. Переносы строк в самом коде браузер не замечает.',
    example: {
      markup: [
        { label: 'без <br>', html: '<p>Открылся тег на заре,\nзакрылся тег на закате.</p>' },
        { label: 'с <br>', html: '<p>Открылся тег на заре,<br>\nзакрылся тег на закате.</p>' },
        { label: 'с <hr>', html: '<p>Песнь о теге</p>\n<hr>\n<p>Бард Абзацевич</p>' },
      ],
      initial: 1,
    },
  },
  'doc-skeleton': {
    name: 'Скелет страницы',
    description:
      'Документ начинается с `<!doctype html>`. Дальше `<html lang="ru">`, в нём `<head>` — служебная часть с кодировкой `<meta charset="utf-8">` и названием вкладки `<title>`, — и `<body>` — всё, что видно на странице.',
    example: {
      markup: [
        {
          label: 'документ',
          html: '<!doctype html>\n<html lang="ru">\n<head>\n  <meta charset="utf-8">\n  <title>Деревня Тегов</title>\n</head>\n<body>\n  <h1>Добро пожаловать!</h1>\n</body>\n</html>',
        },
      ],
    },
  },

  // ——— Ярмарка Ссылок: списки, ссылки, картинки, таблицы ———

  'ul-li': {
    name: 'Список ul и пункты li',
    description:
      '`<ul>` — маркированный список, каждый пункт в нём — `<li>`. Маркеры перед пунктами браузер ставит сам. Внутри `<ul>` сразу идут только `<li>`.',
    example: {
      markup: [
        { label: 'без списка', html: 'хлеб мёд свечи' },
        { label: 'ul + li', html: '<ul>\n  <li>хлеб</li>\n  <li>мёд</li>\n  <li>свечи</li>\n</ul>' },
      ],
      initial: 1,
    },
  },
  ol: {
    name: 'Нумерованный список ol',
    description: '`<ol>` — список, где важен порядок: шаги рецепта, места в рейтинге. Номера браузер расставит сам, а пункты — те же `<li>`.',
    example: {
      markup: [
        { label: 'ul', html: '<ul>\n  <li>Вскипяти росу</li>\n  <li>Брось мяту</li>\n  <li>Помешай</li>\n</ul>' },
        { label: 'ol', html: '<ol>\n  <li>Вскипяти росу</li>\n  <li>Брось мяту</li>\n  <li>Помешай</li>\n</ol>' },
      ],
      initial: 1,
    },
  },
  'nested-lists': {
    name: 'Вложенные списки',
    description: 'Список можно вложить в пункт другого списка: новый `<ul>` стоит внутри `<li>` — после текста пункта, но до его `</li>`.',
    example: {
      markup: [
        { label: 'плоский', html: '<ul>\n  <li>Овощной ряд</li>\n  <li>морковь</li>\n  <li>репа</li>\n</ul>' },
        {
          label: 'вложенный',
          html: '<ul>\n  <li>Овощной ряд\n    <ul>\n      <li>морковь</li>\n      <li>репа</li>\n    </ul>\n  </li>\n</ul>',
        },
      ],
      initial: 1,
    },
  },
  links: {
    name: 'Ссылка a href',
    description: 'Ссылка — тег `<a>`, адрес — в атрибуте `href`: `<a href="https://…">текст</a>`. Без `href` ссылке некуда вести.',
    example: {
      markup: [
        { label: 'текст', html: '<p>Загляни к соседям: Деревня Тегов.</p>' },
        { label: 'ссылка', html: '<p>Загляни к соседям: <a href="https://kaskadia.example">Деревня Тегов</a>.</p>' },
      ],
      initial: 1,
    },
  },
  anchors: {
    name: 'Якорь: ссылка на id',
    description: 'Ссылка может вести на место той же страницы: у элемента метка `id="square"`, а в ссылке — `href="#square"`. Решётка значит «на этой странице».',
    example: {
      markup: [
        {
          label: 'якорь',
          html: '<p><a href="#square">К площади</a></p>\n…\n<h2 id="square">Площадь</h2>',
        },
      ],
    },
  },
  images: {
    name: 'Картинка img',
    description:
      '`<img>` — одиночный тег. `src` — какой файл показать, `alt` — что на картинке: его прочитает экранный диктор, и его же браузер покажет, если картинка не загрузится.',
    example: {
      markup: [
        { label: 'загрузилась', html: '<img src="potion.png" alt="Красное зелье в склянке">' },
        { label: 'не загрузилась', html: '<img src="potion-oops.png" alt="Красное зелье в склянке">' },
        { label: 'без alt', html: '<img src="potion-oops.png">' },
      ],
    },
  },
  tables: {
    name: 'Таблица table',
    description:
      '`<table>` — таблица, `<tr>` — строка, `<td>` — ячейка, `<th>` — ячейка-заголовок столбца. Ячейки всегда стоят внутри строк, а строки — внутри таблицы.',
    example: {
      markup: [
        {
          label: 'таблица',
          html: '<table>\n  <tr><th>Товар</th><th>Цена</th></tr>\n  <tr><td>Хлеб</td><td>2 монеты</td></tr>\n  <tr><td>Мёд</td><td>5 монет</td></tr>\n</table>',
        },
      ],
    },
  },

  // ——— Город Семантики: каркас страницы ———

  'header-footer': {
    name: 'header и footer',
    description:
      '`<header>` — шапка страницы или раздела: заголовок, логотип, меню. `<footer>` — подвал: контакты, копирайт. В отличие от безликого `<div>`, они говорят браузеру и экранному диктору, что это за блок.',
    example: {
      markup: [
        { label: 'коробки', html: '<div>\n  <h1>Город Семантики</h1>\n</div>\n<div>\n  <p>Ратуша, 1024 год</p>\n</div>' },
        { label: 'со смыслом', html: '<header>\n  <h1>Город Семантики</h1>\n</header>\n<footer>\n  <p>Ратуша, 1024 год</p>\n</footer>' },
      ],
      initial: 1,
    },
  },
  nav: {
    name: 'Меню nav',
    description: '`<nav>` — главное меню: ссылки по разделам сайта. Обычно стоит в шапке. Не каждая группа ссылок — меню, только главные пути по сайту.',
    example: {
      markup: [
        {
          label: 'nav',
          html: '<nav>\n  <a href="#square">Площадь</a>\n  <a href="#market">Рынок</a>\n  <a href="#tower">Башня</a>\n</nav>',
        },
      ],
    },
  },
  'main-section': {
    name: 'main и section',
    description:
      '`<main>` — главная часть страницы, она одна. Внутри — разделы `<section>`, у каждого раздела свой заголовок.',
    example: {
      markup: [
        {
          label: 'main + section',
          html: '<main>\n  <section>\n    <h2>Рынок</h2>\n    <p>Торгуют всем, что можно разметить.</p>\n  </section>\n  <section>\n    <h2>Ратуша</h2>\n    <p>Решают, какой тег куда ставить.</p>\n  </section>\n</main>',
        },
      ],
    },
  },
  article: {
    name: 'Запись article',
    description:
      '`<article>` — самостоятельный кусок, понятный сам по себе: новость, пост, карточка товара. Его можно перенести на другую страницу, и он не потеряет смысл.',
    example: {
      markup: [
        { label: 'article', html: '<article>\n  <h3>Открыт новый мост</h3>\n  <p>Мост соединил Рынок и Башню.</p>\n</article>' },
      ],
    },
  },
  aside: {
    name: 'Дополнение aside',
    description: '`<aside>` — полезное, но не главное: советы, объявления, ссылки «читайте также». Стоит рядом с главной частью, а не внутри неё.',
    example: {
      markup: [
        { label: 'aside', html: '<aside>\n  <h3>Совет зодчего</h3>\n  <p>Div — для оформления, а не для смысла.</p>\n</aside>' },
      ],
    },
  },
  figure: {
    name: 'figure и figcaption',
    description:
      '`<figure>` объединяет картинку и её подпись `<figcaption>`. Подпись видна всем — это не замена `alt`: `alt` описывает картинку тем, кто её не видит.',
    example: {
      markup: [
        { label: 'без figure', html: '<img src="map.png" alt="Карта города">\n<p>Красный крестик — ратуша</p>' },
        {
          label: 'figure',
          html: '<figure>\n  <img src="map.png" alt="Карта города">\n  <figcaption>Красный крестик — ратуша</figcaption>\n</figure>',
        },
      ],
      initial: 1,
    },
  },

  // ——— Кузница Форм ———

  'label-input': {
    name: 'form, label и input',
    description:
      'Форма — `<form>`. Поле ввода — одиночный `<input>`, подпись к нему — `<label>`. Связь: `for` у подписи равен `id` у поля — тогда клик по подписи ставит курсор в поле. `name` — имя, под которым форма отправит значение.',
    example: {
      markup: [
        { label: 'без подписи', html: '<form>\n  <input id="hero" name="hero">\n</form>' },
        { label: 'с подписью', html: '<form>\n  <label for="hero">Имя героя</label>\n  <input id="hero" name="hero">\n</form>' },
      ],
      initial: 1,
    },
  },
  'input-types': {
    name: 'Типы полей и placeholder',
    description:
      'Атрибут `type` меняет поле: `email` — почта, `password` — пароль за точками, `number` — число, `date` — дата. `placeholder` — бледная подсказка внутри пустого поля.',
    example: {
      markup: [
        { label: 'text', html: '<input type="text" placeholder="Что угодно">' },
        { label: 'password', html: '<input type="password" value="тайна">' },
        { label: 'number', html: '<input type="number" value="7">' },
        { label: 'date', html: '<input type="date">' },
      ],
      initial: 1,
    },
  },
  'checkbox-radio': {
    name: 'radio и checkbox',
    description:
      '`type="radio"` — переключатель: из группы с одинаковым `name` выбрать можно только один. `type="checkbox"` — галочка: «да» или «нет», и галочек можно отметить сколько угодно.',
    example: {
      markup: [
        {
          label: 'radio',
          html: '<label><input type="radio" name="path" checked> Маг</label>\n<label><input type="radio" name="path"> Воин</label>',
        },
        { label: 'checkbox', html: '<label><input type="checkbox" checked> Принимаю устав</label>' },
      ],
    },
  },
  'select-textarea': {
    name: 'select и textarea',
    description: '`<select>` — выбор из списка, варианты в нём — `<option>`. `<textarea>` — многострочное поле для длинного текста. Оба тега парные.',
    example: {
      markup: [
        { label: 'select', html: '<select>\n  <option>Меч</option>\n  <option>Посох</option>\n  <option>Лютня</option>\n</select>' },
        { label: 'textarea', html: '<textarea rows="3">Пожелание кузнецу…</textarea>' },
      ],
    },
  },
  'button-required': {
    name: 'button и required',
    description:
      '`<button type="submit">` отправляет форму. Атрибут `required` делает поле обязательным: с пустым полем браузер форму не отправит и сам попросит его заполнить.',
    example: {
      markup: [
        {
          label: 'форма',
          html: '<form>\n  <label for="hero">Имя героя</label>\n  <input id="hero" name="hero" required>\n  <button type="submit">Отправить</button>\n</form>',
        },
      ],
    },
  },

  // ——— Опушка: селекторы ———

  'selector-tag': {
    name: 'Селектор по тегу',
    description: 'Самый простой селектор — имя тега: `p`, `h2`, `li`. Правило подействует на все такие теги на странице сразу.',
    example: {
      html: '<div class="box"><h3 class="cell">h3</h3><p class="cell">p</p><p class="cell">p</p><h3 class="cell">h3</h3></div>',
      css: `${PICK_CSS} h3, p { margin: 0; }`,
      variants: picks('p', 'h3'),
    },
  },
  'selector-class': {
    name: 'Селектор по классу: .имя',
    description:
      'Класс — метка, которую ставят в HTML атрибутом `class`. Селектор по классу начинается с точки: `.gem` найдёт все элементы с классом gem. Классов у элемента может быть несколько — через пробел.',
    example: {
      html: '<div class="box"><div class="cell gem">1</div><div class="cell">2</div><div class="cell gem">3</div><div class="cell">4</div></div>',
      css: PICK_CSS,
      variants: picks('.cell', '.gem'),
      initial: 1,
    },
  },
  'selector-id': {
    name: 'Селектор по id: #имя',
    description:
      '`id` — имя элемента, одно-единственное на всю страницу. Селектор по нему пишут с решёткой: `#hero`. Подходит, когда нужен ровно один элемент.',
    example: {
      html: '<div class="box"><div class="cell">1</div><div class="cell" id="hero">2</div><div class="cell">3</div></div>',
      css: PICK_CSS,
      variants: picks('.cell', '#hero'),
      initial: 1,
    },
  },
  'selector-group': {
    name: 'Группа селекторов: a, b',
    description: 'Селекторы через запятую — одно правило сразу для всех: `h1, h2, h3 { … }`. Так не приходится повторять одинаковые объявления.',
    example: {
      html: '<div class="box"><div class="cell a">a</div><div class="cell b">b</div><div class="cell c">c</div><div class="cell a">a</div></div>',
      css: PICK_CSS,
      variants: picks('.a', '.a, .c'),
      initial: 1,
    },
  },
  'selector-compound': {
    name: 'Два класса сразу: .a.b',
    description:
      'Классы, написанные слитно, без пробела, — это «элемент, у которого есть оба класса»: `.cell.red`. С пробелом — `.cell .red` — получится совсем другое: «.red внутри .cell».',
    example: {
      html: '<div class="box"><div class="cell red">1</div><div class="cell">2</div><div class="cell red">3</div><div class="red mark">!</div></div>',
      css: `${PICK_CSS} .mark { padding: 8px 12px; background: #3b3363; color: #a5a3c4; font: bold 16px monospace; }`,
      variants: picks('.red', '.cell.red', '.cell .red'),
      initial: 1,
    },
  },
  'selector-attribute': {
    name: 'Селектор по атрибуту: [href]',
    description:
      'В квадратных скобках — атрибут: `[href="#top"]` — точное значение, `[href^="https"]` — начинается с https, `[type]` — атрибут вообще есть. Перед скобками можно написать тег: `a[href^="https"]`.',
    example: {
      html: '<div class="box"><a class="cell" href="#top">#</a><a class="cell" href="https://example.com">↗</a><a class="cell" href="#end">#</a></div>',
      css: `${PICK_CSS} a { text-decoration: none; }`,
      variants: picks('a', 'a[href^="https"]', '[href="#top"]'),
      initial: 1,
    },
  },
  'selector-descendant': {
    name: 'Потомок: a b',
    description:
      'Пробел между селекторами значит «внутри»: `.nest .cell` найдёт все `.cell`, которые лежат внутри `.nest` на любой глубине — в детях, внуках и дальше.',
    example: {
      html: '<div class="box"><div class="cell">1</div><div class="nest"><div class="cell">2</div><div class="cell">3</div></div><div class="cell">4</div></div>',
      css: `${PICK_CSS} .nest { display: flex; gap: 6px; padding: 6px; box-shadow: inset 0 0 0 2px #7c4dff; }`,
      variants: picks('.cell', '.nest .cell'),
      initial: 1,
    },
  },
  'selector-child': {
    name: 'Ребёнок: a > b',
    description:
      'Знак `>` значит «прямо внутри»: `.box > .cell` — только дети `.box`, а не внуки. Пробел ищет на любой глубине, `>` — только на один уровень вниз.',
    example: {
      html: '<div class="box"><div class="cell">1</div><div class="nest"><div class="cell">2</div></div><div class="cell">3</div></div>',
      css: `${PICK_CSS} .nest { display: flex; padding: 6px; box-shadow: inset 0 0 0 2px #7c4dff; }`,
      variants: picks('.box .cell', '.box > .cell'),
      initial: 1,
    },
  },
  'selector-siblings': {
    name: 'Соседи: a + b и a ~ b',
    description:
      '`+` — сосед, который идёт сразу следом: `.mark + .cell`. `~` — все соседи, которые идут после, не обязательно сразу: `.mark ~ .cell`. Оба знака смотрят только вперёд и только среди детей одного родителя.',
    example: {
      html: '<div class="box"><div class="cell">1</div><div class="cell mark">★</div><div class="cell">3</div><div class="cell">4</div><div class="cell">5</div></div>',
      css: `${PICK_CSS} .mark { background: #7c4dff; color: #fff; }`,
      variants: picks('.mark + .cell', '.mark ~ .cell'),
    },
  },

  // ——— Грибные поляны: псевдоклассы ———

  hover: {
    name: ':hover',
    description:
      'Псевдокласс «под мышкой»: правило работает, пока на элемент наведён курсор. Так кнопки и ссылки откликаются на мышь. Наведи мышь на блоки в примере.',
    example: {
      html: cells(3),
      css: PICK_CSS,
      variants: picks('.cell', '.cell:hover'),
      initial: 1,
    },
  },
  'first-child': {
    name: ':first-child и :last-child',
    description: 'Первый и последний ребёнок своего родителя. Если родителей несколько — у каждого свой первый и свой последний.',
    example: {
      html: cells(4),
      css: PICK_CSS,
      variants: picks('.cell:first-child', '.cell:last-child'),
    },
  },
  'nth-child': {
    name: ':nth-child(odd)',
    description:
      'Ребёнок по номеру — номера начинаются с единицы. `:nth-child(2)` — второй, `odd` — нечётные (1, 3, 5…), `even` — чётные (2, 4, 6…). Удобно для полосатых таблиц и списков.',
    example: {
      html: cells(6),
      css: PICK_CSS,
      variants: picks('.cell:nth-child(odd)', '.cell:nth-child(even)', '.cell:nth-child(2)'),
    },
  },
  'nth-child-formula': {
    name: ':nth-child(3n)',
    description:
      'В скобках можно написать формулу: `3n` — каждый третий (3, 6, 9…), `3n+1` — 1, 4, 7…, `n+4` — с четвёртого и дальше. n по очереди становится 0, 1, 2…, а браузер выбирает всех, чей номер подходит.',
    example: {
      html: cells(9),
      css: PICK_CSS,
      variants: picks('.cell:nth-child(3n)', '.cell:nth-child(3n+1)', '.cell:nth-child(n+4)'),
    },
  },
  not: {
    name: ':not()',
    description: '«Кроме»: `.cell:not(.gem)` найдёт все `.cell`, у которых нет класса gem. В скобках — селектор тех, кого исключить.',
    example: {
      html: '<div class="box"><div class="cell">1</div><div class="cell gem">2</div><div class="cell">3</div><div class="cell gem">4</div><div class="cell">5</div></div>',
      css: PICK_CSS,
      variants: picks('.cell', '.cell:not(.gem)'),
      initial: 1,
    },
  },

  // ——— Древо Каскада: каскад и наследование ———

  'cascade-order': {
    name: 'Каскад: кто ниже, тот и прав',
    description:
      'Когда два правила задают одно свойство одному элементу и их селекторы равны по силе, побеждает правило, которое записано ниже. Поэтому порядок правил в CSS важен.',
    example: {
      html: cells(3),
      css: PICK_CSS,
      variants: [
        { label: 'серое ниже', css: '.cell {\n  background: lime;\n}\n\n.cell {\n  background: gray;\n}' },
        { label: 'салатовое ниже', css: '.cell {\n  background: gray;\n}\n\n.cell {\n  background: lime;\n}' },
      ],
      initial: 1,
    },
  },
  specificity: {
    name: 'Специфичность: класс сильнее тега',
    description:
      'Селекторы бывают разной силы. id сильнее класса, класс сильнее тега — и тогда уже неважно, кто ниже: правило с селектором посильнее побеждает всегда.',
    example: {
      html: '<div class="box"><span class="cell">1</span><span class="cell">2</span><span class="cell">3</span></div>',
      css: PICK_CSS,
      variants: [
        { label: 'тег ниже', css: '.cell {\n  background: lime;\n}\n\nspan {\n  background: gray;\n}' },
        { label: 'класс ниже', css: 'span {\n  background: gray;\n}\n\n.cell {\n  background: lime;\n}' },
      ],
    },
  },
  'specificity-count': {
    name: 'Как считать силу селектора',
    description:
      'Силу складывают: каждый id — сотня, каждый класс, атрибут или псевдокласс — десяток, каждый тег — единица. `.box .cell` (20) сильнее `.cell` (10), а `#hero` (100) сильнее любых классов.',
    example: {
      html: '<div class="box"><div class="cell">1</div><div class="cell" id="hero">2</div><div class="cell">3</div></div>',
      css: PICK_CSS,
      variants: [
        { label: '.box .cell против .cell', css: '.box .cell {\n  background: gray;\n}\n\n.cell {\n  background: lime;\n}' },
        { label: '+ #hero', css: '#hero {\n  background: gold;\n}\n\n.box .cell {\n  background: gray;\n}\n\n.cell {\n  background: lime;\n}' },
      ],
    },
  },
  inheritance: {
    name: 'Наследование и inherit',
    description:
      'Некоторые свойства дети берут у родителя: `color`, шрифт, межстрочный интервал. Отступы, рамки и фон не наследуются. Свой цвет у элемента всегда сильнее унаследованного, а значение `inherit` велит взять его у родителя.',
    example: {
      html: '<div class="box"><p>Абзац с <strong>жирным</strong> словом</p><span class="note">свой цвет</span></div>',
      css: '.box { color: #a5a3c4; font: 16px/1.4 system-ui, sans-serif; } .note { color: #fb7185; }',
      variants: [
        { label: 'color у родителя', css: '.box {\n  color: gold;\n}' },
        { label: 'border у родителя', css: '.box {\n  border: 4px solid gold;\n}' },
        { label: 'inherit', css: '.box {\n  color: gold;\n}\n\n.note {\n  color: inherit;\n}' },
      ],
    },
  },
  important: {
    name: '!important',
    description:
      '`!important` после значения ставит объявление выше любой силы селекторов. Перебить его можно только другим `!important` — и начинается война правил. Пользуйся им как можно реже, а лучше — никогда.',
    example: {
      html: '<div class="box"><div class="cell">1</div><div class="cell" id="hero">2</div><div class="cell">3</div></div>',
      css: PICK_CSS,
      variants: [
        { label: 'с !important', css: '.cell {\n  background: gray !important;\n}\n\n#hero {\n  background: lime;\n}' },
        { label: 'без !important', css: '.cell {\n  background: gray;\n}\n\n#hero {\n  background: lime;\n}' },
      ],
    },
  },

  // ——— Казармы: блочная модель ———

  'width-height': {
    name: 'width и height',
    description:
      'Ширина и высота блока. Без них блок растягивается на всю ширину родителя, а в высоту — по содержимому. Значения обычно пишут в пикселях: `160px`.',
    example: {
      html: ONE_ITEM,
      selector: '.item',
      options: ['width: 40px; height: 40px', 'width: 160px; height: 40px', 'width: 100px; height: 100px', 'width: auto; height: auto'],
      initial: 1,
    },
  },
  padding: {
    name: 'padding',
    description:
      'Внутренний отступ — обивка между содержимым и краем блока. Блок становится больше, а содержимое отодвигается от краёв. Одно значение — для всех четырёх сторон.',
    example: {
      html: ONE_ITEM,
      css: FIT_BOX_CSS,
      selector: '.box',
      options: ['padding: 0', 'padding: 8px', 'padding: 24px', 'padding: 40px'],
      initial: 2,
    },
  },
  'padding-sides': {
    name: 'padding: 8px 24px',
    description:
      'Отступы по сторонам. Два значения — «сверху и снизу», потом «слева и справа». Четыре — по часовой стрелке от верха: верх, право, низ, лево. А для одной стороны есть `padding-top`, `padding-right`, `padding-bottom` и `padding-left`.',
    example: {
      html: ONE_ITEM,
      css: FIT_BOX_CSS,
      selector: '.box',
      options: ['padding: 24px', 'padding: 8px 24px', 'padding: 24px 8px', 'padding: 0 40px 24px 0', 'padding-left: 40px'],
      initial: 1,
    },
  },
  border: {
    name: 'border',
    description:
      'Рамка вокруг обивки. В ней три части: толщина, стиль и цвет. Стиль `solid` — сплошная линия, `dashed` — пунктир, `dotted` — точки; без стиля рамки не будет. Рамка тоже прибавляется к размеру блока.',
    example: {
      html: ONE_ITEM,
      css: `${FIT_BOX_CSS} .box { padding: 16px; }`,
      selector: '.box',
      options: ['border: 4px solid #f6c453', 'border: 8px dashed #fb7185', 'border: 6px dotted #34d399', 'border: 12px solid #78716c'],
    },
  },
  margin: {
    name: 'margin',
    description:
      'Внешний отступ — пустое место снаружи от рамки. Он отталкивает соседей и края родителя. Записывается так же, как padding: одно, два или четыре значения, а для одной стороны — `margin-top`, `margin-right`, `margin-bottom`, `margin-left`.',
    example: {
      css: '.box { display: flex; align-items: flex-start; }',
      selector: '.item:nth-child(2)',
      options: ['margin: 0', 'margin: 0 24px', 'margin-left: 48px', 'margin-top: 40px'],
      initial: 1,
    },
  },
  'margin-auto': {
    name: 'margin: 0 auto',
    description:
      'Если внешний отступ слева и справа — `auto`, браузер делит свободное место поровну, и блок встаёт по центру. Работает у блочных элементов с заданной шириной.',
    example: {
      html: ONE_ITEM,
      selector: '.item',
      options: ['margin: 0', 'margin: 0 auto', 'margin-left: auto'],
      initial: 1,
    },
  },
  'box-sizing': {
    name: 'box-sizing: border-box',
    description:
      'По умолчанию `width` и `height` — размеры только содержимого, а обивка и рамка прибавляются сверху. С `box-sizing: border-box` размеры считаются по рамке: блок ровно такой, как написано. Поэтому многие сайты включают его сразу всем элементам.',
    example: {
      html: ONE_ITEM,
      css: '.item { width: 120px; height: 64px; padding: 16px; border: 6px solid #fbbf24; }',
      selector: '.item',
      options: ['box-sizing: content-box', 'box-sizing: border-box'],
      initial: 1,
    },
  },

  // ——— Плац: display ———

  'inline-block': {
    name: 'display: inline-block',
    description:
      'Строчно-блочный элемент: стоит в строке, как слово, но слушается `width`, `height` и отступов со всех сторон. Так удобно делать кнопки, значки и плитки в ряд.',
    example: {
      html: SPAN_ITEMS,
      selector: '.item',
      options: ['display: inline', 'display: inline-block', 'display: block'],
      initial: 1,
    },
  },
  'display-block': {
    name: 'display: block',
    description:
      'Блочный элемент начинается с новой строки и занимает всю ширину родителя, если ширина не задана. Так по умолчанию ведут себя `div`, `p`, `h1`, `ul` и `section`.',
    example: {
      html: SPAN_ITEMS,
      css: '.item { width: auto; height: 32px; }',
      selector: '.item',
      options: ['display: inline', 'display: block'],
      initial: 1,
    },
  },
  'display-inline': {
    name: 'display: inline',
    description:
      'Строчный элемент течёт в строке, как слово в предложении. Его размер — по содержимому: `width`, `height` и отступы сверху и снизу на соседей не действуют. Так по умолчанию ведут себя `span`, `a`, `strong` и `em`.',
    example: {
      html: '<div class="box"><div class="item">Слушайте</div> <div class="item">все:</div> <div class="item">смотр!</div></div>',
      css: '.item { width: auto; height: auto; padding: 4px 8px; }',
      selector: '.item',
      options: ['display: block', 'display: inline'],
      initial: 1,
    },
  },
  visibility: {
    name: 'visibility: hidden',
    description:
      'Прячет элемент, но оставляет его место пустым — соседи не сдвигаются. А `display: none` убирает элемент совсем, вместе с местом. Сравни оба варианта.',
    example: {
      css: '.box { display: flex; gap: 12px; }',
      selector: '.item:nth-child(2)',
      options: ['visibility: visible', 'visibility: hidden', 'display: none'],
      initial: 1,
    },
  },

  // ——— Дозорная башня: позиционирование ———

  'position-relative': {
    name: 'position: relative',
    description:
      'Блок остаётся на своём месте в потоке, но его можно сдвинуть от этого места свойствами `top`, `right`, `bottom` и `left`. Соседи сдвига не замечают: для них блок стоит где стоял.',
    example: {
      css: '.box { display: flex; align-items: center; gap: 12px; }',
      selector: '.item:nth-child(2)',
      options: ['position: static', 'position: relative; top: -32px', 'position: relative; top: 24px; left: 24px'],
      initial: 1,
    },
  },
  'position-absolute': {
    name: 'position: absolute',
    description:
      'Блок выходит из потока — соседи занимают его место — и встаёт по координатам `top`, `right`, `bottom`, `left` от краёв ближайшего предка с `position`. Отрицательные значения выводят блок за край.',
    example: {
      css: '.box { position: relative; display: flex; gap: 12px; }',
      selector: '.item:nth-child(2)',
      options: ['position: static', 'position: absolute; top: 0; right: 0', 'position: absolute; bottom: 0; left: 0'],
      initial: 1,
    },
  },
  'absolute-parent': {
    name: 'Точка отсчёта для absolute',
    description:
      '`absolute` ищет ближайшего предка, у которого есть `position`, и отсчитывает координаты от его краёв. Нет такого предка — от краёв окна. Поэтому родителю пишут `position: relative` без сдвигов: он остаётся на месте и становится точкой отсчёта.',
    example: {
      css: '.box { display: flex; gap: 12px; } .item:nth-child(2) { position: absolute; top: 0; right: 0; }',
      selector: '.box',
      options: ['position: static', 'position: relative'],
      initial: 1,
    },
  },
  'z-index': {
    name: 'z-index',
    description:
      'Кто кого заслоняет. Когда позиционированные блоки заходят друг на друга, сверху тот, кто позже в разметке. `z-index` меняет порядок слоёв: у кого число больше — тот ближе к нам. Работает только у блоков с `position`.',
    example: {
      css: '.box { position: relative; } .item { position: absolute; top: 24px; width: 72px; height: 72px; } .item:nth-child(1) { left: 72px; } .item:nth-child(2) { top: 44px; left: 116px; } .item:nth-child(3) { left: 160px; }',
      selector: '.item:nth-child(1)',
      options: ['z-index: auto', 'z-index: 1'],
      initial: 1,
    },
  },
  'position-fixed': {
    name: 'position: fixed',
    description:
      'Блок прибит к окну браузера: координаты отсчитываются от краёв окна, и при прокрутке страницы он остаётся на месте. Так делают закреплённые шапки, чаты поддержки и кнопку «наверх».',
    example: {
      css: '.box { position: relative; display: flex; gap: 12px; }',
      selector: '.item:nth-child(2)',
      options: ['position: absolute; bottom: 0; right: 0', 'position: fixed; bottom: 0; right: 0'],
      initial: 1,
    },
  },

  // ——— Скриптория: JavaScript ———
  'console-log': {
    name: 'console.log()',
    description:
      'Приказ Оракулу — показать значение в консоли. Текст пишут в кавычках, числа и примеры — без них. Несколько значений через запятую Оракул скажет через пробел. Строки после `//` — заметки для себя: их JavaScript пропускает.',
    example: {
      scripts: [
        { label: 'текст', code: "console.log('Привет, Скриптория!');" },
        { label: 'число', code: 'console.log(42);' },
        { label: 'через запятую', code: "console.log('Кристаллов:', 5);" },
        { label: 'заметка', code: "// console.log('Эту строку Оракул не услышит');\nconsole.log('А эту — услышит');" },
      ],
    },
  },
  'numbers-strings': {
    name: 'Числа и строки',
    description:
      'Число пишут без кавычек — с ним можно считать. Строка — текст в кавычках `\'…\'` или `"…"`: её повторяют как есть. Если сложить строку и число, JavaScript склеит их в строку: `\'7\' + 5` даёт `\'75\'`, а не 12.',
    example: {
      scripts: [
        { label: '7 + 5', code: 'console.log(7 + 5);' },
        { label: "'7 + 5'", code: "console.log('7 + 5');" },
        { label: "'7' + 5", code: "console.log('7' + 5);" },
        { label: "'7' + '5'", code: "console.log('7' + '5');" },
      ],
    },
  },
  let: {
    name: 'let',
    description:
      'Создаёт переменную — колбу с этикеткой: `let gems = 5;`. Потом колбу зовут по имени, без кавычек: `console.log(gems)`. С кавычками получится просто слово.',
    example: {
      scripts: [
        { label: 'по имени', code: 'let gems = 5;\nconsole.log(gems);' },
        { label: 'в кавычках', code: "let gems = 5;\nconsole.log('gems');" },
        { label: 'две колбы', code: "let hero = 'Странник';\nlet gems = 5;\nconsole.log(hero, gems);" },
      ],
    },
  },
  assignment: {
    name: 'Присваивание =',
    description:
      'Знак `=` наливает новое значение в колбу, которая уже есть, — `let` второй раз не пишут. Справа можно взять старое значение: `gems = gems + 3`. Коротко то же самое: `gems += 3`.',
    example: {
      scripts: [
        { label: 'gems = gems + 3', code: 'let gems = 5;\ngems = gems + 3;\nconsole.log(gems);' },
        { label: 'gems += 3', code: 'let gems = 5;\ngems += 3;\nconsole.log(gems);' },
        { label: 'просто = 3', code: 'let gems = 5;\ngems = 3;\nconsole.log(gems);' },
      ],
    },
  },
  const: {
    name: 'const',
    description:
      'Запечатанная колба: `const` объявляет переменную, которую нельзя изменить. Попробуешь налить новое значение — ошибка. Всё, что не меняется (цена, имя, скорость), запечатывают в `const`, а то, что меняется, — объявляют через `let`.',
    example: {
      scripts: [
        { label: 'const', code: 'const price = 12;\nconsole.log(price);' },
        { label: 'попробовать изменить', code: 'const price = 12;\nprice = 10;\nconsole.log(price);' },
        { label: 'let меняется', code: 'let coins = 50;\ncoins = coins - 12;\nconsole.log(coins);' },
      ],
    },
  },
  naming: {
    name: 'Имена переменных',
    description:
      'Имя — одно слово латиницей: буквы, цифры, `_` и `$`, но не с цифры и без пробелов. Большие и маленькие буквы различаются: `gems` и `Gems` — разные колбы. Длинные имена склеивают «верблюдом»: `magicPower`, `secondGem`.',
    example: {
      scripts: [
        { label: 'magicPower', code: 'let magicPower = 100;\nconsole.log(magicPower);' },
        { label: 'gems и Gems', code: 'let gems = 5;\nlet Gems = 7;\nconsole.log(gems, Gems);' },
        { label: 'gem2', code: "let gem2 = 'ruby';\nconsole.log(gem2);" },
      ],
    },
  },
  arithmetic: {
    name: 'Арифметика: + - * / %',
    description:
      'Сложение `+`, вычитание `-`, умножение `*`, деление `/` и остаток от деления `%`: `17 % 5` — это 2. Умножение и деление выполняются раньше сложения и вычитания, как в математике, а скобки меняют порядок.',
    example: {
      scripts: [
        { label: '7 * 3', code: 'console.log(7 * 3);' },
        { label: '17 / 5', code: 'console.log(17 / 5);' },
        { label: '17 % 5', code: 'console.log(17 % 5);' },
        { label: '2 + 3 * 4', code: 'console.log(2 + 3 * 4);' },
        { label: '(2 + 3) * 4', code: 'console.log((2 + 3) * 4);' },
      ],
    },
  },
  concat: {
    name: 'Склеивание строк +',
    description:
      'Плюс между строками склеивает их в одну — вплотную, без пробела: `\'Лавка\' + \'Алхимика\'` даёт `\'ЛавкаАлхимика\'`. Пробел приклеивают отдельной строкой: `shop + \' \' + owner`. Если хоть одна часть — строка, плюс склеивает и числа: `\'Зелий: \' + 3` даёт `\'Зелий: 3\'`.',
    example: {
      scripts: [
        { label: 'без пробела', code: "let shop = 'Лавка';\nlet owner = 'Алхимика';\nconsole.log(shop + owner);" },
        { label: 'с пробелом', code: "let shop = 'Лавка';\nlet owner = 'Алхимика';\nconsole.log(shop + ' ' + owner);" },
        { label: 'строка + число', code: "console.log('Зелий: ' + 3);" },
      ],
      initial: 1,
    },
  },
  template: {
    name: 'Шаблонные строки',
    description:
      'Строка в обратных кавычках `` ` `` (клавиша Ё в английской раскладке) — шаблон: `${…}` внутри него подставляет значение колбы или результат вычисления. `` `Зелье: ${price} монет` `` — без плюсов и лишних кавычек. В обычных кавычках `${…}` остаётся просто текстом.',
    example: {
      scripts: [
        { label: 'шаблон', code: 'let price = 12;\nconsole.log(`Зелье: ${price} монет`);' },
        { label: 'вычисление внутри', code: 'let price = 12;\nconsole.log(`Три зелья: ${price * 3} монет`);' },
        { label: 'в обычных кавычках', code: "let price = 12;\nconsole.log('Зелье: ${price} монет');" },
      ],
    },
  },
  typeof: {
    name: 'typeof',
    description:
      'Называет тип значения: `typeof 42` — `number`, `typeof \'42\'` — `string`, `typeof true` — `boolean`, а у пустой колбы — `undefined`. Прежде чем смешивать значения, узнай, что в колбе.',
    example: {
      scripts: [
        { label: '42', code: 'console.log(typeof 42);' },
        { label: "'42'", code: "console.log(typeof '42');" },
        { label: 'true', code: 'console.log(typeof true);' },
        { label: 'пустая колба', code: 'let box;\nconsole.log(typeof box);' },
      ],
    },
  },
  'to-number': {
    name: 'Number()',
    description:
      'Превращает строку в число: `Number(\'5\')` — это 5, с ним можно считать. Плюс со строками склеивает — `\'5\' + \'3\'` даёт `\'53\'`, а с числами складывает. Минус, умножение и деление превращают строки в числа сами: `\'5\' * 2` — это 10.',
    example: {
      scripts: [
        { label: "'5' + '3'", code: "console.log('5' + '3');" },
        { label: 'Number', code: "console.log(Number('5') + Number('3'));" },
        { label: "'5' * 2", code: "console.log('5' * 2);" },
        { label: "'5' - 2", code: "console.log('5' - 2);" },
      ],
      initial: 1,
    },
  },
  nan: {
    name: 'NaN и parseInt()',
    description:
      '`NaN` — «не число»: так выходит, когда `Number` не может прочесть строку, например `Number(\'12 монет\')`. Всё, что смешали с `NaN`, тоже становится `NaN`, а `typeof NaN` — всё равно `number`. `parseInt(\'12 монет\')` читает целое число в начале строки — 12.',
    example: {
      scripts: [
        { label: "Number('12 монет')", code: "console.log(Number('12 монет'));" },
        { label: 'NaN * 3', code: "console.log(Number('12 монет') * 3);" },
        { label: "parseInt('12 монет')", code: "console.log(parseInt('12 монет'));" },
        { label: 'typeof NaN', code: 'console.log(typeof NaN);' },
      ],
    },
  },
  alert: {
    name: 'alert()',
    description:
      'Показывает окно с сообщением — его видит каждый, кто открыл страницу. А `console.log` пишет в консоль, которую видит только разработчик. Пока окно открыто, код ждёт, когда его закроют.',
    example: {
      scripts: [
        { label: 'alert', code: "alert('Динь-дон! Добро пожаловать!');" },
        { label: 'с шаблоном', code: "let guest = 'Лира';\nalert(`Добро пожаловать, ${guest}!`);" },
        { label: 'console.log', code: "console.log('Запись в журнал лавки');" },
      ],
    },
  },
  prompt: {
    name: 'prompt()',
    description:
      'Задаёт вопрос в окне с полем ввода и возвращает ответ — всегда строкой: `let guest = prompt(\'Как тебя зовут?\');`. Если нажать «Отмена», вернётся `null`. Число из ответа получают через `Number(…)`.',
    example: {
      scripts: [
        { label: 'ответ «Лира»', code: "let guest = prompt('Как тебя зовут?');\nconsole.log(`Гость: ${guest}`);", inputs: ['Лира'] },
        { label: 'ответ «3»', code: "let count = prompt('Сколько зелий?');\nconsole.log(count + 1);", inputs: ['3'] },
        { label: 'Number', code: "let count = Number(prompt('Сколько зелий?'));\nconsole.log(count + 1);", inputs: ['3'] },
        { label: 'Отмена', code: "let guest = prompt('Как тебя зовут?');\nconsole.log(guest);" },
      ],
    },
  },
};
