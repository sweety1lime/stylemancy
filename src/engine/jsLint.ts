import { parse } from 'acorn';
import { nearest } from './levenshtein';
import type { Problem } from './lint';
import type { RunError } from './jsRun';
import type { CodeRule } from './types';

/*
  Разбор кода студента до запуска: синтаксис, опечатки в именах и русские буквы в них —
  всё объясняется по-русски. Ошибки времени выполнения переводит runtimeProblem.
*/

/** Узел дерева разбора — достаточно типа и места в коде */
interface AnyNode {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

/** Глобальные имена, с которыми сравниваются опечатки */
const KNOWN_GLOBALS = [
  'console',
  'prompt',
  'alert',
  'confirm',
  'Math',
  'Number',
  'String',
  'Boolean',
  'parseInt',
  'parseFloat',
  'isNaN',
  'Array',
  'Object',
  'JSON',
  'Date',
  'undefined',
  'NaN',
  'Infinity',
  'document',
  'window',
  'setTimeout',
  'setInterval',
];

const CONSOLE_METHODS = ['log', 'info', 'warn', 'error', 'debug', 'table', 'clear', 'dir', 'group', 'groupEnd', 'time', 'timeEnd', 'count', 'assert', 'trace'];

/** Привычки из других языков и заглавные буквы там, где нужны строчные */
const WRONG_WORDS: Record<string, string> = {
  Let: 'let',
  Const: 'const',
  Var: 'var',
  If: 'if',
  Else: 'else',
  For: 'for',
  While: 'while',
  Function: 'function',
  Return: 'return',
  True: 'true',
  False: 'false',
  Null: 'null',
  None: 'null',
  Undefined: 'undefined',
  Console: 'console',
  print: 'console.log',
  Print: 'console.log',
};

/** Кириллица, похожая на латиницу: из-за неё имя выглядит верно, но не совпадает */
const CYRILLIC = /[а-яё]/gi;
const LATIN = /[a-z]/i;

/** Кавычки из текстовых редакторов: в коде JavaScript их не бывает */
const TYPOGRAPHIC_QUOTES: Record<string, string> = {
  '«': '«ёлочки»',
  '»': '«ёлочки»',
  '“': '“лапки”',
  '”': '“лапки”',
  '„': '„лапки“',
  '‘': '‘одинарные лапки’',
  '’': '‘одинарные лапки’',
};

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '${': '}' };

export interface JsLintResult {
  problems: Problem[];
  /** Имена переменных верхнего уровня — колбы на полке */
  topLevel: string[];
}

function lineOf(code: string, offset: number): number {
  return code.slice(0, offset).split('\n').length;
}

function error(from: number, to: number, message: string, kind: Problem['kind'] = 'syntax'): Problem {
  return { from, to: Math.max(to, from + 1), severity: 'error', kind, message };
}

/**
 * Скобки, кавычки и комментарии: находит первое, что не закрыто или закрыто не той скобкой, —
 * так сообщение точнее, чем «Unexpected token» где-то дальше.
 */
