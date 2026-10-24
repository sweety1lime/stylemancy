import { SESSION_STORAGE_KEY } from '../lib/config';

/** Чтение из localStorage: при любой ошибке (нет доступа, битые данные) — значение по умолчанию. */
export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Хранилище недоступно (например, приватный режим) — данные доживут до перезагрузки
  }
}

/*
 * Чьи данные сейчас в работе: гостя или аккаунта. За одним учебным компьютером сидят
 * разные студенты, поэтому у каждого аккаунта свои ключи, а гость пользуется старыми.
 */

/** id вошедшего пользователя из сохранённой сессии — известен сразу при запуске. */
function storedUserId(): string | null {
  const session = read<{ user?: { id?: string } } | null>(SESSION_STORAGE_KEY, null);
  return session?.user?.id ?? null;
}

let scope: string | null = storedUserId();
const scopeListeners = new Set<() => void>();

/** Ключ для текущего владельца данных: 'cascadia.progress.v1' → 'cascadia.u.<id>.progress.v1'. */
export function scopedKey(key: string): string {
  return scope ? key.replace(/^cascadia\./, `cascadia.u.${scope}.`) : key;
}

export function currentScope(): string | null {
  return scope;
}

/** Сменить владельца данных (вход или выход); хранилища перечитают свои данные. */
export function setScope(userId: string | null): void {
  if (scope === userId) return;
  scope = userId;
  scopeListeners.forEach((listener) => listener());
}

export function onScopeChange(listener: () => void): () => void {
  scopeListeners.add(listener);
  return () => {
    scopeListeners.delete(listener);
  };
}

/** Скопировать данные гостя в аккаунт — когда студент впервые регистрируется после игры без входа. */
export function copyGuestDataTo(userId: string, keys: string[]): void {
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) localStorage.setItem(key.replace(/^cascadia\./, `cascadia.u.${userId}.`), raw);
    } catch {
      // Нет доступа к хранилищу — переносить нечего
    }
  }
}

/** Стереть с этого компьютера всё, что хранилось под ключами аккаунта. */
export function forgetUserData(userId: string): void {
  try {
    const prefix = `cascadia.u.${userId}.`;
    for (const key of Object.keys(localStorage)) if (key.startsWith(prefix)) localStorage.removeItem(key);
  } catch {
    // Нет доступа к хранилищу, стирать нечего
  }
}
