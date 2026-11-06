import { useState } from 'react';
import type { HeroAnimation } from '../pixel/sprites';
import { HeroNoir } from '../noir/HeroNoir';
import { useNoir } from '../noir/look';
import { SpriteAnim } from './SpriteAnim';
import { useHeroFrames } from './useHeroFrames';

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
 * и подпрыгивает от радости или растерянно оглядывается. В «Сумраке» — силуэт на шарнирах.
 */
export function Hero({ cue, scale = 3 }: { cue?: HeroCue | null; scale?: number }) {
  return useNoir() ? <HeroNoir cue={cue} /> : <PixelHero cue={cue} scale={scale} />;
}

function PixelHero({ cue, scale }: { cue?: HeroCue | null; scale: number }) {
  const frames = useHeroFrames();
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
        frames={frames[move]}
        fps={fps}
        repeat={repeat}
        scale={scale}
        onEnd={repeat ? finish : undefined}
      />
    </span>
  );
}
