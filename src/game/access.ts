import { scriptLands, type Land } from '../levels';
import { isLandOpen, type Account } from './auth';
import type { ProgressMap } from './progress';
import { allLandsDone, isLandDone } from './story';

/**
 * Можно ли войти в землю. Каскадию открывает учитель. Скрипторию — учитель или общий финал,
 * что раньше: кто спас все земли Каскадии, идёт за Лордом Дефолтом сам, и земли Скриптории
 * открываются ему по очереди. Гостю и учителю открыто всё.
 */
export function canEnterLand(account: Account | null, land: Land, map: ProgressMap): boolean {
  if (isLandOpen(account, land.id)) return true;
  const index = scriptLands.indexOf(land);
  if (index === -1 || !allLandsDone(map)) return false;
  return index === 0 || isLandDone(scriptLands[index - 1], map);
}

/** Дверь <script> открыта: в Скриптории есть хоть одна земля, куда можно войти. */
export function isScriptoriaOpen(account: Account | null, map: ProgressMap): boolean {
  return scriptLands.some((land) => land.regions.length > 0 && canEnterLand(account, land, map));
}
