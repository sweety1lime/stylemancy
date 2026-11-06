import type { CssLevel, Npc, RematchStage } from './types';

/** Лорд Дефолт вместо наставника района: в бою реплики и портрет его */
const VILLAIN: Npc = { name: 'Лорд Дефолт', title: 'ломает сцену', portrait: 'default' };

/**
 * Уровень в том виде, какой он на натиске реванша: те же сцена и предметы, но задача, подсказки, чары и эталон —
 * натиска, а говорит Лорд Дефолт. Код студента при этом остаётся прежним.
 */
export function stageLevel(level: CssLevel, stage: RematchStage): CssLevel {
  return {
    ...level,
    npc: VILLAIN,
    dialog: [stage.say],
    task: stage.task,
    hints: stage.hints,
    lockedCss: stage.lockedCss,
    solutionCss: stage.solutionCss,
  };
}
