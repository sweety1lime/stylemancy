import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import { evaluate, lintOptionsFor, scoreSolution, solutionDeclCount } from '../engine/evaluate';
import { lintCss } from '../engine/lint';
import { summarizeMisses, viewsOf, type ItemStatus } from '../engine/scene';
import type { CssLevel } from '../engine/types';
import { sfx } from '../game/sound';
import type { CodeEditorHandle } from './CodeEditor';
import { EditorCard, LevelBrief, Workbench } from './LevelParts';
import type { RegionStats } from './ResultPanel';
import { Scene, type SceneHandle } from './Scene';
import { useLevelFlow } from './useLevelFlow';

interface LevelScreenProps {
  level: CssLevel;
  number: number;
  region: RegionStats;
  /** Ссылка на тропу района — после последнего уровня */
  trailHref: string;
  onNext?: () => void;
}

/** CSS-уровень: студент пишет стили, предметы сцены встают на светящиеся контуры. */
export function LevelScreen({ level, number, region, trailHref, onNext }: LevelScreenProps) {
  const flow = useLevelFlow(level, region, level.starterCss);
  const [statuses, setStatuses] = useState<ItemStatus[]>([]);
  const editorRef = useRef<CodeEditorHandle>(null);
  const sceneRef = useRef<SceneHandle>(null);
  const lintOptions = useMemo(() => lintOptionsFor(level), [level]);
  // Обязательный приём проверяется только по «Сотворить»: пока код пишется, его ещё и не должно быть
  const lintCode = useCallback(
    (text: string) => lintCss(text, lintOptions).problems.filter((problem) => problem.kind !== 'required'),
    [lintOptions],
  );

  function handleChange(next: string) {
    flow.change(next);
    sceneRef.current?.apply(next);
  }

  /** viaKeyboard — сотворили через Ctrl+Enter (для секретного достижения) */
  function cast(viaKeyboard: boolean) {
    const current = flow.codeRef.current;
    sfx.cast();
    const items = sceneRef.current?.apply(current) ?? [];
    const evaluation = evaluate(lintCss(current, lintOptions), items);
    sceneRef.current?.cast(evaluation.passed);
    if (evaluation.passed) sfx.success();
    else sfx.fail();
    if (evaluation.passed) {
      flow.finish({ passed: true, score: scoreSolution(flow.hintsUsed, evaluation.declCount, solutionDeclCount(level)) }, viaKeyboard);
    } else {
      const misses = summarizeMisses(evaluation.items, level.check.groupName, level.check.tolerance);
      // Обязательный приём — когда сцена уже сложилась. Пока предметы не на местах, важнее подсказать, куда их двигать
      const errors = misses.length ? evaluation.errors.filter((problem) => problem.kind !== 'required') : evaluation.errors;
      flow.finish({ passed: false, errors, misses }, viaKeyboard);
    }
  }

  const placed = statuses.filter((s) => s.inPlace).length;

  return (
    <main className={viewsOf(level).length > 1 ? 'level level--mirrors' : 'level'}>
      <LevelBrief level={level} number={number} />

      <section className="stage" aria-label="Сцена">
        <Scene
          ref={sceneRef}
          level={level}
          initialCss={flow.code}
          celebrate={flow.outcome?.kind === 'success'}
          onStatuses={setStatuses}
        />
        {statuses.length > 0 && (
          <div className="stage__status">
            <span>
              На месте: {placed} из {statuses.length}
            </span>
            {groupByMirror(statuses).map(({ tag, items }) => (
              <span key={tag ?? 'scene'} className="stage__dots">
                {tag !== undefined && <span className="stage__mirror">{tag}</span>}
                {items.map((s, i) => (
                  <span
                    key={`${s.name}-${i}`}
                    className={s.inPlace ? 'dot dot--on' : 'dot'}
                    style={{ '--dot': s.color } as CSSProperties}
                    title={s.name}
                  />
                ))}
              </span>
            ))}
          </div>
        )}
      </section>

      <Workbench
        flow={flow}
        level={level}
        region={region}
        trailHref={trailHref}
        onNext={onNext}
        onCast={cast}
        editor={
          <EditorCard
            flow={flow}
            fileName="style.css"
            language="css"
            label="Редактор CSS"
            starter={level.starterCss}
            lint={lintCode}
            onChange={handleChange}
            onCast={cast}
            editorRef={editorRef}
          >
            {/* В уровнях про селекторы без разметки не обойтись — она открыта сразу */}
            <details className="markup" open={Boolean(level.check.style)}>
              <summary>HTML сцены</summary>
              <pre>
                <code>{level.html}</code>
              </pre>
            </details>
            {level.lockedCss && (
              <details className="markup markup--locked" open>
                <summary>Чары Лорда Дефолта — их не изменить</summary>
                <pre>
                  <code>{level.lockedCss.trim()}</code>
                </pre>
              </details>
            )}
          </EditorCard>
        }
      />
    </main>
  );
}

/** Точки «на месте» по зеркалам: 360px ●●● 720px ●●● или обычно ●● под мышкой ●● */
function groupByMirror(statuses: ItemStatus[]): { tag?: string; items: ItemStatus[] }[] {
  const groups = new Map<string | undefined, ItemStatus[]>();
  for (const status of statuses) groups.set(status.view?.tag, [...(groups.get(status.view?.tag) ?? []), status]);
  return Array.from(groups, ([tag, items]) => ({ tag, items }));
}
