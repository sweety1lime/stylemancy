import type { AchievementCategory } from '../game/achievements';
import { MEDALS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

export function Medal({ category, locked, scale = 4 }: { category: AchievementCategory; locked?: boolean; scale?: number }) {
  return <PixelArt sprite={locked ? MEDALS.locked : MEDALS[category]} scale={scale} />;
}
