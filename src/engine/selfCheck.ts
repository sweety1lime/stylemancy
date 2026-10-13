import { SPELLS } from '../game/spells';
import { allLevels } from '../levels';
import { checkLevelCss } from './evaluate';

export interface LevelReport {
  id: string;
  solutionPassed: boolean;
  starterPassed: boolean;
  /** Почему эталон не прошёл или что не так с самим уровнем */
  solutionIssues: string[];
}

/**
 * Самопроверка контента: эталон каждого уровня должен проходить проверку,
 * стартовый код — нет, а сам уровень — быть заполнен без пропусков.
 * Запускается автотестом в настоящем браузере.
 */
export async function checkAllLevels(): Promise<LevelReport[]> {
  const reports: LevelReport[] = [];
  for (const level of allLevels) {
    const solution = await checkLevelCss(level, level.solutionCss);
    const starter = await checkLevelCss(level, level.starterCss);
    const issues = [
      ...solution.errors.map((p) => p.message),
      ...solution.warnings.map((p) => p.message),
      ...solution.items.filter((item) => !item.inPlace).map((item) => item.message ?? item.name),
    ];
    if (level.learns && !SPELLS[level.learns]) issues.push(`Нет заклинания «${level.learns}» в SPELLS.`);
    if (level.hints.length < 2) issues.push('Меньше двух подсказок.');
    reports.push({
      id: level.id,
      solutionPassed: solution.passed,
      starterPassed: starter.passed,
      solutionIssues: issues,
    });
  }
  return reports;
}
