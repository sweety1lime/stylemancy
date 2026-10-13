import type { Region, StoryFrame } from '../engine/types';
import { stats } from './stats';

export interface OpenStory {
  /** Ключ «просмотрено»: 'intro:floating-islands' */
  key: string;
  title: string;
  frames: StoryFrame[];
  finishLabel: string;
}

export function storyOf(region: Region, part: 'intro' | 'outro'): OpenStory | null {
  if (!region.story) return null;
  return part === 'intro'
    ? { key: `intro:${region.id}`, title: `Пролог: ${region.title}`, frames: region.story.intro, finishLabel: 'В путь!' }
    : { key: `outro:${region.id}`, title: `Эпилог: ${region.title}`, frames: region.story.outro, finishLabel: 'Закрыть' };
}

export function isSeen(key: string): boolean {
  return Boolean(stats.get().seen[key]);
}

export function markSeen(key: string): void {
  stats.update((s) => ({ seen: { ...s.seen, [key]: true } }));
}
