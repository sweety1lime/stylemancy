import { cssForView, setPlayerCss, type ItemBox, type ItemStatus, type SceneView } from './scene';
import type { CssLevel, OrderItem, OrderRule } from './types';

/** Что нужно проверке от уровня: условия, допуск и как называть предметы. Заказ жителя и творческое задание «Моей земли» передают только это */
export type OrderSpec = Pick<CssLevel['check'], 'order' | 'tolerance' | 'itemLabel'>;

/*
  Заказ жителя принимается по условиям, а не по контурам: «товары в один ряд», «промежутки поровну», «цена справа».
  Условия проверяются по настоящим размерам предметов в сцене студента, поэтому решений бывает много.
  Каждое условие превращается в ItemStatus: так заказ идёт через тот же путь, что и обычный уровень
  (точки «на месте», искры, итог заклинания, самопроверка уровней), только вместо предметов — пункты заказа.
*/

/** Предмет сцены с его настоящим положением и размером */
interface Part {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  right: number;
  bottom: number;
  visible: boolean;
}

interface Verdict {
  ok: boolean;
  message?: string;
  /** Предметы, о которых условие: вокруг них вспыхнут искры, когда условие выполнится */
  involved: Part[];
}

const round = (n: number) => Math.round(n);
const px = (n: number) => `${round(n)}px`;
const quoted = (parts: Part[]) => parts.map((part) => `«${part.name}»`).join(', ');

function partOf(el: HTMLElement, label: string | undefined, index: number): Part {
  const rect = el.getBoundingClientRect();
  return {
    // Предметы сцены названы через data-name; на странице игрока подпись берётся из alt картинки
    name: el.dataset.name ?? (el.getAttribute('alt')?.trim() || `${label ?? 'Предмет'} ${index + 1}`),
    x: rect.left,
    y: rect.top,
    w: rect.width,
    h: rect.height,
    right: rect.right,
    bottom: rect.bottom,
    visible: rect.width > 0 && rect.height > 0,
  };
}

function partsOf(doc: Document, selector: string, label: string | undefined): Part[] {
  try {
    return Array.from(doc.querySelectorAll<HTMLElement>(selector)).map((el, i) => partOf(el, label, i));
  } catch {
    // Селектор, который браузер не понял, ничего не находит
    return [];
  }
}

/** Контейнер для условий «по центру», «у края», «внутри»: по селектору in, а если его нет — родитель предмета */
function containerOf(doc: Document, item: HTMLElement | null, selector: string | undefined, label: string | undefined): Part | null {
  if (selector) return partsOf(doc, selector, label)[0] ?? null;
  return item?.parentElement ? partOf(item.parentElement, label, 0) : null;
}

function firstElement(doc: Document, selector: string): HTMLElement | null {
  try {
    return doc.querySelector<HTMLElement>(selector);
  } catch {
    return null;
  }
}

function elementsOf(doc: Document, selector: string): HTMLElement[] {
  try {
    return Array.from(doc.querySelectorAll<HTMLElement>(selector));
  } catch {
    return [];
  }
}

/** Несколько предметов как один: общая рамка вокруг всех — для условий вроде «вся группа по центру» */
function groupOf(parts: Part[]): Part {
  const x = Math.min(...parts.map((part) => part.x));
  const y = Math.min(...parts.map((part) => part.y));
  const right = Math.max(...parts.map((part) => part.right));
  const bottom = Math.max(...parts.map((part) => part.bottom));
  return { name: 'Все предметы', x, y, w: right - x, h: bottom - y, right, bottom, visible: true };
}

const SIDE_NAMES = { left: 'левого', right: 'правого', top: 'верхнего', bottom: 'нижнего' } as const;

