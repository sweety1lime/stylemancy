import type { GoalStatus } from './htmlCheck';
import { lintJs, runtimeProblem } from './jsLint';
import { runScript, type Flask, type OutputLine, type RunResult, type ValueType } from './jsRun';
import type { Problem } from './lint';
import type { JsLevel, JsRun } from './types';

/*
  Проверка JS-уровня: код студента и эталон запускаются с одними и теми же ответами на prompt,
  потом сравниваются слова Оракула (строки по порядку) и колбы (значение и тип).
*/

export const TYPE_NAMES: Record<ValueType, string> = {
  number: 'число',
  string: 'строка',
  boolean: 'логическое',
  undefined: 'пусто',
  null: 'null',
  array: 'массив',
  object: 'объект',
  function: 'функция',
  bigint: 'большое число',
  symbol: 'символ',
};

/** Сколько колб помещается на полке */
const SHELF_SIZE = 6;

export interface FlaskStatus {
  name: string;
  flask?: Flask;
  /** Что должно быть в колбе — только у проверяемых */
  target?: Flask;
  ok?: boolean;
}

export interface RunStatus {
  run: JsRun;
  /** Подпись запуска, если их несколько */
  label?: string;
  result: RunResult;
  target: RunResult;
  /** Какие строки вывода совпали с эталоном */
  lineOk: boolean[];
  flasks: FlaskStatus[];
  /** Что не так — по-русски */
  misses: string[];
}

export interface JsEvaluation {
  passed: boolean;
  /** Ошибки в коде: синтаксис, имена, ошибка во время работы, приёмы уровня */
  errors: Problem[];
  warnings: Problem[];
  runs: RunStatus[];
  goals: GoalStatus[];
  misses: string[];
}

function runsOf(level: JsLevel): JsRun[] {
  return level.runs?.length ? level.runs : [{}];
}

function runLabel(level: JsLevel, run: JsRun, index: number): string | undefined {
  if (runsOf(level).length < 2) return undefined;
  return run.label ?? `Запуск ${index + 1}`;
}

const targetCache = new Map<string, Promise<RunResult[]>>();

/** Эталон запускается один раз на уровень: по нему строятся цели. */
export function targetRuns(level: JsLevel): Promise<RunResult[]> {
  let cached = targetCache.get(level.id);
  if (!cached) {
    const vars = level.check.vars ?? [];
    cached = Promise.all(runsOf(level).map((run) => runScript(level.solutionJs, { inputs: run.inputs, vars, timeout: 4000 })));
    targetCache.set(level.id, cached);
  }
  return cached;
}

/** Колбы на полке: сначала проверяемые, потом свои переменные студента. */
export function shelfNames(level: JsLevel, topLevel: string[]): string[] {
  const names = [...(level.check.vars ?? [])];
  for (const name of topLevel) if (!names.includes(name)) names.push(name);
  return names.slice(0, Math.max(SHELF_SIZE, level.check.vars?.length ?? 0));
}

function sameLine(actual: OutputLine | undefined, target: OutputLine | undefined): boolean {
  if (!actual || !target || actual.kind !== target.kind) return false;
  // У вопроса prompt важен сам вопрос, а не его точные слова
  return actual.kind === 'prompt' || actual.text === target.text;
}

const SAYS: Record<OutputLine['kind'], string> = {
  log: 'console.log',
  alert: 'alert',
  prompt: 'prompt',
  confirm: 'confirm',
};

