import { useSyncExternalStore } from 'react';
import { read, write } from './storage';

/** Настройки этого компьютера — общие для всех, кто за ним играет. */
export interface Settings {
  /** Звук включён. По умолчанию нет: на уроке должно быть тихо */
  sound: boolean;
  /** Полные эффекты или лёгкие — для слабых компьютеров и тех, кому мешает движение */
  effects: 'full' | 'light';
  /** Вид игры: пиксель-арт или «Сумрак» — силуэты в лунном свете (пока только Парящие острова) */
  look: 'pixel' | 'noir';
}

const KEY = 'cascadia.settings.v1';

function defaults(): Settings {
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { sound: false, effects: reduced ? 'light' : 'full', look: 'pixel' };
}

let state: Settings = { ...defaults(), ...read<Partial<Settings>>(KEY, {}) };
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
    state = { ...state, ...patch };
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
