export interface Spell {
  name: string;
  description: string;
}

/** Заклинания гримуара. Ключ — поле learns в уровне. */
export const SPELLS: Record<string, Spell> = {
  'display-flex': {
    name: 'display: flex',
    description:
      'Превращает элемент во флекс-контейнер: его дочерние элементы выстраиваются вдоль главной оси — по умолчанию в ряд, слева направо.',
  },
  'justify-content': {
    name: 'justify-content',
    description:
      'Распределяет элементы вдоль главной оси: `flex-start` — к началу, `center` — по центру, `flex-end` — к концу.',
  },
  'space-between': {
    name: 'justify-content: space-between',
    description: 'Крайние элементы прижимаются к краям контейнера, а свободное место делится поровну между соседями.',
  },
  'align-items': {
    name: 'align-items',
    description:
      'Выравнивает элементы поперёк главной оси: `flex-start` — к началу, `center` — по центру, `flex-end` — к концу, `stretch` — растягивает на всю высоту.',
  },
  'flex-centering': {
    name: 'justify-content + align-items: center',
    description: 'Классический способ поставить содержимое точно в центр контейнера — по обеим осям сразу.',
  },
  'flex-direction': {
    name: 'flex-direction',
    description:
      'Поворачивает главную ось: `row` — слева направо, `column` — сверху вниз, `row-reverse` и `column-reverse` — в обратную сторону.',
  },
  'flex-axes': {
    name: 'Главная и поперечная оси',
    description:
      '`justify-content` всегда работает вдоль главной оси, а `align-items` — поперёк неё. Поверни ось через `flex-direction` — и они поменяются направлениями.',
  },
  gap: {
    name: 'gap',
    description: 'Задаёт промежутки между флекс-элементами — только между соседями, не у краёв контейнера.',
  },
  'flex-wrap': {
    name: 'flex-wrap',
    description:
      '`wrap` разрешает переносить элементы на новую строку, когда им не хватает места. По умолчанию `nowrap`: все в одну строку, даже если приходится сжиматься.',
  },
  order: {
    name: 'order',
    description: 'Меняет место элемента в строю, не трогая HTML: чем меньше `order`, тем раньше. По умолчанию у всех 0.',
  },
  'align-self': {
    name: 'align-self',
    description: 'Выравнивание поперёк главной оси для одного элемента — перекрывает `align-items` контейнера.',
  },
  'flex-grow': {
    name: 'flex-grow',
    description:
      'Сколько свободного места забирает элемент. `flex-grow: 1` — растянуться на всё свободное место; если растут несколько элементов, место делится пропорционально.',
  },
};
