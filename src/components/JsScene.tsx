import { useState } from 'react';
import { TYPE_NAMES, type CallStatus, type FlaskStatus, type JsEvaluation, type RunStatus } from '../engine/jsCheck';
import { runtimeProblem } from '../engine/jsLint';
import type { Flask as FlaskValue, OutputLine, ValueType } from '../engine/jsRun';
import type { JsLevel } from '../engine/types';
import { recolor, type Sprite } from '../pixel/pixelArt';
import { POTION } from '../pixel/sprites';
import { GoalList } from './GoalList';
import { PixelArt } from './PixelArt';

/** Цвет жидкости в колбе — по типу значения: видно, что '5' и 5 — разные вещи. */
const LIQUID: Record<ValueType, { r: string; R: string }> = {
  number: { r: '#3b82f6', R: '#93c5fd' },
  string: { r: '#10b981', R: '#6ee7b7' },
  boolean: { r: '#f59e0b', R: '#fde68a' },
  undefined: { r: 'rgba(148, 163, 184, 0.14)', R: 'rgba(148, 163, 184, 0.22)' },
  null: { r: '#64748b', R: '#94a3b8' },
  array: { r: '#8b5cf6', R: '#c4b5fd' },
  object: { r: '#8b5cf6', R: '#c4b5fd' },
  function: { r: '#ec4899', R: '#f9a8d4' },
  bigint: { r: '#3b82f6', R: '#93c5fd' },
  symbol: { r: '#ec4899', R: '#f9a8d4' },
};

const flaskSprites = new Map<ValueType, Sprite>();

function flaskSprite(type: ValueType): Sprite {
  let sprite = flaskSprites.get(type);
  if (!sprite) {
    sprite = recolor(POTION, LIQUID[type]);
    flaskSprites.set(type, sprite);
  }
  return sprite;
}

/** Типы в легенде полки — в порядке, в каком их изучают */
const LEGEND: ValueType[] = ['number', 'string', 'boolean', 'undefined', 'null', 'array', 'object', 'function'];

/** Массив — обоз из вагонов с номерами от нуля, объект — карточка с полями: так их показывают колбы и конвейер. */
function isStructured(value: FlaskValue): boolean {
  return (value.type === 'array' && Boolean(value.items)) || (value.type === 'object' && Boolean(value.entries));
}

/** Значение в колбе: массив — обоз, объект — карточка, остальное — как в консоли. */
function ValueView({ value }: { value: FlaskValue }) {
  if (value.type === 'array' && value.items) {
    return (
      <span className="wagons" title={value.shown}>
        {value.items.map((item, i) => (
          <span key={i} className="wagon">
            <span className="wagon__cargo">{item.shown}</span>
            <span className="wagon__index">{i}</span>
          </span>
        ))}
        {(value.size ?? 0) > value.items.length && <span className="wagon wagon--more">…</span>}
        {value.size === 0 && <span className="wagons__empty">пустой обоз []</span>}
      </span>
    );
  }
  if (value.type === 'object' && value.entries) {
    return (
      <span className="card-value" title={value.shown}>
        {value.entries.map(([key, item]) => (
          <span key={key} className="card-value__row">
            <span className="card-value__key">{key}:</span>
            {item.shown}
          </span>
        ))}
        {(value.size ?? 0) > value.entries.length && <span className="card-value__row">…</span>}
        {value.size === 0 && <span className="card-value__row">пустая карточка {'{}'}</span>}
      </span>
    );
  }
  return <>{value.shown}</>;
}

function Flask({ status }: { status: FlaskStatus }) {
  const { name, flask, target, ok } = status;
  const type: ValueType = flask?.declared ? (flask.type ?? 'undefined') : 'undefined';
  const state = ok ? 'flask--ok' : target?.declared ? 'flask--goal' : '';
  const wide = Boolean(flask?.declared && isStructured(flask));
  return (
    <figure className={`flask ${state}`}>
      <span className="flask__name">{name}</span>
      <PixelArt className="flask__art" sprite={flaskSprite(type)} scale={4} />
      <figcaption className={wide ? 'flask__value flask__value--wide' : 'flask__value'}>
        {flask?.declared ? <ValueView value={flask} /> : 'нет колбы'}
      </figcaption>
      {target?.declared && !ok && <span className="flask__target">нужно: {target.shown}</span>}
    </figure>
  );
}

/** Флакон-вызов на конвейере: что рецепт вернул, и горит золотом, если это то, что ждали. */
function CallFlask({ status }: { status: CallStatus }) {
  const { call, actual, target, ok } = status;
  const type: ValueType = actual?.declared ? (actual.type ?? 'undefined') : 'undefined';
  const state = !actual ? '' : ok ? ' call--ok' : ' call--wrong';
  return (
    <figure className={`call${state}`}>
      <code className="call__label">{call}</code>
      <PixelArt className="call__art" sprite={flaskSprite(type)} scale={3} />
      <figcaption className="call__value">
        {actual?.error ? '✖ ошибка' : actual?.declared ? <ValueView value={actual} /> : '…'}
      </figcaption>
      {target?.declared && actual && !ok && <span className="call__target">ждали: {target.shown}</span>}
    </figure>
  );
}

