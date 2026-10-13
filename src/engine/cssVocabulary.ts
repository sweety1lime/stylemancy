/** Ключевые слова популярных свойств — для подсказок «может, ты имел в виду…». */
export const KEYWORDS: Record<string, string[]> = {
  display: ['block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'none', 'contents', 'flow-root'],
  'justify-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'start', 'end', 'left', 'right', 'normal', 'stretch'],
  'align-items': ['flex-start', 'flex-end', 'center', 'baseline', 'stretch', 'start', 'end', 'normal'],
  'align-content': ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly', 'stretch', 'start', 'end', 'normal'],
  'align-self': ['auto', 'flex-start', 'flex-end', 'center', 'baseline', 'stretch', 'start', 'end'],
  'justify-items': ['start', 'end', 'center', 'stretch', 'left', 'right', 'normal', 'baseline'],
  'justify-self': ['auto', 'start', 'end', 'center', 'stretch', 'left', 'right', 'normal', 'baseline'],
  'flex-direction': ['row', 'row-reverse', 'column', 'column-reverse'],
  'flex-wrap': ['nowrap', 'wrap', 'wrap-reverse'],
  'grid-auto-flow': ['row', 'column', 'dense'],
  position: ['static', 'relative', 'absolute', 'fixed', 'sticky'],
  'box-sizing': ['content-box', 'border-box'],
  'text-align': ['left', 'right', 'center', 'justify', 'start', 'end'],
  overflow: ['visible', 'hidden', 'scroll', 'auto', 'clip'],
  float: ['left', 'right', 'none'],
  'font-weight': ['normal', 'bold', 'bolder', 'lighter'],
  'font-style': ['normal', 'italic', 'oblique'],
  'text-decoration': ['none', 'underline', 'overline', 'line-through'],
  visibility: ['visible', 'hidden', 'collapse'],
};

/** «Народные» значения, которых нет в CSS, и их правильные варианты. */
export const SYNONYMS: Record<string, string> = {
  middle: 'center',
  centre: 'center',
  centered: 'center',
  horizontal: 'row',
  vertical: 'column',
};

/** Частые свойства — первые кандидаты для подсказки при опечатке в названии. */
export const COMMON_PROPERTIES = [
  'display', 'position', 'top', 'right', 'bottom', 'left', 'inset', 'z-index', 'float', 'clear',
  'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'border-radius',
  'border-width', 'border-style', 'border-color', 'outline', 'box-sizing', 'box-shadow',
  'overflow', 'overflow-x', 'overflow-y', 'color', 'background', 'background-color',
  'background-image', 'background-size', 'background-position', 'background-repeat',
  'opacity', 'visibility', 'font', 'font-family', 'font-size', 'font-weight', 'font-style',
  'line-height', 'letter-spacing', 'text-align', 'text-decoration', 'text-transform',
  'text-shadow', 'white-space', 'vertical-align', 'list-style', 'cursor', 'transition',
  'transform', 'animation', 'flex', 'flex-direction', 'flex-wrap', 'flex-flow', 'flex-grow',
  'flex-shrink', 'flex-basis', 'justify-content', 'align-items', 'align-content', 'align-self',
  'justify-items', 'justify-self', 'place-items', 'place-content', 'place-self', 'order',
  'gap', 'row-gap', 'column-gap', 'grid', 'grid-template', 'grid-template-columns',
  'grid-template-rows', 'grid-template-areas', 'grid-area', 'grid-column', 'grid-column-start',
  'grid-column-end', 'grid-row', 'grid-row-start', 'grid-row-end', 'grid-auto-flow',
  'grid-auto-columns', 'grid-auto-rows', 'object-fit', 'aspect-ratio',
];
