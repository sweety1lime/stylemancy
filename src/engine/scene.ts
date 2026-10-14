import type { CssLevel } from './types';

/** Базовые стили любой сцены: без отступов браузера, сцена не прокручивается, содержимое по центру. */
const BASE_SCENE_CSS = `
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
body { display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; }
`;

/**
 * Документ сцены для iframe. Код студента вставляется потом в <style id="player">
 * через textContent — так он не может сломать разметку.
 */
export function sceneDocument(level: CssLevel): string {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<style>${BASE_SCENE_CSS}</style>
<style>${level.sceneCss}</style>
<style id="player"></style>
</head><body>${level.html}</body></html>`;
}

/** Ширины, на которых проверяется уровень: одна сцена или несколько «зеркал». */
export function viewportsOf(level: CssLevel): number[] {
  return level.check.viewports ?? [level.scene.width];
}

/** Подпись зеркала: самое узкое, самое широкое или среднее. */
export function mirrorLabel(widths: number[], index: number): string {
  const kind = index === 0 ? 'Узкое зеркало' : index === widths.length - 1 ? 'Широкое зеркало' : 'Среднее зеркало';
  return `${kind} · ${widths[index]}px`;
}

export function setPlayerCss(doc: Document, css: string): void {
  const style = doc.getElementById('player');
  if (style) style.textContent = css;
}

/** Положение и размер предмета в координатах сцены. */
export interface ItemBox {
  name: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function measureItems(doc: Document, level: CssLevel): ItemBox[] {
  const view = doc.defaultView;
  return Array.from(doc.querySelectorAll<HTMLElement>(level.check.items), (el, i) => {
    const rect = el.getBoundingClientRect();
    const color = view?.getComputedStyle(el).getPropertyValue('--item-color').trim() || '#f4c76b';
    return {
      name: el.dataset.name ?? `${level.check.itemLabel ?? 'Предмет'} ${i + 1}`,
      color,
      x: rect.left,
      y: rect.top,
      w: rect.width,
      h: rect.height,
    };
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
  /** Ширина зеркала, если уровень проверяется на нескольких */
  viewport?: number;
  /** Предмет нужно спрятать или, наоборот, показать (display: none) */
  visibility?: 'hide' | 'show';
}

/** Сравнивает предметы студента с эталонными целями (по порядку в разметке). */
export function compareItems(actual: ItemBox[], targets: ItemBox[], tolerance = 2): ItemStatus[] {
  const near = (d: number) => Math.abs(d) <= tolerance;
  return targets.map((target, i) => {
    const base = { name: target.name, color: target.color, target };
    const item = actual[i];
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
      const message = visibility === 'hide' ? `${target.name}: здесь нужно спрятать.` : `${target.name}: здесь нужно показать.`;
      return { ...base, inPlace: false, sizeOk: false, delta, message, visibility };
    }
    if (hidden(target)) return { ...base, inPlace: true, sizeOk: true, delta };
    const sizeOk = near(delta.w) && near(delta.h);
    if (sizeOk && near(delta.x) && near(delta.y)) return { ...base, inPlace: true, sizeOk, delta };
    const message = `${target.name}: нужно ${describeDelta(delta, sizeOk, tolerance)}.`;
    return { ...base, inPlace: false, sizeOk, delta, message };
  });
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
  // Несколько зеркал — промахи по каждому отдельно, с подписью ширины
  const viewports = [...new Set(statuses.map((s) => s.viewport).filter((width): width is number => width !== undefined))];
  if (viewports.length) {
    return viewports.flatMap((width) =>
      summarizeMisses(
        statuses.filter((s) => s.viewport === width).map((s) => ({ ...s, viewport: undefined })),
        groupName,
        tolerance,
        3,
      ).map((line) => `Зеркало ${width}px: ${line}`),
    );
  }
  // «Спрячь» и «покажи» важнее сдвигов: из-за спрятанного предмета съезжают соседи
  const misses = statuses.filter((s) => !s.inPlace).sort((a, b) => Number(Boolean(b.visibility)) - Number(Boolean(a.visibility)));
  if (!misses.length) return [];
  const [first] = misses;
  const alike = (a: number, b: number) => Math.abs(a - b) <= 1;

  if (misses.length > 1 && misses.length === statuses.length) {
    const sameShift = misses.every((s) => s.sizeOk && alike(s.delta.x, first.delta.x) && alike(s.delta.y, first.delta.y));
    if (sameShift) return [`Все ${groupName} смещены одинаково — нужно ${describeDelta(first.delta, true, tolerance)}.`];
    const sameSize = misses.every((s) => !s.sizeOk && alike(s.delta.w, first.delta.w) && alike(s.delta.h, first.delta.h));
    if (sameSize) return [`Все ${groupName} не того размера — каждому нужно ${describeDelta(first.delta, false, tolerance)}.`];
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
