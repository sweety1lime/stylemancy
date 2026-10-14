import type { AuthError, Session } from '@supabase/supabase-js';
import { useSyncExternalStore } from 'react';
import { supabase } from '../lib/supabase';
import { NOTES_KEY } from './notes';
import { CURRENT_KEY, DRAFTS_KEY, PROGRESS_KEY } from './progress';
import { STATS_KEY } from './stats';
import { copyGuestDataTo, setScope } from './storage';
import { startSync, stopSync } from './sync';

/**
 * Служебные адреса студентов: зона .invalid зарезервирована стандартом (RFC 2606)
 * и никогда не станет настоящей почтой — на такой адрес ничего не может уйти.
 */
const STUDENT_DOMAIN = 'students.stylemancy.invalid';
const GUEST_KEYS = [PROGRESS_KEY, DRAFTS_KEY, CURRENT_KEY, STATS_KEY, NOTES_KEY];

export interface ClassInfo {
  id: string;
  name: string;
  code: string;
  openLands: string[];
}

export interface Account {
  id: string;
  role: 'teacher' | 'student';
  nickname: string;
  email?: string;
  /** Класс студента */
  classInfo?: ClassInfo;
}

interface AuthState {
  ready: boolean;
  account: Account | null;
}

let state: AuthState = { ready: false, account: null };
const listeners = new Set<() => void>();
let currentUserId: string | null = null;
/** После регистрации студента — перенести в аккаунт то, что набрано без входа */
let copyGuestDataOnSignIn = false;

function setState(next: AuthState) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function useAuth(): AuthState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => state,
  );
}

export function currentAccount(): Account | null {
  return state.account;
}

/** Студенту доступны только земли, которые открыл учитель; гостю и учителю — все. */
export function isLandOpen(account: Account | null, landId: string): boolean {
  return !account?.classInfo || account.classInfo.openLands.includes(landId);
}

async function loadAccount(session: Session): Promise<Account> {
  const { user } = session;
  const meta = user.user_metadata ?? {};
  const fallback: Account = {
    id: user.id,
    role: meta.role === 'student' ? 'student' : 'teacher',
    nickname: meta.nickname ?? user.email ?? 'Без имени',
    email: meta.role === 'student' ? undefined : user.email,
  };
  const { data, error } = await supabase
    .from('profiles')
    .select('role, nickname, classes(id, name, code, open_lands)')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !data) return fallback;
  const klass = (Array.isArray(data.classes) ? data.classes[0] : data.classes) as
    | { id: string; name: string; code: string; open_lands: string[] }
    | null;
  return {
    ...fallback,
    role: data.role,
    nickname: data.nickname,
    ...(klass && { classInfo: { id: klass.id, name: klass.name, code: klass.code, openLands: klass.open_lands } }),
  };
}

async function applySession(session: Session | null) {
  const userId = session?.user.id ?? null;
  if (userId === currentUserId && state.ready) return;
  currentUserId = userId;

  if (!session) {
    await stopSync();
    setScope(null);
    setState({ ready: true, account: null });
    return;
  }
  if (copyGuestDataOnSignIn) {
    copyGuestDataOnSignIn = false;
    copyGuestDataTo(session.user.id, GUEST_KEYS);
  }
  setScope(session.user.id);
  const account = await loadAccount(session);
  if (currentUserId !== account.id) return;
  setState({ ready: true, account });
  void startSync(account.id);
}

// Внутри обработчика нельзя сразу обращаться к supabase — откладываем на следующий тик
supabase.auth.onAuthStateChange((_event, session) => {
  setTimeout(() => void applySession(session), 0);
});

/** Обновить данные аккаунта (например, учитель открыл классу новую землю). */
export async function refreshAccount(): Promise<void> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;
  const account = await loadAccount(data.session);
  if (currentUserId === account.id) setState({ ready: true, account });
}

/* ——— Вход и регистрация ——— */

