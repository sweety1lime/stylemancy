import { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import { evaluate, lintOptionsFor, scoreSolution, solutionDeclCount } from '../engine/evaluate';
import type { Inspection } from '../engine/inspect';
import { lintCss } from '../engine/lint';
import { stageLevel } from '../engine/rematch';
import { summarizeMisses, viewsOf, type ItemStatus } from '../engine/scene';
import type { CssLevel } from '../engine/types';
import { sfx } from '../game/sound';
import { stats } from '../game/stats';
import type { CodeEditorHandle } from './CodeEditor';
import { GoalList } from './GoalList';
import { LensPanel } from './LensPanel';
import { EditorCard, LevelBrief, LevelResult, Workbench } from './LevelParts';
import { RematchBar, RematchPanel } from './Rematch';
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
  // «Лупа мага»: включена ли и что показывает про выбранный предмет
  const [lens, setLens] = useState(false);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  // Реванш Лорда Дефолта: fight — 0 у обычного уровня и номер натиска в бою, cleared — натиск отбит, ждём «Дальше»
  const [fight, setFight] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [fightHints, setFightHints] = useState(0);
  const [award, setAward] = useState(0);
  const rematch = level.rematch;
  const stage = rematch && fight > 0 ? rematch.stages[fight - 1] : undefined;
  // Уровень таким, какой он на этом натиске: сцена та же, а задача, подсказки, чары и эталон — натиска
  const active = useMemo(() => (stage ? stageLevel(level, stage) : level), [level, stage]);
  const editorRef = useRef<CodeEditorHandle>(null);
  const sceneRef = useRef<SceneHandle>(null);
  const lintOptions = useMemo(() => lintOptionsFor(active), [active]);
  // Заказ жителя: сцена принимается по условиям, а не по контурам целей
  const isOrder = Boolean(active.check.order);
  // Обязательный приём проверяется только по «Сотворить»: пока код пишется, его ещё и не должно быть
  const lintCode = useCallback(
    (text: string) => lintCss(text, lintOptions).problems.filter((problem) => problem.kind !== 'required'),
    [lintOptions],
  );

  function handleChange(next: string) {
    flow.change(next);
    sceneRef.current?.apply(next);
  }

  /** Что не так на сцене: у обычного уровня — какие предметы не на месте, у заказа — какие условия не выполнены */
  function missesOf(items: ItemStatus[]): string[] {
    if (isOrder) return items.filter((item) => !item.inPlace).map((item) => `${item.name}: ${item.message ?? 'не выполнено'}`);
    return summarizeMisses(items, active.check.groupName, active.check.tolerance);
  }

  /** viaKeyboard — сотворили через Ctrl+Enter (для секретного достижения) */
  function cast(viaKeyboard: boolean) {
    const current = flow.codeRef.current;
    sfx.cast();
    const items = sceneRef.current?.apply(current) ?? [];
    const evaluation = evaluate(lintCss(current, lintOptions), items);
    sceneRef.current?.cast(evaluation.passed);
    if (stage && rematch) {
      // Бой не засчитывается уровню: ни попыток, ни звёзд, только отбитый натиск и награда за победу
      if (evaluation.passed) {
        sfx.success();
        flow.report(null);
        setCleared(true);
        if (fight === rematch.stages.length && !stats.get().rematches.includes(level.id)) {
          stats.update((s) => ({ reviewXp: s.reviewXp + rematch.xp, rematches: [...s.rematches, level.id] }));
          setAward(rematch.xp);
        }
      } else {
        sfx.fail();
        const misses = missesOf(evaluation.items);
        const errors = misses.length ? evaluation.errors.filter((problem) => problem.kind !== 'required') : evaluation.errors;
        flow.report({ kind: 'fail', errors, misses });
      }
      return;
    }
    if (evaluation.passed) {
      flow.finish({ passed: true, score: scoreSolution(flow.hintsUsed, evaluation.declCount, solutionDeclCount(level)) }, viaKeyboard);
    } else {
      const misses = missesOf(evaluation.items);
      // Обязательный приём — когда сцена уже сложилась. Пока предметы не на местах, важнее подсказать, куда их двигать
      const errors = misses.length ? evaluation.errors.filter((problem) => problem.kind !== 'required') : evaluation.errors;
      flow.finish({ passed: false, errors, misses }, viaKeyboard);
    }
  }

  function startFight() {
    setFight(1);
    setCleared(false);
    setFightHints(0);
    setAward(0);
    flow.report(null);
  }

  function nextStage() {
    setFight(fight + 1);
    setCleared(false);
    setFightHints(0);
    flow.report(null);
  }

  // В бою подсказки свои у каждого натиска и звёзд не стоят
  const workFlow = stage
    ? {
        ...flow,
        hintsUsed: fightHints,
        hintsLeft: stage.hints.length - fightHints,
        hintLabel: fightHints < stage.hints.length ? `Подсказка ${fightHints + 1} из ${stage.hints.length}` : 'Подсказок больше нет',
        takeHint: () => setFightHints(Math.min(fightHints + 1, stage.hints.length)),
      }
    : flow;

  const placed = statuses.filter((s) => s.inPlace).length;

  return (
    <main className={viewsOf(active).length > 1 ? 'level level--mirrors' : 'level'}>
      <LevelBrief level={active} number={number} cue={flow.outcome} />

      <section className="stage" aria-label="Сцена">
        {stage && rematch && <RematchBar rematch={rematch} stage={fight} cleared={cleared} />}
        <Scene
          key={`${level.id}:${fight}`}
          ref={sceneRef}
          level={active}
          initialCss={flow.code}
          celebrate={flow.outcome?.kind === 'success'}
          onStatuses={setStatuses}
          lens={lens}
          onInspect={setInspection}
        />
        {statuses.length > 0 && (
          <div className="stage__status">
            {!isOrder && (
              <span>
                На месте: <span key={placed} className="placed-count">{placed}</span> из {statuses.length}
              </span>
            )}
            {!isOrder && groupByMirror(statuses).map(({ tag, items }) => (
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
            <button type="button" className="text-button lens-toggle" aria-pressed={lens} onClick={() => setLens(!lens)}>
              Лупа
            </button>
          </div>
        )}
        {isOrder && statuses.length > 0 && (
          <GoalList title="Заказчик хочет" goals={statuses.map((status) => ({ label: status.name, done: status.inPlace, detail: status.message }))} />
        )}
        {lens && <LensPanel inspection={inspection} />}
        {stage && rematch && cleared && <RematchPanel rematch={rematch} stage={fight} award={award} trailHref={trailHref} onNext={nextStage} />}
        <LevelResult flow={flow} level={level} region={region} trailHref={trailHref} onNext={onNext} onRematch={!fight && level.rematch ? startFight : undefined} />
      </section>

      <Workbench
        flow={workFlow}
        level={active}
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
            <details className="markup" open={Boolean(active.check.style)}>
              <summary>HTML сцены</summary>
              <pre>
                <code>{active.html}</code>
              </pre>
            </details>
            {active.lockedCss && (
              <details className="markup markup--locked" open>
                <summary>Чары Лорда Дефолта — их не изменить</summary>
                <pre>
                  <code>{active.lockedCss.trim()}</code>
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
