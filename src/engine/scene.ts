import type { Level } from './types';

/** Базовые стили любой сцены: без отступов браузера, сцена не прокручивается, содержимое по центру. */
const BASE_SCENE_CSS = `
html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; }
body { display: flex; align-items: center; justify-content: center; font-family: system-ui, sans-serif; }
`;

/**
 * Документ сцены для iframe. Код студента вставляется потом в <style id="player">
 * через textContent — так он не может сломать разметку.
 */
export function sceneDocument(level: Level): string {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<style>${BASE_SCENE_CSS}</style>
<style>${level.sceneCss}</style>
<style id="player"></style>
</head><body>${level.html}</body></html>`;
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

export function measureItems(doc: Document, level: Level): ItemBox[] {
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

export interface ItemStatus {
  name: string;
  color: string;
  target: ItemBox;
  inPlace: boolean;
  /** Что не так — если предмет не на месте */
  message?: string;
}

/** Сравнивает предметы студента с эталонными целями (по порядку в разметке). */
export function compareItems(actual: ItemBox[], targets: ItemBox[], tolerance = 2): ItemStatus[] {
  const near = (d: number) => Math.abs(d) <= tolerance;
  return targets.map((target, i) => {
    const base = { name: target.name, color: target.color, target };
    const item = actual[i];
    if (!item) return { ...base, inPlace: false, message: `${target.name}: пропал со сцены.` };
    const dx = Math.round(target.x - item.x);
    const dy = Math.round(target.y - item.y);
    const dw = Math.round(target.w - item.w);
    const dh = Math.round(target.h - item.h);
    if (near(dx) && near(dy) && near(dw) && near(dh)) return { ...base, inPlace: true };

    const parts: string[] = [];
    if (!near(dw) || !near(dh)) {
      if (!near(dw)) parts.push(dw > 0 ? `шире на ${dw}px` : `уже на ${-dw}px`);
      if (!near(dh)) parts.push(dh > 0 ? `выше ростом на ${dh}px` : `ниже ростом на ${-dh}px`);
    } else {
      if (!near(dx)) parts.push(dx > 0 ? `на ${dx}px правее` : `на ${-dx}px левее`);
      if (!near(dy)) parts.push(dy > 0 ? `на ${dy}px ниже` : `на ${-dy}px выше`);
    }
    return { ...base, inPlace: false, message: `${target.name}: нужно ${parts.join(' и ')}.` };
  });
}

/** Подсвечивает в сцене предметы, которые уже стоят на своих местах. */
export function markInPlace(doc: Document, level: Level, statuses: ItemStatus[]): void {
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
