import type { GoalStatus } from './htmlCheck';
import { lineHint, type JsEvaluation } from './jsCheck';
import { lintJs, runtimeProblem } from './jsLint';
import type { Problem } from './lint';
import { levelPage, runPage, type PageElement, type PageError, type PageResult, type PageShot } from './pageRun';
import type { JsLevel, PageStep } from './types';

/*
  Проверка «Оживления» в Городе Механизмов: код студента и эталон запускаются на одной и той же странице,
  проходят одни и те же шаги сценария (ввести текст, нажать, отправить форму) — и после каждого шага
  сравниваются элементы страницы: классы, текст, значение полей, видимость.
*/

export interface StepStatus {
  step: PageStep;
  shot?: PageShot;
  target?: PageShot;
  ok: boolean;
  misses: string[];
}

export interface PageStatus {
  result: PageResult;
  target: PageResult;
  steps: StepStatus[];
}

export interface PageEvaluation extends JsEvaluation {
  page: PageStatus;
}

export const LOOP_MESSAGE = 'Код работал слишком долго и был остановлен — похоже, где-то бесконечный цикл.';

export const RELOAD_MESSAGE =
  'Форма перезагрузила страницу — и всё, что сделал код, пропало. Так форма поступает по умолчанию; отмени это в обработчике submit: `event.preventDefault()`';

/** Шаги сценария. Без шагов — один снимок сразу после запуска. */
export function stepsOf(level: JsLevel): PageStep[] {
  return level.steps?.length ? level.steps : [{ label: 'Страница после запуска' }];
}

/** Начало сообщений о шаге: часть подписи до тире — «Нажали рычаг». */
export function stepName(step: PageStep): string {
  return step.label.split(' — ')[0];
}

const targetCache = new Map<string, Promise<PageResult>>();

/** Эталон проходит сценарий один раз на уровень: по нему сверяются снимки студента. */
export function targetPage(level: JsLevel): Promise<PageResult> {
  let cached = targetCache.get(level.id);
  if (!cached) {
    cached = runPage(levelPage(level), level.solutionJs, stepsOf(level), 5000);
    targetCache.set(level.id, cached);
  }
  return cached;
}

function quoted(text: string): string {
  return text === '' ? 'пусто' : `«${text}»`;
}

function list(names: string[]): string {
  return names.join(', ');
}

/** Чем элемент студента отличается от эталонного — по-русски. */
function elementMisses(actual: PageElement, target: PageElement, code: string): string[] {
  const misses: string[] = [];
  const who = `«${target.name}»`;
  if (actual.text !== target.text) {
    if (actual.text === '') misses.push(`${who}: пусто, а должно быть написано «${target.text}».`);
    else if (target.text === '') misses.push(`${who}: написано «${actual.text}», а должно быть пусто.`);
    else misses.push(`${who}: написано «${actual.text}», а нужно «${target.text}»${lineHint(actual.text, target.text, [], code)}.`);
  }
  const has = new Set(actual.classes.split(' ').filter(Boolean));
  const needs = new Set(target.classes.split(' ').filter(Boolean));
  const missing = [...needs].filter((name) => !has.has(name));
  const extra = [...has].filter((name) => !needs.has(name));
  const dotted = extra.find((name) => name.startsWith('.') && missing.includes(name.slice(1)));
  if (dotted) {
    misses.push(`${who}: в classList имя класса пишут без точки — '${dotted.slice(1)}', а не '${dotted}'. Точка нужна только в селекторе.`);
  } else {
    if (missing.length) misses.push(`${who}: нет ${missing.length > 1 ? 'классов' : 'класса'} ${list(missing)}.`);
    if (extra.length) misses.push(`${who}: ${extra.length > 1 ? 'лишние классы' : 'лишний класс'} ${list(extra)}.`);
  }
  if (actual.hidden !== target.hidden) {
    misses.push(actual.hidden ? `${who}: на странице не видно, а должно быть видно.` : `${who}: видно на странице, а должно быть спрятано.`);
  }
  if (actual.value !== null && target.value !== null && actual.value !== target.value) {
    misses.push(`${who}: в поле ${quoted(actual.value)}, а нужно ${quoted(target.value)}.`);
  }
  if (actual.disabled !== target.disabled) misses.push(`${who}: disabled = ${actual.disabled}, а нужно ${target.disabled}.`);
  return misses;
}

