import { stats } from './stats';

/*
  «Слепая магия»: в JS-уровне с выводом Оракул молчит, пока студент не сотворит заклинание. Перед этим можно записать,
  что он скажет, и сверить с настоящим выводом. Угадал: код прочитан так же, как его читает Оракул, и приходит
  небольшой опыт (один раз за уровень, чтобы его нельзя было копить повторами).
*/

export const PREDICT_XP = 5;

/** Итог сравнения предсказания с тем, что сказал Оракул */
export interface Verdict {
  right: boolean;
  /** Что ждал студент и что вышло на самом деле: строки вывода через перенос */
  guess: string;
  got: string;
  /** Опыт, начисленный сейчас; 0 — награда за этот уровень уже была */
  award: number;
}

/** Строки для сравнения: без пробелов по краям и без пустых */
export function linesOf(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Совпал ли вывод: строки по порядку, пробелы по краям не в счёт */
export function sameOutput(guess: string, got: string): boolean {
  const expected = linesOf(got);
  const mine = linesOf(guess);
  return mine.length === expected.length && mine.every((line, i) => line === expected[i]);
}

/** Вердикт по предсказанию; верное первый раз на уровне приносит опыт */
export function judgePrediction(levelId: string, guess: string, got: string): Verdict {
  const right = sameOutput(guess, got);
  let award = 0;
  if (right && !stats.get().predictions.includes(levelId)) {
    stats.update((s) => ({ reviewXp: s.reviewXp + PREDICT_XP, predictions: [...s.predictions, levelId] }));
    award = PREDICT_XP;
  }
  return { right, guess: linesOf(guess).join('\n'), got: linesOf(got).join('\n'), award };
}
