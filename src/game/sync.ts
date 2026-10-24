import { supabase } from '../lib/supabase';
import { notesStore } from './notes';
import { progress, type LevelProgress, type ProgressMap } from './progress';
import { mergeStats, stats, type Stats } from './stats';

/*
 * Синхронизация с сервером для вошедшего пользователя. Источник правды — браузер:
 * изменения сохраняются сразу локально и через секунду уходят на сервер. При входе
 * данные с сервера сливаются с локальными — из двух версий берётся лучшее.
 */

interface ProgressRow {
  student_id: string;
  level_id: string;
  completed: boolean;
  stars: number;
  attempts: number;
  hints_used: number;
  best_code: string | null;
  completed_at: string | null;
}

interface StatsDocument {
  stats?: Partial<Stats>;
  notes?: Record<string, string>;
}

let userId: string | null = null;
let unsubscribe: (() => void)[] = [];
const dirtyLevels = new Set<string>();
let statsDirty = false;
let timer: ReturnType<typeof setTimeout> | undefined;

function fromRow(row: ProgressRow): LevelProgress {
  return {
    completed: row.completed,
    stars: row.stars,
    attempts: row.attempts,
    hintsUsed: row.hints_used,
    ...(row.completed_at && { completedAt: row.completed_at }),
    ...(row.best_code && { bestCode: row.best_code }),
  };
}

function toRow(student: string, levelId: string, item: LevelProgress): ProgressRow & { updated_at: string } {
  return {
    student_id: student,
    level_id: levelId,
    completed: item.completed,
    stars: item.stars,
    attempts: item.attempts,
    hints_used: item.hintsUsed,
    best_code: item.bestCode ?? null,
    completed_at: item.completedAt ?? null,
    updated_at: new Date().toISOString(),
  };
}

function schedule(delay = 1000) {
  clearTimeout(timer);
  timer = setTimeout(() => void flush(), delay);
}

async function flush() {
  const owner = userId;
  if (!owner) return;
  const levels = [...dirtyLevels];
  dirtyLevels.clear();
  const sendStats = statsDirty;
  statsDirty = false;

  const requests = [];
  if (levels.length) {
    const rows = levels.map((id) => toRow(owner, id, progress.get(id)));
    requests.push(supabase.from('level_progress').upsert(rows).then(({ error }) => {
      if (error) levels.forEach((id) => dirtyLevels.add(id));
      return error;
    }));
  }
  if (sendStats) {
    const data: StatsDocument = { stats: stats.get(), notes: notesStore.get() };
    requests.push(
      supabase
        .from('student_stats')
        .upsert({ student_id: owner, data, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) statsDirty = true;
          return error;
        }),
    );
  }
  const errors = (await Promise.all(requests)).filter(Boolean);
  // Нет связи или сервер недоступен — повторим позже, локально всё сохранено
  if (errors.length && userId === owner) schedule(15000);
}

/** Отправить сразу, не дожидаясь таймера: вернулась сеть или вкладку прячут, а то и закрывают. */
function flushNow() {
  if (!dirtyLevels.size && !statsDirty) return;
  clearTimeout(timer);
  void flush();
}

function flushWhenHidden() {
  if (document.visibilityState === 'hidden') flushNow();
}

/** Начать синхронизацию: скачать, слить с локальным, дальше отправлять изменения. */
export async function startSync(id: string): Promise<void> {
  await stopSync();
  userId = id;

  const [levels, statsRow] = await Promise.all([
    supabase.from('level_progress').select('*').eq('student_id', id),
    supabase.from('student_stats').select('data').eq('student_id', id).maybeSingle(),
  ]);
  if (userId !== id) return;

  if (!levels.error) {
    const remote: ProgressMap = {};
    for (const row of levels.data as ProgressRow[]) remote[row.level_id] = fromRow(row);
    progress.mergeRemote(remote).forEach((levelId) => dirtyLevels.add(levelId));
  }
  if (!statsRow.error) {
    const remote = (statsRow.data?.data ?? {}) as StatsDocument;
    stats.replace(mergeStats(stats.get(), remote.stats ?? {}));
    notesStore.mergeRemote(remote.notes ?? {});
    statsDirty = true;
  }

  window.addEventListener('online', flushNow);
  document.addEventListener('visibilitychange', flushWhenHidden);
  unsubscribe = [
    () => window.removeEventListener('online', flushNow),
    () => document.removeEventListener('visibilitychange', flushWhenHidden),
    progress.onLevelChange((levelId) => {
      dirtyLevels.add(levelId);
      schedule();
    }),
    stats.onChange(() => {
      statsDirty = true;
      schedule();
    }),
    notesStore.onChange(() => {
      statsDirty = true;
      schedule(2000);
    }),
  ];
  schedule(200);
}

/** Выход: отправить то, что не успело уйти, и остановиться. */
export async function stopSync(): Promise<void> {
  clearTimeout(timer);
  unsubscribe.forEach((stop) => stop());
  unsubscribe = [];
  if (userId && (dirtyLevels.size || statsDirty)) await flush();
  userId = null;
  dirtyLevels.clear();
  statsDirty = false;
}
