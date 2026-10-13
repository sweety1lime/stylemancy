import { useSyncExternalStore } from 'react';
import { read, write } from './storage';

/** Всё, что считается помимо прохождения уровней: достижения, счётчики, повторение, просмотренные сценки. */
export interface Stats {
  /** id достижения → когда получено */
  achievements: Record<string, string>;
  /** Уровней подряд без подсказок */
  streak: number;
  keyboardCasts: number;
  /** Опыт за вопросы на повторение */
  reviewXp: number;
  reviewsCorrect: number;
  /** Заклинание → сколько раз ответили верно и когда спрашивали (по счётчику completions) */
  reviews: Record<string, { correct: number; lastAt: number }>;
  /** Сколько уровней пройдено впервые — «часы» для повторения */
  completions: number;
  /** Значение completions, когда был последний вопрос на повторение */
  lastReviewAt: number;
  /** Заклинания, с живыми примерами которых играли в гримуаре */
  experiments: string[];
  /** Просмотренные сценки: 'intro:floating-islands' */
  seen: Record<string, boolean>;
}

const KEY = 'cascadia.stats.v1';
const INITIAL: Stats = {
  achievements: {},
  streak: 0,
  keyboardCasts: 0,
  reviewXp: 0,
  reviewsCorrect: 0,
  reviews: {},
  completions: 0,
  lastReviewAt: 0,
  experiments: [],
  seen: {},
};

let state: Stats = { ...INITIAL, ...read<Partial<Stats>>(KEY, {}) };
const listeners = new Set<() => void>();

export const stats = {
  get: (): Stats => state,
  update(change: (current: Stats) => Partial<Stats>) {
    state = { ...state, ...change(state) };
    write(KEY, state);
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useStats(): Stats {
  return useSyncExternalStore(stats.subscribe, stats.get);
}
