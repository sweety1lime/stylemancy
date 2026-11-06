import { useState } from 'react';
import { activeStreak, answerDaily, dailyQuestions, dayKey, startDaily } from '../game/daily';
import { useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import { useStats } from '../game/stats';
import { plural } from '../lib/plural';
import { FlameIcon } from './FlameIcon';
import { ReviewCard } from './ReviewCard';

/** Свиток дня: три вопроса из выученного. Дочитал — серия дней растёт, огонёк разгорается. */
export function DailyScreen() {
  const progress = useProgress();
  const { daily } = useStats();
  // День фиксируется при открытии экрана: свиток, начатый до полуночи, дочитывается за тот же день
  const [today] = useState(dayKey);
  const questions = dailyQuestions(daily, today, progress);
  const done = daily.last === today;
  const started = daily.day === today && daily.picks.length > 0;
  const streak = activeStreak(daily, today);

  function days(n: number): string {
    return `${n} ${plural(n, 'день', 'дня', 'дней')}`;
  }

  let body;
  if (done) {
    body = (
      <section className="daily__panel daily__panel--done px-panel" aria-live="polite">
        <span className="daily__flame daily__flame--lit">
          <FlameIcon size={56} />
        </span>
        <h2 className="pixel-subtitle">Свиток прочитан</h2>
        <p className="daily__streak">Серия: {days(streak)} подряд</p>
        <p className="daily__lead">
          Новый свиток развернётся завтра. Пропустишь день — серия начнётся заново.
          {daily.best > streak && ` Твой рекорд: ${days(daily.best)}.`}
        </p>
        <a className="button button--cast" href={hrefFor({ name: 'map' })}>
          На карту
        </a>
      </section>
    );
  } else if (!questions.length) {
    body = (
      <section className="daily__panel px-panel">
        <h2 className="pixel-subtitle">Свиток пока пуст</h2>
        <p className="daily__lead">Вопросы берутся из заклинаний, которые ты уже выучил. Пройди первый уровень, и завтра свиток тебя дождётся.</p>
        <a className="button button--cast" href={hrefFor({ name: 'map' })}>
          На карту
        </a>
      </section>
    );
  } else if (!started) {
    body = (
      <section className="daily__panel px-panel">
        <span className="daily__flame">
          <FlameIcon size={56} />
        </span>
        <h2 className="pixel-subtitle">Свиток дня</h2>
        <p className="daily__lead">
          {questions.length} {plural(questions.length, 'вопрос', 'вопроса', 'вопросов')} из того, что ты уже выучил. Дочитаешь свиток до конца — серия вырастет на день и придёт награда в XP.
        </p>
        {streak > 0 && <p className="daily__streak">Серия: {days(streak)}. Не дай огоньку погаснуть.</p>}
        <button type="button" className="button button--cast" onClick={() => startDaily(today, progress)}>
          Развернуть свиток
        </button>
      </section>
    );
  } else {
    const index = Math.min(daily.answered, questions.length - 1);
    const question = questions[index];
    body = (
      <ReviewCard
        key={question.id}
        question={question}
        seed={Number(today.replace(/-/g, '')) + index}
        heading={`Вопрос ${index + 1} из ${questions.length}`}
        onDone={() => answerDaily(today)}
      />
    );
  }

  return (
    <main className="daily">
      <header className="daily__head">
        <h1 className="pixel-title">Свиток дня</h1>
        <p className="daily__lead">Короткое повторение каждый день: серия дней подряд — только твоя, без рейтинга.</p>
      </header>
      {body}
    </main>
  );
}
