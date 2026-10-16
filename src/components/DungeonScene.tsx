import { useState } from 'react';
import { codeLines, type JsEvaluation, type RunStatus } from '../engine/jsCheck';
import { runtimeProblem } from '../engine/jsLint';
import type { JsLevel } from '../engine/types';
import { plural } from '../lib/plural';
import { DungeonView } from './DungeonView';
import { GoalList } from './GoalList';
import { OracleLine } from './JsScene';

interface DungeonSceneProps {
  level: JsLevel;
  code: string;
  evaluation: JsEvaluation | null;
  /** Код ещё проверяется после последнего изменения */
  busy: boolean;
  celebrate: boolean;
}

/** Прошёл ли герой это подземелье: дошёл до выхода, всё собрал и код не сломался. */
function runPassed(status: RunStatus | undefined): boolean {
  return Boolean(status && status.misses.length === 0 && !status.result.error && status.result.hero?.atExit);
}

/**
 * Сцена «Пути героя»: подземелья — вкладками, как зеркала в адаптиве. Код ведёт героя по каждому,
 * поэтому маршрут не заучить — нужен алгоритм.
 */
export function DungeonScene({ level, code, evaluation, busy, celebrate }: DungeonSceneProps) {
  const dungeons = level.dungeons ?? [];
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, dungeons.length - 1);
  const status = evaluation?.runs[index];
  const report = status?.result.hero;
  const syntax = evaluation?.errors.find((problem) => problem.kind !== 'required' && problem.kind !== 'runtime');
  const failure = status?.result.error && runtimeProblem(code, status.result.error);
  const output = status?.result.output ?? [];
  const lines = codeLines(code);
  const lineOf = (from: number) => code.slice(0, from).split('\n').length;

  let message: { kind: 'error' | 'ok' | 'info'; text: string } | null = null;
  if (syntax) message = { kind: 'error', text: `Строка ${lineOf(syntax.from)}: ${syntax.message}` };
  else if (failure) message = { kind: 'error', text: `Код остановился: строка ${lineOf(failure.from)} — ${failure.message}` };
  else if (status?.result.timedOut) message = { kind: 'error', text: 'Код работал слишком долго и был остановлен — похоже, где-то бесконечный цикл.' };
  else if (report?.failure) message = { kind: 'error', text: report.failure.message };
  else if (runPassed(status)) message = { kind: 'ok', text: 'Герой у выхода!' };
  else if (status?.misses.length) message = { kind: 'info', text: status.misses[0] };

  return (
    <section className="stage stage--js stage--dungeon" aria-label="Подземелье">
      {dungeons.length > 1 && (
        <div className="js-runs" role="tablist" aria-label="Подземелья">
          {dungeons.map((dungeon, i) => (
            <button
              key={dungeon.label ?? i}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={i === index ? 'js-runs__tab js-runs__tab--active' : 'js-runs__tab'}
              onClick={() => setSelected(i)}
            >
              {dungeon.label ?? `Подземелье ${i + 1}`}
              {runPassed(evaluation?.runs[i]) ? ' ✦' : ''}
            </button>
          ))}
        </div>
      )}

      <div className={`dungeon-scene px-panel${celebrate ? ' js-scene--celebrate' : ''}${busy ? ' js-scene--busy' : ''}`}>
        <DungeonView
          key={index}
          dungeon={dungeons[index]}
          report={report}
          success={runPassed(status)}
          caption={message && <p className={`dungeon-scene__status dungeon-scene__status--${message.kind}`}>{message.text}</p>}
        />
        {output.length > 0 && (
          <ol className="oracle-scroll__lines dungeon-scene__log" aria-label="Что сказал Оракул">
            {output.map((line, i) => (
              <OracleLine key={i} line={line} />
            ))}
          </ol>
        )}
        {level.maxLines && (
          <p className={lines > level.maxLines ? 'dungeon-scene__lines dungeon-scene__lines--over' : 'dungeon-scene__lines'}>
            {lines} {plural(lines, 'строка', 'строки', 'строк')} кода · для трёх звёзд уложись в {level.maxLines}
          </p>
        )}
      </div>

      {evaluation && <GoalList goals={evaluation.goals} />}
    </section>
  );
}