/** Проверка одного условия по сцене: ok и, если нет, что не так — простыми словами и с числами */
function judge(doc: Document, level: { check: OrderSpec }, rule: OrderRule): Verdict {
  const tol = level.check.tolerance ?? 2;
  const label = level.check.itemLabel;
  const fail = (involved: Part[], message: string): Verdict => ({ ok: false, message, involved });
  const pass = (involved: Part[]): Verdict => ({ ok: true, involved });
  const missing = (selector: string): Verdict => fail([], `на сцене нет «${selector}»`);

  /** Условия про несколько предметов: их нужно найти хотя бы двух */
  const group = (selector: string, run: (parts: Part[]) => Verdict): Verdict => {
    const parts = partsOf(doc, selector, label);
    if (parts.length < 2) return missing(selector);
    const hidden = parts.find((part) => !part.visible);
    if (hidden) return fail(parts, `«${hidden.name}» не видно на сцене`);
    return run(parts);
  };

  /** Условия про один предмет; если селектор нашёл несколько, это группа: проверяется общая рамка вокруг них */
  const single = (selector: string, run: (part: Part, el: HTMLElement) => Verdict): Verdict => {
    const elements = elementsOf(doc, selector);
    if (!elements.length) return missing(selector);
    const parts = elements.map((el, i) => partOf(el, label, i));
    const hidden = parts.find((part) => !part.visible);
    if (hidden) return fail(parts, `«${hidden.name}» не видно на сцене`);
    return run(parts.length === 1 ? parts[0] : groupOf(parts), elements[0]);
  };

  switch (rule.rule) {
    case 'row':
      return group(rule.items, (parts) => {
        // Один ряд: у всех есть общая горизонтальная полоса, а порядок слева направо — как в разметке
        if (Math.max(...parts.map((p) => p.y)) >= Math.min(...parts.map((p) => p.bottom))) {
          return fail(parts, 'предметы не в один ряд: у них нет общей высоты');
        }
        const wrong = parts.findIndex((part, i) => i > 0 && part.x + tol < parts[i - 1].x);
        if (wrong > 0) return fail(parts, `порядок слева направо должен быть как в разметке: ${quoted(parts)}`);
        return pass(parts);
      });

    case 'column':
      return group(rule.items, (parts) => {
        if (Math.max(...parts.map((p) => p.x)) >= Math.min(...parts.map((p) => p.right))) {
          return fail(parts, 'предметы не в один столбец: они стоят не друг под другом');
        }
        const wrong = parts.findIndex((part, i) => i > 0 && part.y + tol < parts[i - 1].y);
        if (wrong > 0) return fail(parts, `порядок сверху вниз должен быть как в разметке: ${quoted(parts)}`);
        return pass(parts);
      });

    case 'gap':
      return group(rule.items, (parts) => {
        const spreadX = Math.max(...parts.map((p) => p.x)) - Math.min(...parts.map((p) => p.x));
        const spreadY = Math.max(...parts.map((p) => p.y)) - Math.min(...parts.map((p) => p.y));
        const horizontal = spreadX >= spreadY;
        const sorted = [...parts].sort((a, b) => (horizontal ? a.x - b.x : a.y - b.y));
        const gaps = sorted.slice(1).map((part, i) => (horizontal ? part.x - sorted[i].right : part.y - sorted[i].bottom));
        const list = gaps.map(px).join(', ');
        if (rule.px !== undefined) {
          const wanted = rule.px;
          return gaps.every((gap) => Math.abs(gap - wanted) <= tol) ? pass(parts) : fail(parts, `промежутки должны быть ${wanted}px, а сейчас: ${list}`);
        }
        const equal = Math.max(...gaps) - Math.min(...gaps) <= tol && Math.min(...gaps) >= -tol;
        return equal ? pass(parts) : fail(parts, `промежутки разные: ${list}`);
      });

    case 'center':
      return single(rule.item, (part, el) => {
        const box = containerOf(doc, el, rule.in, label);
        if (!box) return missing(rule.in ?? 'контейнер');
        const dx = part.x + part.w / 2 - (box.x + box.w / 2);
        const dy = part.y + part.h / 2 - (box.y + box.h / 2);
        const axis = rule.axis ?? 'both';
        const problems: string[] = [];
        if (axis !== 'y' && Math.abs(dx) > tol) problems.push(`по горизонтали сдвиг ${px(Math.abs(dx))} ${dx > 0 ? 'вправо' : 'влево'}`);
        if (axis !== 'x' && Math.abs(dy) > tol) problems.push(`по вертикали сдвиг ${px(Math.abs(dy))} ${dy > 0 ? 'вниз' : 'вверх'}`);
        return problems.length ? fail([part], `«${part.name}» не по центру: ${problems.join(', ')}`) : pass([part]);
      });

    case 'side':
      return single(rule.item, (part, el) => {
        const box = containerOf(doc, el, rule.in, label);
        if (!box) return missing(rule.in ?? 'контейнер');
        const away = { left: part.x - box.x, right: box.right - part.right, top: part.y - box.y, bottom: box.bottom - part.bottom }[rule.side];
        const wanted = rule.offset ?? 0;
        if (Math.abs(away - wanted) <= tol) return pass([part]);
        return fail([part], `«${part.name}» до ${SIDE_NAMES[rule.side]} края ${px(away)}, а нужно ${wanted}px`);
      });

    case 'leftOf':
    case 'rightOf':
    case 'above':
    case 'below': {
      const a = firstElement(doc, rule.a);
      const b = firstElement(doc, rule.b);
      if (!a) return missing(rule.a);
      if (!b) return missing(rule.b);
      const pa = partOf(a, label, 0);
      const pb = partOf(b, label, 1);
      const ok =
        rule.rule === 'leftOf' ? pa.right <= pb.x + tol : rule.rule === 'rightOf' ? pa.x >= pb.right - tol : rule.rule === 'above' ? pa.bottom <= pb.y + tol : pa.y >= pb.bottom - tol;
      const where = { leftOf: 'левее', rightOf: 'правее', above: 'выше', below: 'ниже' }[rule.rule];
      return ok ? pass([pa, pb]) : fail([pa, pb], `«${pa.name}» должен быть ${where} «${pb.name}»`);
    }

    case 'sameSize':
      return group(rule.items, (parts) => {
        const same = parts.every((part) => Math.abs(part.w - parts[0].w) <= tol && Math.abs(part.h - parts[0].h) <= tol);
        return same ? pass(parts) : fail(parts, `размеры разные: ${parts.map((part) => `${round(part.w)}×${round(part.h)}`).join(', ')}`);
      });

    case 'size':
      return single(rule.item, (part) => {
        const okW = rule.w === undefined || Math.abs(part.w - rule.w) <= tol;
        const okH = rule.h === undefined || Math.abs(part.h - rule.h) <= tol;
        if (okW && okH) return pass([part]);
        return fail([part], `«${part.name}» ${round(part.w)}×${round(part.h)}px, а нужно ${rule.w ?? '…'}×${rule.h ?? '…'}px`);
      });

    case 'inside':
      return single(rule.item, (part) => {
        const box = containerOf(doc, null, rule.in, label);
        if (!box) return missing(rule.in);
        const out =
          part.x < box.x - tol || part.right > box.right + tol || part.y < box.y - tol || part.bottom > box.bottom + tol;
        return out ? fail([part], `«${part.name}» вылезает за «${box.name}»`) : pass([part]);
      });

    case 'noOverlap':
      return group(rule.items, (parts) => {
        for (let i = 0; i < parts.length; i++) {
          for (let k = i + 1; k < parts.length; k++) {
            const overlapX = Math.min(parts[i].right, parts[k].right) - Math.max(parts[i].x, parts[k].x);
            const overlapY = Math.min(parts[i].bottom, parts[k].bottom) - Math.max(parts[i].y, parts[k].y);
            if (overlapX > tol && overlapY > tol) return fail(parts, `«${parts[i].name}» и «${parts[k].name}» налезают друг на друга`);
          }
        }
        return pass(parts);
      });
  }
}

