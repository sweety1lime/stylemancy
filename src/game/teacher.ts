import { supabase } from '../lib/supabase';

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

export interface Roster {
  students: StudentRow[];
  progress: ProgressRow[];
  /** student_id → опыт за вопросы на повторение */
  reviewXp: Record<string, number>;
}

/** Ошибки базы — понятными словами. */
function fail(error: { message: string }): never {
  const message = error.message ?? '';
  if (/NOT_YOUR_STUDENT/.test(message)) throw new Error('Это не ваш студент.');
  if (/PASSWORD_TOO_SHORT/.test(message)) throw new Error('Пароль слишком короткий: нужно минимум 6 символов.');
  if (/ONLY_TEACHERS/.test(message)) throw new Error('Классы создают только учителя.');
  if (/fetch|network/i.test(message)) throw new Error('Нет связи с сервером. Проверьте интернет.');
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
  if (!ids.length) return { students: [], progress: [], reviewXp: {} };

  const [progress, stats] = await Promise.all([
    supabase.from('level_progress').select('*').in('student_id', ids),
    supabase.from('student_stats').select('student_id, data').in('student_id', ids),
  ]);
  if (progress.error) fail(progress.error);
  if (stats.error) fail(stats.error);
  const reviewXp: Record<string, number> = {};
  for (const row of stats.data as { student_id: string; data: { stats?: { reviewXp?: number } } }[]) {
    reviewXp[row.student_id] = row.data?.stats?.reviewXp ?? 0;
  }
  return { students: students as StudentRow[], progress: progress.data as ProgressRow[], reviewXp };
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
