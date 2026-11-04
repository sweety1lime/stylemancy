import type { AchievementCategory } from '../game/achievements';
import { MEDALS } from '../pixel/sprites';
import { NoirMedal } from '../noir/icons';
import { useNoir } from '../noir/look';
import { PixelArt } from './PixelArt';

export function Medal({ category, locked, scale = 4 }: { category: AchievementCategory; locked?: boolean; scale?: number }) {
  const noir = useNoir();
  if (noir) return <NoirMedal category={category} locked={locked} size={12 * scale} />;
  return <PixelArt sprite={locked ? MEDALS.locked : MEDALS[category]} scale={scale} />;
}
