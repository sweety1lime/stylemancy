import { useState, type CSSProperties } from 'react';
import { faceOf } from '../pixel/faces';
import { PORTRAITS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

/**
 * Живое лицо персонажа: поверх портрета лежат кадры «моргнул» и «открыл рот».
 * Моргание и речь — CSS-анимации; talking — пока печатается текст реплики.
 */
export function Face({ id, scale = 4, talking = false, className }: { id: string; scale?: number; talking?: boolean; className?: string }) {
  const face = faceOf(id);
  // Каждый персонаж моргает в своём ритме
  const [delay] = useState(() => `${(-Math.random() * 4).toFixed(2)}s`);
  return (
    <span className={['face', talking && 'face--talking', className].filter(Boolean).join(' ')} style={{ '--blink-delay': delay } as CSSProperties}>
      <PixelArt sprite={PORTRAITS[id] ?? PORTRAITS.flex} scale={scale} />
      {face.blink && <PixelArt className="face__blink" sprite={face.blink} scale={scale} />}
      {face.talk && <PixelArt className="face__talk" sprite={face.talk} scale={scale} />}
    </span>
  );
}

/** Пиксельный портрет персонажа в рамке. */
export function Portrait({ id, scale = 4, talking = false }: { id: string; scale?: number; talking?: boolean }) {
  return (
    <span className="portrait">
      <Face id={id} scale={scale} talking={talking} />
    </span>
  );
}
