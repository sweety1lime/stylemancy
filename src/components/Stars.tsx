import { STAR_OFF, STAR_ON } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

export function Stars({ count, max = 3, scale = 3 }: { count: number; max?: number; scale?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${count} из ${max} звёзд`}>
      {Array.from({ length: max }, (_, i) => (
        <PixelArt key={i} sprite={i < count ? STAR_ON : STAR_OFF} scale={scale} />
      ))}
    </span>
  );
}
