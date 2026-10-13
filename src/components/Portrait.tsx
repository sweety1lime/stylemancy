import { PORTRAITS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

/** Пиксельный портрет персонажа в рамке. */
export function Portrait({ id, scale = 4 }: { id: string; scale?: number }) {
  return (
    <span className="portrait">
      <PixelArt sprite={PORTRAITS[id] ?? PORTRAITS.flex} scale={scale} />
    </span>
  );
}
