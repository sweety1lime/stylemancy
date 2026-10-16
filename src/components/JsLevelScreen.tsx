import { useCallback, useEffect, useRef, useState } from 'react';
import { evaluateJs, scoreJs, type JsEvaluation } from '../engine/jsCheck';
import { lintJs } from '../engine/jsLint';
import type { JsLevel } from '../engine/types';
import { sfx } from '../game/sound';
import type { CodeEditorHandle } from './CodeEditor';
import { DungeonScene } from './DungeonScene';
import { JsScene } from './JsScene';
import { EditorCard, LevelBrief, Workbench } from './LevelParts';
import type { RegionStats } from './ResultPanel';
import { useLevelFlow } from './useLevelFlow';

interface JsLevelScreenProps {
  level: JsLevel;
  number: number;
  region: RegionStats;
  trailHref: string;
  onNext?: () => void;
}

/** Сколько ждать после последней клавиши, прежде чем запустить код */
const RUN_DELAY = 400;

/** JS-уровень: студент пишет скрипт, Оракул повторяет вывод, колбы показывают переменные. */
export function JsLevelScreen({ level, number, region, trailHref, onNext }: JsLevelScreenProps) {
  const flow = useLevelFlow(level, region, level.starterJs);
  const editorRef = useRef<CodeEditorHandle>(null);
  // Последняя проверка и код, по которому она сделана: пока код новее — свиток слегка тускнеет
  const [checked, setChecked] = useState<{ code: string; evaluation: JsEvaluation } | null>(null);
  const busy = checked?.code !== flow.code;
  // Запуски асинхронные: показываем только результат последнего
  const ticket = useRef(0);
  const lintCode = useCallback((text: string) => lintJs(text).problems, []);

  // Свиток и колбы обновляются, когда студент перестаёт печатать
  useEffect(() => {
    const id = ++ticket.current;
    const code = flow.code;
    const timer = setTimeout(() => {
      void evaluateJs(level, code).then((evaluation) => {
        if (ticket.current === id) setChecked({ code, evaluation });
      });
    }, RUN_DELAY);
    return () => clearTimeout(timer);
  }, [level, flow.code]);

  /** viaKeyboard — сотворили через Ctrl+Enter (для секретного достижения) */
  async function cast(viaKeyboard: boolean) {
    const current = flow.codeRef.current;
    const id = ++ticket.current;
    sfx.cast();
    const result = await evaluateJs(level, current, true);
    if (ticket.current === id) setChecked({ code: current, evaluation: result });
    if (result.passed) {
      sfx.success();
      flow.finish({ passed: true, score: scoreJs(level, current, flow.hintsUsed) }, viaKeyboard);
    } else {
      sfx.fail();
      flow.finish({ passed: false, errors: result.errors, misses: result.misses }, viaKeyboard);
    }
  }

  return (
    <main className="level level--js">
      <LevelBrief level={level} number={number} cue={flow.outcome} />

      {level.dungeons?.length ? (
        <DungeonScene
          level={level}
          code={checked?.code ?? flow.code}
          evaluation={checked?.evaluation ?? null}
          busy={busy}
          celebrate={flow.outcome?.kind === 'success'}
        />
      ) : (
        <JsScene
          level={level}
          code={checked?.code ?? flow.code}
          evaluation={checked?.evaluation ?? null}
          busy={busy}
          celebrate={flow.outcome?.kind === 'success'}
        />
      )}

      <Workbench
        flow={flow}
        level={level}
        region={region}
        trailHref={trailHref}
        onNext={onNext}
        onCast={(viaKeyboard) => void cast(viaKeyboard)}
        editor={
          <EditorCard
            flow={flow}
            fileName="script.js"
            language="js"
            label="Редактор JavaScript"
            starter={level.starterJs}
            lint={lintCode}
            onChange={flow.change}
            onCast={(viaKeyboard) => void cast(viaKeyboard)}
            editorRef={editorRef}
          />
        }
      />
    </main>
  );
}
