import { parseCss } from './cssParse';
import type { CssLevel } from './types';

/** Базовые стили любой сцены: без отступов браузера, сцена не прокручивается, содержимое по центру. Лёгкие эффекты — без анимаций. */
const BASE_SCENE_CSS = `
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
body { display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; }
.effects-light *, .effects-light *::before, .effects-light *::after { animation-duration: 0s !important; animation-iteration-count: 1 !important; }
@keyframes frames-2 { to { background-position-x: 200%; } }
@keyframes frames-3 { to { background-position-x: 150%; } }
`;

/**
 * Документ сцены для iframe. Код студента вставляется потом в <style id="player">
 * через textContent — так он не может сломать разметку. Чары Лорда Дефолта — после него.
 */
export function sceneDocument(level: CssLevel): string {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<style>${BASE_SCENE_CSS}</style>
<style>${level.sceneCss}</style>
<style id="player"></style>
<style id="locked">${level.lockedCss ?? ''}</style>
</head><body>${level.html}</body></html>`;
}

/**
 * Одно «зеркало» сцены: своя ширина экрана, а в уровнях про :hover — «под мышкой».
 * У уровня с одной сценой подписей нет.
 */
export interface SceneView {
  width: number;
  /** Уровни про :hover: true — элементы из check.hover наведены мышью, false — не наведён никто */
  hover?: boolean;
  /** Подпись над зеркалом: «Узкое зеркало · 360px», «Под мышкой» */
  label?: string;
  /** Начало сообщения о промахе: «Зеркало 360px», «Под мышкой» */
  prefix?: string;
  /** Подпись у точек «на месте»: «360px», «под мышкой» */
  tag?: string;
}

/** Зеркала уровня: одна сцена, несколько ширин экрана или «обычно» и «под мышкой». */
export function viewsOf(level: CssLevel): SceneView[] {
  const width = level.scene.width;
  if (level.check.hover) {
    return [
      { width, hover: false, label: 'Обычно', prefix: 'Обычно', tag: 'обычно' },
      { width, hover: true, label: 'Под мышкой', prefix: 'Под мышкой', tag: 'под мышкой' },
    ];
  }
  const widths = level.check.viewports ?? [width];
  if (widths.length === 1) return [{ width: widths[0] }];
  return widths.map((w, i) => ({ width: w, label: mirrorLabel(widths, i), prefix: `Зеркало ${w}px`, tag: `${w}px` }));
}

/** Подпись зеркала: самое узкое, самое широкое или среднее. */
export function mirrorLabel(widths: number[], index: number): string {
  const kind = index === 0 ? 'Узкое зеркало' : index === widths.length - 1 ? 'Широкое зеркало' : 'Среднее зеркало';
  return `${kind} · ${widths[index]}px`;
}

/** Зеркало «под мышкой»: наведение мышью изображает атрибут data-hover — его ставим нужным элементам. */
export function prepareView(doc: Document, level: CssLevel, view: SceneView): void {
  if (!view.hover || !level.check.hover) return;
  doc.querySelectorAll(level.check.hover).forEach((el) => el.setAttribute('data-hover', ''));
}

/**
 * Код для зеркала. В уровнях про :hover наведение изображает метка data-hover, а не настоящий курсор:
 * иначе мышь, случайно оставленная над сценой, сбивала бы проверку.
 */
export function cssForView(css: string, view: SceneView): string {
  return view.hover === undefined ? css : css.replace(/:hover\b/gi, '[data-hover]');
}

export function setPlayerCss(doc: Document, css: string): void {
  const style = doc.getElementById('player');
  if (style) style.textContent = css;
}

/** Ставит код в зеркало и измеряет предметы. */
export function applyToView(doc: Document, level: CssLevel, view: SceneView, css: string): ItemBox[] {
  const viewCss = cssForView(css, view);
  setPlayerCss(doc, viewCss);
  return measureItems(doc, level, viewCss);
}

/** Цели для зеркала: сначала сцена без кода (каким был цвет до заклинания), потом эталон. */
export function measureTargets(doc: Document, level: CssLevel, view: SceneView): ItemBox[] {
  setPlayerCss(doc, '');
  const before = measureItems(doc, level);
  return applyToView(doc, level, view, level.solutionCss).map((box, i) => ({ ...box, base: before[i]?.value }));
}

/** Селекторы правил студента, которые задают проверяемое свойство (для «нашёл, но проиграл»). */
function selectorsSetting(css: string, prop: string): string[] {
  return parseCss(css)
    .rules.filter((rule) => rule.kind === 'style' && rule.selector && rule.decls.some((decl) => decl.prop.toLowerCase() === prop))
    .map((rule) => rule.selector);
}

function matchesSafely(el: Element, selector: string): boolean {
  try {
    return el.matches(selector);
  } catch {
    return false;
  }
}

/** Положение и размер предмета в координатах сцены. */
export interface ItemBox {
  name: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** visibility: hidden — места занимает, но не виден */
  invisible?: boolean;
  /** Чей предмет сверху в центре этого (номер предмета, −1 — ничей). Только для уровней про z-index */
  top?: number;
  /** Значение проверяемого свойства (check.style) — в уровнях про селекторы */
  value?: string;
  /** Значение того же свойства без кода студента — только у целей */
  base?: string;
  /** Предмет нашло правило студента, которое задаёт проверяемое свойство */
  matched?: boolean;
}

/** css — код, который сейчас стоит в сцене: по нему видно, чьё правило нашло предмет. */
export function measureItems(doc: Document, level: CssLevel, css = ''): ItemBox[] {
  const view = doc.defaultView;
  const elements = Array.from(doc.querySelectorAll<HTMLElement>(level.check.items));
  const prop = level.check.style;
  const selectors = prop && css ? selectorsSetting(css, prop) : [];
  return elements.map((el, i) => {
    const rect = el.getBoundingClientRect();
    const style = view?.getComputedStyle(el);
    const box: ItemBox = {
      name: el.dataset.name ?? `${level.check.itemLabel ?? 'Предмет'} ${i + 1}`,
      color: style?.getPropertyValue('--item-color').trim() || '#f4c76b',
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
      invisible: style?.visibility === 'hidden',
    };
    if (level.check.stacking && rect.width > 0 && rect.height > 0) {
      const hit = doc.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const owner = hit?.closest<HTMLElement>(level.check.items);
      box.top = owner ? elements.indexOf(owner) : -1;
    }
    if (prop) {
      box.value = style?.getPropertyValue(prop).trim();
      // Контур цели и точка «на месте» — того цвета, каким предмет должен стать
      box.color = box.value || box.color;
      box.matched = selectors.some((selector) => matchesSafely(el, selector));
    }
    return box;
  });
}

/** На сколько сдвинуть и изменить предмет, чтобы он совпал с целью. */
export interface Delta {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ItemStatus {
  name: string;
  color: string;
  target: ItemBox;
  inPlace: boolean;
  /** Размер совпадает с целью */
  sizeOk: boolean;
  delta: Delta;
  /** Что не так — если предмет не на месте */
  message?: string;
  /** Зеркало, если уровень проверяется в нескольких */
  view?: SceneView;
  /** Предмет нужно спрятать или, наоборот, показать (display: none) */
  visibility?: 'hide' | 'show';
  /** Уровни про селекторы: чем не угодил предмет — их сообщения собираются по причинам */
  reason?: StyleReason;
}

/** extra — выбран лишний, missing — не найден, lost — найден, но правило проиграло, inherited — цвет от родителя */
export type StyleReason = 'extra' | 'missing' | 'lost' | 'inherited' | 'color';

/** Сравнивает предметы студента с эталонными целями (по порядку в разметке). */
export function compareItems(actual: ItemBox[], targets: ItemBox[], tolerance = 2): ItemStatus[] {
  const statuses = targets.map((target, i) => comparePlace(actual[i], target, tolerance));
  // Кто кого заслоняет, проверяем, только когда предмет на своём месте
  return statuses.map((status, i) => {
    const target = targets[i];
    const item = actual[i];
    if (!status.inPlace || target.top === undefined || item?.top === target.top) return status;
    const other = (index: number | undefined) => (index !== undefined && index >= 0 ? `«${targets[index].name}»` : 'что-то другое');
    if (target.top === i) {
      return { ...status, inPlace: false, message: `${target.name}: сверху лежит ${other(item.top)} — подними через z-index.` };
    }
    // Закрывать его должен другой предмет — но пока тот не на месте, слоям не с чего совпасть
    if (!statuses[target.top]?.inPlace) return status;
    return { ...status, inPlace: false, message: `${target.name}: сейчас закрывает ${other(target.top)} — проверь z-index.` };
  });
}

/** Положение, размер и видимость одного предмета. */
function comparePlace(item: ItemBox | undefined, target: ItemBox, tolerance: number): ItemStatus {
  const near = (d: number) => Math.abs(d) <= tolerance;
  const base = { name: target.name, color: target.color, target };
  if (!item) {
    const delta = { x: 0, y: 0, w: 0, h: 0 };
    return { ...base, inPlace: false, sizeOk: false, delta, message: `${target.name}: пропал со сцены.` };
  }
  const delta = {
    x: Math.round(target.x - item.x),
    y: Math.round(target.y - item.y),
    w: Math.round(target.w - item.w),
    h: Math.round(target.h - item.h),
  };
  // Спрятанный элемент (display: none) — особые слова, а не «шире на 64px»
  const hidden = (box: ItemBox) => box.w === 0 && box.h === 0;
  if (hidden(target) !== hidden(item)) {
    const visibility = hidden(target) ? 'hide' : 'show';
    let message = visibility === 'hide' ? `${target.name}: здесь нужно спрятать.` : `${target.name}: здесь нужно показать.`;
    // Спрятан, но не тем способом: visibility оставляет место, display: none убирает его
    if (hidden(target) && item.invisible) message = `${target.name}: не виден, но всё ещё занимает место — убери его совсем.`;
    if (hidden(item) && target.invisible) message = `${target.name}: убран вместе со своим местом — а место должно остаться пустым.`;
    return { ...base, inPlace: false, sizeOk: false, delta, message, visibility };
  }
  if (hidden(target)) return { ...base, inPlace: true, sizeOk: true, delta };
  const sizeOk = near(delta.w) && near(delta.h);
  if (!sizeOk || !near(delta.x) || !near(delta.y)) {
    const message = `${target.name}: нужно ${describeDelta(delta, sizeOk, tolerance)}.`;
    return { ...base, inPlace: false, sizeOk, delta, message };
  }
  // Место верное — осталось проверить, видно ли предмет
  if (Boolean(target.invisible) !== Boolean(item.invisible)) {
    const visibility = target.invisible ? 'hide' : 'show';
    const message = target.invisible
      ? `${target.name}: спрячь, но так, чтобы место осталось пустым.`
      : `${target.name}: здесь нужно показать.`;
    return { ...base, inPlace: false, sizeOk, delta, message, visibility };
  }
  // Уровни про селекторы: нашёл ли селектор предмет и чьё правило победило
  if (target.value !== undefined && item.value !== target.value) {
    const reason = styleReason(item, target);
    return { ...base, inPlace: false, sizeOk, delta, reason, message: `${target.name}: ${STYLE_REASONS[reason].one}` };
  }
  return { ...base, inPlace: true, sizeOk, delta };
}

/** Почему цвет предмета не тот: селектор не нашёл его, нашёл лишнее или правило студента проиграло. */
function styleReason(item: ItemBox, target: ItemBox): StyleReason {
  const lit = (box: ItemBox) => box.value !== target.base;
  if (!lit(target)) return item.matched ? 'extra' : 'inherited';
  if (!lit(item)) return item.matched ? 'lost' : 'missing';
  return 'color';
}

const STYLE_REASON_ORDER: StyleReason[] = ['missing', 'lost', 'color', 'extra', 'inherited'];

/** Слова для причин: про один предмет и про несколько сразу (тогда следом идёт список имён). */
const STYLE_REASONS: Record<StyleReason, { one: string; many: string }> = {
  extra: { one: 'выбран лишний.', many: 'Выбраны лишние' },
  missing: { one: 'селектор его не нашёл.', many: 'Селектор не нашёл' },
  lost: {
    one: 'твоё правило его нашло, но победило другое — проверь специфичность и порядок правил.',
    many: 'Твоё правило их нашло, но победило другое — проверь специфичность и порядок правил',
  },
  inherited: { one: 'не должен светиться — цвет достался ему от родителя.', many: 'Светятся зря — цвет достался им от родителя' },
  color: { one: 'цвет не тот.', many: 'Цвет не тот' },
};

/** «Гриб 1, Гриб 2 и Гриб 3»; длинный список обрезается. */
function nameList(names: string[], limit = 4): string {
  if (names.length > limit) return `${names.slice(0, limit).join(', ')} и ещё ${names.length - limit}`;
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} и ${names[names.length - 1]}` : names[0];
}

