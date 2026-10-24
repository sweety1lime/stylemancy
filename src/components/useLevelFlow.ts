import { useEffect, useMemo, useRef, useState } from 'react';
import type { Score } from '../engine/evaluate';
import type { Problem } from '../engine/lint';
import type { Level } from '../engine/types';
import { recordCast, recordSuccess } from '../game/achievements';
import { currentLevel, drafts, progress } from '../game/progress';
import { rankFor, totalXp } from '../game/ranks';
import { learnedSpells, pickQuestion, reviewIsDue, skipReview, type ReviewQuestion } from '../game/review';
import { sfx } from '../game/sound';
import { stats } from '../game/stats';
import {
  allLandsDone,
  allScriptLandsDone,
  FINALE_KEY,
  grandFinale,
  isSeen,
  markSeen,
  SCRIPTORIA_FINALE_KEY,
  scriptoriaFinale,
  storyOf,
  type OpenStory,
} from '../game/story';
import { findLevel } from '../levels';
import type { Outcome, RegionStats } from './ResultPanel';

/** Итог проверки: прошло — со звёздами, нет — с ошибками в коде и тем, что ещё не так. */
export type Attempt = { passed: true; score: Score } | { passed: false; errors: Problem[]; misses: string[] };

/**
 * Общее у всех уровней: черновик, подсказки, попытки, звук итога, звёзды и опыт, достижения,
 * победная сценка района, вопрос на повторение и сообщение учителю.
 */
export function useLevelFlow(level: Level, region: RegionStats, starter: string) {
  const [code, setCode] = useState(() => drafts.get(level.id) ?? starter);
  const [hintsUsed, setHintsUsed] = useState(() => progress.get(level.id).hintsUsed);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [review, setReview] = useState<{ question: ReviewQuestion; seed: number } | null>(null);
  // Сценки по очереди: эпилог района, а если спасено всё королевство — общий финал
  const [stories, setStories] = useState<OpenStory[]>([]);
  const [reporting, setReporting] = useState(false);
  const codeRef = useRef(code);
  const place = useMemo(() => findLevel(level.id), [level.id]);
  // Район пройден целиком — можно посмотреть победную сцену
  const outro = place && region.completed === region.total ? storyOf(place.region, 'outro') : null;

  // На карте появится кнопка «Продолжить» с этим уровнем
  useEffect(() => {
    currentLevel.set(level.id);
  }, [level.id]);

  // Черновик сохраняется, пока студент печатает
  useEffect(() => {
    const timer = setTimeout(() => drafts.save(level.id, code), 400);
    return () => clearTimeout(timer);
  }, [level.id, code]);

  function change(next: string) {
    codeRef.current = next;
    setCode(next);
    setOutcome(null);
  }

  /** viaKeyboard — сотворили через Ctrl+Enter (для секретного достижения) */
  function finish(attempt: Attempt, viaKeyboard: boolean) {
    if (attempt.passed) sfx.success();
    else sfx.fail();
    const current = codeRef.current;
    const found = recordCast(current, viaKeyboard);
    progress.addAttempt(level.id);
    if (!attempt.passed) {
      setOutcome({ kind: 'fail', errors: attempt.errors, misses: attempt.misses });
      return;
    }
    const { score } = attempt;
    const firstTime = !progress.get(level.id).completed;
    const xp = () => totalXp(progress.snapshot(), stats.get().reviewXp);
    const xpBefore = xp();
    progress.complete(level.id, score.stars, current);
    found.push(...recordSuccess({ level, code: current, hintsUsed, firstTime }));
    // Последний уровень района пройден — победная сцена (один раз сама, потом по кнопке)
    const queue: OpenStory[] = [];
    const finale = place && place.region.levels.every((item) => progress.get(item.id).completed) ? storyOf(place.region, 'outro') : null;
    if (finale && !isSeen(finale.key)) queue.push(finale);
    if (allLandsDone() && !isSeen(FINALE_KEY)) queue.push(grandFinale());
    if (allScriptLandsDone() && !isSeen(SCRIPTORIA_FINALE_KEY)) queue.push(scriptoriaFinale());
    if (queue.length) setStories(queue);
    // Раз в два новых уровня — вопрос по заклинанию, которое дольше всех не вспоминали
    if (firstTime && reviewIsDue()) {
      const question = pickQuestion(learnedSpells(progress.snapshot()), level.learns);
      if (question) setReview({ question, seed: stats.get().completions });
    }
    const xpAfter = xp();
    const rankBefore = rankFor(xpBefore).rank;
    const rankAfter = rankFor(xpAfter).rank;
    setOutcome({
      kind: 'success',
      score,
      xpGain: xpAfter - xpBefore,
      newRank: rankAfter !== rankBefore ? rankAfter.title : undefined,
      achievements: found,
    });
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

  return {
    code,
    codeRef,
    change,
    finish,
    outcome,
    hintsUsed,
    hintsLeft,
    hintLabel,
    takeHint,
    review,
    closeReview: () => setReview(null),
    skipReview: () => {
      skipReview();
      setReview(null);
    },
    story: stories[0] ?? null,
    showStory: (next: OpenStory | null) => setStories(next ? [next] : []),
    closeStory: () => {
      if (stories[0]) markSeen(stories[0].key);
      setStories(stories.slice(1));
    },
    outro,
    reporting,
    setReporting,
  };
}

export type LevelFlow = ReturnType<typeof useLevelFlow>;