/** Страница студента против эталона: сначала — сколько каких элементов, потом каждый по порядку. */
function compareElements(actual: PageElement[], target: PageElement[], code: string): string[] {
  const misses: string[] = [];
  const names = [...new Set([...target.map((item) => item.name), ...actual.map((item) => item.name)])];
  for (const name of names) {
    const has = actual.filter((item) => item.name === name).length;
    const needs = target.filter((item) => item.name === name).length;
    if (has === needs) continue;
    if (needs === 0) misses.push(`«${name}»: таких на странице ${has}, а не должно быть ни одного.`);
    else if (has === 0) misses.push(`«${name}»: таких на странице нет, а нужно ${needs}.`);
    else misses.push(`«${name}»: таких на странице ${has}, а нужно ${needs}.`);
  }
  if (misses.length) return misses;
  actual.forEach((item, i) => misses.push(...elementMisses(item, target[i], code)));
  return misses;
}

function stepMisses(shot: PageShot, target: PageShot, code: string): string[] {
  if (shot.missing) return [`На странице нет элемента ${shot.missing} — не удалил ли его код?`];
  if (shot.reloaded && !target.reloaded) return [RELOAD_MESSAGE];
  return compareElements(shot.elements, target.elements, code);
}

/**
 * Запускает код студента на странице уровня, проходит сценарий и сравнивает с эталоном.
 * cast — нажали «Сотворить»: тогда проверяются ещё и приёмы уровня (require, reject).
 */
export async function evaluatePage(level: JsLevel, code: string, cast = false): Promise<PageEvaluation> {
  const lint = lintJs(code, cast ? { require: level.require, reject: level.reject } : undefined);
  const warnings = lint.problems.filter((problem) => problem.severity === 'warning');
  const codeErrors = lint.problems.filter((problem) => problem.severity === 'error' && problem.kind !== 'required');
  const ruleErrors = lint.problems.filter((problem) => problem.severity === 'error' && problem.kind === 'required');
  const steps = stepsOf(level);
  const target = await targetPage(level);
  const result: PageResult = codeErrors.length
    ? { shots: [], output: [], errors: [] }
    : await runPage(levelPage(level), code, steps, cast ? 4000 : 2500);

  const statuses = steps.map((step, i): StepStatus => {
    const shot = result.shots[i];
    const goal = target.shots[i];
    const misses = shot && goal ? stepMisses(shot, goal, code) : [];
    if (shot?.errors.some((failure) => failure.loop)) misses.unshift(LOOP_MESSAGE);
    return { step, shot, target: goal, ok: Boolean(shot && goal) && misses.length === 0 && shot.errors.length === 0, misses };
  });

  // Ошибка при запуске скрипта или в обработчике шага — с местом в коде
  const errors: Problem[] = [...codeErrors];
  const misses: string[] = [];
  const crash = (failure: PageError | undefined, prefix = '') => {
    if (!failure) return;
    if (failure.loop) {
      if (!misses.includes(LOOP_MESSAGE)) misses.push(LOOP_MESSAGE);
      return;
    }
    const problem = runtimeProblem(code, failure);
    errors.push(prefix ? { ...problem, message: `${prefix}: ${problem.message}` } : problem);
  };
  if (result.timedOut) misses.push('Страница не ответила вовремя — похоже, где-то бесконечный цикл.');
  crash(result.errors[0]);
  if (!errors.length) {
    const broken = statuses.find((status) => status.shot?.errors.length);
    crash(broken?.shot?.errors[0], broken && stepName(broken.step));
  }
  // Сценарий идёт по порядку: важен первый шаг, который не сошёлся, — остальные часто ломаются из-за него
  const failed = statuses.find((status) => status.misses.length);
  if (failed) {
    const prefix = stepName(failed.step);
    for (const miss of failed.misses.slice(0, 3)) if (!misses.includes(miss)) misses.push(miss === LOOP_MESSAGE ? miss : `${prefix}: ${miss}`);
  }
  const lost = warnings.filter((problem) => problem.kind === 'unused');
  if (misses.length) misses.unshift(...lost.map((problem) => `Строка ${code.slice(0, problem.from).split('\n').length}: ${problem.message}`));

  const allMatch = errors.length === 0 && misses.length === 0 && statuses.every((status) => status.ok);
  const goals: GoalStatus[] = statuses.map((status) => ({ label: status.step.label, done: status.ok }));
  return {
    passed: allMatch && ruleErrors.length === 0,
    errors: allMatch ? ruleErrors : errors,
    warnings,
    runs: [],
    goals,
    misses,
    page: { result, target, steps: statuses },
  };
}