function scanStructure(code: string): Problem[] {
  const problems: Problem[] = [];
  const stack: { char: string; pos: number }[] = [];
  const n = code.length;
  let i = 0;
  while (i < n) {
    const top = stack[stack.length - 1];
    const ch = code[i];
    // Внутри шаблонной строки: текст до обратной кавычки, а ${ … } — снова код
    if (top?.char === '`') {
      if (ch === '\\') i += 2;
      else if (ch === '`') {
        stack.pop();
        i++;
      } else if (ch === '$' && code[i + 1] === '{') {
        stack.push({ char: '${', pos: i });
        i += 2;
      } else i++;
      continue;
    }
    if (ch === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      i = end === -1 ? n : end;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      if (end === -1) return [error(i, i + 2, 'Комментарий не закрыт: не хватает «*/».')];
      i = end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < n && code[j] !== ch && code[j] !== '\n') j += code[j] === '\\' ? 2 : 1;
      if (j >= n || code[j] === '\n') {
        return [error(i, j, `Строка не закрыта: не хватает кавычки ${ch} в конце. Строка в кавычках не может переноситься на новую строчку.`)];
      }
      i = j + 1;
      continue;
    }
    if (ch === '`') {
      stack.push({ char: '`', pos: i });
      i++;
      continue;
    }
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push({ char: ch, pos: i });
      i++;
      continue;
    }
    if (ch === ')' || ch === ']' || ch === '}') {
      if (!top) return [error(i, i + 1, `Лишняя скобка «${ch}»: открывающей для неё нет.`)];
      if (PAIRS[top.char] !== ch) {
        const open = top.char === '${' ? '${' : top.char;
        return [
          error(i, i + 1, `Скобка «${open}» из строки ${lineOf(code, top.pos)} закрывается не той скобкой: «${ch}» вместо «${PAIRS[top.char]}».`),
        ];
      }
      stack.pop();
      i++;
      continue;
    }
    if (TYPOGRAPHIC_QUOTES[ch]) {
      problems.push(
        error(i, i + 1, `Кавычки ${TYPOGRAPHIC_QUOTES[ch]} JavaScript не понимает — для строк пиши обычные ' или ". Внутри строки такие кавычки можно.`),
      );
      // Закрывающую кавычку на той же строке второй раз не ругаем
      const close = code.slice(i + 1).search(/[»”“’‘\n]/);
      i = close === -1 || code[i + 1 + close] === '\n' ? i + 1 : i + 2 + close;
      continue;
    }
    i++;
  }
  if (problems.length) return problems;
  const open = stack[stack.length - 1];
  if (open?.char === '`') return [error(open.pos, open.pos + 1, 'Шаблонная строка не закрыта: не хватает обратной кавычки `.')];
  if (open) {
    return [error(open.pos, open.pos + open.char.length, `Не закрыта скобка «${open.char}» из строки ${lineOf(code, open.pos)}: не хватает «${PAIRS[open.char]}».`)];
  }
  return [];
}

/** Слово в коде, не в строке и не в комментарии: так ловим Let и Console до разбора. */
function wrongWords(code: string): Problem[] {
  const problems: Problem[] = [];
  const blank = blankStringsAndComments(code);
  for (const match of blank.matchAll(/(?<![.\w$])([A-Za-z_$][\w$]*)/g)) {
    const word = match[1];
    const right = WRONG_WORDS[word];
    if (!right) continue;
    const from = match.index ?? 0;
    // print может быть своей функцией студента — тогда это не ошибка
    if ((word === 'print' || word === 'Print') && new RegExp(`function\\s+${word}\\b|(let|const|var)\\s+${word}\\b`).test(blank)) continue;
    problems.push(error(from, from + word.length, wordMessage(word, right), 'name'));
  }
  return problems;
}

function wordMessage(word: string, right: string): string {
  if (right === 'console.log') return `В JavaScript вместо ${word} пишут console.log(…).`;
  if (word === 'None') return 'None — это из Python. В JavaScript пустое значение — null.';
  return `${word} пишется с маленькой буквы: ${right}. В JavaScript большие и маленькие буквы различаются.`;
}

/** Строки и комментарии заменены пробелами — позиции не сдвигаются. */
function blankStringsAndComments(code: string): string {
  return code.replace(/\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?|`(?:\\[\s\S]|[^`\\])*`?/g, (part) =>
    part.replace(/[^\n]/g, ' '),
  );
}

/** Комментарии заменены пробелами: правила уровня (require, reject) не смотрят в заметки студента. */
export function stripJsComments(code: string): string {
  return code.replace(/\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)|'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?|`(?:\\[\s\S]|[^`\\])*`?/g, (part) =>
    part.startsWith('/') ? part.replace(/[^\n]/g, ' ') : part,
  );
}

interface AcornError extends SyntaxError {
  pos: number;
  raisedAt?: number;
}

