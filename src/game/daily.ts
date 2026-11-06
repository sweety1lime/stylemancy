import { learnedSpells, QUESTIONS, type ReviewQuestion } from './review';
import type { ProgressMap } from './progress';
import { stats, type DailyState } from './stats';

/*
  «Свиток дня»: каждый день три вопроса из того, что герой уже выучил. Дочитал свиток до конца — серия дней растёт,
  и огонёк разгорается. Пропустил день — серия начинается заново. Серия личная, без рейтинга: в классе соревнований нет.
  Вопросы дня выбираются по дате и запоминаются при первом открытии, поэтому не меняются, даже если за день выучить ещё заклинания.
*/

/** Сколько вопросов в свитке и сколько опыта за дочитанный свиток (верные ответы дают свои 5 XP) */
export const DAILY_COUNT = 3;
export const DAILY_XP = 10;

/** День по часам этого компьютера: '2026-11-06' */
export function dayKey(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Предыдущий день: считаем по календарю, а не вычитанием 24 часов, чтобы не споткнуться о переход на летнее время */
export function previousDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  return dayKey(new Date(year, month - 1, date - 1));
}

/** Серия сейчас: идёт, если свиток дочитан сегодня или вчера (сегодняшний ещё можно успеть), иначе оборвалась */
export function activeStreak(daily: DailyState, today: string): number {
  return daily.last === today || daily.last === previousDay(today) ? daily.streak : 0;
}

/** Хеш строки: одинаковый у всех для одного дня, чтобы вопросы дня не зависели от случая */
function hash(text: string): number {
  let h = 2166136261;
  for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  return h;
}

/**
 * Вопросы дня: по одному на заклинание, чтобы свиток не спрашивал одно и то же трижды;
 * если выученных заклинаний мало, добираем другими вопросами к ним.
 */
export function pickDaily(day: string, learned: string[]): ReviewQuestion[] {
  const pool = QUESTIONS.filter((question) => learned.includes(question.spell));
  const bySpell = new Map<string, ReviewQuestion[]>();
  for (const question of pool) bySpell.set(question.spell, [...(bySpell.get(question.spell) ?? []), question]);
  const first = [...bySpell.entries()]
    .sort(([a], [b]) => hash(day + a) - hash(day + b))
    .slice(0, DAILY_COUNT)
    .map(([spell, list]) => list[hash(day + spell) % list.length]);
  const rest = pool.filter((question) => !first.includes(question)).sort((a, b) => hash(day + a.id) - hash(day + b.id));
  return [...first, ...rest].slice(0, DAILY_COUNT);
}

/** Вопросы сегодняшнего свитка: уже выбранные, а если свиток ещё не открывали, то те, что выберутся при открытии */
export function dailyQuestions(daily: DailyState, today: string, progress: ProgressMap): ReviewQuestion[] {
  if (daily.day === today && daily.picks.length) {
    return daily.picks.map((id) => QUESTIONS.find((question) => question.id === id)).filter((question): question is ReviewQuestion => Boolean(question));
  }
  return pickDaily(today, learnedSpells(progress));
}

/** Развернуть сегодняшний свиток: выбрать и запомнить вопросы */
export function startDaily(today: string, progress: ProgressMap): void {
  stats.update((s) => {
    if (s.daily.day === today && s.daily.picks.length) return {};
    const picks = pickDaily(today, learnedSpells(progress)).map((question) => question.id);
    return { daily: { ...s.daily, day: today, picks, answered: 0 } };
  });
}

/** Вопрос отвечен; на последнем свиток дочитан: серия растёт, опыт начисляется */
export function answerDaily(today: string): void {
  stats.update((s) => {
    const d = s.daily;
    if (d.day !== today || d.last === today) return {};
    const answered = d.answered + 1;
    if (answered < d.picks.length) return { daily: { ...d, answered } };
    const streak = d.last === previousDay(today) ? d.streak + 1 : 1;
    return {
      reviewXp: s.reviewXp + DAILY_XP,
      daily: { ...d, answered, last: today, streak, best: Math.max(d.best, streak) },
    };
  });
}
