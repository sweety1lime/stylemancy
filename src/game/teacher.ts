import { supabase } from '../lib/supabase';
import type { FeedbackKind } from './feedback';

export interface ClassRow {
  id: string;
  name: string;
  code: string;
  open_lands: string[];
  created_at: string;
}

export interface StudentRow {
  id: string;
  nickname: string;
  created_at: string;
}

export interface ProgressRow {
  student_id: string;
  level_id: string;
  completed: boolean;
  stars: number;
  attempts: number;
  hints_used: number;
  best_code: string | null;
  updated_at: string;
}

/** Сообщение студента о проблеме в уровне */
export interface FeedbackRow {
  id: string;
  student_id: string;
  level_id: string;
  kind: FeedbackKind;
  message: string;
  code: string | null;
  resolved: boolean;
  created_at: string;
}

export interface Roster {
  students: StudentRow[];
  progress: ProgressRow[];
  /** student_id → опыт за вопросы на повторение */
  reviewXp: Record<string, number>;
  /** Сообщения о проблемах: сначала новые */
  feedback: FeedbackRow[];
}

/** Ошибки базы — понятными словами. */
function fail(error: { message: string }): never {
  const message = error.message ?? '';
  if (/NOT_YOUR_STUDENT/.test(message)) throw new Error('Это не ваш студент.');
  if (/PASSWORD_TOO_SHORT/.test(message)) throw new Error('Пароль слишком короткий: нужно минимум 6 символов.');
  if (/ONLY_TEACHERS/.test(message)) throw new Error('Классы создают только учителя.');
  if (/fetch|network/i.test(message)) {
    throw new Error('Нет связи с сервером. Если интернет работает, возможно, сеть закрывает адрес supabase.co — попросите администратора его открыть.');
  }
  throw new Error(`Не получилось: ${message}`);
}

export async function listClasses(teacherId: string): Promise<ClassRow[]> {
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, code, open_lands, created_at')
    .eq('teacher_id', teacherId)
    .order('created_at');
  if (error) fail(error);
  return data as ClassRow[];
}

export async function createClass(name: string): Promise<ClassRow> {
  const { data, error } = await supabase.rpc('create_class', { class_name: name });
  if (error) fail(error);
  return data as ClassRow;
}

export async function loadRoster(classId: string): Promise<Roster> {
  const { data: students, error } = await supabase
    .from('profiles')
    .select('id, nickname, created_at')
    .eq('class_id', classId)
    .order('nickname');
  if (error) fail(error);
  const ids = (students as StudentRow[]).map((student) => student.id);
  if (!ids.length) return { students: [], progress: [], reviewXp: {}, feedback: [] };

  const [progress, stats, feedback] = await Promise.all([
    supabase.from('level_progress').select('*').in('student_id', ids),
    supabase.from('student_stats').select('student_id, data').in('student_id', ids),
    supabase
      .from('feedback')
      .select('id, student_id, level_id, kind, message, code, resolved, created_at')
      .in('student_id', ids)
      .order('created_at', { ascending: false })
      .limit(200),
  ]);
  if (progress.error) fail(progress.error);
  if (stats.error) fail(stats.error);
  const reviewXp: Record<string, number> = {};
  for (const row of stats.data as { student_id: string; data: { stats?: { reviewXp?: number } } }[]) {
    reviewXp[row.student_id] = row.data?.stats?.reviewXp ?? 0;
  }
  return {
    students: students as StudentRow[],
    progress: progress.data as ProgressRow[],
    reviewXp,
    // Если таблицы сообщений ещё нет в базе, панель работает и без них
    feedback: feedback.error ? [] : (feedback.data as FeedbackRow[]),
  };
}

export async function setFeedbackResolved(id: string, resolved: boolean): Promise<void> {
  const { error } = await supabase.from('feedback').update({ resolved }).eq('id', id);
  if (error) fail(error);
}

export async function deleteFeedback(id: string): Promise<void> {
  const { error } = await supabase.from('feedback').delete().eq('id', id);
  if (error) fail(error);
}

export async function setOpenLands(classId: string, lands: string[]): Promise<void> {
  const { error } = await supabase.from('classes').update({ open_lands: lands }).eq('id', classId);
  if (error) fail(error);
}

export async function resetStudentPassword(studentId: string, password: string): Promise<void> {
  const { error } = await supabase.rpc('reset_student_password', { student: studentId, new_password: password });
  if (error) fail(error);
}

export async function removeStudent(studentId: string): Promise<void> {
  const { error } = await supabase.rpc('remove_student', { student: studentId });
  if (error) fail(error);
}
