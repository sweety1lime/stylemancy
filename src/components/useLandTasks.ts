import { useEffect, useState } from 'react';
import { evaluateTasks } from '../land/probe';
import { awardTask, finishedTasks } from '../land/rewards';
import type { CheckResult } from '../land/tasks';
import { isUntouchedTemplate } from '../land/templates';

/** Итог проверки вместе с кодом, для которого он посчитан: награда выдаётся по нему, а не по тому, что набрано сейчас */
interface Evaluated {
  html: string;
  css: string;
  results: Record<string, CheckResult[]>;
}

/**
 * Проверка творческих заданий на странице игрока: идёт после каждой правки (страница к этому моменту уже успокоилась),
 * а выполненное задание тут же приносит награду. Заготовка без единой правки не считается: опыт даётся за свою работу.
 */
export function useLandTasks(page: string, html: string, css: string): Record<string, CheckResult[]> | null {
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
    if (!evaluated || isUntouchedTemplate(evaluated)) return;
    for (const task of finishedTasks(evaluated.results)) awardTask(task);
  }, [evaluated]);

  return evaluated?.results ?? null;
}
