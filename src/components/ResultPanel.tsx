import type { Evaluation, Score } from '../engine/evaluate';
import { summarizeMisses } from '../engine/scene';
import type { Level } from '../engine/types';
import type { Spell } from '../game/spells';
import { RichText } from './RichText';
import { Stars } from './Stars';

export type Outcome = { kind: 'success'; score: Score } | { kind: 'fail'; evaluation: Evaluation };

/** Итоги района — показываем после последнего уровня. */
export interface RegionStats {
  title: string;
  completed: number;
  total: number;
  stars: number;
  maxStars: number;
}

interface ResultPanelProps {
  outcome: Outcome;
  level: Level;
  code: string;
  spell?: Spell;
  region: RegionStats;
  onNext?: () => void;
}

export function ResultPanel({ outcome, level, code, spell, region, onNext }: ResultPanelProps) {
  if (outcome.kind === 'success') {
    return (
      <section className="result result--success" aria-live="polite">
        <div className="result__head">
          <h2 className="result__title">Заклинание сработало!</h2>
          <Stars count={outcome.score.stars} />
        </div>
        {outcome.score.notes.length > 0 && <p className="result__notes">{outcome.score.notes.join(' · ')}</p>}
        {spell && (
          <div className="spell">
            <span className="spell__label">Новое заклинание</span>
            <code className="spell__name">{spell.name}</code>
            <p className="spell__text">
              <RichText text={spell.description} />
            </p>
          </div>
        )}
        {onNext ? (
          <button type="button" className="button button--cast" onClick={onNext}>
            Дальше →
          </button>
        ) : region.completed === region.total ? (
          <p className="result__final">
            Район «{region.title}» пройден! Звёзд собрано: {region.stars} из {region.maxStars}. Скоро откроются новые
            земли.
          </p>
        ) : (
          <p className="result__final">
            Это последний уровень района. Пройдено уровней: {region.completed} из {region.total} — вернись к
            пропущенным.
          </p>
        )}
      </section>
    );
  }

  const { errors, items } = outcome.evaluation;
  const misses = summarizeMisses(items, level.check.groupName, level.check.tolerance);
  return (
    <section className="result result--fail" aria-live="polite">
      <h2 className="result__title">Заклинание не сработало</h2>
      {errors.length > 0 ? (
        <>
          <p>Сначала исправь ошибки в коде:</p>
          <ul className="result__list">
            {errors.slice(0, 3).map((error) => (
              <li key={`${error.from}-${error.message}`}>
                <span className="result__line">строка {lineAt(code, error.from)}</span> {error.message}
              </li>
            ))}
          </ul>
        </>
      ) : misses.length > 0 ? (
        <ul className="result__list">
          {misses.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : (
        <p>Сцена ещё загружается — попробуй через секунду.</p>
      )}
    </section>
  );
}

function lineAt(text: string, offset: number): number {
  return text.slice(0, offset).split('\n').length;
}
