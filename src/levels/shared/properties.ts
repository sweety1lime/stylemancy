/** Свойства Flexbox — магия Парящих островов. */
export const FLEX_PROPERTIES = [
  'display',
  'flex-direction',
  'flex-wrap',
  'flex-flow',
  'justify-content',
  'align-items',
  'align-content',
  'align-self',
  'place-content',
  'order',
  'gap',
  'row-gap',
  'column-gap',
  'flex',
  'flex-grow',
  'flex-shrink',
  'flex-basis',
];

/** Свойства Grid — магия Витражной обители. */
export const GRID_PROPERTIES = [
  'display',
  'grid',
  'grid-template',
  'grid-template-columns',
  'grid-template-rows',
  'grid-template-areas',
  'grid-auto-columns',
  'grid-auto-rows',
  'grid-auto-flow',
  'grid-column',
  'grid-column-start',
  'grid-column-end',
  'grid-row',
  'grid-row-start',
  'grid-row-end',
  'grid-area',
  'gap',
  'row-gap',
  'column-gap',
  'grid-gap',
  'grid-row-gap',
  'grid-column-gap',
  'justify-items',
  'align-items',
  'place-items',
  'justify-content',
  'align-content',
  'place-content',
  'justify-self',
  'align-self',
  'place-self',
  'order',
];

/** Адаптив: Flexbox и Grid вместе. */
export const LAYOUT_PROPERTIES = [...new Set([...FLEX_PROPERTIES, ...GRID_PROPERTIES])];

/** Блочная модель — магия Казарм: размеры, отступы и рамки. */
export const BOX_PROPERTIES = [
  'width',
  'height',
  'min-width',
  'max-width',
  'min-height',
  'max-height',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'padding-block',
  'padding-inline',
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'margin-block',
  'margin-inline',
  'border',
  'border-width',
  'border-style',
  'border-color',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-radius',
  'box-sizing',
];

/** Плац: как блоки встают в строй — display и visibility плюс блочная модель. */
export const DISPLAY_PROPERTIES = [...BOX_PROPERTIES, 'display', 'visibility'];

/** Дозорная башня: позиционирование плюс всё, что было раньше. */
export const POSITION_PROPERTIES = [...DISPLAY_PROPERTIES, 'position', 'top', 'right', 'bottom', 'left', 'inset', 'z-index'];
