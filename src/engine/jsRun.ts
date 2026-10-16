import workerSource from './jsWorker.js?raw';

/** Что сказал Оракул: console.log, alert или вопрос prompt вместе с ответом. */
export interface OutputLine {
  kind: 'log' | 'alert' | 'prompt' | 'confirm';
  text: string;
  /** Ответ на prompt; null — отвечать было нечего */
  answer?: string | null;
}

export type ValueType = 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'array' | 'object' | 'function' | 'bigint' | 'symbol';

/** Вагон обоза или поле карточки: тип и как выглядит. */
export interface ValuePreview {
  type: ValueType;
  shown: string;
}

/** Колба — переменная верхнего уровня после запуска. */
export interface Flask {
  declared: boolean;
  type?: ValueType;
  /** Как значение выглядит в консоли: 5, 'Аня', [1, 2] */
  shown?: string;
  /** Ключ для сравнения с эталоном */
  key?: string;
  /** Сколько вагонов в массиве или полей в объекте */
  size?: number;
  /** Массив — обоз: первые вагоны */
  items?: ValuePreview[];
  /** Объект — карточка: первые поля */
  entries?: [string, ValuePreview][];
}

/** Вызов-флакон «Алхимии функций»: что вернул или на чём сломался. */
export interface CallResult extends Flask {
  call: string;
  error?: RunError;
}

/** Ошибка, на которой код остановился. Строка и столбец — в коде студента, с единицы. */
export interface RunError {
  name: string;
  message: string;
  line?: number;
  column?: number;
}

/** Куда смотрит герой: > вправо, v вниз, < влево, ^ вверх. */
export type Direction = '>' | 'v' | '<' | '^';

/** Действие героя и где он после него. take и zap — ещё и клетка, где взят кристалл или прогнан баг. */
export interface HeroEvent {
  kind: 'step' | 'turn' | 'take' | 'zap';
  x: number;
  y: number;
  dir: Direction;
  cx?: number;
  cy?: number;
}

/** Путь героя по подземелью и чем он закончился. */
export interface HeroReport {
  events: HeroEvent[];
  x: number;
  y: number;
  dir: Direction;
  /** Сколько кристаллов поднято и сколько осталось на карте */
  gems: number;
  gemsLeft: number;
  atExit: boolean;
  actions: number;
  /** Почему герой остановился раньше времени: врезался в стену, наступил на баг… x, y — где это случилось */
  failure?: { message: string; x: number; y: number };
}

export interface RunResult {
  output: OutputLine[];
  flasks: Record<string, Flask>;
  error?: RunError;
  /** Оракул устал повторять: строк больше, чем он запоминает */
  overflow?: boolean;
  /** Код работал слишком долго и был остановлен — похоже на бесконечный цикл */
  timedOut?: boolean;
  /** Путь героя — если код шёл по подземелью */
  hero?: HeroReport;
  /** Вызовы-флаконы — по порядку */
  calls?: CallResult[];
}

export interface RunOptions {
  /** Ответы на prompt по порядку */
  inputs?: string[];
  /** Какие колбы прочитать после запуска */
  vars?: string[];
  /** Сколько ждать, мс */
  timeout?: number;
  /** Карта подземелья: тогда в коде есть герой */
  world?: string[];
  /** Вызовы-флаконы: вычисляются после скрипта */
  calls?: string[];
}

let workerUrl: string | null = null;

function workerScript(): string {
  workerUrl ??= URL.createObjectURL(new Blob([workerSource], { type: 'text/javascript' }));
  return workerUrl;
}

/**
 * Выполняет код студента в отдельном фоновом потоке: страница игры недоступна, а зависший код
 * останавливается по таймеру. Каждый запуск — новый поток.
 */
export function runScript(code: string, { inputs = [], vars = [], timeout = 2000, world, calls = [] }: RunOptions = {}): Promise<RunResult> {
  return new Promise((resolve) => {
    const nonce = Math.random().toString(36).slice(2);
    const worker = new Worker(workerScript());
    const finish = (result: RunResult) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    };
    const timer = setTimeout(() => finish({ output: [], flasks: {}, timedOut: true }), timeout);
    worker.onmessage = (event: MessageEvent) => {
      const data = event.data as (RunResult & { nonce?: string }) | null;
      if (data?.nonce !== nonce) return;
      finish({ output: data.output, flasks: data.flasks, error: data.error, overflow: data.overflow, hero: data.hero, calls: data.calls });
    };
    worker.onerror = (event) => {
      event.preventDefault();
      finish({ output: [], flasks: {}, error: { name: 'Error', message: event.message } });
    };
    worker.postMessage({ nonce, code, inputs, vars, world, calls });
  });
}
