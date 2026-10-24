import { regions } from '../levels';
import { stats } from './stats';

export type AchievementCategory = 'clean' | 'persistence' | 'explore' | 'secret';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  /** Пока не получено, название и условие скрыты */
  secret?: boolean;
}

export const CATEGORY_TITLES: Record<AchievementCategory, string> = {
  clean: 'Чистота',
  persistence: 'Упорство',
  explore: 'Исследование',
  secret: 'Секретные',
};

/** Названия — без слов о человеке, чтобы не было рода: «Упорство», а не «Упорный ученик». */
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-spell', category: 'clean', title: 'Первое заклинание', description: 'Пройти первый уровень.' },
  { id: 'clean-streak', category: 'clean', title: 'Чистая серия', description: 'Пройти пять уровней подряд без подсказок.' },
  ...regions.map(
    (region): Achievement => ({
      id: `perfect:${region.id}`,
      category: 'clean',
      title: `Сияние: ${region.title}`,
      description: `Собрать все звёзды района «${region.title}».`,
    }),
  ),
  { id: 'persistent', category: 'persistence', title: 'Упорство', description: 'Пройти уровень, на который ушло пять попыток и больше.' },
  { id: 'stubborn', category: 'persistence', title: 'Несгибаемая магия', description: 'Пройти уровень после десяти попыток и больше.' },
  { id: 'with-help', category: 'persistence', title: 'Подсказки — тоже магия', description: 'Открыть все подсказки уровня и всё-таки пройти его.' },
  { id: 'own-way', category: 'explore', title: 'Свой путь', description: 'Пройти уровень решением, которое отличается от решения наставника.' },
  { id: 'experiments', category: 'explore', title: 'Пять опытов', description: 'Поиграть с живыми примерами пяти заклинаний в гримуаре.' },
  { id: 'notes', category: 'explore', title: 'Своими словами', description: 'Записать в гримуар своё объяснение заклинания.' },
  { id: 'review-5', category: 'explore', title: 'Ничего не забыто', description: 'Правильно ответить на пять вопросов на повторение.' },
  { id: 'lord-default', category: 'secret', secret: true, title: 'Заклинание Лорда Дефолта', description: 'Написать font-family: Times New Roman — любимый шрифт злодея.' },
  { id: 'reverse', category: 'secret', secret: true, title: 'Задом наперёд', description: 'Попробовать row-reverse или column-reverse.' },
  { id: 'marquee', category: 'secret', secret: true, title: 'Ретро-магия', description: 'Написать <marquee> — бегущую строку из прошлого века.' },
  { id: 'z-war', category: 'secret', secret: true, title: 'Война слоёв', description: 'Написать z-index: 999 или больше — чтобы уж точно сверху.' },
  { id: 'keyboard', category: 'secret', secret: true, title: 'Магия без мыши', description: 'Сотворить заклинание через Ctrl+Enter десять раз.' },
  { id: 'chronicle', category: 'secret', secret: true, title: 'Летопись', description: 'Пройти уровень, оставив в коде свой комментарий.' },
  { id: 'hello-world', category: 'secret', secret: true, title: 'Hello, World!', description: 'Сказать Оракулу «Hello, World!» — первые слова любого программиста.' },
  { id: 'banana', category: 'secret', secret: true, title: 'Банан', description: "Сварить банан из NaN: 'b' + 'a' + + 'a' + 'a' — второй плюс превращает 'a' в число, а выходит baNaNa." },
];

type UnlockListener = (achievement: Achievement) => void;
const unlockListeners = new Set<UnlockListener>();

/** Подписка на новые достижения — для всплывающих уведомлений. */
export function onUnlock(listener: UnlockListener) {
  unlockListeners.add(listener);
  return () => {
    unlockListeners.delete(listener);
  };
}

export function unlock(id: string, found: Achievement[]) {
  if (stats.get().achievements[id]) return;
  const achievement = ACHIEVEMENTS.find((item) => item.id === id);
  if (!achievement) return;
  stats.update((s) => ({ achievements: { ...s.achievements, [id]: new Date().toISOString() } }));
  found.push(achievement);
  unlockListeners.forEach((listener) => listener(achievement));
}

/** Каждое нажатие «Сотворить»: секретные находки в коде. */
export function recordCast(code: string, viaKeyboard: boolean): Achievement[] {
  const found: Achievement[] = [];
  if (/font-family\s*:[^;{}]*times\s+new\s+roman/i.test(code)) unlock('lord-default', found);
  if (/\b(row|column)-reverse\b/i.test(code)) unlock('reverse', found);
  if (/<marquee\b/i.test(code)) unlock('marquee', found);
  if (/z-index\s*:\s*\d{3,}/i.test(code)) unlock('z-war', found);
  if (/console\.log\(\s*(['"`])hello,?\s*world!?\1\s*\)/i.test(code)) unlock('hello-world', found);
  if (/\+\s*\+\s*(['"`])a\1/i.test(code)) unlock('banana', found);
  if (viaKeyboard) {
    stats.update((s) => ({ keyboardCasts: s.keyboardCasts + 1 }));
    if (stats.get().keyboardCasts >= 10) unlock('keyboard', found);
  }
  return found;
}

export function recordExperiment(spell: string) {
  if (!stats.get().experiments.includes(spell)) {
    stats.update((s) => ({ experiments: [...s.experiments, spell] }));
  }
  if (stats.get().experiments.length >= 5) unlock('experiments', []);
}

export function recordNote(text: string) {
  if (text.trim().length >= 10) unlock('notes', []);
}

/** Ответ на вопрос на повторение: верный ответ даёт 5 XP. */
export function recordReview(spell: string, correct: boolean) {
  stats.update((s) => {
    const previous = s.reviews[spell] ?? { correct: 0, lastAt: 0 };
    return {
      reviews: { ...s.reviews, [spell]: { correct: previous.correct + (correct ? 1 : 0), lastAt: s.completions } },
      lastReviewAt: s.completions,
      reviewsCorrect: s.reviewsCorrect + (correct ? 1 : 0),
      reviewXp: s.reviewXp + (correct ? 5 : 0),
    };
  });
  if (stats.get().reviewsCorrect >= 5) unlock('review-5', []);
}
