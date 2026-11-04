import { useEffect, useState } from 'react';
import { HERO_RIG } from './rig/heroRig';
import { Rig } from './rig/Rig';

/** Сколько длится движение, прежде чем смениться следующим, мс: у покоя конца нет */
const AFTER: Record<string, number> = { cast: 1100, joy: 2000, oops: 1600 };

/** Окно рисунка героя: вокруг фигуры место для поднятой руки, прыжка и вспышки */
const VIEW = { width: 160, height: 190, box: '-30 -40 160 190' };

/**
 * Герой «Сумрака» у кнопки «Сотворить»: на каждое заклинание взмахивает посохом,
 * потом радуется или растерянно хватается за шляпу и снова стоит спокойно.
 * cue — результат заклинания: на каждое «Сотворить» новый объект.
 */
export function HeroNoir({ cue, width = 84 }: { cue?: { kind: 'success' | 'fail' } | null; width?: number }) {
  const [move, setMove] = useState('idle');
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

  useEffect(() => {
    const delay = AFTER[move];
    if (!delay) return;
    const next = move === 'cast' ? (cue?.kind === 'success' ? 'joy' : 'oops') : 'idle';
    const timer = setTimeout(() => setMove(next), delay);
    return () => clearTimeout(timer);
  }, [move, run, cue]);

  return (
    <span className={`hero hero--${move} hero--noir noir-art`}>
      <Rig
        key={`${move}-${run}`}
        rig={HERO_RIG}
        kind="hero"
        move={move}
        rim="noir-rim"
        x={0}
        y={0}
        width={width}
        height={(width * VIEW.height) / VIEW.width}
        viewBox={VIEW.box}
      />
    </span>
  );
}
