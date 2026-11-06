import { LAND_TASKS, type CheckResult, type LandProbe, type LandTask } from './tasks';

/** Ширина, на которой страница проверяется, пока условие не попросило другую */
const NORMAL_WIDTH = 900;

/**
 * Проверить задания на настоящей странице. Для этого она ещё раз открывается в невидимой рамке, в которую можно заглянуть
 * и измерить предметы: видимая рамка изолирована, в неё не заглянуть. Скрипты в рамке по-прежнему не запускаются
 * (sandbox без allow-scripts), а документ тот же, что прошёл санитайзер.
 */
export function evaluateTasks(page: string, source: { html: string; css: string }, tasks: LandTask[] = LAND_TASKS): Promise<Record<string, CheckResult[]>> {
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${NORMAL_WIDTH}px;height:700px;border:0;visibility:hidden;pointer-events:none`;
    frame.onload = async () => {
      try {
        const doc = frame.contentDocument;
        if (!doc) throw new Error('Страница не открылась');
        // Картинки: пока они не готовы, у них нет размеров, и раскладку не измерить
        await Promise.all(Array.from(doc.images, (image) => (image.complete ? undefined : image.decode().catch(() => undefined))));
        const probe: LandProbe = {
          doc,
          html: source.html,
          css: source.css,
          at(width, run) {
            frame.style.width = `${width}px`;
            try {
              return run();
            } finally {
              frame.style.width = `${NORMAL_WIDTH}px`;
            }
          },
        };
        const results: Record<string, CheckResult[]> = {};
        for (const task of tasks) {
          results[task.id] = task.checks.map((check) => {
            try {
              return check.run(probe);
            } catch {
              return { done: false };
            }
          });
        }
        resolve(results);
      } catch (error) {
        reject(error);
      } finally {
        frame.remove();
      }
    };
    frame.srcdoc = page;
    document.body.append(frame);
  });
}
