/** Все теги HTML, которые понимает браузер (кроме совсем экзотических). */
export const KNOWN_TAGS = [
  'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'blockquote', 'body', 'br',
  'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn',
  'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label',
  'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'meta', 'meter', 'nav', 'noscript', 'object', 'ol', 'optgroup',
  'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'script', 'search',
  'section', 'select', 'slot', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'svg', 'table',
  'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u', 'ul', 'var',
  'video', 'wbr',
];

/** Устаревшие теги: браузер их ещё понимает, но так больше не пишут. */
export const OBSOLETE_TAGS: Record<string, string> = {
  center: 'Тег <center> устарел: выравнивают через CSS — text-align: center.',
  font: 'Тег <font> устарел: шрифт и цвет задают через CSS.',
  big: 'Тег <big> устарел: размер текста задают через CSS.',
  strike: 'Тег <strike> устарел: зачёркнутый текст — это <s> или <del>.',
  tt: 'Тег <tt> устарел: моноширинный текст — это <code> или <kbd>.',
  marquee: 'Тег <marquee> устарел: бегущую строку сейчас делают через CSS-анимацию.',
  blink: 'Тег <blink> давно не работает ни в одном браузере.',
  frame: 'Тег <frame> устарел.',
  frameset: 'Тег <frameset> устарел.',
  acronym: 'Тег <acronym> устарел: используйте <abbr>.',
};

/** Одиночные теги: у них нет закрывающей пары. */
export const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** Теги, которые живут в <head>, а не на видимой странице. */
export const HEAD_TAGS = new Set(['title', 'meta', 'link', 'base', 'style']);

/** Блоки, которые не могут стоять внутри абзаца <p>: браузер закроет абзац перед ними. */
export const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'div', 'dl', 'fieldset', 'figcaption', 'figure',
  'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'main', 'menu', 'nav', 'ol', 'p',
  'pre', 'search', 'section', 'table', 'ul',
]);

export const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

/** Частые выдуманные теги → настоящие. */
export const TAG_SYNONYMS: Record<string, string> = {
  bold: 'strong',
  italic: 'em',
  image: 'img',
  photo: 'img',
  paragraph: 'p',
  text: 'p',
  list: 'ul',
  item: 'li',
  heading: 'h1',
  break: 'br',
  line: 'hr',
  url: 'a',
  textbox: 'input',
  field: 'input',
  checkbox: 'input',
  radio: 'input',
  dropdown: 'select',
  submit: 'button',
  bottom: 'footer',
  top: 'header',
  content: 'main',
  sidebar: 'aside',
  block: 'div',
  container: 'div',
  row: 'tr',
  cell: 'td',
  quote: 'blockquote',
};

/** Типы полей ввода — для подсказки при опечатке в type. */
export const INPUT_TYPES = [
  'text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local', 'month', 'week',
  'color', 'range', 'checkbox', 'radio', 'file', 'submit', 'reset', 'button', 'hidden', 'image',
];

/** Атрибуты, которые можно писать любому тегу. */
export const GLOBAL_ATTRIBUTES = [
  'id', 'class', 'style', 'title', 'lang', 'dir', 'hidden', 'tabindex', 'accesskey', 'contenteditable', 'draggable',
  'spellcheck', 'translate', 'inert', 'popover', 'role', 'autocapitalize', 'enterkeyhint', 'inputmode', 'nonce', 'part',
  'slot', 'autofocus', 'itemscope', 'itemtype', 'itemprop', 'itemid', 'itemref', 'is',
];

