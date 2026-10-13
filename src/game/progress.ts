import { useSyncExternalStore } from 'react';
import { read, write } from './storage';

export interface LevelProgress {
  completed: boolean;
  /** Лучший результат, 0–3 */
  stars: number;
  attempts: number;
  hintsUsed: number;
  completedAt?: string;
}

type ProgressMap = Record<string, LevelProgress>;

const PROGRESS_KEY = 'cascadia.progress.v1';
const DRAFTS_KEY = 'cascadia.drafts.v1';
const CURRENT_KEY = 'cascadia.current-level';
const EMPTY: LevelProgress = { completed: false, stars: 0, attempts: 0, hintsUsed: 0 };

let state = read<ProgressMap>(PROGRESS_KEY, {});
const listeners = new Set<() => void>();

function update(id: string, patch: Partial<LevelProgress>) {
  state = { ...state, [id]: { ...EMPTY, ...state[id], ...patch } };
  write(PROGRESS_KEY, state);
  listeners.forEach((listener) => listener());
}

/** Прогресс по уровням. Пока хранится в браузере; на этапе аккаунтов переедет в Supabase. */
export const progress = {
  get: (id: string): LevelProgress => state[id] ?? EMPTY,
  snapshot: (): ProgressMap => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  setHints: (id: string, hintsUsed: number) => update(id, { hintsUsed }),
  addAttempt: (id: string) => update(id, { attempts: progress.get(id).attempts + 1 }),
  complete(id: string, stars: number) {
    const previous = progress.get(id);
    update(id, {
      completed: true,
      stars: Math.max(previous.stars, stars),
      completedAt: previous.completedAt ?? new Date().toISOString(),
    });
  },
};

export function useProgress(): ProgressMap {
  return useSyncExternalStore(progress.subscribe, progress.snapshot);
}

let draftMap = read<Record<string, string>>(DRAFTS_KEY, {});

/** Черновики кода: вернувшись к уровню, студент увидит то, что писал. */
export const drafts = {
  get: (id: string): string | undefined => draftMap[id],
  save(id: string, code: string) {
    draftMap = { ...draftMap, [id]: code };
    write(DRAFTS_KEY, draftMap);
  },
};

export const currentLevel = {
  get: (): string | null => read<string | null>(CURRENT_KEY, null),
  set: (id: string) => write(CURRENT_KEY, id),
};