/** Число в кавычках рядом с плюсом: '7' + 5 склеивает, а не складывает */
const QUOTED_SUM = /(['"`])\d+\1\s*\+|\+\s*(['"`])\d+\2/;

/** Почему строка не совпала — подсказка в конце сообщения. */
function lineHint(actual: string, target: string, names: string[], code: string): string {
  if (names.includes(actual)) return ' — убери кавычки: Оракул прочёл слово, а не заглянул в колбу';
  if (actual === 'undefined') return ' — в колбе пусто (undefined)';
  if (actual.includes('${') && !target.includes('${')) return ' — ${…} подставляет значение только в шаблоне, в обратных кавычках `` ` ``. В обычных кавычках он остаётся текстом';
  if (actual.includes('NaN') && !target.includes('NaN')) {
    return ' — это шут NaN: где-то Number не смог прочесть строку как число, а всё, что смешали с NaN, тоже стало NaN';
  }
  if (actual.replace(/\s/g, '') === target.replace(/\s/g, '')) return ' — проверь пробелы';
  if (actual.toLowerCase() === target.toLowerCase()) return ' — проверь большие и маленькие буквы';
  const bare = (text: string) => text.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
  if (bare(actual) === bare(target)) return ' — проверь знаки препинания';
  if (/^\d+$/.test(actual) && /^-?\d+(\.\d+)?$/.test(target) && (actual.length > target.length || QUOTED_SUM.test(code))) {
    return ' — похоже, числа склеились как строки: плюс складывает только числа. Убери кавычки или преврати строку в число через Number(…)';
  }
  return '';
}

function quote(text: string): string {
  return text === '' ? 'пустую строку' : `«${text}»`;
}

function compareOutput(actual: OutputLine[], target: OutputLine[], names: string[], code: string): { lineOk: boolean[]; misses: string[] } {
  const lineOk = actual.map((line, i) => sameLine(line, target[i]));
  const misses: string[] = [];
  for (let i = 0; i < Math.max(actual.length, target.length); i++) {
    const a = actual[i];
    const t = target[i];
    if (sameLine(a, t)) continue;
    if (!a) {
      const rest = target.length - i;
      misses.push(`Оракул сказал не всё: не хватает ${rest > 1 ? `ещё ${rest} строк, начиная с` : 'строки'} ${quote(t.text)}.`);
    } else if (!t) {
      misses.push(`Оракул сказал лишнее: ${quote(a.text)}. Нужно ровно ${target.length} ${target.length === 1 ? 'строку' : 'строки'}.`);
    } else if (a.kind !== t.kind) {
      misses.push(`Строка ${i + 1}: это нужно сказать через ${SAYS[t.kind]}, а не через ${SAYS[a.kind]}.`);
    } else {
      misses.push(`Строка ${i + 1}: Оракул сказал ${quote(a.text)}, а нужно ${quote(t.text)}${lineHint(a.text, t.text, names, code)}.`);
    }
    break;
  }
  return { lineOk, misses };
}

function describeFlask(flask: Flask): string {
  return `${flask.shown} (${TYPE_NAMES[flask.type ?? 'undefined']})`;
}

function compareFlask(name: string, flask: Flask | undefined, target: Flask): string | undefined {
  if (!target.declared) return undefined;
  if (!flask?.declared) return `Колбы ${name} нет на полке: объяви переменную — let ${name} = …`;
  if (flask.key === target.key) return undefined;
  if (flask.type !== target.type) return `В колбе ${name} — ${describeFlask(flask)}, а нужно ${describeFlask(target)}.`;
  return `В колбе ${name} — ${flask.shown}, а нужно ${target.shown}.`;
}

/** Цели в списке: слова Оракула по строкам и колбы. Если запусков несколько — у каждого свои. */
function goalsOf(level: JsLevel, runs: { label?: string; target: RunResult; lineOk: boolean[]; flasks: FlaskStatus[] }[]): GoalStatus[] {
  const goals: GoalStatus[] = [];
  for (const { label, target, lineOk, flasks } of runs) {
    const prefix = label ? `${label}: ` : '';
    if (level.check.output) {
      target.output.forEach((line, i) => {
        const text =
          line.kind === 'prompt'
            ? `спросить через prompt (ответ: ${line.answer === null ? 'пусто' : `«${line.answer}»`})`
            : `${line.kind === 'alert' ? 'alert' : 'Оракул'}: «${line.text}»`;
        goals.push({ label: `${prefix}${text}`, done: Boolean(lineOk[i]) });
      });
    }
    for (const status of flasks) {
      if (!status.target?.declared) continue;
      goals.push({ label: `${prefix}колба \`${status.name}\` = ${status.target.shown}`, done: Boolean(status.ok) });
    }
  }
  return goals;
}

/**
 * Запускает код студента во всех запусках уровня и сравнивает с эталоном.
 * cast — нажали «Сотворить»: тогда проверяются ещё и приёмы уровня (require, reject).
 */
export async function evaluateJs(level: JsLevel, code: string, cast = false): Promise<JsEvaluation> {
  const lint = lintJs(code, cast ? { require: level.require, reject: level.reject } : undefined);
  const warnings = lint.problems.filter((problem) => problem.severity === 'warning');
  const codeErrors = lint.problems.filter((problem) => problem.severity === 'error' && problem.kind !== 'required');
  const ruleErrors = lint.problems.filter((problem) => problem.severity === 'error' && problem.kind === 'required');
  const targets = await targetRuns(level);
  const names = shelfNames(level, lint.topLevel);
  const checked = level.check.vars ?? [];

  const runs: RunStatus[] = await Promise.all(
    runsOf(level).map(async (run, index) => {
      const target = targets[index];
      const result: RunResult = codeErrors.length
        ? { output: [], flasks: {} }
        : await runScript(code, { inputs: run.inputs, vars: names, timeout: cast ? 3000 : 1500 });
      const { lineOk, misses } =
        level.check.output && !result.timedOut ? compareOutput(result.output, target.output, names, code) : { lineOk: [], misses: [] };
      const flasks = names.map((name): FlaskStatus => {
        const flask = result.flasks[name];
        if (!checked.includes(name)) return { name, flask };
        const goal = target.flasks[name];
        const miss = goal && compareFlask(name, flask, goal);
        if (miss && !result.timedOut) misses.push(miss);
        return { name, flask, target: goal, ok: Boolean(goal) && !miss };
      });
      // Зависший код остановлен: сравнивать нечего, важно одно — найти бесконечный цикл
      if (result.timedOut) misses.push('Код работал слишком долго и был остановлен — похоже, где-то бесконечный цикл.');
      if (result.overflow) misses.push('Оракул охрип: строк слишком много. Проверь, не повторяется ли вывод без конца.');
      return { run, label: runLabel(level, run, index), result, target, lineOk, flasks, misses };
    }),
  );

  const runtime = runs.find((status) => status.result.error)?.result.error;
  const errors = [...codeErrors, ...(runtime ? [runtimeProblem(code, runtime)] : [])];
  // Сообщения о промахах — с подписью запуска, если запусков несколько
  const misses = runs.flatMap((status) => status.misses.map((miss) => (status.label ? `${status.label}: ${miss}` : miss)));
  // Значение, посчитанное впустую (gems + 3;), — частая причина промаха: о нём говорим первым
  const lost = warnings.filter((problem) => problem.kind === 'unused');
  if (misses.length) misses.unshift(...lost.map((problem) => `Строка ${code.slice(0, problem.from).split('\n').length}: ${problem.message}`));
  const allMatch = errors.length === 0 && misses.length === 0;
  return {
    // Приёмы уровня — когда всё остальное уже сошлось, как в CSS-уровнях
    passed: allMatch && ruleErrors.length === 0,
    errors: allMatch ? ruleErrors : errors,
    warnings,
    runs,
    goals: goalsOf(level, runs),
    misses,
  };
}
