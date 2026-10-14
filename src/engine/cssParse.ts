/** Объявление «свойство: значение» с позициями в исходном тексте. */
export interface CssDecl {
  prop: string;
  value: string;
  important: boolean;
  propFrom: number;
  propTo: number;
  valueFrom: number;
  valueTo: number;
}

/**
 * Блок с объявлениями. style — обычное правило, keyframe — кадр внутри @keyframes,
 * at-rule — @font-face и подобные, где объявления особые.
 */
export interface CssRule {
  kind: 'style' | 'keyframe' | 'at-rule';
  selector: string;
  selectorFrom: number;
  selectorTo: number;
  decls: CssDecl[];
  /** Внешние @-правила, например ['@media (min-width: 600px)'] */
  atRules: string[];
}

export interface CssSyntaxError {
  from: number;
  to: number;
  message: string;
}

export interface ParsedCss {
  rules: CssRule[];
  errors: CssSyntaxError[];
}

const GROUPING_AT_RULES = new Set(['media', 'supports', 'container', 'layer', 'scope', 'starting-style', 'document']);
const LOOKS_LIKE_DECLARATION = /^[a-z-]+\s*:/i;

/**
 * Терпимый к ошибкам разбор CSS. Браузер молча выбрасывает сломанные куски,
 * а здесь мы запоминаем, где и что сломано, чтобы объяснить это студенту.
 */
