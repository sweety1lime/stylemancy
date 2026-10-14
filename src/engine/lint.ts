import { parseCss, stripComments, type CssDecl, type CssRule, type ParsedCss } from './cssParse';
import { COMMON_PROPERTIES, KEYWORDS, SYNONYMS } from './cssVocabulary';
import { nearest } from './levenshtein';

export type Severity = 'error' | 'warning';
export type ProblemKind = 'syntax' | 'property' | 'value' | 'not-allowed' | 'selector' | 'duplicate' | 'required';

export interface Problem {
  from: number;
  to: number;
  severity: Severity;
  kind: ProblemKind;
  message: string;
}

export interface LintOptions {
  /** Разрешённые свойства: остальные считаются ошибкой */
  allow?: string[];
  /** Начало сообщения о неразрешённом свойстве */
  allowMessage?: string;
  /** Запрещённые свойства вместе с вариантами: margin запрещает и margin-left */
  forbid?: string[];
  /** Сцена уровня — чтобы предупредить о селекторах, которые ничего не находят */
  sceneDoc?: Document;
  /** Приёмы, без которых решение не засчитывается */
  require?: { pattern: string; message: string }[];
}

export interface LintResult {
  parsed: ParsedCss;
  problems: Problem[];
  /** Объявления, которые браузер понял */
  validDecls: CssDecl[];
}

type Range = { from: number; to: number };

/** Проверяет код студента и объясняет каждую ошибку по-человечески. */
export function lintCss(css: string, options: LintOptions = {}): LintResult {
  const parsed = parseCss(css);
  const problems = parsed.errors.map((e): Problem => ({ ...e, severity: 'error', kind: 'syntax' }));
  const validDecls: CssDecl[] = [];

  for (const rule of parsed.rules) {
    if (rule.kind === 'at-rule') continue;
    if (rule.kind === 'style' && options.sceneDoc) checkSelector(rule, options.sceneDoc, problems);
    const seen = new Map<string, CssDecl>();
    for (const decl of rule.decls) {
      if (!checkDeclaration(decl, problems)) continue;
      validDecls.push(decl);
      const prop = decl.prop.toLowerCase();
      checkAllowed(decl, prop, options, problems);
      const previous = seen.get(prop);
      if (previous) {
        problems.push({
          from: previous.propFrom,
          to: previous.valueTo,
          severity: 'warning',
          kind: 'duplicate',
          message: `${previous.prop} задано ещё раз ниже в этом же правиле — сработает только последнее значение.`,
        });
      }
      seen.set(prop, decl);
    }
  }

  const code = stripComments(css);
  checkMediaQueries(code, problems);
  problems.sort((a, b) => a.from - b.from);

  // Обязательные приёмы ищем в коде без комментариев. Они — в конце списка: сначала чинят сам код
  for (const rule of options.require ?? []) {
    if (!new RegExp(rule.pattern, 'i').test(code)) {
      problems.push({ from: 0, to: 0, severity: 'error', kind: 'required', message: rule.message });
    }
  }
  return { parsed, problems, validDecls };
}

/** true — объявление корректно и браузер его применит. */
function checkDeclaration(decl: CssDecl, problems: Problem[]): boolean {
  const prop = decl.prop.toLowerCase();
  if (prop.startsWith('--')) return true;

  const atProp = { from: decl.propFrom, to: decl.propTo };
  const atValue = decl.valueFrom < decl.valueTo ? { from: decl.valueFrom, to: decl.valueTo } : atProp;
  const fail = (at: Range, kind: ProblemKind, message: string) => {
    problems.push({ ...at, severity: 'error', kind, message });
    return false;
  };

  if (!/^-?[a-z][a-z0-9-]*$/.test(prop)) {
    return fail(atProp, 'property', `«${decl.prop}» — так свойства не называются. Имя пишется латиницей через дефис, например justify-content.`);
  }
  if (!CSS.supports(prop, 'inherit')) {
    const guess = suggestProperty(prop);
    return fail(atProp, 'property', `Неизвестное свойство «${decl.prop}».${guess ? ` Может, ${guess}?` : ''}`);
  }
  if (!decl.value) return fail(atProp, 'value', `Не указано значение для ${decl.prop}.`);

  if (hasTopLevelColon(decl.value)) {
    const firstLine = decl.value.split('\n', 1)[0].trimEnd();
    if (firstLine.length < decl.value.length && !firstLine.includes(':')) {
      const at = { from: decl.valueFrom, to: decl.valueFrom + firstLine.length };
      return fail(at, 'syntax', `Похоже, после «${firstLine}» пропущена точка с запятой.`);
    }
    return fail(atValue, 'syntax', 'Похоже, между свойствами пропущена точка с запятой.');
  }
  if (!CSS.supports(prop, decl.value)) return fail(atValue, 'value', explainValue(prop, decl));
  return true;
}