export function normalizeCode(code: string): string {
  return code.replace(/\s+/g, '').toUpperCase();
}

/** Адрес студента: хеш ника (ник может быть кириллицей) + код класса. */
async function studentEmail(classCode: string, nickname: string): Promise<string> {
  const normalized = nickname.trim().replace(/\s+/g, ' ').toLocaleLowerCase('ru-RU');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalized));
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
  return `s${hex.slice(0, 20)}.${classCode.toLowerCase()}@${STUDENT_DOMAIN}`;
}

/** Ошибки Supabase — понятными словами. */
function explain(error: AuthError | Error, who: 'student' | 'teacher'): Error {
  const code = 'code' in error ? String(error.code ?? '') : '';
  const status = 'status' in error ? Number(error.status) : 0;
  const message = error.message ?? '';
  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return new Error(
      who === 'student'
        ? 'Неверный код класса, ник или пароль. Если пароль забыт — его сбросит учитель.'
        : 'Неверная почта или пароль.',
    );
  }
  if (code === 'user_already_exists' || /already registered/i.test(message)) {
    return new Error(
      who === 'student'
        ? 'Такой ник в этом классе уже занят. Если это твой аккаунт — нажми «Войти».'
        : 'Аккаунт с этой почтой уже есть — войдите.',
    );
  }
  if (code === 'weak_password' || /at least 6/i.test(message)) {
    return new Error('Пароль слишком короткий: нужно минимум 6 символов.');
  }
  if (code === 'over_request_rate_limit' || status === 429) {
    return new Error('Слишком много попыток из этой сети. Подождите пару минут и попробуйте снова.');
  }
  if (code === 'email_address_invalid') return new Error('Проверьте адрес почты.');
  if (/fetch|network/i.test(message)) {
    return new Error(
      'Нет связи с сервером. Если интернет работает, возможно, школьная сеть закрывает адрес supabase.co — его должен открыть администратор. А пока можно играть как гость: прогресс сохранится в этом браузере.',
    );
  }
  return new Error(`Не получилось: ${message}`);
}

export async function classNameByCode(code: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('class_name_by_code', { class_code: normalizeCode(code) });
  if (error) throw explain(error, 'student');
  return (data as string | null) ?? null;
}

export async function signUpStudent(input: {
  classCode: string;
  nickname: string;
  password: string;
  keepGuestProgress: boolean;
}): Promise<void> {
  const code = normalizeCode(input.classCode);
  if (!(await classNameByCode(code))) throw new Error('Класса с таким кодом нет — проверь код у учителя.');
  copyGuestDataOnSignIn = input.keepGuestProgress;
  const { error } = await supabase.auth.signUp({
    email: await studentEmail(code, input.nickname),
    password: input.password,
    options: { data: { role: 'student', nickname: input.nickname.trim(), class_code: code } },
  });
  if (error) {
    copyGuestDataOnSignIn = false;
    throw explain(error, 'student');
  }
}

export async function signInStudent(input: { classCode: string; nickname: string; password: string }): Promise<void> {
  const code = normalizeCode(input.classCode);
  const { error } = await supabase.auth.signInWithPassword({
    email: await studentEmail(code, input.nickname),
    password: input.password,
  });
  if (error) throw explain(error, 'student');
}

export async function signUpTeacher(input: { email: string; password: string; name: string }): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { role: 'teacher', nickname: input.name.trim() } },
  });
  if (error) throw explain(error, 'teacher');
}

export async function signInTeacher(input: { email: string; password: string }): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: input.email.trim(), password: input.password });
  if (error) throw explain(error, 'teacher');
}

export async function signOut(): Promise<void> {
  await stopSync();
  await supabase.auth.signOut();
}

/** Удалить свой аккаунт со всем прогрессом. */
export async function deleteMyAccount(): Promise<void> {
  await stopSync();
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw explain(error, 'student');
  await supabase.auth.signOut({ scope: 'local' });
}
