import { SPELLS } from '../game/spells';
import { allLevels } from '../levels';
import { checkLevelCss } from './evaluate';
import { evaluateHtml } from './htmlCheck';
import { dungeonProblems } from './dungeon';
import { codeLines, evaluateJs, targetRuns } from './jsCheck';
import { isHtmlLevel, isJsLevel, type CssLevel, type HtmlLevel, type JsLevel, type Level } from './types';

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
  for (const { name, target, view } of solution.items) {
    const width = view?.width ?? level.scene.width;
    const visible = target.w > 0 || target.h > 0;
    const outside = target.x < -0.5 || target.y < -0.5 || target.x + target.w > width + 0.5 || target.y + target.h > level.scene.height + 0.5;
    if (visible && outside) issues.push(`Цель «${name}» выходит за край сцены${view?.prefix ? ` (${view.prefix})` : ''}.`);
  }
  // Уровень про селекторы, где ни одна цель не светится, — проверять нечего
  if (level.check.style && solution.items.every((item) => item.target.value === item.target.base)) {
    issues.push('Эталон не меняет цвет ни одного предмета.');
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

async function checkJs(level: JsLevel) {
  const solution = await evaluateJs(level, level.solutionJs, true);
  const starter = await evaluateJs(level, level.starterJs, true);
  const issues = [...solution.errors.map((p) => p.message), ...solution.warnings.map((p) => p.message), ...solution.misses];
  const targets = await targetRuns(level);
  if (!level.check.output && !level.check.vars?.length && !level.dungeons?.length) {
    issues.push('Уровню нечего проверять: нет ни check.output, ни check.vars, ни подземелий.');
  }
  for (const dungeon of level.dungeons ?? []) issues.push(...dungeonProblems(dungeon));
  if (level.maxLines && codeLines(level.solutionJs) > level.maxLines) {
    issues.push(`Эталон длиннее, чем просит уровень: ${codeLines(level.solutionJs)} строк при maxLines ${level.maxLines}.`);
  }
  if (targets.some((target) => target.error || target.timedOut)) issues.push('Эталон падает с ошибкой.');
  if (level.check.output && targets.some((target) => target.output.length === 0)) issues.push('Эталон ничего не говорит Оракулу.');
  for (const name of level.check.vars ?? []) {
    if (targets.some((target) => !target.flasks[name]?.declared)) issues.push(`В эталоне нет колбы ${name}.`);
  }
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
    const { solutionPassed, starterPassed, issues } = isHtmlLevel(level)
      ? checkHtml(level)
      : isJsLevel(level)
        ? await checkJs(level)
        : await checkCss(level);
    if (level.learns && !SPELLS[level.learns]) issues.push(`Нет заклинания «${level.learns}» в SPELLS.`);
    if (level.hints.length < 2) issues.push('Меньше двух подсказок.');
    reports.push({ id: level.id, solutionPassed, starterPassed, solutionIssues: issues });
  }
  return reports;
}
