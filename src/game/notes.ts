import { useSyncExternalStore } from 'react';
import { onScopeChange, read, scopedKey, write } from './storage';

// Ключи хранят рабочее название проекта: не переименовывать — у всех сбросится прогресс
export const NOTES_KEY = 'cascadia.notes.v1';

let notes = read<Record<string, string>>(scopedKey(NOTES_KEY), {});
const listeners = new Set<() => void>();
const changeListeners = new Set<() => void>();

onScopeChange(() => {
  notes = read<Record<string, string>>(scopedKey(NOTES_KEY), {});
  listeners.forEach((listener) => listener());
});

/** Заметки студента к заклинаниям гримуара. */
export const notesStore = {
  get: (): Record<string, string> => notes,
  set(spell: string, text: string) {
    notes = { ...notes, [spell]: text };
    write(scopedKey(NOTES_KEY), notes);
    listeners.forEach((listener) => listener());
    changeListeners.forEach((listener) => listener());
  },
  /** Заметки с сервера: локальные важнее — их студент мог дописать без связи */
  mergeRemote(remote: Record<string, string>) {
    notes = { ...remote, ...notes };
    write(scopedKey(NOTES_KEY), notes);
    listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  onChange(listener: () => void) {
    changeListeners.add(listener);
    return () => {
      changeListeners.delete(listener);
    };
  },
};

export function useNotes(): Record<string, string> {
  return useSyncExternalStore(notesStore.subscribe, notesStore.get);
}
