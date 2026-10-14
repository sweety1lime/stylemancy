import { lintHtml } from './htmlLint';
import type { Problem } from './lint';
import type { HtmlGoal, HtmlLevel } from './types';

/** Базовые стили страницы-сцены: пока теги не расставлены, всё выглядит как у Лорда Дефолта. */
const BASE_PAGE_CSS = `
html { background: #e8e6df; }
body { margin: 16px 20px; color: #1c1c24; font: 16px/1.5 "Times New Roman", Times, serif; overflow-wrap: anywhere; }
img { max-width: 100%; }
`;

export interface GoalStatus {
  label: string;
  done: boolean;
  /** Сколько нашлось — если количество не то */
  detail?: string;
  hint?: string;
}

export interface HtmlEvaluation {
  passed: boolean;
  errors: Problem[];
  warnings: Problem[];
  goals: GoalStatus[];
}

/** Разметка студента как документ — так её понимает браузер (ошибки он молча чинит по-своему). */
export function parseMarkup(code: string, isDocument = false): Document {
  const parser = new DOMParser();
  return isDocument
    ? parser.parseFromString(code, 'text/html')
    : parser.parseFromString(`<!doctype html><html lang="ru"><head></head><body>${code}</body></html>`, 'text/html');
}

/** Текст для сравнения: без регистра, лишних пробелов и знаков препинания по краям, «ё» = «е». */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .replace(/^[\s.,!?:;«»"'—–-]+|[\s.,!?:;«»"'—–-]+$/g, '');
}

export function checkGoals(code: string, doc: Document, goals: HtmlGoal[], isDocument = false): GoalStatus[] {
  return goals.map((goal): GoalStatus => {
    const base = { label: goal.label, hint: goal.hint };
    if (goal.doctype) return { ...base, done: /^\s*<!doctype\s+html\s*>/i.test(code) };
    if (goal.clean) {
      const errors = lintHtml(code, { document: isDocument }).filter((problem) => problem.severity === 'error').length;
      return { ...base, done: errors === 0, detail: errors ? `ошибок: ${errors}` : undefined };
    }

    let found = Array.from(doc.querySelectorAll(goal.selector ?? '*'));
    if (goal.text !== undefined) {
      const expected = normalize(goal.text);
      found = found.filter((el) => normalize(el.textContent ?? '') === expected);
    }
    if (goal.contains !== undefined) {
      const part = normalize(goal.contains);
      found = found.filter((el) => normalize(el.textContent ?? '').includes(part));
    }
    const n = found.length;
    const done =
      goal.count !== undefined ? n === goal.count : n >= (goal.min ?? 1) && (goal.max === undefined || n <= goal.max);
    if (done) return { ...base, done };
    const wanted = goal.count ?? goal.min;
    const detail = n === 0 ? 'пока не найдено' : wanted !== undefined ? `найдено ${n} из ${wanted}` : `найдено ${n} — это слишком много`;
    return { ...base, done, detail };
  });
}

/** Полная проверка HTML-уровня: ошибки в разметке и цели. */
export function evaluateHtml(level: HtmlLevel, code: string): HtmlEvaluation {
  const problems = lintHtml(code, { document: level.document });
  const errors = problems.filter((p) => p.severity === 'error');
  const goals = checkGoals(code, parseMarkup(code, level.document), level.goals, level.document);
  return {
    passed: errors.length === 0 && goals.every((goal) => goal.done),
    errors,
    warnings: problems.filter((p) => p.severity === 'warning'),
    goals,
  };
}

/** Картинки по именам из библиотеки уровня: студент пишет src="potion.png", сцена показывает спрайт. */
function resolveImages(doc: Document, images: Record<string, string>) {
  doc.querySelectorAll<HTMLImageElement>('img[src]').forEach((img) => {
    const src = img.getAttribute('src')?.trim() ?? '';
    const name = src.split(/[/\\]/).pop()?.toLowerCase() ?? '';
    if (images[name]) img.setAttribute('src', images[name]);
    // Чужие адреса не загружаем: сцена работает и без интернета, а сломанная картинка покажет alt
    else img.setAttribute('src', 'data:,');
  });
}

export interface HtmlPage {
  /** Документ для iframe */
  html: string;
  /** Содержимое <body> — им можно обновить сцену без перезагрузки */
  body: string;
  /** Заголовок вкладки: <title> студента */
  title: string;
}

/** Страница-сцена: разметка студента в оформлении района. */
export function htmlPage(level: HtmlLevel, code: string, images: Record<string, string> = {}): HtmlPage {
  const doc = parseMarkup(code, level.document);
  resolveImages(doc, images);
  doc.querySelectorAll('script').forEach((script) => script.remove());
  const styles = `<style>${BASE_PAGE_CSS}${level.sceneCss}</style>`;
  const head = level.document ? doc.head.innerHTML : '<meta charset="utf-8">';
  const lang = doc.documentElement.getAttribute('lang') ?? 'ru';
  return {
    html: `<!doctype html><html lang="${lang}"><head>${styles}${head}</head><body>${doc.body.innerHTML}</body></html>`,
    body: doc.body.innerHTML,
    title: doc.title.trim(),
  };
}
