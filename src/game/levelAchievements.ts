import { lintOptionsFor } from '../engine/evaluate';
import { parseMarkup } from '../engine/htmlCheck';
import { lintCss } from '../engine/lint';
import { stripJsComments } from '../engine/jsLint';
import { isHtmlLevel, isJsLevel, type CssLevel, type HtmlLevel, type Level } from '../engine/types';
import { findLevel } from '../levels';
import { unlock, type Achievement } from './achievements';
import { progress } from './progress';
import { stats } from './stats';

// Отдельно от списка достижений: «свой путь» проверяется движком уровней, а список нужен шапке на любом экране

export interface SuccessInfo {
  level: Level;
  code: string;
  hintsUsed: number;
  /** Уровень пройден впервые (а не переигран) */
  firstTime: boolean;
}

/** Уровень пройден: проверяем достижения за чистоту, упорство и исследование. */
export function recordSuccess({ level, code, hintsUsed, firstTime }: SuccessInfo): Achievement[] {
  const found: Achievement[] = [];
  const attempts = progress.get(level.id).attempts;
  stats.update((s) => ({
    streak: hintsUsed === 0 ? s.streak + 1 : 0,
    completions: s.completions + (firstTime ? 1 : 0),
  }));

  unlock('first-spell', found);
  if (stats.get().streak >= 5) unlock('clean-streak', found);
  if (attempts >= 5) unlock('persistent', found);
  if (attempts >= 10) unlock('stubborn', found);
  if (hintsUsed >= level.hints.length) unlock('with-help', found);
  if (isOwnWay(level, code)) unlock('own-way', found);
  if (hasOwnComment(level, code)) unlock('chronicle', found);

  const place = findLevel(level.id);
  if (place && place.region.levels.every((item) => progress.get(item.id).stars === 3)) {
    unlock(`perfect:${place.region.id}`, found);
  }
  return found;
}

function declSet(level: CssLevel, css: string): Set<string> {
  const { validDecls } = lintCss(css, lintOptionsFor(level));
  return new Set(validDecls.map((d) => `${d.prop.toLowerCase()}: ${d.value.toLowerCase().replace(/\s+/g, ' ')}`));
}

/** Теги разметки по порядку — «скелет» без текста и атрибутов. */
function tagSequence(level: HtmlLevel, code: string): string {
  return Array.from(parseMarkup(code, level.document).body.querySelectorAll('*'), (el) => el.localName).join(' ');
}

/** Скрипт без комментариев и пробелов — чтобы сравнивать сами приказы. */
function scriptCore(code: string): string {
  return stripJsComments(code).replace(/\s+/g, '').replace(/;/g, '').replace(/"/g, "'");
}

/**
 * Своё решение. CSS: нет хотя бы одного объявления из решения наставника.
 * HTML: другие теги или другой их порядок. JS: другие приказы.
 */
function isOwnWay(level: Level, code: string): boolean {
  if (isHtmlLevel(level)) return tagSequence(level, code) !== tagSequence(level, level.solutionHtml);
  if (isJsLevel(level)) return scriptCore(code) !== scriptCore(level.solutionJs);
  const mine = declSet(level, code);
  return [...declSet(level, level.solutionCss)].some((decl) => !mine.has(decl));
}

/** Свой комментарий: не заготовка из стартового кода и не пустой. */
function hasOwnComment(level: Level, code: string): boolean {
  const pattern = isHtmlLevel(level) ? /<!--[\s\S]*?-->/g : isJsLevel(level) ? /\/\/[^\n]*|\/\*[\s\S]*?\*\//g : /\/\*[\s\S]*?\*\//g;
  const starter = new Set((isHtmlLevel(level) ? level.starterHtml : isJsLevel(level) ? level.starterJs : level.starterCss).match(pattern) ?? []);
  return (code.match(pattern) ?? []).some((c) => !starter.has(c) && c.replace(/<!--|-->|[/*\s]/g, '').length > 0);
}
