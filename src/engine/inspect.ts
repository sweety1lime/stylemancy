import { parseCss } from './cssParse';

/*
  «Лупа мага»: что видно про предмет сцены, если на него нажать. Размеры и отступы берутся из браузера,
  а «кто победил» считается здесь по правилам каскада: !important, затем сила селектора, затем порядок в тексте.
  Правила разбираются из тех же исходников, что стоят в сцене: оформление района, код студента, чары Лорда Дефолта.
*/

/** Откуда правило: у каждого источника в сцене свой <style> */
export type RuleSource = 'scene' | 'player' | 'locked';

export const SOURCE_NAMES: Record<RuleSource, string> = {
  scene: 'оформление сцены',
  player: 'твой код',
  locked: 'чары Лорда Дефолта',
};

/** Сила селектора: (id, классы и атрибуты, теги) */
export type Specificity = [number, number, number];

export interface Declaration {
  prop: string;
  value: string;
  important: boolean;
  source: RuleSource;
  selector: string;
  specificity: Specificity;
  /** Номер по порядку в тексте всех источников: у кого больше — тот ниже */
  order: number;
}

export interface Verdict {
  prop: string;
  winner: Declaration;
  /** Проигравшие объявления и причина проигрыша простыми словами */
  losers: { declaration: Declaration; reason: string }[];
}

export interface Sides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Inspection {
  /** Как предмет называется в сцене (data-name), если назван */
  name?: string;
  /** тег.класс#id — как его находит селектор */
  label: string;
  width: number;
  height: number;
  margin: Sides;
  border: Sides;
  padding: Sides;
  display: string;
  position: string;
  verdicts: Verdict[];
}

const PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter']);

/** Закрывающая скобка для открывающей в позиции open */
function closing(text: string, open: number): number {
  const pair = text[open] === '(' ? ')' : ']';
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === text[open]) depth++;
    else if (text[i] === pair && --depth === 0) return i;
  }
  return text.length;
}

/** Запятые верхнего уровня: «a, b:is(c, d)» делится на «a» и «b:is(c, d)» */
export function splitSelectors(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let from = 0;
  for (let i = 0; i < list.length; i++) {
    const ch = list[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === ',' && depth === 0) {
      parts.push(list.slice(from, i).trim());
      from = i + 1;
    }
  }
  parts.push(list.slice(from).trim());
  return parts.filter(Boolean);
}

/** Сила одного селектора (без запятых). :where() не весит ничего, а :is(), :not() и :has() весят как самый сильный из аргументов. */
export function specificity(selector: string): Specificity {
  const sum: Specificity = [0, 0, 0];
  let i = 0;
  while (i < selector.length) {
    const ch = selector[i];
    if (ch === '#') {
      sum[0]++;
      i += 1 + (selector.slice(i + 1).match(/^[\w-]+/)?.[0].length ?? 0);
    } else if (ch === '.') {
      sum[1]++;
      i += 1 + (selector.slice(i + 1).match(/^[\w-]+/)?.[0].length ?? 0);
    } else if (ch === '[') {
      sum[1]++;
      i = closing(selector, i) + 1;
    } else if (ch === ':') {
      const element = selector[i + 1] === ':';
      const name = selector.slice(i + (element ? 2 : 1)).match(/^[\w-]+/)?.[0] ?? '';
      i += (element ? 2 : 1) + name.length;
      let args = '';
      if (selector[i] === '(') {
        const end = closing(selector, i);
        args = selector.slice(i + 1, end);
        i = end + 1;
      }
      if (element || PSEUDO_ELEMENTS.has(name)) sum[2]++;
      else if (name === 'where') continue;
      else if (name === 'is' || name === 'not' || name === 'has' || name === 'matches') {
        const strongest = splitSelectors(args).map(specificity).sort(compareSpecificity).pop() ?? [0, 0, 0];
        sum[0] += strongest[0];
        sum[1] += strongest[1];
        sum[2] += strongest[2];
      } else sum[1]++;
    } else if (/[a-zA-Z_-]/.test(ch)) {
      sum[2]++;
      i += selector.slice(i).match(/^[\w-]+/)?.[0].length ?? 1;
    } else {
      i++;
    }
  }
  return sum;
}