/** Строка свитка: слова Оракула, окно alert или вопрос prompt вместе с ответом. */
export function OracleLine({ line, ok = false }: { line: OutputLine; ok?: boolean }) {
  const mark = ok ? <span className="oracle-line__mark">✦</span> : null;
  if (line.kind === 'prompt') {
    return (
      <li className="oracle-line oracle-line--prompt">
        <span className="oracle-line__question">? {line.text}</span>
        <span className="oracle-line__answer">→ {line.answer === null ? 'нет ответа' : line.answer}</span>
        {mark}
      </li>
    );
  }
  return (
    <li className={`oracle-line oracle-line--${line.kind}${ok ? ' oracle-line--ok' : ''}`}>
      {line.kind === 'alert' && <span className="oracle-line__badge">alert</span>}
      <span className="oracle-line__text">{line.text === '' ? ' ' : line.text}</span>
      {mark}
    </li>
  );
}

interface JsSceneProps {
  level: JsLevel;
  code: string;
  evaluation: JsEvaluation | null;
  /** Код ещё проверяется после последнего изменения */
  busy: boolean;
  celebrate: boolean;
}

/**
 * Сцена JS-уровня: свиток Оракула (всё, что вывел код) и полка с колбами (переменные).
 * Если запусков несколько — вкладки, как зеркала в адаптиве.
 */
export function JsScene({ level, code, evaluation, busy, celebrate }: JsSceneProps) {
  const [selected, setSelected] = useState(0);
  const runs = evaluation?.runs ?? [];
  const status: RunStatus | undefined = runs[Math.min(selected, runs.length - 1)];
  const syntax = evaluation?.errors.find((problem) => problem.kind !== 'required' && problem.kind !== 'runtime');
  const failure = status?.result.error && runtimeProblem(code, status.result.error);
  const output = status?.result.output ?? [];
  // Конвейер: до первой проверки флаконы едут пустыми
  const calls: CallStatus[] = status?.calls ?? (level.calls ?? []).map((call) => ({ call, ok: false }));
  const conveyor = calls.length > 0;
  // На уровнях с конвейером полка — только если уровень проверяет колбы: главное там — флаконы
  const flasks = conveyor && !level.check.vars?.length ? [] : (status?.flasks ?? []);
  const showShelf = Boolean(level.check.vars?.length) || flasks.length > 0;
  const quiet = conveyor && !level.check.output && output.length === 0 && !syntax && !failure && !status?.result.timedOut;
  const types = new Set([
    ...flasks.map((item) => (item.flask?.declared ? (item.flask.type ?? 'undefined') : 'undefined')),
    ...calls.filter((item) => item.actual?.declared).map((item) => item.actual?.type ?? 'undefined'),
  ]);

  return (
    <section className="stage stage--js" aria-label="Скриптория">
      {runs.length > 1 && (
        <div className="js-runs" role="tablist" aria-label="Запуски">
          {runs.map((run, i) => (
            <button
              key={run.label ?? i}
              type="button"
              role="tab"
              aria-selected={i === selected}
              className={i === selected ? 'js-runs__tab js-runs__tab--active' : 'js-runs__tab'}
              onClick={() => setSelected(i)}
            >
              {run.label}
              {run.misses.length === 0 && run.result.output.length > 0 ? ' ✦' : ''}
            </button>
          ))}
        </div>
      )}

      <div className={`js-scene px-panel${celebrate ? ' js-scene--celebrate' : ''}${busy ? ' js-scene--busy' : ''}`}>
        {conveyor && (
          <div className="conveyor">
            <p className="conveyor__title">Конвейер рецептов</p>
            <div className="conveyor__belt">
              {calls.map((item, i) => (
                <CallFlask key={i} status={item} />
              ))}
            </div>
          </div>
        )}

        {!quiet && (
          <div className="oracle-scroll">
            <p className="oracle-scroll__title">Свиток Оракула</p>
            <ol className="oracle-scroll__lines" aria-live="polite">
              {output.map((line, i) => (
                <OracleLine key={i} line={line} ok={Boolean(status?.lineOk[i])} />
              ))}
              {syntax && (
                <li className="oracle-line oracle-line--error">
                  ✖ {syntax.kind === 'syntax' ? 'Оракул не может прочесть приказ: строка' : 'Строка'}{' '}
                  {code.slice(0, syntax.from).split('\n').length} — {syntax.message}
                </li>
              )}
              {failure && (
                <li className="oracle-line oracle-line--error">
                  ✖ Код остановился: строка {code.slice(0, failure.from).split('\n').length} — {failure.message}
                </li>
              )}
              {status?.result.timedOut && <li className="oracle-line oracle-line--error">✖ Код работал слишком долго и был остановлен.</li>}
              {!syntax && !failure && !status?.result.timedOut && output.length === 0 && (
                <li className="oracle-line oracle-line--empty">{evaluation ? 'Оракул молчит…' : 'Оракул слушает…'}</li>
              )}
            </ol>
          </div>
        )}

        {showShelf && (
          <div className="flask-shelf">
            <p className="flask-shelf__title">Полка колб</p>
            {flasks.length > 0 ? (
              <div className="flask-shelf__row">
                {flasks.map((item) => (
                  <Flask key={item.name} status={item} />
                ))}
              </div>
            ) : (
              <p className="flask-shelf__empty">Пусто. Объяви переменную через let — и её колба встанет на полку.</p>
            )}
            <ul className="flask-legend" aria-label="Цвет — тип значения">
              {LEGEND.filter((type) => types.has(type)).map((type) => (
                <li key={type}>
                  <i style={{ background: LIQUID[type].r }} /> {TYPE_NAMES[type]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {evaluation && <GoalList goals={evaluation.goals} />}
    </section>
  );
}
