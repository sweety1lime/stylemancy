import { useSyncExternalStore } from 'react';
import { onScopeChange, read, scopedKey, write } from './storage';

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

// Ключи хранят рабочее название проекта: не переименовывать — у всех сбросится прогресс
export const STATS_KEY = 'cascadia.stats.v1';
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

const load = (): Stats => ({ ...INITIAL, ...read<Partial<Stats>>(scopedKey(STATS_KEY), {}) });

let state: Stats = load();
const listeners = new Set<() => void>();
const changeListeners = new Set<() => void>();

onScopeChange(() => {
  state = load();
  listeners.forEach((listener) => listener());
});

/** Объединение двух версий: достижения и просмотры складываются, счётчики берутся наибольшие. */
export function mergeStats(a: Partial<Stats>, b: Partial<Stats>): Stats {
  const x = { ...INITIAL, ...a };
  const y = { ...INITIAL, ...b };
  const achievements = { ...y.achievements, ...x.achievements };
  for (const [id, date] of Object.entries(y.achievements)) {
    if (x.achievements[id] && date < x.achievements[id]) achievements[id] = date;
  }
  const reviews = { ...y.reviews };
  for (const [spell, review] of Object.entries(x.reviews)) {
    const other = reviews[spell];
    reviews[spell] = other
      ? { correct: Math.max(review.correct, other.correct), lastAt: Math.max(review.lastAt, other.lastAt) }
      : review;
  }
  return {
    achievements,
    streak: Math.max(x.streak, y.streak),
    keyboardCasts: Math.max(x.keyboardCasts, y.keyboardCasts),
    reviewXp: Math.max(x.reviewXp, y.reviewXp),
    reviewsCorrect: Math.max(x.reviewsCorrect, y.reviewsCorrect),
    reviews,
    completions: Math.max(x.completions, y.completions),
    lastReviewAt: Math.max(x.lastReviewAt, y.lastReviewAt),
    experiments: [...new Set([...x.experiments, ...y.experiments])],
    seen: { ...y.seen, ...x.seen },
  };
}

export const stats = {
  get: (): Stats => state,
  update(change: (current: Stats) => Partial<Stats>) {
    state = { ...state, ...change(state) };
    write(scopedKey(STATS_KEY), state);
    listeners.forEach((listener) => listener());
    changeListeners.forEach((listener) => listener());
  },
  /** Заменить целиком (после слияния с сервером) — без повторной отправки */
  replace(next: Stats) {
    state = next;
    write(scopedKey(STATS_KEY), state);
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Статистика изменилась — для отправки на сервер */
  onChange(listener: () => void) {
    changeListeners.add(listener);
    return () => {
      changeListeners.delete(listener);
    };
  },
};

export function useStats(): Stats {
  return useSyncExternalStore(stats.subscribe, stats.get);
}