export function compareSpecificity(a: Specificity, b: Specificity): number {
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

export const formatSpecificity = (s: Specificity) => `${s[0]},${s[1]},${s[2]}`;

/** Почему проигравшее объявление уступило победителю — по порядку, в котором каскад принимает решение */
function reasonFor(loser: Declaration, winner: Declaration): string {
  if (winner.important && !loser.important) return `у победителя есть !important`;
  const diff = compareSpecificity(loser.specificity, winner.specificity);
  if (diff < 0) return `селектор слабее: сила ${formatSpecificity(loser.specificity)} против ${formatSpecificity(winner.specificity)}`;
  return 'сила селекторов одинакова, а победитель стоит ниже по тексту, поэтому перебивает';
}

const sides = (style: CSSStyleDeclaration, name: string, suffix = ''): Sides => ({
  top: parseFloat(style.getPropertyValue(`${name}-top${suffix}`)) || 0,
  right: parseFloat(style.getPropertyValue(`${name}-right${suffix}`)) || 0,
  bottom: parseFloat(style.getPropertyValue(`${name}-bottom${suffix}`)) || 0,
  left: parseFloat(style.getPropertyValue(`${name}-left${suffix}`)) || 0,
});

/** Объявления из текста CSS, которые действуют на предмет: селектор подходит, медиазапрос выполняется */
function declarationsFor(el: Element, source: RuleSource, css: string, from: number): Declaration[] {
  const win = el.ownerDocument.defaultView;
  const result: Declaration[] = [];
  let order = from;
  for (const rule of parseCss(css).rules) {
    if (rule.kind !== 'style') continue;
    const mediaOk = rule.atRules.every((at) => {
      const query = /^@media\s+(.*)$/i.exec(at)?.[1];
      return !query || Boolean(win?.matchMedia(query).matches);
    });
    if (!mediaOk) continue;
    // В списке «a, b» берём самую сильную из подошедших частей
    let best: Specificity | null = null;
    let bestSelector = '';
    for (const part of splitSelectors(rule.selector)) {
      let matches = false;
      try {
        matches = el.matches(part);
      } catch {
        // Селектор, который браузер не понял, ни на что не действует
      }
      const strength = matches ? specificity(part) : null;
      if (strength && (!best || compareSpecificity(strength, best) > 0)) {
        best = strength;
        bestSelector = part;
      }
    }
    if (!best) continue;
    for (const decl of rule.decls) {
      result.push({ prop: decl.prop.toLowerCase(), value: decl.value, important: decl.important, source, selector: bestSelector, specificity: best, order: order++ });
    }
  }
  return result;
}

/** Решение каскада по каждому свойству, к которому прикасался студент или Лорд Дефолт */
export function resolveCascade(el: Element, css: Record<RuleSource, string>): Verdict[] {
  const all: Declaration[] = [];
  for (const source of ['scene', 'player', 'locked'] as RuleSource[]) {
    all.push(...declarationsFor(el, source, css[source], all.length));
  }
  const byProp = new Map<string, Declaration[]>();
  for (const declaration of all) byProp.set(declaration.prop, [...(byProp.get(declaration.prop) ?? []), declaration]);
  const verdicts: Verdict[] = [];
  for (const [prop, list] of byProp) {
    // Оформление района без участия студента не интересно: смотрим свойства, где есть его код или чары Лорда Дефолта
    if (!list.some((item) => item.source !== 'scene')) continue;
    const ranked = [...list].sort(
      (a, b) => Number(a.important) - Number(b.important) || compareSpecificity(a.specificity, b.specificity) || a.order - b.order,
    );
    const winner = ranked[ranked.length - 1];
    verdicts.push({ prop, winner, losers: ranked.slice(0, -1).reverse().map((declaration) => ({ declaration, reason: reasonFor(declaration, winner) })) });
  }
  return verdicts.sort((a, b) => a.winner.order - b.winner.order);
}

/** Как предмет называется для селектора: тег#id.класс.класс */
function labelOf(el: Element): string {
  const classes = [...el.classList].map((name) => `.${name}`).join('');
  return `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}${classes}`;
}

/** Всё, что показывает лупа про предмет: размеры, коробка и кто победил по каждому свойству */
export function inspectElement(el: Element, css: Record<RuleSource, string>): Inspection {
  const win = el.ownerDocument.defaultView as Window;
  const style = win.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  return {
    name: el.getAttribute('data-name') ?? undefined,
    label: labelOf(el),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    margin: sides(style, 'margin'),
    border: sides(style, 'border', '-width'),
    padding: sides(style, 'padding'),
    display: style.display,
    position: style.position,
    verdicts: resolveCascade(el, css),
  };
}
