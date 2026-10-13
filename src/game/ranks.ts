import type { LevelProgress } from './progress';

export interface Rank {
  title: string;
  /** Сколько XP нужно для ранга */
  xp: number;
}

/** Ранги за опыт. Слова без грамматического рода — подходят всем. */
export const RANKS: Rank[] = [
  { title: 'Искра', xp: 0 },
  { title: 'Звезда', xp: 150 },
  { title: 'Созвездие', xp: 500 },
  { title: 'Сверхновая', xp: 1200 },
];

/** Опыт за уровень: 10 за прохождение и по 5 за каждую звезду (максимум 25). */
export function levelXp(progress: LevelProgress | undefined): number {
  return progress?.completed ? 10 + 5 * progress.stars : 0;
}

export function totalXp(progress: Record<string, LevelProgress>): number {
  return Object.values(progress).reduce((sum, item) => sum + levelXp(item), 0);
}

export interface RankState {
  rank: Rank;
  next?: Rank;
  /** Доля пути до следующего ранга, 0–1 */
  share: number;
}

export function rankFor(xp: number): RankState {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (xp >= rank.xp) index = i;
  });
  const rank = RANKS[index];
  const next = RANKS[index + 1];
  return { rank, next, share: next ? (xp - rank.xp) / (next.xp - rank.xp) : 1 };
}
