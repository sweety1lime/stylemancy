import { BASE_PAGE_CSS } from '../engine/htmlCheck';
import { LAND_LIMITS } from './model';

/*
  Безопасность «Моей земли». Страницу игрока может открыть другой человек по ссылке, а проверить её между ними некому:
  сервера нет. Поэтому защита в два слоя.

  1. Санитайзер (этот файл) пересобирает разметку и стили только из разрешённого: никакого кода, форм, чужих страниц,
     внешних адресов. Он запускается и в редакторе, и в окне получателя заново: данным из ссылки доверять нельзя.
  2. Страница показывается в iframe с пустым sandbox (ни скриптов, ни форм, ни переходов) и политикой CSP,
     которая запрещает любые загрузки, кроме картинок из библиотеки игры.

  Если санитайзер что-то пропустит, второй слой всё равно не даст странице ни выполнить код, ни сходить в сеть.
  Всё, что убрано, объясняется по-русски: игрок видит, почему его тег или адрес не работает.
*/

const HTML_NS = 'http://www.w3.org/1999/xhtml';
const SVG_NS = 'http://www.w3.org/2000/svg';

/** Предел на всю землю: не даём построить «бомбу» из тысяч вложенных элементов */
const MAX_ELEMENTS = 700;
const MAX_DEPTH = 40;
const MAX_RULES = 400;
const MAX_NOTES = 10;
/** Разметка пересобирается, пока не перестанет меняться: защита от мутаций при повторном разборе */
const MAX_PASSES = 5;

/** Картинки земли: имя файла → адрес картинки в самом документе (data:) */
export type LandImages = Record<string, string>;

export interface SafeLand {
  /** Безопасное содержимое <body>. Картинки — по именам из библиотеки */
  html: string;
  /** Безопасный CSS. В библиотечных картинках — имена файлов */
  css: string;
  /** Что игра убрала, по-русски */
  notes: string[];
}

/* ——— Что разрешено ——— */

const HTML_TAGS = new Set(
  (
    'div span section article aside header footer main nav figure figcaption details summary address hgroup blockquote pre hr br wbr ' +
    'h1 h2 h3 h4 h5 h6 p a abbr b bdi bdo cite code data dfn em i kbd mark q rp rt ruby s samp small strong sub sup time u var del ins ' +
    'ul ol li dl dt dd menu table caption colgroup col thead tbody tfoot tr th td img ' +
    'form fieldset legend label input textarea select optgroup option button output progress meter'
  ).split(' '),
);

/** Теги SVG с учётом регистра: в разметке HTML парсер возвращает им «родные» имена */
const SVG_TAGS = new Set(
  'svg g defs path circle ellipse rect line polyline polygon text tspan title desc linearGradient radialGradient stop clipPath mask pattern'.split(' '),
);

/** Эти теги убираются вместе с содержимым. Остальные неизвестные теги теряют только сам тег, а текст остаётся */
const DROPPED: Record<string, string> = {
  script: 'в землях код не запускается, они строятся из HTML и CSS',
  style: 'стили пишутся во вкладке CSS',
  link: 'внешних файлов в землях нет',
  meta: 'в земле нет заголовка документа',
  base: 'в земле нет заголовка документа',
  title: 'название земли задаётся над редактором',
  head: 'в земле нет заголовка документа',
  iframe: 'чужие страницы в землю не вставляются',
  frame: 'чужие страницы в землю не вставляются',
  frameset: 'чужие страницы в землю не вставляются',
  object: 'чужое содержимое в землю не вставляется',
  embed: 'чужое содержимое в землю не вставляется',
  applet: 'чужое содержимое в землю не вставляется',
  audio: 'звук и видео в землях не работают',
  video: 'звук и видео в землях не работают',
  canvas: 'холст рисуется кодом, а кода в землях нет',
  template: 'шаблонам нужен код',
  noscript: 'в землях нет скриптов',
  map: 'карты-картинки ведут по ссылкам, а ссылок наружу нет',
  area: 'карты-картинки ведут по ссылкам, а ссылок наружу нет',
  source: 'в землях нет звука и видео',
  track: 'в землях нет звука и видео',
  param: 'чужое содержимое в землю не вставляется',
  portal: 'чужие страницы в землю не вставляются',
  xmp: 'так больше не пишут',
  plaintext: 'так больше не пишут',
  noembed: 'так больше не пишут',
  noframes: 'так больше не пишут',
};

