import type { Verdict } from '../game/predict';

interface PredictPanelProps {
  blind: boolean;
  onToggle: () => void;
  guess: string;
  onGuess: (text: string) => void;
  /** Свиток открыт: заклинание сотворено, Оракул показал вывод */
  revealed: boolean;
  verdict: Verdict | null;
}

/**
 * «Слепая магия»: Оракул молчит, пока студент не сотворит заклинание. Перед этим можно записать, что он скажет,
 * и сверить с настоящим выводом. Угадал — опыт (один раз за уровень): значит, код прочитан так же, как его читает Оракул.
 */
export function PredictPanel({ blind, onToggle, guess, onGuess, revealed, verdict }: PredictPanelProps) {
  return (
    <section className="predict px-panel" aria-label="Слепая магия">
      <div className="predict__head">
        <button type="button" className="button button--ghost" aria-pressed={blind} onClick={onToggle}>
          Слепая магия
        </button>
        <p className="predict__lead">
          {blind
            ? 'Оракул молчит, пока ты не сотворишь заклинание.'
            : 'Оракул покажет вывод, только когда сотворишь. Угадаешь его заранее — получишь XP.'}
        </p>
      </div>
      {blind && !revealed && (
        <label className="field predict__guess">
          <span>Что напечатает Оракул? Одна строка вывода — одна строка здесь</span>
          <textarea value={guess} rows={3} onChange={(event) => onGuess(event.target.value)} placeholder="Например: Привет, Скриптория!" />
        </label>
      )}
      {verdict && (
        <div className="predict__verdict" aria-live="polite">
          {verdict.right ? (
            <p className="predict__right">
              Предсказание верно! Ты прочитал свой код так же, как его читает Оракул.
              {verdict.award > 0 && <strong> +{verdict.award} XP</strong>}
            </p>
          ) : (
            <>
              <p className="predict__wrong">Предсказание не совпало: посмотри, где Оракул понял код иначе.</p>
              <p className="predict__diff">
                Ты ждал: <code>{verdict.guess || '(ничего)'}</code>
              </p>
              <p className="predict__diff">
                Оракул сказал: <code>{verdict.got || '(ничего)'}</code>
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
