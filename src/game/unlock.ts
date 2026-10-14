import type { Level, Region } from '../engine/types';
import type { Land } from '../levels';
import type { Account } from './auth';
import type { ProgressMap } from './progress';

/** Уровень, который открывает следующий район, — последний в районе (обычно испытание). */
export function gateLevel(region: Region): Level {
  return region.levels[region.levels.length - 1];
}

/**
 * Дошёл ли студент до района. Первый район открыт сразу, следующий — когда пройдено
 * испытание предыдущего. Внутри района уровни можно проходить в любом порядке.
 * Район, в котором уже есть попытки, не закрывается.
 */
export function isRegionReached(land: Land, index: number, progress: ProgressMap): boolean {
  if (index <= 0) return true;
  const gate = gateLevel(land.regions[index - 1]);
  return Boolean(progress[gate.id]?.completed) || land.regions[index].levels.some((level) => progress[level.id]?.attempts);
}

/** Учителю открыто всё: ему нужно видеть уровни целиком. */
export function isRegionOpen(account: Account | null, land: Land, index: number, progress: ProgressMap): boolean {
  return account?.role === 'teacher' || isRegionReached(land, index, progress);
}