const GLOBAL_ATTRIBUTES = new Set(['id', 'class', 'title', 'lang', 'dir', 'role', 'hidden', 'style']);

/** Свои атрибуты у тегов: остальное отбрасывается */
const TAG_ATTRIBUTES: Record<string, string[]> = {
  a: ['href'],
  img: ['src', 'alt', 'width', 'height'],
  td: ['colspan', 'rowspan', 'headers'],
  th: ['colspan', 'rowspan', 'scope', 'headers', 'abbr'],
  col: ['span'],
  colgroup: ['span'],
  ol: ['start', 'reversed', 'type'],
  li: ['value'],
  time: ['datetime'],
  data: ['value'],
  details: ['open'],
  label: ['for'],
  form: ['name', 'autocomplete', 'novalidate'],
  fieldset: ['disabled', 'name'],
  input: [
    'type', 'name', 'value', 'placeholder', 'checked', 'disabled', 'readonly', 'required', 'min', 'max', 'step',
    'minlength', 'maxlength', 'size', 'pattern', 'autocomplete', 'multiple',
  ],
  button: ['type', 'name', 'value', 'disabled'],
  textarea: ['name', 'rows', 'cols', 'placeholder', 'disabled', 'readonly', 'required', 'minlength', 'maxlength', 'wrap'],
  select: ['name', 'multiple', 'size', 'disabled', 'required'],
  option: ['value', 'selected', 'disabled', 'label'],
  optgroup: ['label', 'disabled'],
  output: ['for', 'name'],
  progress: ['value', 'max'],
  meter: ['value', 'min', 'max', 'low', 'high', 'optimum'],
};

/** Поля ввода: те, что просто что-то показывают или отмечают. Пароли, файлы и скрытые поля земле ни к чему */
const INPUT_TYPES = new Set([
  'text', 'email', 'search', 'tel', 'url', 'number', 'range', 'color', 'date', 'time', 'datetime-local', 'month', 'week',
  'checkbox', 'radio', 'button', 'submit', 'reset',
]);
const BUTTON_TYPES = new Set(['button', 'submit', 'reset']);

const SVG_ATTRIBUTES = new Set(
  (
    'id class style viewBox preserveAspectRatio width height x y x1 y1 x2 y2 cx cy r rx ry fx fy d points ' +
    'fill fill-opacity fill-rule stroke stroke-width stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset stroke-opacity stroke-miterlimit ' +
    'opacity transform offset stop-color stop-opacity gradientUnits gradientTransform spreadMethod patternUnits patternTransform maskUnits ' +
    'clipPathUnits clip-path clip-rule mask text-anchor font-size font-family font-weight font-style letter-spacing dominant-baseline dx dy ' +
    'role aria-label aria-hidden aria-labelledby aria-describedby'
  ).split(' '),
);

