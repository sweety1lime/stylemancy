import { notify } from '../game/notices';
import { progress } from '../game/progress';
import { settings } from '../game/settings';
import { stats } from '../game/stats';
import { STAFF_LIGHTS, unlockedStaffLights } from '../noir/staffLights';
import { LAND_TASKS, type LandTask } from './tasks';

/**
 * Награда за творческое задание: опыт и запись в статистике, один раз за задание, чтобы его нельзя было копить повторами.
 * Новый свет посоха открывается за три выполненных задания. Возвращает полученный опыт; 0 — награда за это задание уже была.
 */
export function awardTask(task: LandTask): number {
  if (stats.get().landTasks.includes(task.id)) return 0;
  const lightsBefore = unlockedStaffLights(progress.snapshot());
  stats.update((current) => ({ reviewXp: current.reviewXp + task.xp, landTasks: [...current.landTasks, task.id] }));
  notify({ title: 'Задание выполнено', text: `«${task.title}»: +${task.xp} XP` });
  // Свет виден только в «Сумраке», поэтому и сообщать о нём стоит только там
  if (settings.get().look === 'noir') {
    const lightsAfter = unlockedStaffLights(progress.snapshot());
    for (const option of STAFF_LIGHTS) {
      if (!lightsBefore.has(option.id) && lightsAfter.has(option.id)) {
        notify({ title: 'Новый свет посоха', text: `${option.name}. Выбери его в Летописи героя.` });
      }
    }
  }
  return task.xp;
}

/** Задание, у которого выполнены все условия */
export function finishedTasks(results: Record<string, { done: boolean }[]>): LandTask[] {
  return LAND_TASKS.filter((task) => results[task.id]?.length && results[task.id].every((result) => result.done));
}