function explainValue(prop: string, decl: CssDecl): string {
  const value = decl.value;
  const word = value.toLowerCase();
  const head = `Значение «${value}» не подходит для ${decl.prop}.`;

  if (prop === 'grid-template-areas') {
    return 'Карта не читается: каждая строка — в кавычках, в строках одинаковое число слов, а одинаковые слова складываются в прямоугольник.';
  }

  if (/^[a-z-]+$/.test(word)) {
    const synonym = SYNONYMS[word];
    if (synonym && CSS.supports(prop, synonym)) return `${head} Может, ${synonym}?`;
    const keywords = KEYWORDS[prop];
    const guess = keywords ? nearest(word, keywords) : undefined;
    if (guess) return `${head} Может, ${guess}?`;
    const owners = Object.keys(KEYWORDS).filter((other) => other !== prop && KEYWORDS[other].includes(word));
    if (owners.length) return `${head} Такое значение бывает у ${owners.join(', ')}.`;
    if (keywords) return `${head} Подойдут, например: ${keywords.slice(0, 6).join(', ')}.`;
  }
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(word) && CSS.supports(prop, `${word}px`)) {
    return `${head} Не хватает единиц измерения — например, ${word}px.`;
  }
  const glued = word.replace(/(\d)\s+([a-z%]+)/g, '$1$2');
  if (glued !== word && CSS.supports(prop, glued)) {
    return `${head} Между числом и единицей измерения не нужен пробел: ${glued}.`;
  }
  return `Браузер не понимает значение «${value}» для ${decl.prop}.`;
}

function hasTopLevelColon(value: string): boolean {
  let depth = 0;
  let quote = '';
  for (const c of value) {
    if (quote) {
      if (c === quote) quote = '';
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '(') {
      depth++;
    } else if (c === ')') {
      depth = Math.max(0, depth - 1);
    } else if (c === ':' && depth === 0) {
      return true;
    }
  }
  return false;
}

const MEDIA_FEATURES = ['min-width', 'max-width', 'width', 'min-height', 'max-height', 'height', 'orientation', 'hover', 'prefers-color-scheme'];

/** Медиазапрос с ошибкой браузер молча не применяет никогда — поэтому объясняем сами. */
function checkMediaQueries(code: string, problems: Problem[]) {
  for (const match of code.matchAll(/@media\b([^{};]*)/gi)) {
    const message = mediaQueryProblem(match[1].trim());
    if (message) {
      problems.push({ from: match.index, to: match.index + match[0].trimEnd().length, severity: 'error', kind: 'syntax', message });
    }
  }
}

/**
 * Понимает ли браузер медиазапрос. Сломанное условие он не выбрасывает, а считает «неизвестным» —
 * тогда не срабатывает ни сам запрос, ни его отрицание. У понятного запроса срабатывает ровно один из двух.
 */
function isKnownMedia(query: string): boolean {
  let negation: string;
  if (/^not\s/i.test(query)) negation = query.replace(/^not\s+/i, '');
  else if (query.startsWith('(')) negation = `not (${query})`;
  else negation = `not ${query.replace(/^only\s+/i, '')}`;
  return window.matchMedia(query).matches || window.matchMedia(negation).matches;
}

