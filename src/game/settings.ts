import { useSyncExternalStore } from 'react';
import { read, write } from './storage';

/** Настройки этого компьютера — общие для всех, кто за ним играет. */
export interface Settings {
  /** Звук включён. По умолчанию нет: на уроке должно быть тихо */
  sound: boolean;
  /** Полные эффекты или лёгкие — для слабых компьютеров и тех, кому мешает движение */
  effects: 'full' | 'light';
  /** Вид игры: «Сумрак» — силуэты в лунном свете (по умолчанию) или прежний пиксель-арт (сейчас спрятан, см. PIXEL_LOOK_AVAILABLE) */
  look: 'pixel' | 'noir';
  /** Игрок сам выбрал эффекты кнопкой: тогда игра их не переключает (см. frameWatch.ts) */
  effectsChosen?: boolean;
}

const KEY = 'cascadia.settings.v1';

/**
 * Пиксельный вид спрятан: на сайте игра открывается только в «Сумраке», переключателя нет, а сохранённый когда-то выбор
 * «pixel» не действует. Код пикселя остаётся в игре и включается при запуске переменной VITE_PIXEL_LOOK=1: так автотесты
 * проверяют оба вида (playwright.config.ts), а для разработки: `$env:VITE_PIXEL_LOOK=1; npm run dev`.
 */
export const PIXEL_LOOK_AVAILABLE = import.meta.env.VITE_PIXEL_LOOK === '1';

/** Вид, который можно показать: спрятанный пиксельный заменяется «Сумраком» */
function withLook(next: Settings): Settings {
  return PIXEL_LOOK_AVAILABLE || next.look === 'noir' ? next : { ...next, look: 'noir' };
}

function defaults(): Settings {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { sound: false, effects: reduced ? 'light' : 'full', look: 'noir' };
}

let state: Settings = withLook({ ...defaults(), ...read<Partial<Settings>>(KEY, {}) });
const listeners = new Set<() => void>();

/** Лёгкие эффекты и вид — классы на <html>: по ним CSS выключает фоновые анимации и включает оформление «Сумрака». */
function applyEffectsClass() {
  document.documentElement.classList.toggle('effects-light', state.effects === 'light');
  document.documentElement.classList.toggle('look-noir', state.look === 'noir');
}
applyEffectsClass();

export const settings = {
  get: (): Settings => state,
  update(patch: Partial<Settings>) {
    state = withLook({ ...state, ...patch });
    write(KEY, state);
    applyEffectsClass();
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSettings(): Settings {
  return useSyncExternalStore(settings.subscribe, settings.get);
}

/** Можно ли сейчас показывать полные эффекты: частицы, перелёты предметов, живой фон. */
export function fullEffects(): boolean {
  return state.effects === 'full';
}
