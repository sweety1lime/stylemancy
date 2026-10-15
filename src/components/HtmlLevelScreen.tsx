import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { scoreSolution } from '../engine/evaluate';
import { checkGoals, evaluateHtml, parseMarkup } from '../engine/htmlCheck';
import { lintHtml } from '../engine/htmlLint';
import type { HtmlLevel } from '../engine/types';
import { sfx } from '../game/sound';
import { IMAGE_LIBRARY } from '../levels/shared/images';
import type { CodeEditorHandle } from './CodeEditor';
import { GoalList } from './GoalList';
import { HtmlScene } from './HtmlScene';
import { EditorCard, LevelBrief, Workbench } from './LevelParts';
import type { RegionStats } from './ResultPanel';
import { useLevelFlow } from './useLevelFlow';

interface HtmlLevelScreenProps {
  level: HtmlLevel;
  number: number;
  region: RegionStats;
  trailHref: string;
  onNext?: () => void;
}

/** HTML-уровень: студент пишет или чинит разметку, справа — страница и цели, которые загораются. */
export function HtmlLevelScreen({ level, number, region, trailHref, onNext }: HtmlLevelScreenProps) {
  const flow = useLevelFlow(level, region, level.starterHtml);
  const editorRef = useRef<CodeEditorHandle>(null);
  // Страница и цели обновляются, когда студент перестаёт печатать
  const [liveCode, setLiveCode] = useState(flow.code);
  const lintCode = useCallback((text: string) => lintHtml(text, { document: level.document }), [level.document]);
  const goals = useMemo(
    () => checkGoals(liveCode, parseMarkup(liveCode, level.document), level.goals, level.document),
    [liveCode, level],
  );

  useEffect(() => {
    const timer = setTimeout(() => setLiveCode(flow.code), 250);
    return () => clearTimeout(timer);
  }, [flow.code]);

  /** viaKeyboard — сотворили через Ctrl+Enter (для секретного достижения) */
  function cast(viaKeyboard: boolean) {
    const current = flow.codeRef.current;
    setLiveCode(current);
    const evaluation = evaluateHtml(level, current);
    sfx.cast();
    if (evaluation.passed) sfx.success();
    else sfx.fail();
    if (evaluation.passed) {
      flow.finish({ passed: true, score: scoreSolution(flow.hintsUsed, 0, 0) }, viaKeyboard);
    } else {
      const misses = evaluation.goals
        .filter((goal) => !goal.done)
        .map((goal) => `Не выполнено: ${goal.label}${goal.hint ? `. ${goal.hint}` : ''}`);
      flow.finish({ passed: false, errors: evaluation.errors, misses }, viaKeyboard);
    }
  }

  return (
    <main className="level level--html">
      <LevelBrief level={level} number={number} />

      <section className="stage" aria-label="Страница">
        <HtmlScene level={level} code={liveCode} images={IMAGE_LIBRARY} celebrate={flow.outcome?.kind === 'success'} />
        <GoalList goals={goals} />
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
            fileName="index.html"
            language="html"
            label="Редактор HTML"
            starter={level.starterHtml}
            lint={lintCode}
            onChange={flow.change}
            onCast={cast}
            editorRef={editorRef}
          />
        }
      />
    </main>
  );
}
