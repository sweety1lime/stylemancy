import type { ReactNode, Ref } from 'react';
import type { Problem } from '../engine/lint';
import type { Level } from '../engine/types';
import { useAuth } from '../game/auth';
import { SPELLS } from '../game/spells';
import { CodeEditor, type CodeEditorHandle, type EditorLanguage } from './CodeEditor';
import { FeedbackDialog } from './FeedbackDialog';
import { Hero, type HeroCue } from './Hero';
import { Portrait } from './Portrait';
import { ResultPanel, type RegionStats } from './ResultPanel';
import { ReviewCard } from './ReviewCard';
import { RichText } from './RichText';
import { StoryScene } from './StoryScene';
import type { LevelFlow } from './useLevelFlow';

/** Шапка уровня: район, название, реплики персонажа и задача. cue — итог последнего заклинания: наставник на него реагирует. */
export function LevelBrief({ level, number, cue }: { level: Level; number: number; cue?: HeroCue | null }) {
  return (
    <section className="brief">
      <p className="brief__eyebrow">
        {level.regionTitle} · уровень {number}
      </p>
      <h1 className="brief__title">{level.title}</h1>
      <div className="dialog px-panel">
        <Portrait id={level.npc.portrait} cue={cue} />
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
  );
}

interface EditorCardProps {
  flow: LevelFlow;
  fileName: string;
  language: EditorLanguage;
  label: string;
  /** С чего начать заново */
  starter: string;
  lint: (text: string) => Problem[];
  onChange: (text: string) => void;
  onCast: (viaKeyboard: boolean) => void;
  editorRef: Ref<CodeEditorHandle> & { current: CodeEditorHandle | null };
  /** Что показать под редактором — например, HTML сцены */
  children?: ReactNode;
}

/** Карточка редактора: имя файла, «Сообщить о проблеме», «Начать заново» и сам редактор. */
export function EditorCard({ flow, fileName, language, label, starter, lint, onChange, onCast, editorRef, children }: EditorCardProps) {
  const { account } = useAuth();
  return (
    <div className="editor-card px-panel">
      <div className="editor-card__head">
        <span className="editor-card__file">{fileName}</span>
        <span className="editor-card__tools">
          {account?.role === 'student' && (
            <button type="button" className="text-button" onClick={() => flow.setReporting(true)}>
              Сообщить о проблеме
            </button>
          )}
          <button type="button" className="text-button" onClick={() => editorRef.current?.setValue(starter)}>
            Начать заново
          </button>
        </span>
      </div>
      <CodeEditor
        ref={editorRef}
        language={language}
        initialValue={flow.code}
        onChange={onChange}
        lint={lint}
        onSubmit={() => onCast(true)}
        label={label}
        autoFocus
      />
      {children}
    </div>
  );
}

interface WorkbenchProps {
  flow: LevelFlow;
  level: Level;
  region: RegionStats;
  trailHref: string;
  onNext?: () => void;
  onCast: (viaKeyboard: boolean) => void;
  editor: ReactNode;
}

/** Правая колонка уровня: редактор, подсказки, итог попытки, вопрос на повторение и сценки. */
export function Workbench({ flow, level, region, trailHref, onNext, onCast, editor }: WorkbenchProps) {
  const { account } = useAuth();
  const spell = level.learns ? SPELLS[level.learns] : undefined;
  return (
    <section className="workbench" aria-label="Код">
      {editor}

      <div className="actions">
        <Hero cue={flow.outcome} />
        <button type="button" className="button button--ghost" onClick={flow.takeHint} disabled={flow.hintsLeft <= 0}>
          {flow.hintLabel}
        </button>
        <button type="button" className="button button--cast" onClick={() => onCast(false)}>
          ✦ Сотворить <kbd>Ctrl+Enter</kbd>
        </button>
      </div>

      {flow.hintsUsed > 0 && (
        <ol className="hints">
          {level.hints.slice(0, flow.hintsUsed).map((hint, i) => (
            <li key={hint} className="hint px-panel">
              <span className="hint__label">Подсказка {i + 1}</span>
              <RichText text={hint} />
            </li>
          ))}
        </ol>
      )}

      {flow.outcome && (
        <ResultPanel
          outcome={flow.outcome}
          code={flow.code}
          spell={spell}
          region={region}
          trailHref={trailHref}
          onNext={onNext}
          onFinale={flow.outro ? () => flow.showStory(flow.outro) : undefined}
        />
      )}

      {flow.review && (
        <ReviewCard
          question={flow.review.question}
          seed={flow.review.seed}
          heading="Вопрос на повторение"
          onDone={flow.closeReview}
          onSkip={flow.skipReview}
        />
      )}

      {flow.reporting && account && (
        <FeedbackDialog
          studentId={account.id}
          levelId={level.id}
          levelTitle={level.title}
          code={flow.code}
          onClose={() => flow.setReporting(false)}
        />
      )}

      {flow.story && (
        <StoryScene
          key={flow.story.key}
          title={flow.story.title}
          frames={flow.story.frames}
          finishLabel={flow.story.finishLabel}
          onClose={flow.closeStory}
        />
      )}
    </section>
  );
}
