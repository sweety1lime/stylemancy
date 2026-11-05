/*
  Маршрут героя по тропе карты в «Сумраке»: от земли, где он стоял, до земли, где встанет, через центры земель по порядку тропы.
  План считает planWalk, рисуют его NoirTrail (световой след) и NoirWalker (сам герой) в NoirWalker.tsx.
*/

/** Маршрут героя в px карты; точки — левый верхний угол ходока */
export interface WalkPlan {
  points: [number, number][];
  /** Центры земель по пути в долях карты (то же, что тропа в WorldMap): по ним ложится световой след */
  trail: [number, number][];
  /** Сколько идёт и когда начинает (мс) */
  duration: number;
  delay: number;
  /** Дошёл: показать настоящего героя и запомнить место */
  done: () => void;
}

/** Идущий путь: over — герой уже дошёл, но световой след ещё гаснет */
export type Journey = WalkPlan & { over: boolean };

export const dist = (a: [number, number], b: [number, number]) => Math.hypot(b[0] - a[0], b[1] - a[1]);

/**
 * Маршрут от земли was до земли to. order — остановки тропы по порядку, path — их центры в долях карты (индексы совпадают).
 * null, если идти не нужно или нельзя: движение выключено, окно узкое (там тропа скрыта) или путь короткий.
 */
export function planWalk(map: HTMLElement, hero: HTMLElement, order: string[], path: [number, number][], was: string, to: string): Omit<WalkPlan, 'done'> | null {
  // В автотестах браузер рисует без видеокарты, как и в router.ts
  if (navigator.webdriver || matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(min-width: 761px)').matches) return null;
  const a = order.indexOf(was);
  const b = order.indexOf(to);
  if (a < 0 || b < 0 || a === b) return null;
  const base = map.getBoundingClientRect();
  const end = hero.getBoundingClientRect();
  const startArt = map.querySelector(`[data-land="${was}"] .land__art`)?.getBoundingClientRect();
  const endArt = map.querySelector(`[data-land="${to}"] .land__art`)?.getBoundingClientRect();
  if (!startArt || !endArt) return null;

  // У каждой земли герой стоит на одном и том же месте относительно её рисунка
  const rest = (art: DOMRect): [number, number] => [art.left - endArt.left + end.left - base.left, art.top - endArt.top + end.top - base.top];
  // По тропе он идёт ногами по её линии
  const feet = ([x, y]: [number, number]): [number, number] => [(base.width * x) / 100 - end.width / 2, (base.height * y) / 100 - end.height];
  const step = a < b ? 1 : -1;
  const trail: [number, number][] = [];
  for (let i = a; i !== b + step; i += step) trail.push(path[i]);
  const points = [rest(startArt), ...trail.map(feet), rest(endArt)];

  const length = points.slice(1).reduce((sum, point, i) => sum + dist(points[i], point), 0);
  if (length < 60) return null;
  return { points, trail, duration: Math.min(2800, Math.max(900, length * 3.2)), delay: 600 };
}
