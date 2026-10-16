import { guardLoops, LOOP_MARK } from './loopGuard';
import type { JsPage, PageStep } from './types';

/*
  Документ страницы Города Механизмов. Три вида:
  — check: скрытая страница для проверки — после скрипта проходит шаги сценария и отправляет снимки;
  — live: страница на сцене — живая, по ней можно щёлкать; форма без preventDefault просит её перезагрузить;
  — download: готовая игра для скачивания — только разметка, оформление и код студента, без обвязки.
  Страница живёт в iframe с sandbox="allow-scripts allow-forms": к игре, её хранилищу и аккаунту доступа нет.
*/

export type PageMode = 'check' | 'live' | 'download';

const BASE_CSS = `
html, body { margin: 0; }
body { min-height: 100vh; box-sizing: border-box; font: 16px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif; }
`;

/** Обвязка до кода студента: Оракул, окна, страж циклов, ловушка ошибок и «перезагрузка» формой. */
function harness(nonce: string, mode: PageMode, offset: number): string {
  return `(() => {
  const NONCE = ${JSON.stringify(nonce)};
  const MODE = ${JSON.stringify(mode)};
  const LOOP = ${JSON.stringify(LOOP_MARK)};
  const post = (data) => parent.postMessage(Object.assign({ nonce: NONCE }, data), '*');
  const output = [];
  const errors = [];
  const show = (value) => {
    if (typeof value === 'string') return value;
    try { return JSON.stringify(value) ?? String(value); } catch { return String(value); }
  };
  // На сцене каждая строка Оракула сразу уходит в игру — страница живая
  const record = (line) => {
    if (output.length >= 300) return;
    output.push(line);
    if (MODE === 'live') post({ type: 'output', line });
  };
  console.log = console.info = console.warn = console.error = console.debug = (...args) => record({ kind: 'log', text: args.map(show).join(' ') });
  window.alert = (message) => record({ kind: 'alert', text: message === undefined ? '' : String(message) });
  window.prompt = (question) => { record({ kind: 'prompt', text: question === undefined ? '' : String(question), answer: null }); return null; };
  window.confirm = () => true;
  // В проверке случайность всегда одна и та же — у студента и у эталона: первое число 0.42
  if (MODE === 'check') {
    const sequence = [0.42, 0.17, 0.73, 0.05, 0.91, 0.36, 0.58, 0.88];
    let next = 0;
    Math.random = () => sequence[next++ % sequence.length];
  }
  // Страж циклов: в каждом цикле — __guard(); дольше секунды за один заход — ошибка
  let started = 0;
  window.__guard = () => {
    if (!started) { started = Date.now(); setTimeout(() => { started = 0; }, 0); }
    if (Date.now() - started > 1000) throw new Error(LOOP);
  };
  window.addEventListener('error', (event) => {
    const error = event.error;
    const message = error && error.message !== undefined ? String(error.message) : String(event.message || '').replace(/^Uncaught\\s+(\\w*Error:\\s*)?/, '');
    const entry = {
      name: (error && error.name) || 'Error',
      message,
      line: event.lineno ? event.lineno - ${offset} : undefined,
      column: event.colno || undefined,
      loop: message.includes(LOOP),
    };
    errors.push(entry);
    if (MODE === 'live') post({ type: 'error', error: entry });
  });
  // Форма без preventDefault «перезагружает» страницу — как положено по умолчанию
  window.addEventListener('submit', (event) => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (MODE === 'live') post({ type: 'reload' });
    else if (window.__reload) window.__reload();
  });
  window.__harness = { output, errors, post };
})();`;
}

/** Проверка после кода студента: шаги сценария и снимки страницы. */
function checker(page: JsPage, steps: PageStep[]): string {
  return `(() => {
  const { output, errors, post } = window.__harness;
  const steps = ${JSON.stringify(steps)};
  const watch = ${JSON.stringify(page.watch)};
  const initialBody = ${JSON.stringify(page.html)};
  let reloaded = false;
  // Перезагрузка: страница возвращается к началу, всё сделанное пропадает
  window.__reload = () => { reloaded = true; document.body.innerHTML = initialBody; };
  const snapshot = () => Array.from(document.querySelectorAll(watch), (el) => ({
    name: el.getAttribute('data-name') || el.tagName.toLowerCase(),
    classes: Array.from(el.classList).sort().join(' '),
    text: (el.textContent || '').replace(/\\s+/g, ' ').trim(),
    value: el.matches('input, textarea, select') ? String(el.value) : null,
    hidden: el.hidden || getComputedStyle(el).display === 'none',
    disabled: Boolean(el.disabled),
  }));
  const scriptErrors = errors.slice();
  const shots = [];
  for (const step of steps) {
    const before = errors.length;
    let missing = null;
    const find = (selector) => { const el = document.querySelector(selector); if (!el) missing = selector; return el; };
    if (step.type) {
      const field = find(step.type[0]);
      if (field) {
        field.value = step.type[1];
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    if (step.click) { const el = find(step.click); if (el) for (let i = 0; i < (step.times || 1); i++) el.click(); }
    if (step.submit) { const form = find(step.submit); if (form) form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); }
    shots.push({ elements: snapshot(), reloaded, errors: errors.slice(before), missing });
  }
  post({ type: 'done', shots, output, errors: scriptErrors });
})();`;
}

interface PageDocumentOptions {
  mode: PageMode;
  nonce?: string;
  steps?: PageStep[];
}

/** Документ страницы целиком. Код студента в проверке и на сцене — со стражем циклов. */
export function pageDocument(page: JsPage, code: string, { mode, nonce = '', steps = [] }: PageDocumentOptions): string {
  const head = `<!doctype html>\n<html lang="ru">\n<head>\n<meta charset="utf-8">\n<title>Город Механизмов</title>\n<style>${BASE_CSS}${page.css ?? ''}</style>\n`;
  const body = `</head>\n<body>\n${page.html}\n<script>\n`;
  if (mode === 'download') return `${head}${body}${code}\n</script>\n</body>\n</html>\n`;
  // Номер строки ошибки в документе минус строки до кода студента — строка в его коде
  const prefixWithoutHarness = `${head}<script></script>\n${body}`;
  const harnessLines = harness(nonce, mode, 0).split('\n').length - 1;
  const offset = prefixWithoutHarness.split('\n').length - 1 + harnessLines;
  const before = `${head}<script>${harness(nonce, mode, offset)}</script>\n${body}`;
  const after = mode === 'check' ? `\n</script>\n<script>${checker(page, steps)}</script>\n</body>\n</html>\n` : `\n</script>\n</body>\n</html>\n`;
  return `${before}${guardLoops(code)}${after}`;
}
