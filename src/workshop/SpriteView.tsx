import { PixelArt } from '../components/PixelArt';
import { SpriteAnim } from '../components/SpriteAnim';
import type { Sprite } from '../pixel/pixelArt';

/** Спрайт или анимация; still — все кадры рядом, без движения. */
export function SpriteView({ frames, scale, fps = 6, still = false }: { frames: Sprite[]; scale: number; fps?: number; still?: boolean }) {
  if (frames.length === 1 || still) {
    return (
      <span className="ws-frames">
        {frames.map((frame, i) => (
          <PixelArt key={i} sprite={frame} scale={scale} />
        ))}
      </span>
    );
  }
  return <SpriteAnim frames={frames} fps={fps} scale={scale} />;
}
