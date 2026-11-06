import { IMAGE_LIBRARY } from '../levels/shared/images';
import { useNoir } from '../noir/look';
import { NOIR_IMAGE_LIBRARY } from '../noir/scenes/pages';
import type { LandImages } from './sanitize';

/*
  Картинки земли. Внешних адресов нет: страницу открывает другой человек, и ссылка на чужой файл была бы утечкой.
  Игрок пишет <img src="potion.png">, а страница получает рисунок из этой библиотеки. Рисунок зависит от вида игры
  («Сумрак» или пиксели), а имена и размеры одинаковые, так что земля, построенная в одном виде, целиком открывается в другом.
*/

export const PIXEL_LAND_IMAGES: LandImages = { ...IMAGE_LIBRARY };
export const NOIR_LAND_IMAGES: LandImages = { ...NOIR_IMAGE_LIBRARY };

/** Картинки для текущего вида игры */
export function useLandImages(): LandImages {
  return useNoir() ? NOIR_LAND_IMAGES : PIXEL_LAND_IMAGES;
}
