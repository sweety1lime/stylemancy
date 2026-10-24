import type { CSSProperties } from 'react';
import type { Sprite } from '../pixel/pixelArt';
import { sheetAnimation, spriteSheet } from '../pixel/sheet';

interface SpriteAnimProps {
  frames: Sprite[];
  /** Кадров в секунду */
  fps?: number;
  /** Сколько раз проиграть; без него — по кругу */
  repeat?: number;
  scale?: number;
  /** Размер задаёт CSS (например, в долях ширины кадра сценки), а кадр держит пропорции */
  fluid?: boolean;
  className?: string;
  onEnd?: () => void;
}

/** Покадровая анимация: лента кадров едет в окошке размером с один кадр. */
export function SpriteAnim({ frames, fps = 8, repeat, scale = 3, fluid = false, className, onEnd }: SpriteAnimProps) {
  const sheet = spriteSheet(frames);
  const animation = sheetAnimation(sheet, fps, repeat);
  return (
    <span
      className={className ? `sprite-anim ${className}` : 'sprite-anim'}
      style={
        fluid
          ? ({ aspectRatio: `${sheet.width} / ${sheet.height}`, '--pw': `${sheet.width}px` } as CSSProperties)
          : { width: sheet.width * scale, height: sheet.height * scale }
      }
      aria-hidden="true"
    >
      <img
        src={sheet.uri}
        alt=""
        width={fluid ? undefined : sheet.width * scale * sheet.count}
        height={fluid ? undefined : sheet.height * scale}
        style={fluid ? { width: `${sheet.count * 100}%`, height: '100%', animation } : { animation }}
        onAnimationEnd={onEnd}
      />
    </span>
  );
}
