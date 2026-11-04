import { magicCircle, spriteDataUri } from '../pixel/pixelArt';

/*
  Эффекты сцены: предметы перелетают на новые места, цвет перетекает, сыплются искры.
  Всё это — только картинка: проверка измеряет предметы до того, как эффект начнётся,
  а перед следующим измерением прошлые перелёты отменяются.
*/

/** Где предметы видны сейчас и какого они цвета — до того, как код поменяется. */
export interface Snapshot {
  rects: DOMRect[];
  values: string[];
}

export function snapshot(doc: Document, selector: string, prop?: string): Snapshot {
  const view = doc.defaultView;
  const elements = Array.from(doc.querySelectorAll<HTMLElement>(selector));
  return {
    rects: elements.map((el) => el.getBoundingClientRect()),
    values: prop ? elements.map((el) => view?.getComputedStyle(el).getPropertyValue(prop).trim() ?? '') : [],
  };
}

/** 'background-color' → 'backgroundColor': так свойства называются в анимациях из JS. */
function camel(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
/** Перелёт с лёгкой пружинкой в конце — как будто предмет притянуло магией */
const SPRING = 'cubic-bezier(0.34, 1.3, 0.64, 1)';

/** Предмет начинает с того места, размера и цвета, где был, и плавно приходит к новым. */
export function glide(doc: Document, selector: string, before: Snapshot, prop?: string): Animation[] {
  const view = doc.defaultView;
  const animations: Animation[] = [];
  doc.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
    const from = before.rects[i];
    if (!from) return;
    const to = el.getBoundingClientRect();
    const visible = (rect: DOMRect) => rect.width > 0 && rect.height > 0;
    if (visible(from) && visible(to)) {
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      const sx = from.width / to.width;
      const sy = from.height / to.height;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || Math.abs(sx - 1) > 0.01 || Math.abs(sy - 1) > 0.01) {
        animations.push(
          el.animate(
            [
              { transformOrigin: '0 0', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
              { transformOrigin: '0 0', transform: 'none' },
            ],
            { duration: 700, easing: SPRING },
          ),
        );
      }
    } else if (!visible(from) && visible(to)) {
      // Был спрятан — появляется
      animations.push(el.animate([{ opacity: 0, transform: 'scale(0.6)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: SPRING }));
    }
    if (prop) {
      const was = before.values[i];
      const now = view?.getComputedStyle(el).getPropertyValue(prop).trim();
      if (was && now && was !== now) {
        animations.push(el.animate([{ [camel(prop)]: was }, { [camel(prop)]: now }], { duration: 650, easing: 'ease-in-out' }));
      }
    }
  });
  return animations;
}

/** Вид «Сумрак»: у него свои эффекты — мягкий свет вместо пиксельных искр */
export function isNoir(): boolean {
  return document.documentElement.classList.contains('look-noir');
}

/** Искры из точки: пиксельные квадратики разлетаются и гаснут. В «Сумраке» — огоньки, которые всплывают и тают */
export function burst(layer: HTMLElement, x: number, y: number, color: string, { count = 10, spread = 40, delay = 0 } = {}) {
  if (isNoir()) {
    motes(layer, x, y, color, { count, spread, delay });
    return;
  }
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span');
    spark.className = 'spark';
    const size = Math.random() < 0.3 ? 6 : 4;
    const tint = Math.random() < 0.3 ? '#ffffff' : color;
    Object.assign(spark.style, { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px`, background: tint, color: tint });
    layer.append(spark);
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.7;
    const distance = spread * (0.55 + Math.random() * 0.6);
    // Искра горит почти весь полёт и гаснет в самом конце
    const animation = spark.animate(
      [
        { transform: 'translate(-50%, -50%)', opacity: 1 },
        { opacity: 1, offset: 0.65 },
        { transform: `translate(${Math.cos(angle) * distance - size / 2}px, ${Math.sin(angle) * distance - size / 2}px)`, opacity: 0 },
      ],
      { duration: 850 + Math.random() * 350, delay, easing: EASE_OUT, fill: 'backwards' },
    );
    animation.onfinish = () => spark.remove();
    animation.oncancel = () => spark.remove();
  }
}

/** Огоньки «Сумрака»: круглые, со свечением; разлетаются недалеко и всплывают вверх, как искры над костром */
function motes(layer: HTMLElement, x: number, y: number, color: string, { count = 10, spread = 40, delay = 0 }) {
  for (let i = 0; i < count; i++) {
    const size = 2 + Math.random() * 3;
    const tint = Math.random() < 0.25 ? '#fff4dc' : color;
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.8;
    const distance = spread * (0.35 + Math.random() * 0.5);
    const rise = spread * (0.4 + Math.random() * 0.6);
    const dx = Math.cos(angle) * distance - size / 2;
    const dy = Math.sin(angle) * distance * 0.4 - rise - size / 2;
    fx(
      layer,
      'spark spark--noir',
      { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px`, background: tint, color: tint },
      [
        { transform: 'translate(-50%, -50%) scale(0.4)', opacity: 0 },
        { transform: `translate(${dx / 2}px, ${dy / 3}px) scale(1)`, opacity: 1, offset: 0.25 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.6)`, opacity: 0 },
      ],
      { duration: 1300 + Math.random() * 500, delay, easing: NOIR_EASE },
    );
  }
}

/** Элемент эффекта на слое: класс, стиль и анимация; по окончании убирается сам */
function fx(layer: HTMLElement, className: string, style: Partial<CSSStyleDeclaration>, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  const el = document.createElement('span');
  el.className = className;
  Object.assign(el.style, style);
  layer.append(el);
  const animation = el.animate(keyframes, { fill: 'backwards', ...options });
  animation.onfinish = () => el.remove();
  animation.oncancel = () => el.remove();
}

/** Язык движения «Сумрака»: мягко, без отскоков */
const NOIR_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';

/**
 * Заклинание сработало — в «Сумраке» свет возвращается: тёплое кольцо расходится от середины,
 * по сцене проходит полоса света, на миг всё теплеет.
 */
function noirMagic(layer: HTMLElement, width: number, height: number) {
  const size = Math.max(width, height) * 1.1;
  fx(layer, 'noir-bloom', {}, [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { duration: 1600, easing: NOIR_EASE });
  fx(
    layer,
    'noir-ring',
    { width: `${size}px`, height: `${size}px`, left: `${width / 2}px`, top: `${height / 2}px` },
    [
      { transform: 'translate(-50%, -50%) scale(0.05)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(0.35)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
    ],
    { duration: 1400, easing: NOIR_EASE },
  );
  fx(layer, 'noir-sweep', {}, [{ transform: 'translateX(-60%)', opacity: 0 }, { opacity: 1, offset: 0.3 }, { transform: 'translateX(260%)', opacity: 0 }], {
    duration: 1300,
    delay: 150,
    easing: NOIR_EASE,
  });
}

/** Пшик в «Сумраке»: свет на миг гаснет, над промахом поднимается холодный дымок */
export function fizzle(layer: HTMLElement, points: { x: number; y: number }[]) {
  fx(layer, 'noir-dim', {}, [{ opacity: 0 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: 900, easing: NOIR_EASE });
  points.forEach(({ x, y }, k) => {
    for (let i = 0; i < 3; i++) {
      const size = 10 + Math.random() * 10;
      const dx = (Math.random() - 0.5) * 24 - size / 2;
      const dy = -24 - Math.random() * 18 - size / 2;
      fx(
        layer,
        'noir-smoke',
        { left: `${x}px`, top: `${y}px`, width: `${size}px`, height: `${size}px` },
        [
          { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
          { opacity: 0.7, offset: 0.3 },
          { transform: `translate(${dx}px, ${dy}px) scale(1.6)`, opacity: 0 },
        ],
        { duration: 1200 + Math.random() * 400, delay: k * 60 + i * 120, easing: NOIR_EASE },
      );
    }
  });
}

const CIRCLE = spriteDataUri(magicCircle(33, { o: '#f6c453', i: '#a78bfa', r: '#fde68a' }));

/** Заклинание сработало: магический круг раскрывается над сценой, вспышка гаснет. */
export function magic(layer: HTMLElement, width: number, height: number) {
  if (isNoir()) {
    noirMagic(layer, width, height);
    return;
  }
  const size = Math.min(width, height) * 0.9;
  const circle = document.createElement('img');
  circle.className = 'magic-circle';
  circle.src = CIRCLE;
  circle.alt = '';
  Object.assign(circle.style, { width: `${size}px`, height: `${size}px`, left: `${width / 2}px`, top: `${height / 2}px` });
  const flash = document.createElement('span');
  flash.className = 'magic-flash';
  layer.append(flash, circle);
  const spin = circle.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.3) rotate(0deg)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1) rotate(90deg)', opacity: 1, offset: 0.45 },
      { transform: 'translate(-50%, -50%) scale(1.15) rotate(150deg)', opacity: 0 },
    ],
    { duration: 1300, easing: 'ease-out' },
  );
  spin.onfinish = () => circle.remove();
  const fade = flash.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: 700, delay: 350, easing: 'ease-out', fill: 'backwards' });
  fade.onfinish = () => flash.remove();
}
