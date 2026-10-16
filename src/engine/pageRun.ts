import type { OutputLine, RunError } from './jsRun';
import { pageDocument } from './pageHarness';
import type { JsLevel, JsPage, PageStep } from './types';

/** Элемент страницы после шага: что сравнивается с эталоном. */
export interface PageElement {
  /** data-name или тег */
  name: string;
  /** Классы по алфавиту через пробел */
  classes: string;
  /** Текст без лишних пробелов */
  text: string;
  /** Значение поля ввода; у остальных элементов — null */
  value: string | null;
  hidden: boolean;
  disabled: boolean;
}

/** Ошибка на странице. loop — цикл остановлен стражем. */
export interface PageError extends RunError {
  loop?: boolean;
}

/** Страница после шага сценария. */
export interface PageShot {
  elements: PageElement[];
  /** Форма перезагрузила страницу: всё, что код сделал, пропало */
  reloaded: boolean;
  /** Ошибки в обработчиках во время этого шага */
  errors: PageError[];
  /** Селектор шага, который не нашёлся на странице */
  missing: string | null;
}

export interface PageResult {
  shots: PageShot[];
  output: OutputLine[];
  /** Ошибки при первом запуске скрипта */
  errors: PageError[];
  /** Страница не ответила — значит, зависла */
  timedOut?: boolean;
}

/** Страница уровня: оформление района и уровня — вместе. */
export function levelPage(level: JsLevel): JsPage {
  const page = level.page ?? { html: '', watch: 'body' };
  return { ...page, css: [level.sceneCss, page.css].filter(Boolean).join('\n') };
}

/**
 * Запускает код на странице в невидимом iframe без доступа к игре (sandbox без allow-same-origin),
 * проходит шаги сценария и возвращает снимки страницы после каждого.
 */
export function runPage(page: JsPage, code: string, steps: PageStep[], timeout = 3000): Promise<PageResult> {
  return new Promise((resolve) => {
    const nonce = Math.random().toString(36).slice(2);
    const frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-scripts allow-forms');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:600px;height:400px;border:0;visibility:hidden;pointer-events:none';
    const finish = (result: PageResult) => {
      clearTimeout(timer);
      window.removeEventListener('message', listen);
      frame.remove();
      resolve(result);
    };
    const listen = (event: MessageEvent) => {
      const data = event.data as (Omit<PageResult, 'timedOut'> & { nonce?: string; type?: string }) | null;
      if (event.source !== frame.contentWindow || data?.nonce !== nonce || data.type !== 'done') return;
      finish({ shots: data.shots, output: data.output, errors: data.errors });
    };
    const timer = setTimeout(() => finish({ shots: [], output: [], errors: [], timedOut: true }), timeout);
    window.addEventListener('message', listen);
    frame.srcdoc = pageDocument(page, code, { mode: 'check', nonce, steps });
    document.body.append(frame);
  });
}
