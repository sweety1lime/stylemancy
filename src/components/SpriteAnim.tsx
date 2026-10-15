import type { Sprite } from '../pixel/pixelArt';
import { sheetAnimation, spriteSheet } from '../pixel/sheet';

interface SpriteAnimProps {
  frames: Sprite[];
  /** Кадров в секунду */
  fps?: number;
  /** Сколько раз проиграть; без него — по кругу */
  repeat?: number;
  scale?: number;
  className?: string;
  onEnd?: () => void;
}

/** Покадровая анимация: лента кадров едет в окошке размером с один кадр. */
export function SpriteAnim({ frames, fps = 8, repeat, scale = 3, className, onEnd }: SpriteAnimProps) {
  const sheet = spriteSheet(frames);
  return (
    <span
      className={className ? `sprite-anim ${className}` : 'sprite-anim'}
      style={{ width: sheet.width * scale, height: sheet.height * scale }}
      aria-hidden="true"
    >
      <img
        src={sheet.uri}
        alt=""
        width={sheet.width * scale * sheet.count}
        height={sheet.height * scale}
        style={{ animation: sheetAnimation(sheet, fps, repeat) }}
        onAnimationEnd={onEnd}
      />
    </span>
  );
}
