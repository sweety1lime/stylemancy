import { supabase } from '../lib/supabase';

/*
  Админка суперадмина. Всё идёт через функции базы (supabase/migrations/20261106120000_admin.sql): каждая сама
  проверяет, что вызывает админ, поэтому спрятанной кнопкой или подменой запроса админом не стать.
*/

/** Учитель в списке админки: с почтой и числами */
export interface AdminTeacher {
  id: string;
  nickname: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
  classes: number;
  students: number;
}

/** Класс в списке админки: с числом студентов, пройденных ими уровней и временем последней работы */
export interface AdminClass {
  id: string;
  name: string;
  code: string;
  open_lands: string[];
  created_at: string;
  teacher_id: string;
  students: number;
  levels_done: number;
  last_activity: string | null;
}

export interface AdminOverview {
  teachers: AdminTeacher[];
  classes: AdminClass[];
  /** Сообщения студентов о проблемах в уровнях, которые никто ещё не отметил решёнными */
  feedback_open: number;
}

/** Ошибки базы — понятными словами. */
function fail(error: { message: string }): never {
  const message = error.message ?? '';
  if (/ONLY_ADMINS/.test(message)) throw new Error('Это действие только для админа.');
  if (/NOT_A_TEACHER/.test(message)) throw new Error('Класс можно передать только учителю.');
  if (/CLASS_NOT_FOUND/.test(message)) throw new Error('Такого класса уже нет: обновите страницу.');
  if (/USER_NOT_FOUND/.test(message)) throw new Error('Такого аккаунта уже нет: обновите страницу.');
  if (/CANNOT_DELETE_SELF/.test(message)) throw new Error('Свой аккаунт здесь удалить нельзя.');
  if (/CANNOT_DELETE_ADMIN/.test(message)) throw new Error('Админа здесь удалить нельзя: сначала снимите ему права в базе.');
  if (/CANNOT_CHANGE_ADMIN/.test(message)) throw new Error('Пароль админа здесь не меняется.');
  if (/PASSWORD_TOO_SHORT/.test(message)) throw new Error('Пароль слишком короткий: нужно минимум 6 символов.');
  if (/Could not find the function|PGRST202/.test(message)) {
    throw new Error('В базе нет админских функций: выполните supabase/migrations/20261106120000_admin.sql в SQL Editor.');
  }
  if (/fetch|network/i.test(message)) throw new Error('Нет связи с сервером.');
  throw new Error(`Не получилось: ${message}`);
}

export async function loadOverview(): Promise<AdminOverview> {
  const { data, error } = await supabase.rpc('admin_overview');
  if (error) fail(error);
  const overview = data as Partial<AdminOverview> | null;
  return { teachers: overview?.teachers ?? [], classes: overview?.classes ?? [], feedback_open: overview?.feedback_open ?? 0 };
}

/** Передать класс другому учителю: студенты и прогресс остаются */
export async function moveClass(classId: string, teacherId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_move_class', { target_class: classId, target_teacher: teacherId });
  if (error) fail(error);
}

/** Удалить класс вместе с аккаунтами его студентов */
export async function deleteClass(classId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_class', { target_class: classId });
  if (error) fail(error);
}

/** Удалить аккаунт учителя вместе с его классами и студентами этих классов */
export async function deleteTeacher(teacherId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_user', { target_user: teacherId });
  if (error) fail(error);
}

export async function resetPassword(userId: string, password: string): Promise<void> {
  const { error } = await supabase.rpc('admin_reset_password', { target_user: userId, new_password: password });
  if (error) fail(error);
}
