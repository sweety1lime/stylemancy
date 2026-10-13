import { useState } from 'react';
import { recordNote } from '../game/achievements';
import { notesStore, useNotes } from '../game/notes';
import { useProgress } from '../game/progress';
import { learnedSpells, pickQuestion, type ReviewQuestion } from '../game/review';
import { hrefFor } from '../game/router';
import { SPELLS } from '../game/spells';
import { useStats } from '../game/stats';
import { allLevels } from '../levels';
import { BOOK } from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { ReviewCard } from './ReviewCard';
import { RichText } from './RichText';
import { SpellExample } from './SpellExample';

const QUIZ_LENGTH = 5;

/** Заклинания в порядке уровней, где их изучают. */
const ENTRIES = allLevels
  .filter((level) => level.learns && SPELLS[level.learns])
  .filter((level, i, list) => list.findIndex((other) => other.learns === level.learns) === i)
  .map((level) => ({ key: level.learns as string, level }));

interface Quiz {
  index: number;
  correct: number;
  question?: ReviewQuestion;
}

export function GrimoireScreen() {
  const progress = useProgress();
  const notes = useNotes();
  const { reviewsCorrect } = useStats();
  const learned = learnedSpells(progress);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  function startQuiz() {
    setQuiz({ index: 0, correct: 0, question: pickQuestion(learned) });
  }

  function answer(correct: boolean) {
    if (!quiz?.question) return;
    const index = quiz.index + 1;
    const total = quiz.correct + (correct ? 1 : 0);
    const question = index < QUIZ_LENGTH ? pickQuestion(learned, quiz.question.spell) ?? pickQuestion(learned) : undefined;
    setQuiz({ index, correct: total, question });
  }

  return (
    <main className="grimoire">
      <header className="grimoire__head">
        <PixelArt sprite={BOOK} scale={5} />
        <div className="grimoire__title">
          <h1 className="pixel-title">Гримуар</h1>
          <p className="grimoire__count">
            Изучено {learned.length} из {ENTRIES.length} заклинаний
          </p>
        </div>
        <div className="grimoire__actions">
          <button type="button" className="button button--cast" disabled={learned.length === 0} onClick={startQuiz}>
            Проверь себя
          </button>
          <button type="button" className="button button--ghost" onClick={() => window.print()}>
            Распечатать шпаргалку
          </button>
        </div>
      </header>

      {quiz &&
        (quiz.question ? (
          <ReviewCard
            key={`${quiz.index}-${quiz.question.id}`}
            question={quiz.question}
            seed={reviewsCorrect + quiz.index}
            heading={`Проверь себя: вопрос ${quiz.index + 1} из ${QUIZ_LENGTH}`}
            onDone={answer}
          />
        ) : (
          <section className="review px-panel">
            <p className="review__label">Проверь себя</p>
            <p className="review__prompt">
              Верных ответов: {quiz.correct} из {quiz.index}.{' '}
              {quiz.correct === quiz.index ? 'Безупречно!' : 'Загляни в записи ниже и попробуй ещё раз.'}
            </p>
            <button type="button" className="button button--ghost" onClick={() => setQuiz(null)}>
              Закрыть
            </button>
          </section>
        ))}

      <ol className="grimoire__list">
        {ENTRIES.map(({ key, level }) => {
          const spell = SPELLS[key];
          const levelLink = (
            <a href={hrefFor({ name: 'level', id: level.id })}>
              «{level.title}»
            </a>
          );
          if (!learned.includes(key)) {
            return (
              <li key={key} className="spell-card spell-card--locked px-panel">
                <h2 className="pixel-subtitle">???</h2>
                <p className="spell-card__text">Запись появится после уровня {levelLink}.</p>
              </li>
            );
          }
          return (
            <li key={key} className="spell-card px-panel">
              <h2 className="pixel-subtitle">{spell.name}</h2>
              <p className="spell-card__text">
                <RichText text={spell.description} />
              </p>
              <SpellExample spell={key} example={spell.example} />
              <label className="spell-card__notes">
                <span>Мои заметки</span>
                <textarea
                  value={notes[key] ?? ''}
                  placeholder="Объясни заклинание своими словами — так оно запомнится лучше"
                  onChange={(event) => notesStore.set(key, event.target.value)}
                  onBlur={(event) => recordNote(event.target.value)}
                />
              </label>
              {notes[key] && <p className="spell-card__notes-print">Мои заметки: {notes[key]}</p>}
              <p className="spell-card__source">Изучено на уровне {levelLink}</p>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