/** Рамка вокруг предметов условия: туда прилетят искры, когда оно выполнится */
function boxAround(item: OrderItem, parts: Part[]): ItemBox {
  const shown = parts.filter((part) => part.visible);
  if (!shown.length) return { name: item.label, color: '#f4c76b', x: 0, y: 0, w: 0, h: 0 };
  const x = Math.min(...shown.map((part) => part.x));
  const y = Math.min(...shown.map((part) => part.y));
  return {
    name: item.label,
    color: '#f4c76b',
    x,
    y,
    w: Math.max(...shown.map((part) => part.right)) - x,
    h: Math.max(...shown.map((part) => part.bottom)) - y,
  };
}

/** Все условия заказа по сцене: по одному ItemStatus на пункт; пункт выполнен — «на месте» */
export function evaluateOrder(doc: Document, level: { check: OrderSpec }): ItemStatus[] {
  return (level.check.order ?? []).map((item): ItemStatus => {
    const verdict = judge(doc, level, item.rule);
    return {
      name: item.label,
      color: '#f4c76b',
      target: boxAround(item, verdict.involved),
      inPlace: verdict.ok,
      sizeOk: verdict.ok,
      delta: { x: 0, y: 0, w: 0, h: 0 },
      message: verdict.message,
    };
  });
}

/** Ставит код в сцену и проверяет заказ */
export function applyOrder(doc: Document, level: CssLevel, view: SceneView, css: string): ItemStatus[] {
  setPlayerCss(doc, cssForView(css, view));
  return evaluateOrder(doc, level);
}
