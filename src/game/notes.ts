import { useSyncExternalStore } from 'react';
import { read, write } from './storage';

// Ключи хранят рабочее название проекта: не переименовывать — у всех сбросится прогресс
const KEY = 'cascadia.notes.v1';

let notes = read<Record<string, string>>(KEY, {});
const listeners = new Set<() => void>();

/** Заметки студента к заклинаниям гримуара. */
export const notesStore = {
  get: (): Record<string, string> => notes,
  set(spell: string, text: string) {
    notes = { ...notes, [spell]: text };
    write(KEY, notes);
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useNotes(): Record<string, string> {
  return useSyncExternalStore(notesStore.subscribe, notesStore.get);
}
