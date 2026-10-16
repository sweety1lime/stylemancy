import type { Score } from '../engine/evaluate';
import type { Problem } from '../engine/lint';
import type { Achievement } from '../game/achievements';
import type { Spell } from '../game/spells';
import { Medal } from './Medal';
import { RichText } from './RichText';
import { Stars } from './Stars';

export type Outcome =
  | { kind: 'success'; score: Score; xpGain: number; newRank?: string; achievements: Achievement[] }
  /** errors — ошибки в коде, misses — что ещё не так на сцене или не выполнено */
  | { kind: 'fail'; errors: Problem[]; misses: string[] };

/** Итоги района — показываем после последнего уровня. */
export interface RegionStats {
  title: string;
  completed: number;
  total: number;
  stars: number;
  maxStars: number;
  /** Этот уровень открывает следующий район — его название */
  unlocks?: string;
}

interface ResultPanelProps {
  outcome: Outcome;
  code: string;
  spell?: Spell;
  region: RegionStats;
  trailHref: string;
  onNext?: () => void;
  /** Район пройден — показать победную сцену */
  onFinale?: () => void;
}

export function ResultPanel({ outcome, code, spell, region, trailHref, onNext, onFinale }: ResultPanelProps) {
  if (outcome.kind === 'success') {
    return (
      <section className="result result--success px-panel" aria-live="polite">
        <div className="result__head">
          <h2 className="result__title">Заклинание сработало!</h2>
          <Stars count={outcome.score.stars} scale={4} />
        </div>
        {outcome.xpGain > 0 && <p className="result__xp">+{outcome.xpGain} XP</p>}
        {outcome.newRank && <p className="result__rank">Новый ранг: {outcome.newRank}!</p>}
        {outcome.score.notes.length > 0 && <p className="result__notes">{outcome.score.notes.join(' · ')}</p>}
        {outcome.achievements.length > 0 && (
          <ul className="result__achievements">
            {outcome.achievements.map((item) => (
              <li key={item.id}>
                <Medal category={item.category} scale={2} />
                Достижение: {item.title}
              </li>
            ))}
          </ul>
        )}
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
        ) : (
          <>
            <p className="result__final">
              {region.completed === region.total
                ? `Район «${region.title}» пройден! Звёзд собрано: ${region.stars} из ${region.maxStars}.`
                : `Это последний уровень района. Пройдено уровней: ${region.completed} из ${region.total} — вернись к пропущенным.`}
            </p>
            {region.unlocks && <p className="result__unlock">Открыт новый район: «{region.unlocks}» — он ждёт на тропе.</p>}
            <div className="result__buttons">
              <a className="button button--cast" href={trailHref}>
                ← К тропе
              </a>
              {onFinale && (
                <button type="button" className="button button--ghost" onClick={onFinale}>
                  Смотреть финал
                </button>
              )}
            </div>
          </>
        )}
      </section>
    );
  }

  const { errors, misses } = outcome;
  return (
    <section className="result result--fail px-panel" aria-live="polite">
      <h2 className="result__title">Заклинание не сработало</h2>
      {errors.length > 0 ? (
        <>
          <p>Сначала исправь ошибки в коде:</p>
          <ul className="result__list">
            {errors.slice(0, 3).map((error) => (
              <li key={`${error.from}-${error.message}`}>
                {error.kind !== 'required' && <span className="result__line">строка {lineAt(code, error.from)}</span>}{' '}
                {error.message}
              </li>
            ))}
          </ul>
        </>
      ) : misses.length > 0 ? (
        <ul className="result__list">
          {misses.map((line, i) => (
            <li key={`${i}:${line}`}>
              <RichText text={line} />
            </li>
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
