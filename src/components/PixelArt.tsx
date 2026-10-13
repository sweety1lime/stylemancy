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
  const width = Math.max(...sprite.rows.map((row) => row.length)) * scale;
  const height = sprite.rows.length * scale;
  return (
    <img
      className={className ? `pixel-art ${className}` : 'pixel-art'}
      src={uriFor(sprite)}
      width={width}
      height={height}
      alt={alt}
      draggable={false}
    />
  );
}
