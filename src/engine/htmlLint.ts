import {
  ALLOWED_CHILDREN,
  BLOCK_TAGS,
  GLOBAL_ATTRIBUTES,
  HEAD_TAGS,
  HEADING_TAGS,
  INPUT_TYPES,
  KNOWN_TAGS,
  OBSOLETE_TAGS,
  REQUIRED_PARENTS,
  TAG_ATTRIBUTES,
  TAG_SYNONYMS,
  VOID_TAGS,
} from './htmlVocabulary';
import { nearest } from './levenshtein';
import type { Problem, ProblemKind, Severity } from './lint';

export interface HtmlLintOptions {
  /** Студент пишет документ целиком: <!doctype>, <html>, <head>, <body> */
  document?: boolean;
}

interface OpenTag {
  name: string;
  /** Где стоит открывающий тег — для подсветки */
  from: number;
  to: number;
}

interface Attribute {
  name: string;
  raw: string;
  from: number;
  to: number;
  value?: string;
  quoted: boolean;
}

const DOCUMENT_TAGS = new Set(['html', 'head', 'body']);

/** Открывая такой тег, забыли закрыть предыдущий такой же: «<li>Один<li>Два». */
const SIBLING_TAGS: Record<string, string[]> = {
  li: ['li'],
  p: ['p'],
  option: ['option'],
  tr: ['tr'],
  td: ['td', 'th'],
  th: ['td', 'th'],
  dt: ['dt', 'dd'],
  dd: ['dt', 'dd'],
};

/** Чем обернуть то, что стоит не на своём месте. */
const WRAPPERS: Record<string, string> = {
  ul: '<li>…</li>',
  ol: '<li>…</li>',
  tr: '<td>…</td>',
  table: '<tr><td>…</td></tr>',
  select: '<option>…</option>',
};

/**
 * Проверяет разметку студента и объясняет ошибки по-человечески. Браузер такие ошибки
 * молча чинит по-своему — поэтому страница «вроде работает», а выглядит не так.
 */
