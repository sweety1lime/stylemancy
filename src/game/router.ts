import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';
import { fullEffects, settings } from './settings';

/**
 * Экраны игры. Адрес хранится после «#» — так ссылки работают на любом
 * статическом хостинге (GitHub Pages) без настройки сервера.
 */
export type Route =
  | { name: 'map' }
  | { name: 'scriptoria' }
  | { name: 'land'; id: string }
  | { name: 'level'; id: string }
  | { name: 'grimoire' }
  | { name: 'achievements' }
  | { name: 'login' }
  | { name: 'teacher' }
  /** Админка суперадмина: все учителя, классы и студенты */
  | { name: 'admin' }
  | { name: 'chronicle' }
  | { name: 'daily' }
  /** «Моя земля»: без номера — три ячейки, с номером — редактор земли в этой ячейке */
  | { name: 'myland'; slot?: number }
  /** Чужая земля по ссылке: вся земля зашита в токен (land/share.ts) */
  | { name: 'shared'; code: string }
  | { name: 'certificate'; id: string };

export function parseHash(hash: string): Route {
  const [kind, id] = hash.replace(/^#\/?/, '').split('/');
  if (kind === 'scriptoria') return { name: 'scriptoria' };
  if (kind === 'land' && id) return { name: 'land', id: decodeURIComponent(id) };
  if (kind === 'level' && id) return { name: 'level', id: decodeURIComponent(id) };
  if (kind === 'grimoire') return { name: 'grimoire' };
  if (kind === 'achievements') return { name: 'achievements' };
  if (kind === 'login') return { name: 'login' };
  if (kind === 'teacher') return { name: 'teacher' };
  if (kind === 'admin') return { name: 'admin' };
  if (kind === 'chronicle') return { name: 'chronicle' };
  if (kind === 'daily') return { name: 'daily' };
  if (kind === 'my-land') {
    const slot = id === undefined || id === '' ? NaN : Number(id);
    return Number.isInteger(slot) ? { name: 'myland', slot } : { name: 'myland' };
  }
  // Токен ссылки — латиница, цифры, «-» и «_»: в нём нечего раскодировать
  if (kind === 'shared' && id) return { name: 'shared', code: id };
  if (kind === 'certificate' && id) return { name: 'certificate', id: decodeURIComponent(id) };
  return { name: 'map' };
}

export function hrefFor(route: Route): string {
  switch (route.name) {
    case 'map':
      return '#/';
    case 'scriptoria':
      return '#/scriptoria';
    case 'land':
      return `#/land/${encodeURIComponent(route.id)}`;
    case 'level':
      return `#/level/${encodeURIComponent(route.id)}`;
    case 'grimoire':
      return '#/grimoire';
    case 'achievements':
      return '#/achievements';
    case 'login':
      return '#/login';
    case 'teacher':
      return '#/teacher';
    case 'admin':
      return '#/admin';
    case 'chronicle':
      return '#/chronicle';
    case 'daily':
      return '#/daily';
    case 'myland':
      return route.slot === undefined ? '#/my-land' : `#/my-land/${route.slot}`;
    case 'shared':
      return `#/shared/${route.code}`;
    case 'certificate':
      return `#/certificate/${encodeURIComponent(route.id)}`;
  }
}

export function navigate(route: Route): void {
  window.location.hash = hrefFor(route).slice(1);
}

/** Плавная смена экранов — только в «Сумраке» с полными эффектами. В автотестах браузер рисует без видеокарты: снимки страниц тормозили бы проверки */
function transitionsOn(): boolean {
  return (
    typeof document.startViewTransition === 'function' &&
    settings.get().look === 'noir' &&
    fullEffects() &&
    !navigator.webdriver &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

const listeners = new Set<() => void>();

// Подписчиков несколько (экран и экран сбоя), а переход должен начаться один раз: адрес слушает один обработчик
function onHashChange() {
  const notify = () => listeners.forEach((listener) => listener());
  if (transitionsOn()) document.startViewTransition(() => flushSync(notify));
  else notify();
}

function subscribe(onChange: () => void) {
  if (listeners.size === 0) window.addEventListener('hashchange', onHashChange);
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) window.removeEventListener('hashchange', onHashChange);
  };
}

/** Текущий адрес после «#»; компонент перерисуется при переходе. */
export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash);
}