function mediaQueryProblem(query: string): string | undefined {
  if (!query) return 'После @media нужно условие в скобках, например @media (min-width: 600px).';
  if (isKnownMedia(query)) return undefined;
  const head = `Браузер не понимает медиазапрос «${query}».`;
  if (!query.includes('(')) return `${head} Условие пишется в круглых скобках: (min-width: 600px).`;
  const feature = /\(\s*([a-z-]+)/i.exec(query)?.[1].toLowerCase();
  if (feature && !MEDIA_FEATURES.includes(feature)) {
    const guess = nearest(feature, MEDIA_FEATURES);
    if (guess) return `${head} Может, ${guess}?`;
  }
  if (/\(\s*[a-z-]+\s+\d/i.test(query)) return `${head} Внутри скобок не хватает двоеточия: (min-width: 600px).`;
  if (/:\s*\d+\s*\)/.test(query)) return `${head} Не хватает единиц измерения — например, 600px.`;
  return `${head} Пример правильного: @media (min-width: 600px).`;
}

let browserProperties: string[] | undefined;

function suggestProperty(prop: string): string | undefined {
  const common = nearest(prop, COMMON_PROPERTIES);
  if (common) return common;
  if (!browserProperties) {
    const style = getComputedStyle(document.documentElement);
    browserProperties = Array.from({ length: style.length }, (_, i) => style[i]).filter((p) => !p.startsWith('-'));
  }
  return nearest(prop, browserProperties);
}

function checkAllowed(decl: CssDecl, prop: string, options: LintOptions, problems: Problem[]) {
  if (prop.startsWith('--')) return;
  const at = { from: decl.propFrom, to: decl.propTo };
  if (options.forbid?.some((f) => prop === f || prop.startsWith(`${f}-`))) {
    problems.push({ ...at, severity: 'error', kind: 'not-allowed', message: `В этом испытании нельзя использовать ${decl.prop}.` });
  } else if (options.allow && !options.allow.includes(prop)) {
    const reason = options.allowMessage ?? 'Здесь это свойство не разрешено';
    problems.push({ ...at, severity: 'error', kind: 'not-allowed', message: `${reason}: ${decl.prop} не подойдёт.` });
  }
}

const PSEUDO_ELEMENTS = /::?(before|after|first-line|first-letter|marker|placeholder|selection|backdrop)\b/gi;
const STATE_PSEUDO_CLASSES = /:(hover|focus-visible|focus-within|focus|active|visited|target)\b/gi;

function checkSelector(rule: CssRule, doc: Document, problems: Problem[]) {
  if (!rule.selector || rule.selector.includes('&')) return;
  const at = { from: rule.selectorFrom, to: rule.selectorTo };
  for (const part of splitSelectorList(rule.selector)) {
    if (!part) {
      problems.push({ ...at, severity: 'error', kind: 'selector', message: 'В списке селекторов лишняя запятая — из-за неё браузер пропустит всё правило.' });
      continue;
    }
    const probe = part.replace(PSEUDO_ELEMENTS, '').replace(STATE_PSEUDO_CLASSES, '').trim() || '*';
    let found: number;
    try {
      found = doc.querySelectorAll(probe).length;
    } catch {
      problems.push({ ...at, severity: 'error', kind: 'selector', message: `Ошибка в селекторе «${part}».${selectorHint(part, doc)}` });
      continue;
    }
    if (found === 0) {
      problems.push({ ...at, severity: 'warning', kind: 'selector', message: `Селектор «${part}» ничего не нашёл в сцене.${selectorHint(part, doc)}` });
    }
  }
}

function splitSelectorList(selector: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selector.length; i++) {
    const c = selector[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth = Math.max(0, depth - 1);
    else if (c === ',' && depth === 0) {
      parts.push(selector.slice(start, i).trim());
      start = i + 1;
    }
  }
  parts.push(selector.slice(start).trim());
  return parts;
}

interface SceneNames {
  classes: string[];
  ids: string[];
  tags: string[];
}

const namesCache = new WeakMap<Document, SceneNames>();

function sceneNames(doc: Document): SceneNames {
  let names = namesCache.get(doc);
  if (!names) {
    const classes = new Set<string>();
    const ids = new Set<string>();
    const tags = new Set<string>();
    for (const el of Array.from(doc.querySelectorAll('*'))) {
      el.classList.forEach((c) => classes.add(c));
      if (el.id) ids.add(el.id);
      tags.add(el.localName);
    }
    names = { classes: [...classes], ids: [...ids], tags: [...tags] };
    namesCache.set(doc, names);
  }
  return names;
}

function selectorHint(part: string, doc: Document): string {
  const names = sceneNames(doc);
  if (/^[a-z][\w-]*$/i.test(part)) {
    if (names.classes.includes(part)) return ` Похоже, пропущена точка: .${part}`;
    const tag = nearest(part, names.tags);
    if (tag) return ` Может, ${tag}?`;
    const cls = nearest(part, names.classes);
    if (cls) return ` Может, .${cls}?`;
  }
  if (/^\.[\w-]+$/.test(part)) {
    const cls = nearest(part.slice(1), names.classes);
    if (cls) return ` Может, .${cls}?`;
  }
  if (/^#[\w-]+$/.test(part)) {
    const id = nearest(part.slice(1), names.ids);
    if (id) return ` Может, #${id}?`;
  }
  return '';
}
