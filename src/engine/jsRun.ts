import workerSource from './jsWorker.js?raw';

/** Что сказал Оракул: console.log, alert или вопрос prompt вместе с ответом. */
export interface OutputLine {
  kind: 'log' | 'alert' | 'prompt' | 'confirm';
  text: string;
  /** Ответ на prompt; null — отвечать было нечего */
  answer?: string | null;
}

export type ValueType = 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'array' | 'object' | 'function' | 'bigint' | 'symbol';

/** Колба — переменная верхнего уровня после запуска. */
export interface Flask {
  declared: boolean;
  type?: ValueType;
  /** Как значение выглядит в консоли: 5, 'Аня', [1, 2] */
  shown?: string;
  /** Ключ для сравнения с эталоном */
  key?: string;
}

/** Ошибка, на которой код остановился. Строка и столбец — в коде студента, с единицы. */
export interface RunError {
  name: string;
  message: string;
  line?: number;
  column?: number;
}

export interface RunResult {
  output: OutputLine[];
  flasks: Record<string, Flask>;
  error?: RunError;
  /** Оракул устал повторять: строк больше, чем он запоминает */
  overflow?: boolean;
  /** Код работал слишком долго и был остановлен — похоже на бесконечный цикл */
  timedOut?: boolean;
}

export interface RunOptions {
  /** Ответы на prompt по порядку */
  inputs?: string[];
  /** Какие колбы прочитать после запуска */
  vars?: string[];
  /** Сколько ждать, мс */
  timeout?: number;
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
export function runScript(code: string, { inputs = [], vars = [], timeout = 2000 }: RunOptions = {}): Promise<RunResult> {
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
      finish({ output: data.output, flasks: data.flasks, error: data.error, overflow: data.overflow });
    };
    worker.onerror = (event) => {
      event.preventDefault();
      finish({ output: [], flasks: {}, error: { name: 'Error', message: event.message } });
    };
    worker.postMessage({ nonce, code, inputs, vars });
  });
}
