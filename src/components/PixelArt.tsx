import type { CSSProperties } from 'react';
import { spriteDataUri, type Sprite } from '../pixel/pixelArt';

const uris = new WeakMap<Sprite, string>();

function uriFor(sprite: Sprite): string {
  let uri = uris.get(sprite);
  if (!uri) {
    uri = spriteDataUri(sprite);
    uris.set(sprite, uri);
  }
  return uri;
}

interface PixelArtProps {
  sprite: Sprite;
  /** Во сколько раз увеличить: 1 пиксель спрайта = scale пикселей экрана */
  scale?: number;
  alt?: string;
  className?: string;
}

export function PixelArt({ sprite, scale = 4, alt = '', className }: PixelArtProps) {
  const pixels = Math.max(...sprite.rows.map((row) => row.length));
  return (
    <img
      className={className ? `pixel-art ${className}` : 'pixel-art'}
      src={uriFor(sprite)}
      width={pixels * scale}
      height={sprite.rows.length * scale}
      // Ширина рисунка: по ней CSS и сценки округляют размер до целого масштаба
      style={{ '--pw': `${pixels}px` } as CSSProperties}
      alt={alt}
      draggable={false}
    />
  );
}
