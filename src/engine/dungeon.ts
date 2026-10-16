import type { Direction, HeroEvent } from './jsRun';
import type { Dungeon } from './types';

/*
  Подземелье «Пути героя» на стороне игры: разбор карты, проверка карт уровня и состояние
  после первых шагов героя — для анимации. Сам герой ходит в фоновом потоке (jsWorker.js).
*/

const HERO_MARKS: Record<string, Direction> = { '>': '>', v: 'v', '<': '<', '^': '^' };
/** Клетки, из которых складывается карта: стена, пол, кристалл, баг, выход и таблички с числами */
const KNOWN = /^[#.gbE1-9]$/;

export interface HeroPlace {
  x: number;
  y: number;
  dir: Direction;
}

export interface DungeonState {
  width: number;
  height: number;
  /** Клетки карты; там, где стоит герой, — пол */
  cells: string[][];
  hero: HeroPlace;
}

export function parseDungeon(dungeon: Dungeon): DungeonState {
  let hero: HeroPlace = { x: 0, y: 0, dir: '>' };
  const cells = dungeon.map.map((row, y) =>
    [...row].map((cell, x) => {
      if (!HERO_MARKS[cell]) return cell;
      hero = { x, y, dir: HERO_MARKS[cell] };
      return '.';
    }),
  );
  return { width: Math.max(...dungeon.map.map((row) => row.length)), height: dungeon.map.length, cells, hero };
}

export function countGems(cells: string[][]): number {
  return cells.reduce((sum, row) => sum + row.filter((cell) => cell === 'g').length, 0);
}

/** Сколько шагов от клетки до ближайшего выхода. Баги не мешают — их можно прогнать. */
export function distanceToExit(cells: string[][], x: number, y: number): number | undefined {
  const seen = new Set([`${x},${y}`]);
  let frontier = [[x, y]];
  for (let distance = 0; frontier.length; distance++) {
    const next: number[][] = [];
    for (const [cx, cy] of frontier) {
      if (cells[cy]?.[cx] === 'E') return distance;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const key = `${cx + dx},${cy + dy}`;
        const cell = cells[cy + dy]?.[cx + dx];
        if (cell === undefined || cell === '#' || seen.has(key)) continue;
        seen.add(key);
        next.push([cx + dx, cy + dy]);
      }
    }
    frontier = next;
  }
  return undefined;
}

/** Что не так с картой — для самопроверки уровней. */
export function dungeonProblems(dungeon: Dungeon): string[] {
  const problems: string[] = [];
  const name = dungeon.label ? `«${dungeon.label}»` : 'подземелья';
  if (new Set(dungeon.map.map((row) => row.length)).size > 1) problems.push(`Строки карты ${name} разной длины.`);
  const heroes = dungeon.map.join('').split('').filter((cell) => HERO_MARKS[cell]).length;
  if (heroes !== 1) problems.push(`На карте ${name} должен быть ровно один герой (> < ^ v), а их ${heroes}.`);
  const unknown = [...new Set(dungeon.map.join('').split('').filter((cell) => !HERO_MARKS[cell] && !KNOWN.test(cell)))];
  if (unknown.length) problems.push(`На карте ${name} непонятные клетки: ${unknown.join(' ')}.`);
  const { cells, hero } = parseDungeon(dungeon);
  if (!cells.some((row) => row.includes('E'))) problems.push(`На карте ${name} нет выхода E.`);
  else if (distanceToExit(cells, hero.x, hero.y) === undefined) problems.push(`На карте ${name} до выхода не дойти.`);
  return problems;
}

/** Подземелье после первых shown действий героя: где он, что он поднял и прогнал и где уже прошёл. */
export function replay(start: DungeonState, events: HeroEvent[], shown: number): { hero: HeroPlace; cells: string[][]; trail: Set<string> } {
  const cells = start.cells.map((row) => [...row]);
  let hero = start.hero;
  const trail = new Set([`${hero.x},${hero.y}`]);
  for (const event of events.slice(0, shown)) {
    hero = { x: event.x, y: event.y, dir: event.dir };
    trail.add(`${event.x},${event.y}`);
    if ((event.kind === 'take' || event.kind === 'zap') && event.cx !== undefined && event.cy !== undefined) cells[event.cy][event.cx] = '.';
  }
  return { hero, cells, trail };
}
