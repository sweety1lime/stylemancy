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