/** Строка в кавычках, слово или знак, с которого начинается код в этом месте. */
function tokenAt(code: string, pos: number): string {
  const rest = code.slice(pos);
  const text = /^(['"`])(?:\\.|(?!\1)[^\\\n])*\1?/.exec(rest);
  if (text) return text[0];
  const word = /^[\p{L}\p{N}_$]+/u.exec(rest);
  return word ? word[0] : (rest.match(/^\S/)?.[0] ?? '');
}

/** Предыдущая строка в кавычках, слово или знак перед этим местом (пробелы пропускаются). */
function tokenBefore(code: string, pos: number): { text: string; sameLine: boolean } {
  const before = code.slice(0, pos);
  const trimmed = before.replace(/\s+$/, '');
  const found = /(['"`])(?:\\.|(?!\1)[^\\\n])*\1$/.exec(trimmed) ?? /[\p{L}\p{N}_$]+$/u.exec(trimmed);
  const text = found ? found[0] : trimmed.slice(-1);
  return { text, sameLine: !before.slice(trimmed.length).includes('\n') };
}

const IS_WORD = /^[\p{L}_$][\p{L}\p{N}_$]*$/u;

/** Значение или имя: после него нужен знак операции, а не ещё одно значение */
function isValueToken(token: string): boolean {
  return /^[\p{L}\p{N}_$]+$/u.test(token) || token === ')' || token === ']' || /^['"`]/.test(token);
}

/** Имена после let, const и var — когда код не разбирается целиком, ищем их просто по тексту. */
function declaredByText(code: string): string[] {
  return [...blankStringsAndComments(code).matchAll(/\b(?:let|const|var)\s+([\p{L}_$][\p{L}\p{N}_$]*)/gu)].map((match) => match[1]);
}

/** Перевод ошибки разбора на человеческий язык. */
function syntaxProblem(code: string, failure: AcornError): Problem {
  const pos = Math.min(failure.pos ?? 0, code.length);
  const raw = failure.message.replace(/\s*\(\d+:\d+\)$/, '');
  const token = tokenAt(code, pos);
  const to = pos + Math.max(1, token.length);
  const before = tokenBefore(code, pos);
  const declaration = /\b(let|const|var)\s+([\p{L}_$][\p{L}\p{N}_$]*)\s*$/u.exec(code.slice(0, pos));

  let match: RegExpExecArray | null;
  if ((match = /^Identifier '(.+)' has already been declared$/.exec(raw))) {
    return error(pos, pos + match[1].length, `Переменная ${match[1]} уже объявлена выше. Второй раз let не нужен: чтобы налить новое значение, пиши просто ${match[1]} = …`);
  }
  if (raw === 'Identifier directly after number') {
    // Назад — до начала слова, а не только по цифрам: в 2ndGem acorn читает «2n» как большое число и спотыкается на «d»
    let from = pos;
    while (from > 0 && /[\p{L}\p{N}_$]/u.test(code[from - 1])) from--;
    return error(from, to, 'Имя переменной не может начинаться с цифры. Цифры можно в середине или в конце: gem2, secondGem.');
  }
  if (raw === 'Assigning to rvalue') {
    return error(pos, to, 'Слева от = должно стоять имя переменной: значение наливают в колбу, а не наоборот. Чтобы сравнить два значения, нужно ===.');
  }
  if ((match = /^The keyword '(.+)' is reserved$/.exec(raw)) || (match = /^Unexpected keyword '(.+)'$/.exec(raw))) {
    if (/\b(let|const|var)\s*$/.test(code.slice(0, pos))) {
      return error(pos, to, `${match[1]} — служебное слово JavaScript, так переменную назвать нельзя.`);
    }
    return error(pos, to, `Слово ${match[1]} здесь не к месту. Проверь строку выше: может, там что-то не дописано.`);
  }
  if (/^Unterminated string constant/.test(raw)) return error(pos, to, 'Строка не закрыта: не хватает закрывающей кавычки.');
  if (/^Unterminated template/.test(raw)) return error(pos, to, 'Шаблонная строка не закрыта: не хватает обратной кавычки `.');
  if (/^Unterminated comment/.test(raw)) return error(pos, to, 'Комментарий не закрыт: не хватает «*/».');
  if ((match = /^Unexpected character '(.+)'$/.exec(raw))) return error(pos, to, `Символ «${match[1]}» JavaScript не понимает.`);

  if (/^Unexpected token/.test(raw)) {
    if (!token) return error(Math.max(0, pos - 1), pos, 'Код оборвался на полуслове: что-то не дописано.');
    // let magic power = … — пробел в имени
    if (declaration && IS_WORD.test(token) && before.sameLine) {
      const glued = declaration[2] + token[0].toUpperCase() + token.slice(1);
      return error(pos, to, `В имени переменной не может быть пробела: «${declaration[2]} ${token}». Склей слова, вторую часть — с большой буквы: ${glued}.`);
    }
    // const x; — запечатанную колбу наполняют сразу
    if (/\bconst\s+[\p{L}_$][\p{L}\p{N}_$]*\s*$/u.test(code.slice(0, pos)) && (token === ';' || !before.sameLine)) {
      return error(pos, to, 'Запечатанную колбу (const) нужно наполнить сразу: const имя = значение;');
    }
    if (token === '=' && before.text === '=') {
      return error(pos, to, 'Здесь лишнее =. Чтобы налить значение — один знак =, чтобы сравнить — три: ===.');
    }
    if (before.text === '=' && (token === ';' || !before.sameLine)) {
      return error(Math.max(0, pos - 1), to, 'После = нужно значение: что налить в колбу?');
    }
    if (before.sameLine && isValueToken(before.text) && (isValueToken(token) || token === '(')) {
      // console.log(magic power) — имя с пробелом, хотя колба называется magicPower
      const glued = [before.text + token[0].toUpperCase() + token.slice(1), before.text + token];
      const known = glued.find((name) => declaredByText(code).includes(name));
      if (known) return error(pos, to, `В имени не может быть пробела: «${before.text} ${token}» — может, ${known}?`);
      return error(pos, to, `Между «${before.text}» и «${token}» чего-то не хватает: запятой, знака операции (+, -, *) или точки с запятой.`);
    }
    return error(pos, to, `JavaScript не ожидал здесь «${token}». Проверь, не пропущены ли скобка, кавычка, запятая или знак операции перед ним.`);
  }
  return error(pos, to, 'JavaScript не может разобрать код в этом месте. Проверь скобки, кавычки и запятые.');
}

function isNode(value: unknown): value is AnyNode {
  return typeof value === 'object' && value !== null && typeof (value as AnyNode).type === 'string';
}

function childNodes(node: AnyNode): AnyNode[] {
  const result: AnyNode[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc') continue;
    if (Array.isArray(value)) value.forEach((item) => isNode(item) && result.push(item));
    else if (isNode(value)) result.push(value);
  }
  return result;
}

/** Имена в коде: где объявлены, где читаются, куда наливают и чьи свойства берут. */
interface Names {
  declared: Map<string, AnyNode>;
  reads: AnyNode[];
  writes: AnyNode[];
  members: AnyNode[];
}

function collectNames(program: AnyNode): Names {
  const names: Names = { declared: new Map(), reads: [], writes: [], members: [] };

  function declare(pattern: unknown): void {
    if (!isNode(pattern)) return;
    switch (pattern.type) {
      case 'Identifier':
        if (!names.declared.has(pattern.name as string)) names.declared.set(pattern.name as string, pattern);
        return;
      case 'ObjectPattern':
        (pattern.properties as AnyNode[]).forEach((property) => declare(property.type === 'RestElement' ? property.argument : property.value));
        return;
      case 'ArrayPattern':
        (pattern.elements as unknown[]).forEach(declare);
        return;
      case 'RestElement':
        declare(pattern.argument);
        return;
      case 'AssignmentPattern':
        declare(pattern.left);
        visit(pattern.right as AnyNode);
        return;
    }
  }

  function visit(node: AnyNode): void {
    switch (node.type) {
      case 'Identifier':
        names.reads.push(node);
        return;
      case 'MemberExpression':
        names.members.push(node);
        visit(node.object as AnyNode);
        if (node.computed) visit(node.property as AnyNode);
        return;
      case 'Property':
      case 'MethodDefinition':
      case 'PropertyDefinition':
        if (node.computed) visit(node.key as AnyNode);
        if (isNode(node.value)) visit(node.value);
        return;
      case 'VariableDeclarator':
        declare(node.id);
        if (isNode(node.init)) visit(node.init);
        return;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
      case 'ClassDeclaration':
      case 'ClassExpression':
        declare(node.id);
        ((node.params as unknown[]) ?? []).forEach(declare);
        if (isNode(node.superClass)) visit(node.superClass);
        visit(node.body as AnyNode);
        return;
      case 'CatchClause':
        declare(node.param);
        visit(node.body as AnyNode);
        return;
      case 'AssignmentExpression':
      case 'UpdateExpression': {
        const target = (node.type === 'AssignmentExpression' ? node.left : node.argument) as AnyNode;
        if (target.type === 'Identifier') names.writes.push(target);
        else visit(target);
        if (isNode(node.right)) visit(node.right);
        // gems += 3 и gems++ ещё и читают колбу
        if (target.type === 'Identifier' && (node.type === 'UpdateExpression' || node.operator !== '=')) names.reads.push(target);
        return;
      }
      case 'LabeledStatement':
        visit(node.body as AnyNode);
        return;
      case 'BreakStatement':
      case 'ContinueStatement':
        return;
      default:
        childNodes(node).forEach(visit);
    }
  }

  visit(program);
  return names;
}

/** Переменные верхнего уровня — их колбы стоят на полке. */
function topLevelNames(program: AnyNode): string[] {
  const result: string[] = [];
  for (const statement of program.body as AnyNode[]) {
    if (statement.type === 'VariableDeclaration') {
      for (const declarator of statement.declarations as AnyNode[]) {
        const id = declarator.id as AnyNode;
        if (id.type === 'Identifier') result.push(id.name as string);
      }
    } else if ((statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') && isNode(statement.id)) {
      result.push(statement.id.name as string);
    }
  }
  return result;
}

function cyrillicLetters(name: string): string[] {
  return [...new Set(name.match(CYRILLIC) ?? [])];
}

/** Русские буквы внутри латинского имени: выглядит верно, а JavaScript видит другое имя. */
function mixedScriptMessage(name: string): string | undefined {
  const letters = cyrillicLetters(name);
  if (!letters.length || !LATIN.test(name)) return undefined;
  const list = letters.map((letter) => `«${letter}»`).join(', ');
  const [which, looks] = letters.length > 1 ? ['русские буквы', 'они похожи на латинские'] : ['русская буква', 'она похожа на латинскую'];
  return `В имени «${name}» есть ${which} ${list} — ${looks}, но для JavaScript это другое имя. Переключи раскладку и перепиши слово.`;
}

function existsGlobally(name: string): boolean {
  return KNOWN_GLOBALS.includes(name) || name in globalThis;
}

/** Опечатки и русские буквы в именах, команды, которых у console нет. */
function nameProblems(program: AnyNode): Problem[] {
  const problems: Problem[] = [];
  const { declared, reads, writes, members } = collectNames(program);
  const declaredNames = [...declared.keys()];
  const reported = new Set<string>();

  for (const [name, node] of declared) {
    const mixed = mixedScriptMessage(name);
    if (mixed) {
      problems.push(error(node.start, node.end, mixed, 'name'));
      reported.add(name);
    } else if (cyrillicLetters(name).length) {
      problems.push({
        from: node.start,
        to: node.end,
        severity: 'warning',
        kind: 'name',
        message: `Русские имена переменных JavaScript понимает, но так не принято: пиши латиницей, например gems или heroName.`,
      });
    }
  }

  for (const node of reads) {
    const name = node.name as string;
    if (declared.has(name) || WRONG_WORDS[name] || reported.has(name)) continue;
    const mixed = mixedScriptMessage(name);
    const typo = nearest(name, [...declaredNames, ...KNOWN_GLOBALS]);
    if (mixed) problems.push(error(node.start, node.end, mixed, 'name'));
    else if (existsGlobally(name)) continue;
    else if (typo && typo.toLowerCase() === name.toLowerCase()) {
      problems.push(error(node.start, node.end, `${name} — может, ${typo}? В JavaScript большие и маленькие буквы различаются.`, 'name'));
    } else if (typo) problems.push(error(node.start, node.end, `${name} — может, ${typo}?`, 'name'));
    else problems.push(error(node.start, node.end, `Переменная ${name} не объявлена. Создай её: let ${name} = …`, 'name'));
    reported.add(name);
  }

  for (const node of writes) {
    const name = node.name as string;
    if (declared.has(name) || reported.has(name) || existsGlobally(name)) continue;
    const typo = nearest(name, declaredNames);
    if (typo) problems.push(error(node.start, node.end, `${name} — может, ${typo}? Такой колбы нет.`, 'name'));
    else {
      problems.push({
        from: node.start,
        to: node.end,
        severity: 'warning',
        kind: 'name',
        message: `Колба ${name} создаётся без let. Так JavaScript разрешает, но маги так не делают: объяви её — let ${name} = …`,
      });
    }
    reported.add(name);
  }

  for (const node of members) {
    const object = node.object as AnyNode;
    const property = node.property as AnyNode;
    if (node.computed || property.type !== 'Identifier') continue;
    const name = property.name as string;
    if (object.type === 'Identifier' && object.name === 'console' && !CONSOLE_METHODS.includes(name)) {
      const typo = nearest(name, CONSOLE_METHODS);
      problems.push(error(property.start, property.end, `У console нет команды ${name}${typo ? ` — может, ${typo}?` : '. Обычно пишут console.log.'}`, 'name'));
    } else if (object.type === 'Identifier' && object.name === 'Math' && !(name in Math)) {
      const typo = nearest(name, Object.getOwnPropertyNames(Math));
      problems.push(error(property.start, property.end, `У Math нет ${name}${typo ? ` — может, ${typo}?` : '.'}`, 'name'));
    } else if (name !== 'length' && nearest(name, ['length']) === 'length') {
      problems.push(error(property.start, property.end, `${name} — может, length? Длина пишется так: l-e-n-g-t-h.`, 'name'));
    }
  }
  return problems;
}

const ARITHMETIC = ['+', '-', '*', '/', '%', '**'];
const COMPARISON = ['==', '===', '!=', '!==', '<', '>', '<=', '>='];

/**
 * Значение посчитано и сразу забыто: `gems + 3;` не доливает колбу, а `gems == 8;` — сравнивает, а не наливает.
 * Код при этом работает, поэтому это предупреждение, а не ошибка.
 */
function lostValues(program: AnyNode, code: string): Problem[] {
  const problems: Problem[] = [];
  function visit(node: AnyNode): void {
    if (node.type === 'ExpressionStatement' && !node.directive) {
      const expression = node.expression as AnyNode;
      const text = code.slice(expression.start, expression.end);
      const operator = expression.operator as string;
      let message: string | undefined;
      if (expression.type === 'BinaryExpression' && COMPARISON.includes(operator)) {
        message = `${text} — это сравнение, и его ответ пропадает. Чтобы налить значение в колбу, нужен один знак =.`;
      } else if (expression.type === 'BinaryExpression' && ARITHMETIC.includes(operator)) {
        const left = expression.left as AnyNode;
        message =
          left.type === 'Identifier'
            ? `${text} посчитано, но никуда не налито — колба ${left.name as string} не изменилась. Чтобы долить её, пиши ${left.name as string} = ${text};`
            : `${text} посчитано и сразу забыто. Покажи результат Оракулу — console.log(${text}) — или налей его в колбу.`;
      } else if (expression.type === 'Identifier' || expression.type === 'Literal' || expression.type === 'TemplateLiteral') {
        message = `${text} — значение без приказа: его никто не увидит. Может, нужен console.log(${text})?`;
      }
      if (message) problems.push({ from: expression.start, to: expression.end, severity: 'warning', kind: 'unused', message });
    }
    childNodes(node).forEach(visit);
  }
  visit(program);
  return problems;
}

/**
 * Проверяет код студента. rules — ещё и приёмы уровня (require, reject):
 * они проверяются только по «Сотворить», пока код пишется — не мешают.
 */
export function lintJs(code: string, rules?: { require?: CodeRule[]; reject?: CodeRule[] }): JsLintResult {
  const words = wrongWords(code);
  let program: AnyNode;
  try {
    program = parse(code, { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: false }) as unknown as AnyNode;
  } catch (failure) {
    const structure = scanStructure(code);
    const problems = structure.length ? structure : words.length ? words : [syntaxProblem(code, failure as AcornError)];
    return { problems, topLevel: [] };
  }
  const problems = [...words, ...nameProblems(program).filter((problem) => !words.some((word) => word.from === problem.from)), ...lostValues(program, code)];
  if (rules) problems.push(...ruleProblems(code, rules));
  return { problems, topLevel: topLevelNames(program) };
}

/** Обязательные и запрещённые приёмы уровня. Комментарии не считаются. */
export function ruleProblems(code: string, { require = [], reject = [] }: { require?: CodeRule[]; reject?: CodeRule[] }): Problem[] {
  const clean = stripJsComments(code);
  const problems: Problem[] = [];
  for (const rule of require) {
    if (!new RegExp(rule.pattern, 'm').test(clean)) problems.push({ from: 0, to: 0, severity: 'error', kind: 'required', message: rule.message });
  }
  for (const rule of reject) {
    const match = new RegExp(rule.pattern, 'm').exec(clean);
    if (match) problems.push({ from: match.index, to: match.index + match[0].length, severity: 'error', kind: 'required', message: rule.message });
  }
  return problems;
}

function offsetOf(code: string, line: number, column: number): number {
  const lines = code.split('\n');
  let offset = 0;
  for (let i = 0; i < line - 1 && i < lines.length; i++) offset += lines[i].length + 1;
  return Math.min(code.length, offset + Math.max(0, column - 1));
}

/** Ошибка, на которой код остановился, — по-русски и с местом в коде. */
export function runtimeProblem(code: string, failure: RunError): Problem {
  const lines = code.split('\n');
  const line = failure.line && failure.line <= lines.length ? failure.line : undefined;
  const from = line ? offsetOf(code, line, failure.column ?? 1) : 0;
  const lineText = line ? lines[line - 1] : '';
  const lineEnd = line ? offsetOf(code, line, lineText.length + 1) : 0;
  const word = tokenAt(code, from);
  const to = word ? from + word.length : lineEnd;
  const message = runtimeMessage(failure, lineText, code);
  return { from, to: Math.max(to, from + 1), severity: 'error', kind: 'runtime', message };
}

function runtimeMessage({ name, message }: RunError, lineText: string, code: string): string {
  let match: RegExpExecArray | null;
  if ((match = /^(.+) is not defined$/.exec(message))) {
    return `Переменная ${match[1]} не объявлена. Создай её через let — или проверь, нет ли опечатки.`;
  }
  if ((match = /^Cannot access '(.+)' before initialization$/.exec(message)) || (match = /^can't access lexical declaration '(.+)' before initialization$/.exec(message))) {
    return `Колба ${match[1]} используется раньше, чем создана: строка с let ${match[1]} = … должна стоять выше.`;
  }
  if (/^Assignment to constant variable\.?$/.test(message) || (match = /^invalid assignment to const '(.+)'$/.exec(message))) {
    const constName = match?.[1] ?? constTarget(lineText, code);
    const which = constName ? `Колба ${constName} запечатана` : 'Эта колба запечатана';
    return `${which}: она объявлена через const, и менять её нельзя. Если значение должно меняться — объяви её через let.`;
  }
  if ((match = /^(.+) is not a function$/.exec(message))) {
    return `«${match[1]}» — не команда: её нельзя вызвать со скобками ().`;
  }
  if ((match = /^Cannot read properties of (undefined|null) \(reading '(.+)'\)$/.exec(message))) {
    return `Пытаешься взять «${match[2]}» у пустоты — значение ${match[1]}. Проверь, что в колбе что-то есть.`;
  }
  if ((match = /^Cannot set properties of (undefined|null)/.exec(message))) {
    return `Пытаешься записать свойство в пустоту — значение ${match[1]}.`;
  }
  if (/Maximum call stack size exceeded|too much recursion/.test(message)) {
    return 'Функция вызывает сама себя без конца — у неё нет условия, когда остановиться.';
  }
  if (name === 'Throw') return `Код выбросил: ${message}`;
  return `Код остановился с ошибкой ${name}: ${message}`;
}

/** Какой запечатанной колбе пытались налить новое значение в этой строке. */
function constTarget(lineText: string, code: string): string | undefined {
  for (const match of lineText.matchAll(/([\p{L}_$][\p{L}\p{N}_$]*)\s*(?:[-+*/%]?=(?!=)|\+\+|--)/gu)) {
    if (new RegExp(`\\bconst\\s+${match[1]}\\b`, 'u').test(code)) return match[1];
  }
  return undefined;
}