export function parseCss(source: string): ParsedCss {
  const errors: CssSyntaxError[] = [];
  const rules: CssRule[] = [];
  const text = blankComments(source, errors);
  const len = text.length;
  let pos = 0;

  parseRuleList([], false, false);
  return { rules, errors };

  function isSpace(i: number) {
    return /\s/.test(text[i]);
  }

  function skipSpaces() {
    while (pos < len && isSpace(pos)) pos++;
  }

  function trimRange(from: number, to: number): [number, number] {
    while (from < to && isSpace(from)) from++;
    while (to > from && isSpace(to - 1)) to--;
    return [from, to];
  }

  function skipString(i: number): number {
    const quote = text[i];
    for (let j = i + 1; j < len; j++) {
      if (text[j] === '\\') j++;
      else if (text[j] === quote || text[j] === '\n') return j;
    }
    return len;
  }

  /** Первый символ из stops вне строк. «;» и «:» внутри скобок () не считаются, «{» и «}» — всегда. */
  function scan(stops: string, from: number, to = len): number {
    let depth = 0;
    for (let i = from; i < to; i++) {
      const c = text[i];
      if (c === '"' || c === "'") {
        i = skipString(i);
      } else if (c === '(') {
        depth++;
      } else if (c === ')') {
        depth = Math.max(0, depth - 1);
      } else if (stops.includes(c) && (depth === 0 || c === '{' || c === '}')) {
        return i;
      }
    }
    return to;
  }

  /** Правила верхнего уровня или содержимое @media. false — блок так и не закрыли. */
  function parseRuleList(atRules: string[], inKeyframes: boolean, nested: boolean): boolean {
    for (;;) {
      skipSpaces();
      if (pos >= len) return !nested;
      if (text[pos] === '}') {
        pos++;
        if (nested) return true;
        errors.push({ from: pos - 1, to: pos, message: 'Лишняя скобка «}» — у неё нет пары «{».' });
        continue;
      }
      const stop = scan('{;}', pos);
      const [from, to] = trimRange(pos, stop);
      const prelude = text.slice(from, to);
      if (text[stop] !== '{') {
        const isStatement = prelude.startsWith('@') && text[stop] === ';';
        if (prelude && !isStatement) {
          errors.push({
            from,
            to,
            message: !LOOKS_LIKE_DECLARATION.test(prelude)
              ? 'После селектора не хватает фигурных скобок { … }.'
              : atRules.length
                ? 'Внутри @media свойства тоже пишутся в правиле с селектором: @media (…) { .hall { flex-direction: row; } }'
                : 'Свойства пишутся внутри фигурных скобок: селектор { свойство: значение; }',
          });
        }
        pos = text[stop] === ';' ? stop + 1 : stop;
        continue;
      }
      pos = stop + 1;
      let closed: boolean;
      if (prelude.startsWith('@')) {
        const name = prelude.slice(1).split(/[\s(]/, 1)[0].toLowerCase();
        if (GROUPING_AT_RULES.has(name)) closed = parseRuleList([...atRules, prelude], inKeyframes, true);
        else if (name.endsWith('keyframes')) closed = parseRuleList([...atRules, prelude], true, true);
        else closed = parseBlock('at-rule', prelude, from, to, atRules);
      } else {
        if (!prelude) errors.push({ from: stop, to: stop + 1, message: 'Перед «{» не хватает селектора.' });
        closed = parseBlock(inKeyframes ? 'keyframe' : 'style', prelude, from, to, atRules);
      }
      if (!closed) {
        errors.push({ from: stop, to: stop + 1, message: 'Блок не закрыт: не хватает скобки «}».' });
        return false;
      }
    }
  }

  /** Блок объявлений. Вложенные правила (CSS nesting) разбираются рекурсивно. */
  function parseBlock(
    kind: CssRule['kind'],
    selector: string,
    selectorFrom: number,
    selectorTo: number,
    atRules: string[],
  ): boolean {
    const rule: CssRule = { kind, selector, selectorFrom, selectorTo, decls: [], atRules };
    rules.push(rule);
    for (;;) {
      skipSpaces();
      if (pos >= len) return false;
      if (text[pos] === '}') {
        pos++;
        return true;
      }
      if (text[pos] === ';') {
        pos++;
        continue;
      }
      const start = pos;
      const stop = scan('{;}', pos);
      if (text[stop] === '{') {
        // Вложенное правило — или забытая «}» перед следующим правилом
        const [from, to] = trimRange(start, stop);
        pos = stop + 1;
        if (!parseBlock(kind, text.slice(from, to), from, to, atRules)) {
          errors.push({ from: stop, to: stop + 1, message: 'Блок не закрыт: не хватает скобки «}».' });
          return false;
        }
        continue;
      }
      parseDeclaration(rule, start, stop);
      pos = stop;
    }
  }

  function parseDeclaration(rule: CssRule, start: number, end: number) {
    const [from, to] = trimRange(start, end);
    if (from === to) return;
    const colon = scan(':', from, to);
    if (colon === to) {
      errors.push({ from, to, message: 'Не хватает двоеточия: пиши «свойство: значение».' });
      return;
    }
    const [propFrom, propTo] = trimRange(from, colon);
    if (propFrom === propTo) {
      errors.push({ from, to: colon + 1, message: 'Перед двоеточием не хватает названия свойства.' });
      return;
    }
    const [valueFrom, rawValueTo] = trimRange(colon + 1, to);
    const important = /!\s*important$/i.exec(text.slice(valueFrom, rawValueTo));
    const valueTo = important ? trimRange(valueFrom, valueFrom + important.index)[1] : rawValueTo;
    rule.decls.push({
      prop: text.slice(propFrom, propTo),
      value: text.slice(valueFrom, valueTo),
      important: Boolean(important),
      propFrom,
      propTo,
      valueFrom,
      valueTo,
    });
  }
}

/** Код без комментариев: они заменены пробелами, поэтому позиции символов не сдвигаются. */
export function stripComments(source: string): string {
  return blankComments(source, []);
}

/** Заменяет комментарии пробелами, чтобы позиции в тексте не сдвинулись. */
function blankComments(source: string, errors: CssSyntaxError[]): string {
  return source.replace(/\/\*[\s\S]*?(\*\/|$)/g, (comment: string, end: string, offset: number) => {
    if (!end) errors.push({ from: offset, to: offset + 2, message: 'Комментарий не закрыт: не хватает «*/».' });
    return comment.replace(/[^\n]/g, ' ');
  });
}
