import { useMemo, useState } from 'react';
import { recordReview } from '../game/achievements';
import { shuffledOptions, type ReviewQuestion } from '../game/review';
import { SPELLS } from '../game/spells';
import { RichText } from './RichText';

interface ReviewCardProps {
  question: ReviewQuestion;
  /** Зерно перемешивания вариантов */
  seed: number;
  heading: string;
  onDone: (correct: boolean) => void;
  onSkip?: () => void;
}

/** Вопрос на повторение: четыре варианта, после ответа — объяснение. Верный ответ даёт 5 XP. */
export function ReviewCard({ question, seed, heading, onDone, onSkip }: ReviewCardProps) {
  const options = useMemo(() => shuffledOptions(question, seed), [question, seed]);
  const [picked, setPicked] = useState<number | null>(null);
  const correct = picked !== null && options[picked].correct;

  function pick(index: number) {
    if (picked !== null) return;
    setPicked(index);
    recordReview(question.spell, options[index].correct);
  }

  function optionClass(index: number): string {
    if (picked === null) return 'review__option';
    if (options[index].correct) return 'review__option review__option--ok';
    return index === picked ? 'review__option review__option--no' : 'review__option';
  }

  return (
    <section className="review px-panel" aria-live="polite">
      <p className="review__label">
        {heading} · {SPELLS[question.spell]?.name}
      </p>
      <p className="review__prompt">
        <RichText text={question.prompt} />
      </p>
      <div className="review__options">
        {options.map((option, i) => (
          <button
            key={option.text}
            type="button"
            className={optionClass(i)}
            disabled={picked !== null}
            onClick={() => pick(i)}
          >
            <RichText text={option.text} />
          </button>
        ))}
      </div>
      {picked !== null ? (
        <div className="review__after">
          <p className={correct ? 'review__verdict review__verdict--ok' : 'review__verdict'}>
            {correct ? 'Верно! +5 XP. ' : 'Не совсем. '}
            <RichText text={question.explain} />
          </p>
          <button type="button" className="button button--ghost" onClick={() => onDone(correct)}>
            Дальше
          </button>
        </div>
      ) : (
        onSkip && (
          <button type="button" className="text-button review__skip" onClick={onSkip}>
            Пропустить
          </button>
        )
      )}
    </section>
  );
}
