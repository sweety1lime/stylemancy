import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { parseDungeon, replay } from '../engine/dungeon';
import type { Direction, HeroReport } from '../engine/jsRun';
import type { Dungeon } from '../engine/types';
import { fullEffects } from '../game/settings';
import { spriteCssUrl } from '../pixel/pixelArt';
import { DUNGEON_BUG, DUNGEON_EXIT, DUNGEON_FLOOR, DUNGEON_WALL, GEMS, HERO_ANIMATIONS, type HeroAnimation } from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { SpriteAnim } from './SpriteAnim';

const TILES = { '--wall': spriteCssUrl(DUNGEON_WALL), '--floor': spriteCssUrl(DUNGEON_FLOOR) };

const FACING: Record<Direction, string> = { '>': 'right', v: 'down', '<': 'left', '^': 'up' };

/** Сколько длится одно действие героя при показе пути, мс: длинный путь проигрывается быстрее */
function stepTime(count: number): number {
  return Math.max(40, Math.min(220, Math.round(4000 / Math.max(1, count))));
}

function cellKind(cell: string): string {
  if (cell === '#') return 'wall';
  if (/[1-9]/.test(cell)) return 'sign';
  return { g: 'gem', b: 'bug', E: 'exit' }[cell] ?? 'floor';
}

interface DungeonViewProps {
  dungeon: Dungeon;
  /** Путь героя; без него герой стоит у входа */
  report?: HeroReport;
  /** Герой дошёл, куда нужно: в конце пути он радуется */
  success?: boolean;
  /** Маленькая карта — для гримуара */
  compact?: boolean;
  /** Подпись под картой — появляется, когда герой закончил путь */
  caption?: ReactNode;
}

/**
 * Подземелье «Пути героя»: клетки карты и герой. Новый путь проигрывается по шагам — герой идёт,
 * поднимает кристаллы, прогоняет багов, а в конце радуется или растерянно оглядывается.
 * В лёгком режиме эффектов сразу виден итог.
 */
export function DungeonView({ dungeon, report, success = false, compact = false, caption }: DungeonViewProps) {
  const start = useMemo(() => parseDungeon(dungeon), [dungeon]);
  const events = useMemo(() => report?.events ?? [], [report]);
  const [shown, setShown] = useState(() => (fullEffects() ? 0 : events.length));
  // Новый путь — проигрываем заново. Состояние меняется во время отрисовки, без эффекта
  const [seen, setSeen] = useState(report);
  if (report !== seen) {
    setSeen(report);
    setShown(fullEffects() ? 0 : events.length);
  }
  const tick = stepTime(events.length);

  useEffect(() => {
    if (shown >= events.length) return;
    const timer = setTimeout(() => setShown((n) => n + 1), tick);
    return () => clearTimeout(timer);
  }, [shown, events.length, tick]);

  const state = useMemo(() => replay(start, events, shown), [start, events, shown]);
  const finished = shown >= events.length;
  const failure = finished ? report?.failure : undefined;
  const move: HeroAnimation = !finished ? 'walk' : failure ? 'oops' : report && success ? 'joy' : 'idle';
  const place = (x: number, y: number) => ({ '--x': x, '--y': y }) as CSSProperties;

  return (
    <>
      <div
        className={compact ? 'dungeon dungeon--compact' : 'dungeon'}
        style={{ ...TILES, '--w': start.width, '--h': start.height, '--step': `${tick}ms` } as CSSProperties}
        aria-hidden="true"
      >
        {state.cells.map((row, y) =>
          row.map((cell, x) => {
            const kind = cellKind(cell);
            const trail = kind !== 'wall' && state.trail.has(`${x},${y}`);
            return (
              <span key={`${x},${y}`} className={`dungeon__cell dungeon__cell--${kind}${trail ? ' dungeon__cell--trail' : ''}`}>
                {kind === 'gem' && <PixelArt sprite={GEMS.emerald.sprite} scale={2} />}
                {kind === 'bug' && <PixelArt sprite={DUNGEON_BUG} scale={3} />}
                {kind === 'exit' && <PixelArt sprite={DUNGEON_EXIT} scale={3} />}
                {kind === 'sign' && <span className="dungeon__sign">{cell}</span>}
              </span>
            );
          }),
        )}
        {failure && <span className="dungeon__bonk" style={place(failure.x, failure.y)} />}
        <span className={`dungeon__hero dungeon__hero--${FACING[state.hero.dir]}`} style={place(state.hero.x, state.hero.y)}>
          <SpriteAnim
            key={move}
            frames={HERO_ANIMATIONS[move]}
            fps={move === 'walk' ? 8 : move === 'idle' ? 2 : 6}
            repeat={move === 'joy' || move === 'oops' ? 2 : undefined}
            fluid
          />
        </span>
      </div>
      {finished && caption}
    </>
  );
}
