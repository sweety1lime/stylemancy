import { useState } from 'react';
import { HERO_ANIMATIONS, type HeroAnimation } from '../pixel/sprites';
import { SpriteAnim } from './SpriteAnim';

/** Как играется каждое движение героя: скорость и сколько раз */
const MOVES: Record<HeroAnimation, { fps: number; repeat?: number }> = {
  idle: { fps: 2 },
  walk: { fps: 8 },
  cast: { fps: 9, repeat: 1 },
  joy: { fps: 6, repeat: 2 },
  oops: { fps: 5, repeat: 2 },
};

/** Чем закончилось заклинание. На каждое «Сотворить» — новый объект */
export interface HeroCue {
  kind: 'success' | 'fail';
}

/**
 * Герой у кнопки «Сотворить»: дышит, а на каждое заклинание взмахивает посохом —
 * и подпрыгивает от радости или растерянно оглядывается.
 */
export function Hero({ cue, scale = 3 }: { cue?: HeroCue | null; scale?: number }) {
  const [move, setMove] = useState<HeroAnimation>('idle');
  const [seen, setSeen] = useState(cue);
  const [run, setRun] = useState(0);
  // Новое заклинание — сразу взмах. Состояние меняется во время отрисовки, без эффекта
  if (cue !== seen) {
    setSeen(cue);
    if (cue) {
      setMove('cast');
      setRun((n) => n + 1);
    }
  }

  function finish() {
    if (move === 'cast') setMove(cue?.kind === 'success' ? 'joy' : 'oops');
    else setMove('idle');
  }

  const { fps, repeat } = MOVES[move];
  return (
    <span className={`hero hero--${move}`}>
      <SpriteAnim
        key={`${move}-${run}`}
        frames={HERO_ANIMATIONS[move]}
        fps={fps}
        repeat={repeat}
        scale={scale}
        onEnd={repeat ? finish : undefined}
      />
    </span>
  );
}
