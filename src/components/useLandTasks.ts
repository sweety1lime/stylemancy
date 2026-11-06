import { useEffect, useState } from 'react';
import type { LandSource } from '../land/model';
import { evaluateTasks } from '../land/probe';
import { awardTask, finishedTasks } from '../land/rewards';
import type { CheckResult } from '../land/tasks';
import { isNearTemplate } from '../land/templates';

/** Итог проверки вместе с кодом, для которого он посчитан: награда выдаётся по нему, а не по тому, что набрано сейчас */
interface Evaluated {
  html: string;
  css: string;
  results: Record<string, CheckResult[]>;
}

/**
 * Проверка творческих заданий на странице игрока: идёт после каждой правки (страница к этому моменту уже успокоилась),
 * а выполненное задание тут же приносит награду. Заготовка без единой правки не считается, как и чужая земля, взятая за основу
 * (base) и почти не тронутая: опыт даётся за свою работу.
 */
export function useLandTasks(page: string, html: string, css: string, base?: LandSource): Record<string, CheckResult[]> | null {
  const [evaluated, setEvaluated] = useState<Evaluated | null>(null);

  useEffect(() => {
    let current = true;
    evaluateTasks(page, { html, css }).then(
      (results) => {
        if (current) setEvaluated({ html, css, results });
      },
      () => undefined,
    );
    return () => {
      current = false;
    };
  }, [page, html, css]);

  useEffect(() => {
    if (!evaluated || isNearTemplate(evaluated, base)) return;
    for (const task of finishedTasks(evaluated.results)) awardTask(task);
  }, [evaluated, base]);

  return evaluated?.results ?? null;
}
