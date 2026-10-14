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

export type SpellExample = ValueExample | WidthExample;

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
};
