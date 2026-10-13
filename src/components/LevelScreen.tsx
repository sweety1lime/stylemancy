import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { evaluate, lintOptionsFor, scoreSolution, solutionDeclCount } from '../engine/evaluate';
import { lintCss } from '../engine/lint';
import type { ItemStatus } from '../engine/scene';
import type { Level } from '../engine/types';
import { currentLevel, drafts, progress } from '../game/progress';
import { rankFor, totalXp } from '../game/ranks';
import { SPELLS } from '../game/spells';
import { CodeEditor, type CodeEditorHandle } from './CodeEditor';
import { ResultPanel, type Outcome, type RegionStats } from './ResultPanel';
import { Portrait } from './Portrait';
import { RichText } from './RichText';
import { Scene, type SceneHandle } from './Scene';

interface LevelScreenProps {
  level: Level;
  number: number;
  region: RegionStats;
  /** Ссылка на тропу района — после последнего уровня */
  trailHref: string;
  onNext?: () => void;
}

export function LevelScreen({ level, number, region, trailHref, onNext }: LevelScreenProps) {
  const [code, setCode] = useState(() => drafts.get(level.id) ?? level.starterCss);
  const [hintsUsed, setHintsUsed] = useState(() => progress.get(level.id).hintsUsed);
  const [statuses, setStatuses] = useState<ItemStatus[]>([]);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const codeRef = useRef(code);
  const editorRef = useRef<CodeEditorHandle>(null);
  const sceneRef = useRef<SceneHandle>(null);
  const lintOptions = useMemo(() => lintOptionsFor(level), [level]);
  const lintCode = useCallback((text: string) => lintCss(text, lintOptions).problems, [lintOptions]);

  // На карте появится кнопка «Продолжить» с этим уровнем
  useEffect(() => {
    currentLevel.set(level.id);
  }, [level.id]);

  // Черновик сохраняется, пока студент печатает
  useEffect(() => {
    const timer = setTimeout(() => drafts.save(level.id, code), 400);
    return () => clearTimeout(timer);
  }, [level.id, code]);

  function handleChange(next: string) {
    codeRef.current = next;
    setCode(next);
    setOutcome(null);
    sceneRef.current?.apply(next);
  }

  function cast() {
    const current = codeRef.current;
    const items = sceneRef.current?.apply(current) ?? [];
    const evaluation = evaluate(lintCss(current, lintOptions), items);
    progress.addAttempt(level.id);
    if (evaluation.passed) {
      const score = scoreSolution(hintsUsed, evaluation.declCount, solutionDeclCount(level));
      const xpBefore = totalXp(progress.snapshot());
      progress.complete(level.id, score.stars);
      const xpAfter = totalXp(progress.snapshot());
      const rankBefore = rankFor(xpBefore).rank;
      const rankAfter = rankFor(xpAfter).rank;
      setOutcome({
        kind: 'success',
        score,
        xpGain: xpAfter - xpBefore,
        newRank: rankAfter !== rankBefore ? rankAfter.title : undefined,
      });
    } else {
      setOutcome({ kind: 'fail', evaluation });
    }
  }

  const hintsLeft = level.hints.length - hintsUsed;
  function takeHint() {
    if (hintsLeft <= 0) return;
    setHintsUsed(hintsUsed + 1);
    progress.setHints(level.id, hintsUsed + 1);
  }
  const hintLabel =
    hintsLeft > 0
      ? `Подсказка ${hintsUsed + 1} из ${level.hints.length}${hintsUsed < 2 ? ' · −1 ★' : ''}`
      : 'Подсказок больше нет';

  const placed = statuses.filter((s) => s.inPlace).length;
  const spell = level.learns ? SPELLS[level.learns] : undefined;

  return (
    <main className="level">
      <section className="brief">
        <p className="brief__eyebrow">
          {level.regionTitle} · уровень {number}
        </p>
        <h1 className="brief__title">{level.title}</h1>
        <div className="dialog px-panel">
          <Portrait id={level.npc.portrait} />
          <div className="dialog__body">
            <p className="dialog__name">
              {level.npc.name}
              <span>, {level.npc.title}</span>
            </p>
            {level.dialog.map((line) => (
              <p key={line} className="dialog__line">
                <RichText text={line} />
              </p>
            ))}
          </div>
        </div>
        <div className="task px-panel">
          <span className="task__label">Задача</span>
          <p className="task__text">
            <RichText text={level.task} />
          </p>
        </div>
      </section>

      <section className="stage" aria-label="Сцена">
        <Scene
          ref={sceneRef}
          level={level}
          initialCss={code}
          celebrate={outcome?.kind === 'success'}
          onStatuses={setStatuses}
        />
        {statuses.length > 0 && (
          <div className="stage__status">
            <span>
              На месте: {placed} из {statuses.length}
            </span>
            <span className="stage__dots">
              {statuses.map((s) => (
                <span
                  key={s.name}
                  className={s.inPlace ? 'dot dot--on' : 'dot'}
                  style={{ '--dot': s.color } as CSSProperties}
                  title={s.name}
                />
              ))}
            </span>
          </div>
        )}
      </section>

      <section className="workbench" aria-label="Код">
        <div className="editor-card px-panel">
          <div className="editor-card__head">
            <span className="editor-card__file">style.css</span>
            <button type="button" className="text-button" onClick={() => editorRef.current?.setValue(level.starterCss)}>
              Начать заново
            </button>
          </div>
          <CodeEditor
            ref={editorRef}
            initialValue={code}
            onChange={handleChange}
            lint={lintCode}
            onSubmit={cast}
            label="Редактор CSS"
            autoFocus
          />
          <details className="markup">
            <summary>HTML сцены</summary>
            <pre>
              <code>{level.html}</code>
            </pre>
          </details>
        </div>

        <div className="actions">
          <button type="button" className="button button--ghost" onClick={takeHint} disabled={hintsLeft <= 0}>
            {hintLabel}
          </button>
          <button type="button" className="button button--cast" onClick={cast}>
            ✦ Сотворить <kbd>Ctrl+Enter</kbd>
          </button>
        </div>

        {hintsUsed > 0 && (
          <ol className="hints">
            {level.hints.slice(0, hintsUsed).map((hint, i) => (
              <li key={hint} className="hint px-panel">
                <span className="hint__label">Подсказка {i + 1}</span>
                <RichText text={hint} />
              </li>
            ))}
          </ol>
        )}

        {outcome && (
          <ResultPanel
            outcome={outcome}
            level={level}
            code={code}
            spell={spell}
            region={region}
            trailHref={trailHref}
            onNext={onNext}
          />
        )}
      </section>
    </main>
  );
}
