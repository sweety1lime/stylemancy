/*
  Фоновый поток, в котором выполняется код студента. Страницы игры, её хранилища и аккаунта он не видит.
  Код подключается как настоящий <script>: переменные верхнего уровня остаются в общей области видимости,
  и после запуска их можно прочитать по имени — это колбы на полке.

  Получает: { nonce, code, inputs, vars }. Отвечает: { nonce, output, flasks, error, overflow }.
  Каждый запуск — новый поток: переменные прошлого запуска не мешают.
*/

// Всё нужное запоминаем до кода студента: он может переписать что угодно в глобальной области
const send = self.postMessage.bind(self);
const evalGlobal = self.eval;
const loadScript = self.importScripts.bind(self);
const makeUrl = URL.createObjectURL.bind(URL);
const dropUrl = URL.revokeObjectURL.bind(URL);
const isArray = Array.isArray;
const keysOf = Object.keys;
const BlobType = Blob;

/** Больше строк Оракул не запоминает — бесконечный вывод остановит таймер */
const MAX_LINES = 500;

function typeOf(value) {
  if (value === null) return 'null';
  if (isArray(value)) return 'array';
  return typeof value;
}

/** Как значение выглядит в консоли браузера. quote — строки в кавычках: внутри массивов и в колбах. */
function show(value, quote, depth) {
  switch (typeOf(value)) {
    case 'string':
      return quote ? `'${value}'` : value;
    case 'number':
      return Object.is(value, -0) ? '-0' : String(value);
    case 'bigint':
      return `${value}n`;
    case 'function':
      return `ƒ ${value.name || ''}()`;
    case 'symbol':
      return value.toString();
    case 'array': {
      if (depth > 2) return '[…]';
      const items = value.slice(0, 50).map((item) => show(item, true, depth + 1));
      if (value.length > 50) items.push('…');
      return `[${items.join(', ')}]`;
    }
    case 'object': {
      if (depth > 2) return '{…}';
      const entries = keysOf(value)
        .slice(0, 30)
        .map((key) => `${key}: ${show(value[key], true, depth + 1)}`);
      return entries.length ? `{${entries.join(', ')}}` : '{}';
    }
    default:
      return String(value);
  }
}

/** Ключ для сравнения с эталоном: у объектов порядок свойств не важен. */
function compareKey(value, depth) {
  const type = typeOf(value);
  if (depth > 3) return type;
  if (type === 'array') return `[${value.map((item) => compareKey(item, depth + 1)).join(',')}]`;
  if (type === 'object') {
    return `{${keysOf(value)
      .sort()
      .map((key) => `${key}:${compareKey(value[key], depth + 1)}`)
      .join(',')}}`;
  }
  return `${type}:${show(value, true, depth)}`;
}

function snapshot(value) {
  return { type: typeOf(value), shown: show(value, true, 0), key: compareKey(value, 0) };
}

function describe(error, url) {
  if (error instanceof Error) {
    const stack = String(error.stack || '');
    const at = stack.indexOf(url);
    const place = at === -1 ? null : /^:(\d+):(\d+)/.exec(stack.slice(at + url.length));
    return {
      name: error.name,
      message: error.message,
      line: place ? Number(place[1]) : undefined,
      column: place ? Number(place[2]) : undefined,
    };
  }
  return { name: 'Throw', message: show(error, true, 0) };
}

self.onmessage = (event) => {
  const { nonce, code, inputs = [], vars = [] } = event.data;
  const output = [];
  const answers = inputs.slice();
  let overflow = false;

  function record(line) {
    if (output.length < MAX_LINES) output.push(line);
    else overflow = true;
  }

  const say = (...args) => record({ kind: 'log', text: args.map((arg) => show(arg, false, 0)).join(' ') });
  self.console = { log: say, info: say, warn: say, error: say, debug: say, table: say, clear() {} };
  self.alert = (message) => record({ kind: 'alert', text: message === undefined ? '' : String(message) });
  self.prompt = (question) => {
    const answer = answers.length > 0 ? String(answers.shift()) : null;
    record({ kind: 'prompt', text: question === undefined ? '' : String(question), answer });
    return answer;
  };
  self.confirm = (question) => {
    record({ kind: 'confirm', text: question === undefined ? '' : String(question) });
    return true;
  };

  let error;
  const url = makeUrl(new BlobType([code], { type: 'text/javascript' }));
  try {
    loadScript(url);
  } catch (failure) {
    error = describe(failure, url);
  }
  dropUrl(url);

  // Колбы: переменные верхнего уровня видны следующему коду, как соседнему <script> на странице
  const flasks = {};
  for (const name of vars) {
    try {
      flasks[name] = { declared: true, ...snapshot(evalGlobal(name)) };
    } catch {
      flasks[name] = { declared: false };
    }
  }

  send({ nonce, output, flasks, error, overflow });
};
