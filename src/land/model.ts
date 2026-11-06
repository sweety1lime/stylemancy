/*
  «Моя земля»: страница из HTML и CSS, которую игрок строит сам. Здесь — что такое земля и какого она размера.
  Безопасность страницы — в sanitize.ts, ссылки — в share.ts, хранение — в lands.ts.
*/

export const MAX_LANDS = 3;

/**
 * Размеры в знаках. Земля маленькая нарочно: она живёт в одном документе со статистикой (на сервере он не больше 64 КБ)
 * и целиком помещается в ссылку, которую можно отправить в мессенджере.
 */
export const LAND_LIMITS = { html: 3000, css: 3000, title: 40, nick: 24 } as const;

export interface Land {
  /** Номер ячейки: 0, 1 или 2 */
  slot: number;
  title: string;
  html: string;
  css: string;
  /** Ставить ли ник игрока в ссылку: по умолчанию нет */
  signed: boolean;
  /** Когда земля сохранена в последний раз (ISO). По нему сливаются версии с разных компьютеров */
  savedAt: string;
  /**
   * Чужая земля, которую игрок взял за основу, в том виде, в каком взял. Пока своего в земле почти нет, задания на ней не
   * засчитываются, как и на заготовке. Когда игрок поменял достаточно, поле убирается (lands.ts), чтобы не занимать место
   */
  base?: LandSource;
  /** Земля удалена. Запись остаётся, чтобы удаление дошло до других компьютеров, а не воскресило землю при слиянии */
  gone?: true;
}

/** Код земли: то, что игрок пишет */
export interface LandSource {
  html: string;
  css: string;
}

export function emptyLand(slot: number, now: string = new Date().toISOString()): Land {
  return { slot, title: 'Моя земля', html: '', css: '', signed: false, savedAt: now };
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function cleanBase(value: unknown): LandSource | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const raw = value as Record<string, unknown>;
  if (typeof raw.html !== 'string' || typeof raw.css !== 'string') return undefined;
  return { html: raw.html.slice(0, LAND_LIMITS.html), css: raw.css.slice(0, LAND_LIMITS.css) };
}

/** Земля из недоверенного места (сервер, чужой браузер): типы и размеры проверяются, лишнее отбрасывается */
export function cleanLand(value: unknown): Land | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const slot = raw.slot;
  if (typeof slot !== 'number' || !Number.isInteger(slot) || slot < 0 || slot >= MAX_LANDS) return null;
  const land: Land = {
    slot,
    title: text(raw.title, LAND_LIMITS.title),
    html: text(raw.html, LAND_LIMITS.html),
    css: text(raw.css, LAND_LIMITS.css),
    signed: raw.signed === true,
    savedAt: text(raw.savedAt, 40),
  };
  if (raw.gone === true) return { ...land, html: '', css: '', title: '', gone: true };
  const base = cleanBase(raw.base);
  return base ? { ...land, base } : land;
}

/** Список земель из недоверенного места: по одной на ячейку, по порядку ячеек */
export function cleanLands(value: unknown): Land[] {
  if (!Array.isArray(value)) return [];
  const bySlot = new Map<number, Land>();
  for (const item of value) {
    const land = cleanLand(item);
    if (land && !bySlot.has(land.slot)) bySlot.set(land.slot, land);
  }
  return [...bySlot.values()].sort((a, b) => a.slot - b.slot);
}

/** Объединение двух версий: в каждой ячейке побеждает та, что сохранена позже (удаление тоже сохранение) */
export function mergeLands(a: unknown, b: unknown): Land[] {
  const bySlot = new Map<number, Land>();
  for (const land of [...cleanLands(a), ...cleanLands(b)]) {
    const other = bySlot.get(land.slot);
    if (!other || land.savedAt > other.savedAt) bySlot.set(land.slot, land);
  }
  return [...bySlot.values()].sort((x, y) => x.slot - y.slot);
}

/** Живые земли: без удалённых */
export function aliveLands(lands: Land[]): Land[] {
  return lands.filter((land) => !land.gone);
}

/** Размер земли в знаках, как его видит игрок: сколько уже написано и не превышен ли предел */
export function landSize(land: Pick<Land, 'html' | 'css'>): { html: number; css: number; over: boolean } {
  const html = land.html.length;
  const css = land.css.length;
  return { html, css, over: html > LAND_LIMITS.html || css > LAND_LIMITS.css };
}