/** Какие функции CSS могут что-то загрузить или выполнить. Из них пропускаются только url(#якорь) и url(картинка_из_библиотеки) */
const FORBIDDEN_CSS = /(?:^|[^\w-])(?:url|image|image-set|-webkit-image-set|cross-fade|-webkit-cross-fade|element|-moz-element|paint|src)\s*\(|expression\s*\(|javascript:|vbscript:/i;

/* ——— Общее ——— */

interface Context {
  /** Библиотека картинок: по имени файла */
  images: LandImages;
  /** Что убрано, без повторов */
  notes: Set<string>;
  elements: number;
  rules: number;
}

function newContext(images: LandImages): Context {
  return { images, notes: new Set(), elements: 0, rules: 0 };
}

function note(ctx: Context, message: string) {
  ctx.notes.add(message);
}

function has(images: LandImages, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(images, name);
}

/** Имя файла без пути, в нижнем регистре: «img/House.PNG» → «house.png» */
function fileName(path: string): string {
  return path.trim().split(/[/\\]/).pop()?.toLowerCase() ?? '';
}

/** Коротко показать кусок кода игроку */
function brief(value: string): string {
  const text = value.replace(/\s+/g, ' ').trim();
  return text.length > 36 ? `${text.slice(0, 36)}…` : text;
}

/** Служебные символы в значениях не нужны ни одному атрибуту */
function stripControls(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
}

/* ——— CSS ——— */

/** Разделить по знаку вне строк и скобок */
function splitTopLevel(text: string, separator: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote = '';
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\\') {
      i++;
    } else if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    } else if (char === separator && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** CSS допускает «u\72l(» вместо «url(»: перед проверкой раскрываем все такие записи */
function unescapeCss(value: string): string {
  return value
    .replace(/\\([0-9a-fA-F]{1,6})[ \t\n\r\f]?/g, (_whole, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '�';
    })
    .replace(/\\([^0-9a-fA-F\n])/g, '$1');
}

const URL_CALL = /url\(\s*(["']?)([^"')]*)\1\s*\)/gi;

/** Значение свойства без опасных адресов; null — значение выброшено целиком */
function safeValue(value: string, property: string, ctx: Context): string | null {
  let clean = true;
  const rewritten = value.replace(URL_CALL, (whole, _quote: string, target: string) => {
    const address = unescapeCss(target).trim();
    if (/^#[\w-]+$/.test(address)) return `url(${address})`;
    const name = fileName(address);
    if (name && has(ctx.images, name)) return `url("${name}")`;
    clean = false;
    return whole;
  });
  // После замены в тексте не должно остаться ни одного вызова, который что-то загружает
  const left = unescapeCss(rewritten).replace(/url\(\s*(["']?)(?:#[\w-]+|[\w-]+\.[a-z0-9]+)\1\s*\)/gi, '');
  if (!clean || FORBIDDEN_CSS.test(left)) {
    note(ctx, `В свойстве ${property} убран адрес: картинки берутся только из библиотеки, например url(house.png).`);
    return null;
  }
  return rewritten;
}

/** Объявления «свойство: значение» из блока, который браузер уже разобрал и записал заново */
function declarations(block: string, ctx: Context): string[] {
  const kept: string[] = [];
  for (const part of splitTopLevel(block, ';')) {
    const declaration = part.trim();
    const colon = declaration.indexOf(':');
    if (colon < 1) continue;
    const property = declaration.slice(0, colon).trim();
    const value = safeValue(declaration.slice(colon + 1), property, ctx);
    if (value !== null) kept.push(`${property}:${value}`);
  }
  return kept;
}

const AT_RULE_REASONS: Record<string, string> = {
  '@import': 'внешних файлов в землях нет',
  '@font-face': 'свои шрифты в землях не загружаются, бери шрифты, которые есть на любом компьютере',
  '@namespace': 'пространства имён землям не нужны',
  '@page': 'земля рисуется на экране, а не на бумаге',
  '@property': 'такие правила землям не нужны',
  '@counter-style': 'такие правила землям не нужны',
};

/** Первая строка правила («@media (min-width: 600px)») — так, как записал её браузер */
function ruleHeader(rule: CSSRule): string {
  const text = rule.cssText;
  const brace = text.indexOf('{');
  return (brace === -1 ? text : text.slice(0, brace)).trim();
}

function childRules(list: CSSRuleList | undefined, ctx: Context, depth: number): string {
  let out = '';
  if (list) for (const rule of Array.from(list)) out += ruleText(rule, ctx, depth);
  return out;
}

/** Правило, пересобранное из разрешённого. Пустая строка — правило убрано */
function ruleText(rule: CSSRule, ctx: Context, depth: number): string {
  if (depth > 6) return '';
  if (++ctx.rules > MAX_RULES) {
    note(ctx, 'В CSS слишком много правил: лишние убраны.');
    return '';
  }
  switch (rule.constructor.name) {
    case 'CSSStyleRule': {
      const styled = rule as CSSStyleRule;
      const own = declarations(styled.style.cssText, ctx);
      const nested = childRules(styled.cssRules, ctx, depth + 1);
      if (!own.length && !nested) return '';
      return `${styled.selectorText} {\n${own.map((item) => `  ${item};\n`).join('')}${nested}}\n`;
    }
    case 'CSSNestedDeclarations': {
      const own = declarations((rule as CSSStyleRule).style.cssText, ctx);
      return own.map((item) => `  ${item};\n`).join('');
    }
    case 'CSSMediaRule':
    case 'CSSSupportsRule':
    case 'CSSContainerRule':
    case 'CSSLayerBlockRule': {
      const inner = childRules((rule as CSSGroupingRule).cssRules, ctx, depth + 1);
      return inner ? `${ruleHeader(rule)} {\n${inner}}\n` : '';
    }
    case 'CSSLayerStatementRule':
      return `${rule.cssText}\n`;
    case 'CSSKeyframesRule': {
      const frames = Array.from((rule as CSSKeyframesRule).cssRules)
        .map((frame) => {
          const own = declarations((frame as CSSKeyframeRule).style.cssText, ctx);
          return own.length ? `  ${(frame as CSSKeyframeRule).keyText} {\n${own.map((item) => `    ${item};\n`).join('')}  }\n` : '';
        })
        .join('');
      return frames ? `${ruleHeader(rule)} {\n${frames}}\n` : '';
    }
    default: {
      const name = /^@[\w-]+/.exec(rule.cssText)?.[0] ?? 'Правило';
      note(ctx, `Правило ${name} убрано: ${AT_RULE_REASONS[name.toLowerCase()] ?? 'в землях его нет'}.`);
      return '';
    }
  }
}

function sanitizeCss(source: string, ctx: Context): string {
  if (!source.trim()) return '';
  // Браузер молча выбрасывает @import из стилей без документа, но игроку стоит знать, почему шрифт или файл не пришёл
  if (/@import\b/i.test(source)) note(ctx, `Правило @import убрано: ${AT_RULE_REASONS['@import']}.`);
  let sheet: CSSStyleSheet;
  try {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(source);
  } catch {
    note(ctx, 'Этот браузер не смог безопасно разобрать CSS, поэтому стили не показаны.');
    return '';
  }
  // «<» вне строк в CSS не бывает, а в строке «</style>» закрыл бы наш тег и впустил разметку; \3c — тот же знак в записи CSS
  return childRules(sheet.cssRules, ctx, 0).replace(/</g, '\\3c ');
}

/** Атрибут style: тот же разбор, что у правил. Если после разбора не одно правило, значит, кто-то пытался выйти за скобки */
function sanitizeInlineStyle(value: string, ctx: Context): string | null {
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`x{${value}}`);
    if (sheet.cssRules.length !== 1 || sheet.cssRules[0].constructor.name !== 'CSSStyleRule') return null;
    return declarations((sheet.cssRules[0] as CSSStyleRule).style.cssText, ctx).join('; ');
  } catch {
    return null;
  }
}

/* ——— HTML ——— */

function allowedAttribute(tag: string, name: string, svg: boolean): boolean {
  if (svg) return SVG_ATTRIBUTES.has(name);
  if (GLOBAL_ATTRIBUTES.has(name) || /^(?:aria|data)-[a-z0-9_.:-]+$/.test(name)) return true;
  return TAG_ATTRIBUTES[tag]?.includes(name) ?? false;
}

function copyAttributes(from: Element, to: Element, ctx: Context) {
  const svg = from.namespaceURI === SVG_NS;
  const tag = from.localName;
  for (const attribute of Array.from(from.attributes)) {
    const name = svg ? attribute.name : attribute.name.toLowerCase();
    const value = stripControls(attribute.value);
    const where = `<${tag}>`;

    if (/^on/i.test(name)) {
      note(ctx, `Атрибут ${name} убран: в землях нет JavaScript.`);
      continue;
    }
    if (!allowedAttribute(tag, name, svg)) {
      if (name !== 'xmlns' && !name.startsWith('xmlns:')) note(ctx, `Атрибут ${name} у ${where} не пропущен.`);
      continue;
    }
    // Длинные значения бывают только у контуров рисунка
    if (value.length > (name === 'd' || name === 'points' ? 3000 : 400)) {
      note(ctx, `Значение атрибута ${name} слишком длинное: убрано.`);
      continue;
    }

    if (name === 'href') {
      if (/^#[^\s"'<>\\]{0,60}$/.test(value.trim())) to.setAttribute('href', value.trim());
      else note(ctx, `Ссылка href="${brief(value)}" отключена: в землях работают только якоря вида href="#имя".`);
    } else if (name === 'src') {
      const picture = fileName(value);
      if (has(ctx.images, picture)) to.setAttribute('src', picture);
      else note(ctx, `Картинка «${brief(value)}» не из библиотеки: возьми имя из панели картинок или нарисуй свой <svg>.`);
    } else if (name === 'style') {
      const style = sanitizeInlineStyle(value, ctx);
      if (style) to.setAttribute('style', style);
      else if (style === null) note(ctx, 'Атрибут style убран: в нём не получилось найти обычные объявления «свойство: значение».');
    } else if (name === 'type' && tag === 'input') {
      if (INPUT_TYPES.has(value.trim().toLowerCase())) to.setAttribute('type', value.trim().toLowerCase());
      else note(ctx, `Поле type="${brief(value)}" в землях не работает: пароли, файлы и скрытые поля тут ни к чему.`);
    } else if (name === 'type' && tag === 'button') {
      if (BUTTON_TYPES.has(value.trim().toLowerCase())) to.setAttribute('type', value.trim().toLowerCase());
    } else if (svg) {
      // Заливка и обводка могут ссылаться на градиент: url(#id). Любой другой адрес — нет
      const left = unescapeCss(value).replace(/url\(\s*(["']?)#[\w-]+\1\s*\)/gi, '');
      if (FORBIDDEN_CSS.test(left)) note(ctx, `В атрибуте ${name} убран адрес: у рисунка могут быть только ссылки на градиенты вида url(#имя).`);
      else to.setAttribute(name, value);
    } else {
      to.setAttribute(name, value);
    }
  }
}

function copyChildren(from: Node, to: Node, doc: Document, ctx: Context, depth: number) {
  for (const child of Array.from(from.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) to.appendChild(doc.createTextNode(child.nodeValue ?? ''));
    else if (child.nodeType === Node.ELEMENT_NODE) copyElement(child as Element, to, doc, ctx, depth);
    // Комментарии, инструкции и всё остальное не переносится
  }
}

function copyElement(element: Element, to: Node, doc: Document, ctx: Context, depth: number) {
  const name = element.localName;
  const namespace = element.namespaceURI;

  if (namespace === HTML_NS) {
    if (Object.prototype.hasOwnProperty.call(DROPPED, name)) {
      note(ctx, `Тег <${name}> убран: ${DROPPED[name]}.`);
      return;
    }
    if (!HTML_TAGS.has(name)) {
      note(ctx, `Тег <${name}> не пропущен, остался только его текст.`);
      copyChildren(element, to, doc, ctx, depth);
      return;
    }
  } else if (namespace === SVG_NS) {
    if (!SVG_TAGS.has(name)) {
      note(ctx, `В рисунке <svg> тег <${name}> убран: можно фигуры, градиенты и текст, а ссылки, картинки и анимацию нельзя.`);
      return;
    }
  } else {
    note(ctx, `Тег <${name}> убран: формулы и другие языки разметки землям не нужны.`);
    return;
  }

  if (depth >= MAX_DEPTH || ctx.elements >= MAX_ELEMENTS) {
    note(ctx, `Земля слишком сложная: тегов больше ${MAX_ELEMENTS} или вложены глубже ${MAX_DEPTH} уровней. Лишнее убрано.`);
    return;
  }
  ctx.elements++;

  const copy = namespace === SVG_NS ? doc.createElementNS(SVG_NS, name) : doc.createElement(name);
  copyAttributes(element, copy, ctx);
  to.appendChild(copy);
  copyChildren(element, copy, doc, ctx, depth + 1);
}

/** Один проход: разметка → разобранное браузером дерево → новое дерево из разрешённого → текст */
function htmlPass(source: string, ctx: Context): string {
  const parsed = new DOMParser().parseFromString(`<!doctype html><html><head></head><body>${source}`, 'text/html');
  // Документ без окна: ничего не загружает и не запускает
  const clean = document.implementation.createHTMLDocument('');
  ctx.elements = 0;
  copyChildren(parsed.body, clean.body, clean, ctx, 0);
  return clean.body.innerHTML;
}

/**
 * Разметка прогоняется несколько раз, пока результат не перестанет меняться. Браузер, разобрав текст второй раз,
 * иногда строит другое дерево, чем в первый (так обходят многие санитайзеры): стабильный результат
 * гарантирует, что страница получит ровно то, что мы проверили.
 */
function sanitizeHtml(source: string, ctx: Context): string {
  let current = htmlPass(source, ctx);
  for (let pass = 1; pass < MAX_PASSES; pass++) {
    // Заметки о том, что убрано, пишутся только в первый проход
    const next = htmlPass(current, newContext(ctx.images));
    if (next === current) return current;
    current = next;
  }
  note(ctx, 'Разметка слишком запутана: игра не смогла разобрать её безопасно, поэтому страница пуста. Упрости вложенность тегов.');
  return '';
}

/* ——— Общий вход ——— */

function summarize(notes: Set<string>): string[] {
  const list = [...notes];
  return list.length > MAX_NOTES ? [...list.slice(0, MAX_NOTES), `…и ещё ${list.length - MAX_NOTES}.`] : list;
}

/** Земля игрока → безопасная земля. Вход может быть чем угодно: из редактора, из ссылки, из чужого документа */
export function sanitizeLand(source: { html: string; css: string }, images: LandImages): SafeLand {
  const ctx = newContext(images);
  const html = sanitizeHtml(String(source.html ?? '').slice(0, LAND_LIMITS.html * 2), ctx);
  const css = sanitizeCss(String(source.css ?? '').slice(0, LAND_LIMITS.css * 2), ctx);
  return { html, css, notes: summarize(ctx.notes) };
}

/** Политика, при которой страница ничего не загрузит и никуда не сходит. Картинки — только data: (библиотека игры) */
export const LAND_CSP = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'";

/** Картинки библиотеки вместо имён: <img src="house.png"> получает настоящий рисунок */
function withPictures(html: string, images: LandImages): string {
  if (!html.includes('<img')) return html;
  const doc = new DOMParser().parseFromString(`<!doctype html><html><head></head><body>${html}`, 'text/html');
  doc.querySelectorAll('img').forEach((picture) => {
    const name = picture.getAttribute('src') ?? '';
    if (has(images, name)) picture.setAttribute('src', images[name]);
    else picture.removeAttribute('src');
  });
  return doc.body.innerHTML;
}

function cssWithPictures(css: string, images: LandImages): string {
  return css.replace(URL_CALL, (whole, _quote: string, target: string) => {
    const address = target.trim();
    if (address.startsWith('#')) return whole;
    return has(images, address) ? `url("${images[address]}")` : 'none';
  });
}

/**
 * Документ земли для iframe с пустым sandbox. Стиль страницы по умолчанию — «Лорд Дефолт»:
 * пока игрок ничего не написал, земля выглядит как страница без стилей.
 */
export function landDocument(safe: Pick<SafeLand, 'html' | 'css'>, images: LandImages, title = ''): string {
  const name = title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return (
    '<!doctype html><html lang="ru"><head><meta charset="utf-8">' +
    `<meta http-equiv="Content-Security-Policy" content="${LAND_CSP}">` +
    (name ? `<title>${name}</title>` : '') +
    `<style>${BASE_PAGE_CSS}</style><style>${cssWithPictures(safe.css, images)}</style>` +
    `</head><body>${withPictures(safe.html, images)}</body></html>`
  );
}

/** Из кода игрока сразу в документ: для предпросмотра и страницы получателя */
export function renderLand(source: { html: string; css: string }, images: LandImages): { document: string; notes: string[] } {
  const safe = sanitizeLand(source, images);
  return { document: landDocument(safe, images), notes: safe.notes };
}
