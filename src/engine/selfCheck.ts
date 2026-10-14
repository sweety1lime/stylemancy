import { SPELLS } from '../game/spells';
import { allLevels } from '../levels';
import { checkLevelCss } from './evaluate';
import { evaluateHtml } from './htmlCheck';
import { isHtmlLevel, type CssLevel, type HtmlLevel, type Level } from './types';

export interface LevelReport {
  id: string;
  solutionPassed: boolean;
  starterPassed: boolean;
  /** Почему эталон не прошёл или что не так с самим уровнем */
  solutionIssues: string[];
}

async function checkCss(level: CssLevel) {
  const solution = await checkLevelCss(level, level.solutionCss);
  const starter = await checkLevelCss(level, level.starterCss);
  const issues = [
    ...solution.errors.map((p) => p.message),
    ...solution.warnings.map((p) => p.message),
    ...solution.items.filter((item) => !item.inPlace).map((item) => item.message ?? item.name),
  ];
  for (const { name, target, viewport } of solution.items) {
    const width = viewport ?? level.scene.width;
    const visible = target.w > 0 || target.h > 0;
    const outside = target.x < -0.5 || target.y < -0.5 || target.x + target.w > width + 0.5 || target.y + target.h > level.scene.height + 0.5;
    if (visible && outside) issues.push(`Цель «${name}» выходит за край сцены${viewport ? ` в зеркале ${viewport}px` : ''}.`);
  }
  return { solutionPassed: solution.passed, starterPassed: starter.passed, issues };
}

function checkHtml(level: HtmlLevel) {
  const solution = evaluateHtml(level, level.solutionHtml);
  const starter = evaluateHtml(level, level.starterHtml);
  const issues = [
    ...solution.errors.map((p) => p.message),
    ...solution.warnings.map((p) => p.message),
    ...solution.goals.filter((goal) => !goal.done).map((goal) => `Цель не выполнена: ${goal.label}`),
  ];
  if (level.goals.length === 0) issues.push('У уровня нет целей.');
  return { solutionPassed: solution.passed, starterPassed: starter.passed, issues };
}

/**
 * Самопроверка контента: эталон каждого уровня должен проходить проверку,
 * стартовый код — нет, а сам уровень — быть заполнен без пропусков.
 * Запускается автотестом в настоящем браузере.
 */
export async function checkAllLevels(): Promise<LevelReport[]> {
  const reports: LevelReport[] = [];
  for (const level of allLevels as Level[]) {
    const { solutionPassed, starterPassed, issues } = isHtmlLevel(level) ? checkHtml(level) : await checkCss(level);
    if (level.learns && !SPELLS[level.learns]) issues.push(`Нет заклинания «${level.learns}» в SPELLS.`);
    if (level.hints.length < 2) issues.push('Меньше двух подсказок.');
    reports.push({ id: level.id, solutionPassed, starterPassed, solutionIssues: issues });
  }
  return reports;
}
