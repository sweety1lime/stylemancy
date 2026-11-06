import { useStaffLight } from '../noir/staffLights';
import type { Sprite } from '../pixel/pixelArt';
import { heroAnimations, type HeroAnimation } from '../pixel/sprites';

/** Кадры пиксельного героя с камнем того цвета, который игрок выбрал для посоха */
export function useHeroFrames(): Record<HeroAnimation, Sprite[]> {
  return heroAnimations(useStaffLight().pixel);
}
