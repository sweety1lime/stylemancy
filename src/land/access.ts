import type { Account } from '../game/auth';
import type { ProgressMap } from '../game/progress';
import { isLandDone } from '../game/story';
import { findLand } from '../levels';

/** Земля, которую нужно спасти, чтобы открылась «Моя земля»: тут игрок выучил теги и умеет писать страницу */
export const LAND_UNLOCK_ID = 'tags-valley';

/** Название этой земли для подсказки «что нужно сделать» */
export function unlockLandTitle(): string {
  return findLand(LAND_UNLOCK_ID)?.title ?? 'Долина Тегов';
}

/** Можно ли строить свои земли. Учителю открыто всё, как и везде в игре */
export function canBuildLands(account: Account | null, map: ProgressMap): boolean {
  if (account?.role === 'teacher') return true;
  const valley = findLand(LAND_UNLOCK_ID);
  return Boolean(valley && isLandDone(valley, map));
}