/** «на 40px правее и на 12px ниже» или «шире на 13px». Если размер не тот, говорим сначала о нём. */
function describeDelta(delta: Delta, sizeOk: boolean, tolerance: number): string {
  const near = (d: number) => Math.abs(d) <= tolerance;
  const parts: string[] = [];
  if (!sizeOk) {
    if (!near(delta.w)) parts.push(delta.w > 0 ? `шире на ${delta.w}px` : `уже на ${-delta.w}px`);
    if (!near(delta.h)) parts.push(delta.h > 0 ? `выше ростом на ${delta.h}px` : `ниже ростом на ${-delta.h}px`);
  } else {
    if (!near(delta.x)) parts.push(delta.x > 0 ? `на ${delta.x}px правее` : `на ${-delta.x}px левее`);
    if (!near(delta.y)) parts.push(delta.y > 0 ? `на ${delta.y}px ниже` : `на ${-delta.y}px выше`);
  }
  return parts.join(' и ');
}

/**
 * Что сказать студенту о промахах. Если все предметы сдвинуты или сжаты одинаково —
 * одна фраза вместо списка; длинный список обрезается.
 */
export function summarizeMisses(statuses: ItemStatus[], groupName = 'предметы', tolerance = 2, limit = 4): string[] {
  // Несколько зеркал — промахи по каждому отдельно, с подписью зеркала
  const prefixes = [...new Set(statuses.map((s) => s.view?.prefix).filter((prefix): prefix is string => prefix !== undefined))];
  if (prefixes.length) {
    return prefixes.flatMap((prefix) =>
      summarizeMisses(
        statuses.filter((s) => s.view?.prefix === prefix).map((s) => ({ ...s, view: undefined })),
        groupName,
        tolerance,
        3,
      ).map((line) => `${prefix}: ${line}`),
    );
  }
  // «Спрячь» и «покажи» важнее сдвигов: из-за спрятанного предмета съезжают соседи
  const misses = statuses.filter((s) => !s.inPlace).sort((a, b) => Number(Boolean(b.visibility)) - Number(Boolean(a.visibility)));
  if (!misses.length) return [];
  const [first] = misses;
  const alike = (a: number, b: number) => Math.abs(a - b) <= 1;
  // Предмет стоит где надо, а не так у него другое — видимость или слой
  const placed = (s: ItemStatus) => Math.abs(s.delta.x) <= tolerance && Math.abs(s.delta.y) <= tolerance;

  if (misses.length > 1 && misses.length === statuses.length) {
    const sameShift = misses.every((s) => s.sizeOk && !placed(s) && alike(s.delta.x, first.delta.x) && alike(s.delta.y, first.delta.y));
    if (sameShift) return [`Все ${groupName} смещены одинаково — нужно ${describeDelta(first.delta, true, tolerance)}.`];
    const sameSize = misses.every((s) => !s.sizeOk && !s.visibility && alike(s.delta.w, first.delta.w) && alike(s.delta.h, first.delta.h));
    if (sameSize) return [`Все ${groupName} не того размера — каждому нужно ${describeDelta(first.delta, false, tolerance)}.`];
  }

  // Уровни про селекторы: промахи одной причины — одной строкой со списком имён
  if (misses.every((s) => s.reason)) {
    // Сначала — кого не нашли, потом — что лишнее
    const reasons = STYLE_REASON_ORDER.filter((reason) => misses.some((s) => s.reason === reason));
    return reasons.map((reason) => {
      const names = misses.filter((s) => s.reason === reason).map((s) => s.name);
      return names.length === 1 ? `${names[0]}: ${STYLE_REASONS[reason].one}` : `${STYLE_REASONS[reason].many}: ${nameList(names)}.`;
    });
  }

  const lines = misses.slice(0, limit).map((s) => s.message ?? s.name);
  if (misses.length > limit) lines.push(`…и ещё ${misses.length - limit} не на месте.`);
  return lines;
}

/** Подсвечивает в сцене предметы, которые уже стоят на своих местах. */
export function markInPlace(doc: Document, level: CssLevel, statuses: ItemStatus[]): void {
  doc.querySelectorAll(level.check.items).forEach((el, i) => {
    el.toggleAttribute('data-in-place', Boolean(statuses[i]?.inPlace));
  });
}

/** Невидимый iframe для проверки без интерфейса. */
export function createHiddenFrame(width: number, height: number): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-same-origin');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  Object.assign(iframe.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${width}px`,
    height: `${height}px`,
    border: '0',
    visibility: 'hidden',
  });
  document.body.append(iframe);
  return iframe;
}

export function loadFrame(iframe: HTMLIFrameElement, html: string): Promise<Document> {
  return new Promise((resolve, reject) => {
    iframe.addEventListener(
      'load',
      () => {
        const doc = iframe.contentDocument;
        if (doc) resolve(doc);
        else reject(new Error('Нет доступа к документу сцены'));
      },
      { once: true },
    );
    iframe.srcdoc = html;
  });
}
