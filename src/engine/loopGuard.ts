import { parse } from 'acorn';

/*
  Страж циклов для страниц Города Механизмов. Код студента там работает прямо в окне страницы,
  а не в фоновом потоке, — и бесконечный цикл заморозил бы всю игру. Поэтому в начало каждого
  цикла вставляется вызов __guard(): он бросает ошибку, если цикл крутится дольше секунды.
  Вставки — без переводов строки, так что номера строк в сообщениях об ошибках не сдвигаются.
*/

/** Сообщение, по которому страница узнаёт остановку стражем */
export const LOOP_MARK = '__loop_guard__';

interface Node {
  type: string;
  start: number;
  end: number;
  [key: string]: unknown;
}

const LOOPS = new Set(['WhileStatement', 'DoWhileStatement', 'ForStatement', 'ForInStatement', 'ForOfStatement']);

function isNode(value: unknown): value is Node {
  return typeof value === 'object' && value !== null && typeof (value as Node).type === 'string';
}

/** Код со стражем в каждом цикле. Код с ошибкой разбора возвращается как есть — его и так не запустят. */
export function guardLoops(code: string): string {
  let program: Node;
  try {
    program = parse(code, { ecmaVersion: 'latest', sourceType: 'script' }) as unknown as Node;
  } catch {
    return code;
  }
  const inserts: { at: number; text: string }[] = [];
  const visit = (node: Node) => {
    if (LOOPS.has(node.type) && isNode(node.body)) {
      const body = node.body;
      if (body.type === 'BlockStatement') inserts.push({ at: body.start + 1, text: '__guard();' });
      else {
        inserts.push({ at: body.start, text: '{__guard();' });
        inserts.push({ at: body.end, text: '}' });
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === 'loc') continue;
      if (Array.isArray(value)) value.forEach((item) => isNode(item) && visit(item));
      else if (isNode(value)) visit(value);
    }
  };
  visit(program);
  // С конца — чтобы вставки не сдвигали ещё не вставленные места
  inserts.sort((a, b) => b.at - a.at);
  let guarded = code;
  for (const { at, text } of inserts) guarded = guarded.slice(0, at) + text + guarded.slice(at);
  return guarded;
}
