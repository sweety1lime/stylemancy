import { allLevels } from '../levels';
import { checkLevelCss } from './evaluate';

export interface LevelReport {
  id: string;
  solutionPassed: boolean;
  starterPassed: boolean;
  /** Почему эталон не прошёл или к чему есть замечания */
  solutionIssues: string[];
}

/**
 * Самопроверка контента: эталон каждого уровня должен проходить проверку,
 * а стартовый код — нет. Запускается автотестом в настоящем браузере.
 */
export async function checkAllLevels(): Promise<LevelReport[]> {
  const reports: LevelReport[] = [];
  for (const level of allLevels) {
    const solution = await checkLevelCss(level, level.solutionCss);
    const starter = await checkLevelCss(level, level.starterCss);
    reports.push({
      id: level.id,
      solutionPassed: solution.passed,
      starterPassed: starter.passed,
      solutionIssues: [
        ...solution.errors.map((p) => p.message),
        ...solution.warnings.map((p) => p.message),
        ...solution.items.filter((item) => !item.inPlace).map((item) => item.message ?? item.name),
      ],
    });
  }
  return reports;
}
