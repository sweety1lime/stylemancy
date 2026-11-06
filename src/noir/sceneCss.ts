import { FLOATING_SCENES } from './scenes/floating';
import { FOREST_SCENES } from './scenes/forest';
import { FORTRESS_LEVELS, FORTRESS_SCENES } from './scenes/fortress';
import { ISLANDS_SCENES } from './scenes/islands';
import { MARKET_SCENES } from './scenes/market';
import { MECHANISM_SCENES } from './scenes/mechanism';
import { PAGE_SCENES } from './scenes/pages';

/*
  «Сумрак» для сцен уровней. Подключается после оформления района и до кода студента,
  меняет только картинки и фоны: размеры и отступы предметов не трогает — по ним идёт проверка.
  Оформление районов — в scenes/: у каждой земли свой файл, общий набор — scenes/kit.ts.
*/

/** Оформление «Сумрака» по районам */
const SCENES: Record<string, string> = {
  ...ISLANDS_SCENES,
  ...FORTRESS_SCENES,
  ...FOREST_SCENES,
  ...FLOATING_SCENES,
  ...MARKET_SCENES,
  ...PAGE_SCENES,
  ...MECHANISM_SCENES,
};

/** Добавки для отдельных уровней: у них свои предметы и фон поверх оформления района */
const LEVELS: Record<string, string> = {
  ...FORTRESS_LEVELS,
};

/** Оформление «Сумрака» для сцены уровня; пустая строка — у района его пока нет */
export function noirSceneCss(regionId: string, levelId = ''): string {
  return (SCENES[regionId] ?? '') + (LEVELS[levelId] ?? '');
}
