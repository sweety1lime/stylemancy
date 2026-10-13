/** Живой пример заклинания: варианты объявлений подставляются в одно правило. */
export interface SpellExample {
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

export interface Spell {
  name: string;
  description: string;
  example: SpellExample;
}

const NINE_ITEMS = `<div class="box">${Array.from({ length: 9 }, (_, i) => `<div class="item">${i + 1}</div>`).join('')}</div>`;

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
};
