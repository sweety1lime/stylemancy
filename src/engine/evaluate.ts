import { plural } from '../lib/plural';
import { lintCss, type LintOptions, type LintResult, type Problem } from './lint';
import {
  compareItems,
  createHiddenFrame,
  loadFrame,
  measureItems,
  sceneDocument,
  setPlayerCss,
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
    options = { allow: level.allow, allowMessage: level.allowMessage, forbid: level.forbid, sceneDoc };
    optionsCache.set(level, options);
  }
  return options;
}

export function solutionDeclCount(level: Level): number {
  return lintCss(level.solutionCss, lintOptionsFor(level)).validDecls.length;
}

/** Полная проверка без интерфейса — для автотестов уровней. */
export async function checkLevelCss(level: Level, css: string): Promise<Evaluation> {
  const { width, height } = level.scene;
  const targetFrame = createHiddenFrame(width, height);
  const playerFrame = createHiddenFrame(width, height);
  try {
    const html = sceneDocument(level);
    const [targetDoc, playerDoc] = await Promise.all([loadFrame(targetFrame, html), loadFrame(playerFrame, html)]);
    setPlayerCss(targetDoc, level.solutionCss);
    setPlayerCss(playerDoc, css);
    const items = compareItems(measureItems(playerDoc, level), measureItems(targetDoc, level), level.check.tolerance);
    return evaluate(lintCss(css, lintOptionsFor(level)), items);
  } finally {
    targetFrame.remove();
    playerFrame.remove();
  }
}
