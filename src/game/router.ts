import { useSyncExternalStore } from 'react';

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
  | { name: 'chronicle' }
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
  if (kind === 'chronicle') return { name: 'chronicle' };
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
    case 'chronicle':
      return '#/chronicle';
    case 'certificate':
      return `#/certificate/${encodeURIComponent(route.id)}`;
  }
}

export function navigate(route: Route): void {
  window.location.hash = hrefFor(route).slice(1);
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

/** Текущий адрес после «#»; компонент перерисуется при переходе. */
export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash);
}
