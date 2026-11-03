import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { parseDungeon, replay } from '../engine/dungeon';
import type { Direction, HeroReport } from '../engine/jsRun';
import type { Dungeon } from '../engine/types';
import { fullEffects } from '../game/settings';
import { spriteCssUrl } from '../pixel/pixelArt';
import {
  DUNGEON_BUG,
  DUNGEON_EXIT,
  DUNGEON_FLOOR,
  DUNGEON_FLOOR_CRACK,
  DUNGEON_FLOOR_MOSS,
  DUNGEON_TORCH_FRAMES,
  DUNGEON_WALL,
  GEMS,
  HERO_ANIMATIONS,
  type HeroAnimation,
} from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { SpriteAnim } from './SpriteAnim';

const TILES = {
  '--wall': spriteCssUrl(DUNGEON_WALL),
  '--floor': spriteCssUrl(DUNGEON_FLOOR),
  '--floor-crack': spriteCssUrl(DUNGEON_FLOOR_CRACK),
  '--floor-moss': spriteCssUrl(DUNGEON_FLOOR_MOSS),
};

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

/** «Случайное» число 0–99 для клетки: одна и та же карта всегда украшена одинаково. */
function noise(x: number, y: number, salt: number): number {
  let h = Math.imul(x + 1, 374761393) ^ Math.imul(y + 1, 668265263) ^ Math.imul(salt, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) % 100;
}

interface Decor {
  /** Стены с факелом: под ними проход */
  torches: Set<string>;
  /** Клетки под факелом, на которые падает свет */
  lit: Set<string>;
  /** Плиты пола с трещиной или мхом */
  floors: Map<string, 'crack' | 'moss'>;
}

/**
 * Убранство подземелья: факелы на стенах над проходом (не теснее чем через две клетки)
 * и редкие плиты с трещиной или мхом. Только картинка — на путь героя не влияет.
 */
function decorate(cells: string[][]): Decor {
  const torches = new Set<string>();
  const lit = new Set<string>();
  const floors = new Map<string, 'crack' | 'moss'>();
  const spots: [number, number][] = [];
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      const below = cells[y + 1]?.[x];
      if (cell === '#' && below !== undefined && below !== '#') spots.push([x, y]);
    }),
  );
  const placed: [number, number][] = [];
  for (const [x, y] of spots) {
    if (noise(x, y, 1) % 3) continue;
    if (placed.some(([px, py]) => Math.abs(px - x) <= 2 && Math.abs(py - y) <= 1)) continue;
    placed.push([x, y]);
  }
  // Хотя бы один факел на карту, если есть куда повесить
  if (!placed.length && spots.length) placed.push(spots[Math.floor(spots.length / 2)]);
  for (const [x, y] of placed) {
    torches.add(`${x},${y}`);
    lit.add(`${x},${y + 1}`);
  }
  cells.forEach((row, y) =>
    row.forEach((cell, x) => {
      if (cell !== '.') return;
      const n = noise(x, y, 2);
      if (n < 12) floors.set(`${x},${y}`, 'crack');
      else if (n < 20) floors.set(`${x},${y}`, 'moss');
    }),
  );
  return { torches, lit, floors };
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
  // Убранство считается по исходной карте: подобранный кристалл не открывает под собой трещину
  const decor = useMemo(() => decorate(start.cells), [start]);
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
            const key = `${x},${y}`;
            const trail = kind !== 'wall' && state.trail.has(key);
            const floor = kind === 'floor' ? decor.floors.get(key) : undefined;
            const classes = [
              'dungeon__cell',
              `dungeon__cell--${kind}`,
              floor && `dungeon__cell--${floor}`,
              decor.lit.has(key) && 'dungeon__cell--lit',
              trail && 'dungeon__cell--trail',
            ];
            return (
              <span key={key} className={classes.filter(Boolean).join(' ')}>
                {decor.torches.has(key) && <SpriteAnim frames={DUNGEON_TORCH_FRAMES} fps={6} fluid className="dungeon__torch" />}
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
