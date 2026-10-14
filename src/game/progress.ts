import { useSyncExternalStore } from 'react';
import { onScopeChange, read, scopedKey, write } from './storage';

export interface LevelProgress {
  completed: boolean;
  /** Лучший результат, 0–3 */
  stars: number;
  attempts: number;
  hintsUsed: number;
  completedAt?: string;
  /** Код лучшего прохождения — его видит учитель */
  bestCode?: string;
}

export type ProgressMap = Record<string, LevelProgress>;

// Ключи хранят рабочее название проекта: не переименовывать — у всех сбросится прогресс
export const PROGRESS_KEY = 'cascadia.progress.v1';
export const DRAFTS_KEY = 'cascadia.drafts.v1';
export const CURRENT_KEY = 'cascadia.current-level';
const EMPTY: LevelProgress = { completed: false, stars: 0, attempts: 0, hintsUsed: 0 };

let state = read<ProgressMap>(scopedKey(PROGRESS_KEY), {});
let draftMap = read<Record<string, string>>(scopedKey(DRAFTS_KEY), {});
const listeners = new Set<() => void>();
const levelListeners = new Set<(id: string) => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function update(id: string, patch: Partial<LevelProgress>) {
  state = { ...state, [id]: { ...EMPTY, ...state[id], ...patch } };
  write(scopedKey(PROGRESS_KEY), state);
  emit();
  levelListeners.forEach((listener) => listener(id));
}

// Вошёл другой студент или вышел — показываем его данные
onScopeChange(() => {
  state = read<ProgressMap>(scopedKey(PROGRESS_KEY), {});
  draftMap = read<Record<string, string>>(scopedKey(DRAFTS_KEY), {});
  emit();
});

/** Лучшее из двух версий прогресса одного уровня. */
function mergeLevel(a: LevelProgress | undefined, b: LevelProgress | undefined): LevelProgress {
  const x = { ...EMPTY, ...a };
  const y = { ...EMPTY, ...b };
  const better = x.stars >= y.stars ? x : y;
  const completedAt = [x.completedAt, y.completedAt].filter((date): date is string => Boolean(date)).sort()[0];
  return {
    completed: x.completed || y.completed,
    stars: Math.max(x.stars, y.stars),
    attempts: Math.max(x.attempts, y.attempts),
    hintsUsed: Math.max(x.hintsUsed, y.hintsUsed),
    ...(completedAt && { completedAt }),
    ...((better.bestCode ?? x.bestCode ?? y.bestCode) && { bestCode: better.bestCode ?? x.bestCode ?? y.bestCode }),
  };
}

function sameLevel(a: LevelProgress, b: LevelProgress | undefined): boolean {
  return JSON.stringify(a) === JSON.stringify(mergeLevel(b, undefined));
}

/** Прогресс по уровням текущего владельца (гостя или аккаунта). */
export const progress = {
  get: (id: string): LevelProgress => state[id] ?? EMPTY,
  snapshot: (): ProgressMap => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Какой уровень изменился — для отправки на сервер */
  onLevelChange(listener: (id: string) => void) {
    levelListeners.add(listener);
    return () => {
      levelListeners.delete(listener);
    };
  },
  setHints: (id: string, hintsUsed: number) => update(id, { hintsUsed }),
  addAttempt: (id: string) => update(id, { attempts: progress.get(id).attempts + 1 }),
  complete(id: string, stars: number, code?: string) {
    const previous = progress.get(id);
    update(id, {
      completed: true,
      stars: Math.max(previous.stars, stars),
      completedAt: previous.completedAt ?? new Date().toISOString(),
      bestCode: stars >= previous.stars ? (code ?? previous.bestCode) : previous.bestCode,
    });
  },
  /**
   * Слить с прогрессом с сервера: по каждому уровню берётся лучшее.
   * Возвращает уровни, где у нас лучше, чем на сервере, — их нужно отправить.
   */
  mergeRemote(remote: ProgressMap): string[] {
    const ids = new Set([...Object.keys(state), ...Object.keys(remote)]);
    const merged: ProgressMap = {};
    const toPush: string[] = [];
    ids.forEach((id) => {
      merged[id] = mergeLevel(state[id], remote[id]);
      if (!sameLevel(merged[id], remote[id])) toPush.push(id);
    });
    state = merged;
    write(scopedKey(PROGRESS_KEY), state);
    emit();
    return toPush;
  },
};

export function useProgress(): ProgressMap {
  return useSyncExternalStore(progress.subscribe, progress.snapshot);
}

/** Черновики кода: вернувшись к уровню, студент увидит то, что писал. */
export const drafts = {
  get: (id: string): string | undefined => draftMap[id],
  save(id: string, code: string) {
    draftMap = { ...draftMap, [id]: code };
    write(scopedKey(DRAFTS_KEY), draftMap);
  },
};

export const currentLevel = {
  get: (): string | null => read<string | null>(scopedKey(CURRENT_KEY), null),
  set: (id: string) => write(scopedKey(CURRENT_KEY), id),
};
