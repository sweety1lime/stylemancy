import { useMemo } from 'react';
import { notesStore } from '../game/notes';
import { stats, useStats } from '../game/stats';
import { aliveLands, cleanLands, LAND_LIMITS, MAX_LANDS, type Land, type LandSource } from './model';
import { changeFrom, MIN_CHANGE } from './templates';

/*
  Хранение «Моих земель». Земли лежат в статистике аккаунта и ходят за ним на другие компьютеры тем же путём,
  что достижения и заметки (game/sync.ts). У гостя они только в браузере. Учитель видит земли своих студентов
  без новых таблиц: статистику студента он и так читает.
*/

/**
 * Сколько байт отведено на весь документ аккаунта (статистика, заметки гримуара и земли). На сервере предел 64 КБ
 * (колонка data в student_stats), часть оставляем про запас: база считает размер по-своему, чуть больше обычного текста.
 */
export const ACCOUNT_BUDGET = 56 * 1024;

/** Живые земли игрока по порядку ячеек. Удалённые не в счёт */
export function useLands(): Land[] {
  const { lands } = useStats();
  return useMemo(() => aliveLands(cleanLands(lands)), [lands]);
}

export function getLands(): Land[] {
  return aliveLands(cleanLands(stats.get().lands));
}

export type SaveResult = { ok: true; land: Land } | { ok: false; reason: 'slot' | 'long' | 'space' };

/** Сколько байт займёт документ аккаунта с такими землями */
function accountBytes(lands: Land[]): number {
  const document = { stats: { ...stats.get(), lands }, notes: notesStore.get() };
  return new TextEncoder().encode(JSON.stringify(document)).length;
}

function withSlot(lands: Land[], land: Land): Land[] {
  return [...cleanLands(lands).filter((item) => item.slot !== land.slot), land].sort((a, b) => a.slot - b.slot);
}

/**
 * Сохранить землю в ячейку. Отказ, если земля длиннее предела или в документе аккаунта не осталось места.
 * base — чужая земля, взятая за основу: её помнит только что взятая земля. Правка обычной записи основу не теряет,
 * пока своего в земле меньше MIN_CHANGE знаков; дальше земля считается своей, и основа не нужна.
 */
export function saveLand(draft: Pick<Land, 'slot' | 'title' | 'html' | 'css' | 'signed'> & { base?: LandSource }): SaveResult {
  if (!Number.isInteger(draft.slot) || draft.slot < 0 || draft.slot >= MAX_LANDS) return { ok: false, reason: 'slot' };
  if (draft.html.length > LAND_LIMITS.html || draft.css.length > LAND_LIMITS.css) return { ok: false, reason: 'long' };
  const kept = draft.base ?? getLands().find((item) => item.slot === draft.slot)?.base;
  const land: Land = {
    slot: draft.slot,
    title: draft.title.slice(0, LAND_LIMITS.title),
    html: draft.html,
    css: draft.css,
    signed: draft.signed,
    savedAt: new Date().toISOString(),
    ...(kept && changeFrom(kept, draft) < MIN_CHANGE ? { base: kept } : {}),
  };
  const lands = withSlot(stats.get().lands, land);
  if (accountBytes(lands) > ACCOUNT_BUDGET) return { ok: false, reason: 'space' };
  stats.update(() => ({ lands }));
  return { ok: true, land };
}

/** Удалить землю из ячейки. Запись остаётся «надгробием», чтобы удаление дошло и до других компьютеров */
export function deleteLand(slot: number): void {
  if (!getLands().some((land) => land.slot === slot)) return;
  const gone: Land = { slot, title: '', html: '', css: '', signed: false, savedAt: new Date().toISOString(), gone: true };
  stats.update((current) => ({ lands: withSlot(current.lands, gone) }));
}
