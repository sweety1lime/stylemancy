import { useState, type CSSProperties } from 'react';
import { faceOf, reactionsOf } from '../pixel/faces';
import { PORTRAITS } from '../pixel/sprites';
import type { HeroCue } from './Hero';
import { PixelArt } from './PixelArt';
import { SpriteAnim } from './SpriteAnim';

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

interface PortraitProps {
  id: string;
  scale?: number;
  talking?: boolean;
  /** Чем закончилось заклинание: наставник радуется успеху или задумывается над промахом */
  cue?: HeroCue | null;
}

/** Пиксельный портрет персонажа в рамке. С cue — ещё и реагирует на заклинания. */
export function Portrait({ id, scale = 4, talking = false, cue }: PortraitProps) {
  const [reaction, setReaction] = useState<'joy' | 'think' | null>(null);
  const [seen, setSeen] = useState(cue);
  const [run, setRun] = useState(0);
  // Новое заклинание — новая реакция. Состояние меняется во время отрисовки, без эффекта
  if (cue !== seen) {
    setSeen(cue);
    if (cue) {
      setReaction(cue.kind === 'success' ? 'joy' : 'think');
      setRun((n) => n + 1);
    }
  }
  const current = reaction ? reactionsOf(id)[reaction] : null;
  return (
    <span className={reaction ? `portrait portrait--${reaction}` : 'portrait'}>
      {current ? (
        <SpriteAnim
          key={run}
          frames={current.frames}
          fps={current.fps}
          repeat={current.repeat}
          scale={scale}
          onEnd={() => setReaction(null)}
        />
      ) : (
        <Face id={id} scale={scale} talking={talking} />
      )}
    </span>
  );
}
