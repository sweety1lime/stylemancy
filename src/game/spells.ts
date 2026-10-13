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
};
