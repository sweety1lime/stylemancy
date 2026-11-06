import type { Rematch } from '../engine/types';
import { RichText } from './RichText';

/** Здоровье Лорда Дефолта: по сегменту на натиск, отбитые погасли */
export function RematchBar({ rematch, stage, cleared }: { rematch: Rematch; stage: number; cleared: boolean }) {
  const total = rematch.stages.length;
  return (
    <div className="rematch-bar" role="group" aria-label={`Лорд Дефолт: натиск ${stage} из ${total}`}>
      <p className="rematch-bar__title">
        Лорд Дефолт · натиск {stage} из {total}
      </p>
      <ol className="rematch-bar__hp">
        {rematch.stages.map((_, i) => (
          <li key={i} className={i < stage - 1 || (i === stage - 1 && cleared) ? 'rematch-bar__seg rematch-bar__seg--down' : 'rematch-bar__seg'} />
        ))}
      </ol>
    </div>
  );
}

interface RematchPanelProps {
  rematch: Rematch;
  stage: number;
  /** Опыт, начисленный за победу сейчас: 0, если реванш уже был выигран раньше */
  award: number;
  trailHref: string;
  onNext: () => void;
}

/** Натиск отбит: Лорд Дефолт отвечает, а герой решает, идти ли дальше; после последнего — победа */
export function RematchPanel({ rematch, stage, award, trailHref, onNext }: RematchPanelProps) {
  const last = stage === rematch.stages.length;
  return (
    <section className="rematch px-panel" aria-live="polite">
      <h2 className="rematch__title">{last ? 'Лорд Дефолт повержен!' : 'Натиск отбит!'}</h2>
      <p className="rematch__say">
        <RichText text={last ? rematch.victory : rematch.stages[stage - 1].defeated} />
      </p>
      {last && award > 0 && <p className="rematch__xp">+{award} XP</p>}
      {last ? (
        <a className="button button--cast" href={trailHref}>
          ← К тропе
        </a>
      ) : (
        <button type="button" className="button button--cast" onClick={onNext}>
          Дальше: новый удар
        </button>
      )}
    </section>
  );
}