export function lintHtml(source: string, options: HtmlLintOptions = {}): Problem[] {
  const problems: Problem[] = [];
  const stack: OpenTag[] = [];
  const ids = new Set<string>();
  const lower = source.toLowerCase();
  const len = source.length;
  let pos = 0;
  /** До <!doctype> уже было что-то, кроме пробелов */
  let seenContent = false;

  const report = (severity: Severity, from: number, to: number, message: string, kind: ProblemKind = 'syntax') => {
    problems.push({ from, to, severity, kind, message });
  };
  const inside = (name: string) => stack.some((open) => open.name === name);

  while (pos < len) {
    const lt = source.indexOf('<', pos);
    const textEnd = lt === -1 ? len : lt;
    if (textEnd > pos) checkText(pos, textEnd);
    if (lt === -1) break;
    if (source.startsWith('<!--', lt)) {
      const end = source.indexOf('-->', lt + 4);
      if (end === -1) {
        report('error', lt, lt + 4, 'Комментарий не закрыт: не хватает -->. Всё, что ниже, браузер считает комментарием.');
        break;
      }
      pos = end + 3;
      continue;
    }
    const next = source[lt + 1] ?? '';
    if (next === '!') pos = doctype(lt);
    else if (next === '/') pos = closingTag(lt);
    else if (/[a-z]/i.test(next)) pos = openingTag(lt);
    else {
      report('warning', lt, lt + 1, 'Знак < в тексте браузер может принять за начало тега. В тексте его пишут как &lt;.');
      pos = lt + 1;
    }
  }

  for (const open of stack) {
    report('error', open.from, open.to, `Тег <${open.name}> не закрыт — не хватает </${open.name}>.`, 'nesting');
  }
  return problems.sort((a, b) => a.from - b.from);

  function checkText(from: number, to: number) {
    const text = source.slice(from, to);
    if (!text.trim()) return;
    seenContent = true;
    const start = from + (text.length - text.trimStart().length);
    const end = from + text.trimEnd().length;
    const snippet = text.trim().slice(0, 30);
    const parent = stack[stack.length - 1]?.name;

    if (parent && ALLOWED_CHILDREN[parent]) {
      report('error', start, end, `${ALLOWED_CHILDREN[parent].message} Текст «${snippet}» оберни в ${WRAPPERS[parent] ?? 'подходящий тег'}.`, 'nesting');
    } else if (options.document && !inside('body') && !['title', 'style', 'script'].includes(parent ?? '')) {
      report('error', start, end, `Текст «${snippet}» стоит вне <body>: видимая часть страницы пишется внутри <body>.`, 'nesting');
    }

    // «p>Текст</p»: пропущен знак «<» перед именем тега
    const missing = /(^|[\s>])(\/?)([a-z][a-z0-9]*)>/i.exec(text);
    if (missing && KNOWN_TAGS.includes(missing[3].toLowerCase())) {
      const at = from + missing.index + missing[1].length;
      const word = `${missing[2]}${missing[3]}>`;
      report('error', at, at + word.length, `Похоже, перед «${word}» пропущен знак <.`);
    }
  }

  function doctype(lt: number): number {
    const end = source.indexOf('>', lt);
    const to = end === -1 ? len : end + 1;
    if (!/^<!doctype\s+html\s*>$/i.test(source.slice(lt, to))) {
      report('warning', lt, to, 'Тип документа объявляют так: <!doctype html>.');
    } else if (!options.document) {
      report('warning', lt, to, '<!doctype html> нужен только в начале целого документа, а здесь пишем лишь содержимое страницы.');
    } else if (seenContent) {
      report('warning', lt, to, '<!doctype html> должен стоять в самом начале документа.');
    }
    seenContent = true;
    return to;
  }

  function openingTag(lt: number): number {
    seenContent = true;
    const raw = /^[a-z][a-z0-9-]*/i.exec(source.slice(lt + 1, lt + 80))?.[0] ?? '';
    const name = raw.toLowerCase();
    const nameTo = lt + 1 + raw.length;
    const { attrs, closed, selfClosing, to } = readAttributes(name, nameTo);
    if (!closed) report('error', lt, nameTo, `Тег <${raw} не закрыт символом «>».`);

    const known = KNOWN_TAGS.includes(name);
    const at = { from: lt, to: nameTo };
    if (!known) {
      if (OBSOLETE_TAGS[name]) {
        report('warning', at.from, at.to, OBSOLETE_TAGS[name], 'tag');
      } else if (name.includes('-')) {
        report('warning', at.from, at.to, `Тег <${raw}> — самодельный: браузер не знает, что он значит.`, 'tag');
      } else {
        const guess = TAG_SYNONYMS[name] ?? nearest(name, KNOWN_TAGS);
        report('error', at.from, at.to, `Тега <${raw}> в HTML нет.${guess ? ` Может, <${guess}>?` : ''}`, 'tag');
      }
    } else {
      if (raw !== name) report('warning', at.from, at.to, `Теги принято писать маленькими буквами: <${name}>.`, 'tag');
      checkPlace(name, at);
      checkAttributes(name, attrs, { from: lt, to });
      if (selfClosing && !VOID_TAGS.has(name)) {
        report('error', lt, to, `<${name} /> так не закрывается: у <${name}> должен быть закрывающий тег </${name}>.`, 'nesting');
      }
    }

    // Неизвестный тег кладём в стек, только если дальше есть его закрывающая пара — иначе ошибки посыплются каскадом
    const paired = known ? !VOID_TAGS.has(name) : lower.includes(`</${name}`, to);
    if (paired) stack.push({ name, from: lt, to: nameTo });
    return to;
  }

  function readAttributes(name: string, from: number) {
    const attrs: Attribute[] = [];
    let i = from;
    let closed = false;
    let selfClosing = false;
    while (i < len) {
      while (i < len && /\s/.test(source[i])) i++;
      if (i >= len) break;
      const c = source[i];
      if (c === '>') {
        closed = true;
        i++;
        break;
      }
      if (c === '/' && source[i + 1] === '>') {
        closed = selfClosing = true;
        i += 2;
        break;
      }
      if (c === '<') break;
      const rawName = /^[^\s"'>/=<]+/.exec(source.slice(i, i + 200))?.[0];
      if (!rawName) {
        report('error', i, i + 1, `Лишний символ «${c}» внутри тега <${name}>.`);
        i++;
        continue;
      }
      const attr: Attribute = { name: rawName.toLowerCase(), raw: rawName, from: i, to: i + rawName.length, quoted: false };
      i = attr.to;
      let j = i;
      while (j < len && /\s/.test(source[j])) j++;
      if (source[j] === '=') {
        j++;
        while (j < len && /\s/.test(source[j])) j++;
        const quote = source[j];
        if (quote === '"' || quote === "'") {
          const end = source.indexOf(quote, j + 1);
          if (end === -1) {
            report('error', attr.from, Math.min(len, attr.to + 20), `Кавычка у значения ${attr.raw} не закрыта.`, 'attribute');
            attr.value = source.slice(j + 1);
            i = len;
          } else {
            attr.value = source.slice(j + 1, end);
            attr.quoted = true;
            i = end + 1;
            // Кавычка закрылась далеко, захватив чужие теги: «alt="текст>…<p>…"»
            if (/[<>]/.test(attr.value)) {
              report('error', attr.from, attr.to, `Похоже, у значения ${attr.raw} не закрыта кавычка: в него попали знаки < и >.`, 'attribute');
            }
          }
        } else {
          const value = /^[^\s>]*/.exec(source.slice(j, j + 500))?.[0] ?? '';
          attr.value = value;
          i = j + value.length;
        }
        attr.to = i;
      }
      attrs.push(attr);
    }
    return { attrs, closed, selfClosing, to: i };
  }

  /** Тег на своём месте: внутри нужного родителя и не там, где браузер его не потерпит. */
  function checkPlace(name: string, at: { from: number; to: number }) {
    // «<li>Один<li>Два»: предыдущий такой же тег не закрыли
    const top = stack[stack.length - 1];
    if (top && SIBLING_TAGS[name]?.includes(top.name)) {
      report('error', top.from, top.to, `Тег <${top.name}> не закрыт: поставь </${top.name}> перед следующим <${name}>.`, 'nesting');
      stack.pop();
    }
    const parent = stack[stack.length - 1]?.name;

    if (options.document) {
      if (DOCUMENT_TAGS.has(name)) return;
      if (HEAD_TAGS.has(name)) {
        if (!inside('head')) report('warning', at.from, at.to, `<${name}> пишут в <head>, а не в <body>.`, 'nesting');
        return;
      }
      if (inside('head')) {
        report('error', at.from, at.to, `<${name}> — видимая часть страницы: её пишут в <body>, а не в <head>.`, 'nesting');
        return;
      }
      if (!inside('body')) report('error', at.from, at.to, `<${name}> стоит вне <body>: видимая часть страницы пишется внутри <body>.`, 'nesting');
    } else if (DOCUMENT_TAGS.has(name)) {
      report('warning', at.from, at.to, `Здесь пишем только содержимое страницы: <${name}> уже есть, его писать не нужно.`, 'nesting');
      return;
    } else if (name === 'link') {
      report('warning', at.from, at.to, '<link> подключает файлы и пишется в <head>. Ссылка на странице — это <a href="…">…</a>.', 'nesting');
      return;
    } else if (HEAD_TAGS.has(name)) {
      report('warning', at.from, at.to, `<${name}> пишут в <head>, а не на странице.`, 'nesting');
      return;
    }

    const required = REQUIRED_PARENTS[name];
    const allowed = parent ? ALLOWED_CHILDREN[parent] : undefined;
    if (required && !required.parents.includes(parent ?? '')) {
      report('error', at.from, at.to, required.message, 'nesting');
    } else if (allowed && !allowed.children.includes(name)) {
      report('error', at.from, at.to, `${allowed.message} <${name}> оберни в ${WRAPPERS[parent!] ?? 'подходящий тег'}.`, 'nesting');
    }

    if (BLOCK_TAGS.has(name) && inside('p')) {
      report('error', at.from, at.to, `Внутри абзаца <p> не бывает <${name}> — браузер закроет абзац раньше. Сначала закрой </p>.`, 'nesting');
    }
    if (HEADING_TAGS.has(name) && stack.some((open) => HEADING_TAGS.has(open.name))) {
      report('error', at.from, at.to, 'Заголовок не может стоять внутри другого заголовка.', 'nesting');
    }
    if (name === 'a' && inside('a')) {
      report('error', at.from, at.to, 'Ссылка внутри ссылки не работает: сначала закрой первую </a>.', 'nesting');
    } else if (['button', 'input', 'select', 'textarea'].includes(name) && inside('a')) {
      report('error', at.from, at.to, `<${name}> не может стоять внутри ссылки <a>.`, 'nesting');
    }
    if (['a', 'button', 'input', 'select', 'textarea'].includes(name) && inside('button')) {
      report('error', at.from, at.to, `<${name}> не может стоять внутри кнопки <button>.`, 'nesting');
    }
    if (name === 'form' && inside('form')) {
      report('error', at.from, at.to, 'Форма внутри формы не работает: сначала закрой </form>.', 'nesting');
    }
  }

  function checkAttributes(name: string, attrs: Attribute[], tag: { from: number; to: number }) {
    const allowedAttrs = [...GLOBAL_ATTRIBUTES, ...(TAG_ATTRIBUTES[name] ?? [])];
    const seen = new Map<string, Attribute>();
    attrs.forEach((attr, index) => {
      const previous = attrs[index - 1];
      // «alt=Красный кристалл»: без кавычек второе слово браузер считает отдельным атрибутом
      if (previous?.value && !previous.quoted && attr.value === undefined && !allowedAttrs.includes(attr.name)) {
        report(
          'error',
          previous.from,
          attr.to,
          `Значение с пробелами пишут в кавычках: ${previous.raw}="${previous.value} ${attr.raw}…".`,
          'attribute',
        );
        return;
      }
      if (seen.has(attr.name)) {
        report('error', attr.from, attr.to, `Атрибут ${attr.raw} указан дважды — сработает только первый.`, 'attribute');
        return;
      }
      seen.set(attr.name, attr);
      if (attr.value && !attr.quoted) {
        report('warning', attr.from, attr.to, `Значения атрибутов пишут в кавычках: ${attr.raw}="${attr.value}".`, 'attribute');
      }
      if (attr.name.startsWith('data-') || attr.name.startsWith('aria-')) return;
      if (attr.name.startsWith('on')) {
        report('warning', attr.from, attr.to, `Скрипты в тренажёре не запускаются: ${attr.raw} ничего не сделает.`, 'attribute');
        return;
      }
      if (!allowedAttrs.includes(attr.name)) {
        const guess = nearest(attr.name, allowedAttrs);
        report('warning', attr.from, attr.to, `У <${name}> нет атрибута «${attr.raw}».${guess ? ` Может, ${guess}?` : ''}`, 'attribute');
      }
    });

    const value = (attr: string) => seen.get(attr)?.value?.trim();
    const id = value('id');
    if (id) {
      if (ids.has(id)) {
        const attr = seen.get('id')!;
        report('warning', attr.from, attr.to, `id «${id}» уже есть на странице, а id должен быть единственным.`, 'attribute');
      }
      ids.add(id);
    }
    const where = tag;
    if (name === 'img') {
      if (!seen.has('src')) report('error', where.from, where.to, 'У <img> нет src — какую картинку показать?', 'attribute');
      if (!seen.has('alt')) {
        report('warning', where.from, where.to, 'У картинки нет alt — описания для тех, кто её не видит. Если картинка не загрузится, браузер покажет alt.', 'attribute');
      }
    }
    if (name === 'a') {
      if (!seen.has('href')) report('warning', where.from, where.to, 'У ссылки нет href — ей некуда вести.', 'attribute');
      else if (!value('href')) report('warning', where.from, where.to, 'У ссылки пустой href — она никуда не ведёт.', 'attribute');
    }
    const type = value('type')?.toLowerCase();
    if (name === 'input' && type && !INPUT_TYPES.includes(type)) {
      const guess = nearest(type, INPUT_TYPES);
      const attr = seen.get('type')!;
      report('warning', attr.from, attr.to, `Поля с типом «${type}» нет${guess ? ` — может, ${guess}?` : '.'}`, 'attribute');
    }
    const charset = value('charset')?.toLowerCase();
    if (name === 'meta' && charset && charset !== 'utf-8') {
      const attr = seen.get('charset')!;
      report('warning', attr.from, attr.to, 'Кодировку пишут так: <meta charset="utf-8">.', 'attribute');
    }
  }

  function closingTag(lt: number): number {
    seenContent = true;
    const match = /^\s*([a-z][a-z0-9-]*)\s*(>)?/i.exec(source.slice(lt + 2, lt + 80));
    if (!match) {
      report('error', lt, lt + 2, 'После </ нужно имя тега, например </p>.');
      return lt + 2;
    }
    const raw = match[1];
    const name = raw.toLowerCase();
    const to = lt + 2 + match[0].length;
    if (!match[2]) report('error', lt, to, `Закрывающий тег </${raw} не закрыт символом «>».`);
    if (VOID_TAGS.has(name)) {
      report('error', lt, to, `У <${name}> нет закрывающего тега: он одиночный. Просто удали </${name}>.`, 'nesting');
      return to;
    }
    let index = -1;
    for (let k = stack.length - 1; k >= 0; k--) {
      if (stack[k].name === name) {
        index = k;
        break;
      }
    }
    if (index === -1) {
      report('error', lt, to, `</${raw}> лишний: тег <${name}> здесь не открывался.`, 'nesting');
      return to;
    }
    if (index < stack.length - 1) {
      const inner = stack[stack.length - 1];
      // Сразу дальше закрывается внутренний тег — значит, закрывающие теги просто перепутаны местами
      const after = /^\s*<\/\s*([a-z][a-z0-9-]*)/i.exec(source.slice(to, to + 80));
      if (index === stack.length - 2 && after?.[1].toLowerCase() === inner.name) {
        report(
          'error',
          lt,
          to,
          `Теги перепутаны: сначала закрой </${inner.name}>, потом </${name}> — внутренний тег закрывается первым.`,
          'nesting',
        );
        stack.splice(index, 1);
        return to;
      }
      for (const open of stack.slice(index + 1)) {
        report('error', open.from, open.to, `Тег <${open.name}> не закрыт: поставь </${open.name}> перед </${name}>.`, 'nesting');
      }
      stack.length = index;
      return to;
    }
    stack.pop();
    return to;
  }
}
