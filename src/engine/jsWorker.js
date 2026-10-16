/*
  Фоновый поток, в котором выполняется код студента. Страницы игры, её хранилища и аккаунта он не видит.
  Код подключается как настоящий <script>: переменные верхнего уровня остаются в общей области видимости,
  и после запуска их можно прочитать по имени — это колбы на полке.

  Получает: { nonce, code, inputs, vars, world }. Отвечает: { nonce, output, flasks, error, overflow, hero }.
  world — карта подземелья: тогда в коде есть герой (hero), а в ответе — его путь и где он остановился.
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

/* ——— Путь героя: подземелье, по которому герой ходит по приказам студента ——— */

const DIRECTIONS = { '>': [1, 0], v: [0, 1], '<': [-1, 0], '^': [0, -1] };
/** По часовой стрелке: поворот направо — следующее направление, налево — предыдущее */
const CLOCKWISE = ['>', 'v', '<', '^'];
/** Что герой видит впереди: hero.look() */
const LOOKS = { '#': 'wall', '.': 'floor', g: 'gem', b: 'bug', E: 'exit' };
/** Больше действий — значит, цикл не заканчивается */
const MAX_ACTIONS = 500;
const MAX_LOOKS = 5000;
/** Герой остановился: это бросается, чтобы прервать код студента, и ловится запуском */
const STOPPED = { toString: () => 'Герой остановился' };

function makeHero(map) {
  const grid = map.map((row) => [...row]);
  let x = 0;
  let y = 0;
  let dir = '>';
  grid.forEach((row, j) =>
    row.forEach((cell, i) => {
      if (DIRECTIONS[cell]) {
        x = i;
        y = j;
        dir = cell;
        row[i] = '.';
      }
    }),
  );
  const events = [];
  let gems = 0;
  let actions = 0;
  let looks = 0;
  let failure;

  const cellAt = (cx, cy) => grid[cy]?.[cx] ?? '#';
  const ahead = () => [x + DIRECTIONS[dir][0], y + DIRECTIONS[dir][1]];
  const record = (kind, at) => events.push(at ? { kind, x, y, dir, cx: at[0], cy: at[1] } : { kind, x, y, dir });

  function stop(message, at) {
    failure = { message, x: at ? at[0] : x, y: at ? at[1] : y };
    throw STOPPED;
  }
  // После остановки герой больше ничего не делает, даже если код поймал остановку
  function act() {
    if (failure) throw STOPPED;
    actions += 1;
    if (actions > MAX_ACTIONS) stop(`Герой выбился из сил: больше ${MAX_ACTIONS} действий. Похоже, цикл не заканчивается.`);
  }
  function sense() {
    if (failure) throw STOPPED;
    looks += 1;
    if (looks > MAX_LOOKS) stop('Герой всё осматривается и не двигается с места. Похоже, цикл не заканчивается.');
  }

  const hero = Object.freeze({
    step() {
      act();
      const [tx, ty] = ahead();
      const cell = cellAt(tx, ty);
      if (cell === '#') stop('Герой врезался в стену.', [tx, ty]);
      if (cell === 'b') stop('Герой наступил на баг, и тот его укусил. Баг впереди прогоняют: hero.zap()', [tx, ty]);
      x = tx;
      y = ty;
      record('step');
    },
    turnLeft() {
      act();
      dir = CLOCKWISE[(CLOCKWISE.indexOf(dir) + 3) % 4];
      record('turn');
    },
    turnRight() {
      act();
      dir = CLOCKWISE[(CLOCKWISE.indexOf(dir) + 1) % 4];
      record('turn');
    },
    take() {
      act();
      if (grid[y][x] !== 'g') stop('Под ногами нет кристалла — герой схватил воздух. Сначала проверь: hero.isGem()');
      grid[y][x] = '.';
      gems += 1;
      record('take', [x, y]);
    },
    zap() {
      act();
      const [tx, ty] = ahead();
      if (cellAt(tx, ty) !== 'b') stop("Впереди нет бага — заклинание ушло в пустоту. Сначала проверь: hero.look() === 'bug'", [tx, ty]);
      grid[ty][tx] = '.';
      record('zap', [tx, ty]);
    },
    isWall() {
      sense();
      return cellAt(...ahead()) === '#';
    },
    isGem() {
      sense();
      return grid[y][x] === 'g';
    },
    atExit() {
      sense();
      return grid[y][x] === 'E';
    },
    look() {
      sense();
      const cell = cellAt(...ahead());
      return LOOKS[cell] ?? (/\d/.test(cell) ? 'sign' : 'floor');
    },
    read() {
      sense();
      if (!/\d/.test(grid[y][x])) stop('Здесь нет таблички — читать нечего.');
      return Number(grid[y][x]);
    },
    gems() {
      sense();
      return gems;
    },
  });

  function report() {
    const gemsLeft = grid.reduce((sum, row) => sum + row.filter((cell) => cell === 'g').length, 0);
    return { events, x, y, dir, gems, gemsLeft, atExit: grid[y][x] === 'E', actions, failure };
  }
  return { hero, report };
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
  const { nonce, code, inputs = [], vars = [], world } = event.data;
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

  // Подземелье: герой — глобальная переменная, как console
  const dungeon = world ? makeHero(world) : null;
  if (dungeon) Object.defineProperty(self, 'hero', { value: dungeon.hero, writable: false, configurable: true });

  let error;
  const url = makeUrl(new BlobType([code], { type: 'text/javascript' }));
  try {
    loadScript(url);
  } catch (failure) {
    // Остановку героя показывает карта, это не ошибка кода
    if (failure !== STOPPED) error = describe(failure, url);
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

  send({ nonce, output, flasks, error, overflow, hero: dungeon?.report() });
};
