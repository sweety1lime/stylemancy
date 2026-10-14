import { plural } from '../lib/plural';
import { lintCss, type LintOptions, type LintResult, type Problem } from './lint';
import {
  compareItems,
  createHiddenFrame,
  loadFrame,
  measureItems,
  sceneDocument,
  setPlayerCss,
  viewportsOf,
  type ItemStatus,
} from './scene';
import type { Level } from './types';

export interface Evaluation {
  passed: boolean;
  items: ItemStatus[];
  /** Ошибки в коде: пока они есть, заклинание не засчитывается */
  errors: Problem[];
  warnings: Problem[];
  /** Сколько объявлений браузер понял — для звезды за чистое решение */
  declCount: number;
}

export function evaluate(lint: LintResult, items: ItemStatus[]): Evaluation {
  const errors = lint.problems.filter((p) => p.severity === 'error');
  return {
    passed: items.length > 0 && items.every((item) => item.inPlace) && errors.length === 0,
    items,
    errors,
    warnings: lint.problems.filter((p) => p.severity === 'warning'),
    declCount: lint.validDecls.length,
  };
}

export interface Score {
  stars: number;
  /** Почему звёзд меньше трёх */
  notes: string[];
}

/** 3 звезды — без подсказок и без лишних свойств. */
export function scoreSolution(hintsUsed: number, declCount: number, solutionDeclCount: number): Score {
  let stars = 3;
  const notes: string[] = [];
  if (hintsUsed > 0) {
    const cost = Math.min(2, hintsUsed);
    stars -= cost;
    notes.push(`${hintsUsed} ${plural(hintsUsed, 'подсказка', 'подсказки', 'подсказок')}: −${cost} ★`);
  }
  if (declCount > solutionDeclCount) {
    const extra = `лишние свойства (${declCount} вместо ${solutionDeclCount})`;
    if (stars > 1) {
      stars -= 1;
      notes.push(`${extra}: −1 ★`);
    } else {
      notes.push(extra);
    }
  }
  return { stars, notes };
}

const optionsCache = new WeakMap<Level, LintOptions>();

/** Настройки проверки кода для уровня. Разметка сцены разбирается один раз. */
export function lintOptionsFor(level: Level): LintOptions {
  let options = optionsCache.get(level);
  if (!options) {
    const sceneDoc = new DOMParser().parseFromString(`<!doctype html><html><body>${level.html}</body></html>`, 'text/html');
    options = { allow: level.allow, allowMessage: level.allowMessage, forbid: level.forbid, require: level.require, sceneDoc };
    optionsCache.set(level, options);
  }
  return options;
}

export function solutionDeclCount(level: Level): number {
  return lintCss(level.solutionCss, lintOptionsFor(level)).validDecls.length;
}

/** Сравнение на одной ширине: эталон и код студента в невидимых iframe. */
async function compareAtWidth(level: Level, css: string, width: number): Promise<ItemStatus[]> {
  const height = level.scene.height;
  const targetFrame = createHiddenFrame(width, height);
  const playerFrame = createHiddenFrame(width, height);
  try {
    const html = sceneDocument(level);
    const [targetDoc, playerDoc] = await Promise.all([loadFrame(targetFrame, html), loadFrame(playerFrame, html)]);
    setPlayerCss(targetDoc, level.solutionCss);
    setPlayerCss(playerDoc, css);
    return compareItems(measureItems(playerDoc, level), measureItems(targetDoc, level), level.check.tolerance);
  } finally {
    targetFrame.remove();
    playerFrame.remove();
  }
}

/** Полная проверка без интерфейса — для автотестов уровней. Адаптив проверяется в каждом зеркале. */
export async function checkLevelCss(level: Level, css: string): Promise<Evaluation> {
  const widths = viewportsOf(level);
  const items: ItemStatus[] = [];
  for (const width of widths) {
    const statuses = await compareAtWidth(level, css, width);
    items.push(...(widths.length > 1 ? statuses.map((status) => ({ ...status, viewport: width })) : statuses));
  }
  return evaluate(lintCss(css, lintOptionsFor(level)), items);
}