/** Свои атрибуты у тегов. Остальные теги умеют только глобальные. */
export const TAG_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'target', 'rel', 'download', 'hreflang', 'type', 'referrerpolicy', 'ping'],
  area: ['alt', 'coords', 'shape', 'href', 'target', 'rel', 'download', 'referrerpolicy'],
  audio: ['src', 'controls', 'autoplay', 'loop', 'muted', 'preload', 'crossorigin'],
  base: ['href', 'target'],
  blockquote: ['cite'],
  button: ['type', 'name', 'value', 'disabled', 'form', 'formaction', 'formmethod', 'formnovalidate', 'formtarget', 'popovertarget', 'popovertargetaction'],
  canvas: ['width', 'height'],
  col: ['span'],
  colgroup: ['span'],
  data: ['value'],
  del: ['cite', 'datetime'],
  details: ['open', 'name'],
  dialog: ['open'],
  embed: ['src', 'type', 'width', 'height'],
  fieldset: ['disabled', 'form', 'name'],
  form: ['action', 'method', 'enctype', 'target', 'novalidate', 'autocomplete', 'name', 'accept-charset', 'rel'],
  html: ['xmlns', 'manifest'],
  iframe: ['src', 'srcdoc', 'name', 'width', 'height', 'allow', 'allowfullscreen', 'loading', 'referrerpolicy', 'sandbox'],
  img: ['src', 'alt', 'width', 'height', 'srcset', 'sizes', 'loading', 'decoding', 'crossorigin', 'usemap', 'ismap', 'referrerpolicy', 'fetchpriority'],
  input: [
    'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly', 'checked', 'min', 'max', 'step',
    'minlength', 'maxlength', 'pattern', 'size', 'autocomplete', 'list', 'multiple', 'accept', 'form', 'src', 'alt',
    'width', 'height', 'capture', 'dirname', 'formaction', 'formmethod', 'formnovalidate', 'formtarget',
  ],
  ins: ['cite', 'datetime'],
  label: ['for', 'form'],
  li: ['value'],
  link: ['href', 'rel', 'type', 'media', 'sizes', 'crossorigin', 'as', 'hreflang', 'integrity', 'referrerpolicy'],
  meta: ['charset', 'name', 'content', 'http-equiv', 'property', 'media'],
  meter: ['value', 'min', 'max', 'low', 'high', 'optimum'],
  object: ['data', 'type', 'name', 'width', 'height', 'form'],
  ol: ['start', 'reversed', 'type'],
  optgroup: ['label', 'disabled'],
  option: ['value', 'selected', 'disabled', 'label'],
  output: ['for', 'form', 'name'],
  progress: ['value', 'max'],
  q: ['cite'],
  script: ['src', 'type', 'async', 'defer', 'crossorigin', 'integrity', 'nomodule', 'referrerpolicy'],
  select: ['name', 'required', 'disabled', 'multiple', 'size', 'form', 'autocomplete'],
  slot: ['name'],
  source: ['src', 'type', 'srcset', 'sizes', 'media', 'width', 'height'],
  style: ['media'],
  td: ['colspan', 'rowspan', 'headers'],
  textarea: ['name', 'rows', 'cols', 'placeholder', 'required', 'disabled', 'readonly', 'maxlength', 'minlength', 'wrap', 'form', 'autocomplete', 'dirname'],
  th: ['colspan', 'rowspan', 'headers', 'scope', 'abbr'],
  time: ['datetime'],
  track: ['src', 'kind', 'srclang', 'label', 'default'],
  video: ['src', 'controls', 'autoplay', 'loop', 'muted', 'poster', 'preload', 'width', 'height', 'playsinline', 'crossorigin'],
};

/** Где может стоять тег: родители, без которых он не работает. */
export const REQUIRED_PARENTS: Record<string, { parents: string[]; message: string }> = {
  li: { parents: ['ul', 'ol', 'menu'], message: '<li> — пункт списка: он живёт только внутри <ul> или <ol>.' },
  tr: { parents: ['table', 'thead', 'tbody', 'tfoot'], message: '<tr> — строка таблицы: она стоит внутри <table>.' },
  td: { parents: ['tr'], message: '<td> — ячейка: она стоит внутри строки <tr>.' },
  th: { parents: ['tr'], message: '<th> — ячейка-заголовок: она стоит внутри строки <tr>.' },
  thead: { parents: ['table'], message: '<thead> стоит внутри <table>.' },
  tbody: { parents: ['table'], message: '<tbody> стоит внутри <table>.' },
  tfoot: { parents: ['table'], message: '<tfoot> стоит внутри <table>.' },
  caption: { parents: ['table'], message: '<caption> — подпись таблицы: она стоит внутри <table>.' },
  option: { parents: ['select', 'datalist', 'optgroup'], message: '<option> — вариант выбора: он стоит внутри <select>.' },
  optgroup: { parents: ['select'], message: '<optgroup> стоит внутри <select>.' },
  figcaption: { parents: ['figure'], message: '<figcaption> — подпись к <figure>: она стоит внутри <figure>.' },
  legend: { parents: ['fieldset'], message: '<legend> — заголовок группы полей: он стоит внутри <fieldset>.' },
  dt: { parents: ['dl', 'div'], message: '<dt> стоит внутри списка определений <dl>.' },
  dd: { parents: ['dl', 'div'], message: '<dd> стоит внутри списка определений <dl>.' },
  summary: { parents: ['details'], message: '<summary> стоит внутри <details>.' },
};

/** Кто может стоять прямо внутри тега — остальное браузер переставит по-своему. */
export const ALLOWED_CHILDREN: Record<string, { children: string[]; message: string }> = {
  ul: { children: ['li', 'script', 'template'], message: 'Внутри <ul> сразу идут только пункты <li>.' },
  ol: { children: ['li', 'script', 'template'], message: 'Внутри <ol> сразу идут только пункты <li>.' },
  tr: { children: ['td', 'th', 'script', 'template'], message: 'Внутри строки <tr> — только ячейки <td> и <th>.' },
  table: {
    children: ['caption', 'colgroup', 'thead', 'tbody', 'tfoot', 'tr', 'script', 'template'],
    message: 'Внутри <table> идут строки <tr> (или <thead>, <tbody>), а уже в них — ячейки.',
  },
  select: { children: ['option', 'optgroup', 'hr', 'script', 'template'], message: 'Внутри <select> — только варианты <option>.' },
};
