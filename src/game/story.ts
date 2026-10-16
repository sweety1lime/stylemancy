import type { Region, StoryCondition, StoryFrame } from '../engine/types';
import { lands, type Land } from '../levels';
import { GAME_PROLOGUE, GRAND_FINALE, SCRIPTORIA_PROLOGUE } from '../levels/storyline';
import { currentAccount } from './auth';
import { progress, type ProgressMap } from './progress';
import { stats } from './stats';

export interface OpenStory {
  /** Ключ «просмотрено»: 'intro:floating-islands', 'prologue:game' */
  key: string;
  title: string;
  frames: StoryFrame[];
  finishLabel: string;
}

export const PROLOGUE_KEY = 'prologue:game';
export const FINALE_KEY = 'finale:game';
export const SCRIPTORIA_KEY = 'prologue:scriptoria';

/**
 * Земля спасена — пройден последний уровень её последнего района (финальное испытание).
 * Земля, где ещё есть районы в тумане, спасённой не считается.
 */
export function isLandDone(land: Land, map: ProgressMap = progress.snapshot()): boolean {
  if (land.upcoming.length > 0) return false;
  const lastRegion = land.regions[land.regions.length - 1];
  const finalLevel = lastRegion?.levels[lastRegion.levels.length - 1];
  return Boolean(finalLevel && map[finalLevel.id]?.completed);
}

/** Спасены все земли королевства — даже те, что пока в тумане, должны быть пройдены. */
export function allLandsDone(map: ProgressMap = progress.snapshot()): boolean {
  return lands.every((land) => isLandDone(land, map));
}

/** Что сюжет знает о герое прямо сейчас. */
interface StoryContext {
  done: Set<string>;
  allDone: boolean;
  /** Следующая открытая и не спасённая земля по порядку курса */
  next?: Land;
  name: string;
}

function storyContext(current?: Land): StoryContext {
  const map = progress.snapshot();
  const done = new Set(lands.filter((land) => isLandDone(land, map)).map((land) => land.id));
  const next = lands.find((land) => land !== current && land.regions.length > 0 && !done.has(land.id));
  return { done, allDone: lands.every((land) => done.has(land.id)), next, name: currentAccount()?.nickname ?? 'странник' };
}

function matches(when: StoryCondition | undefined, ctx: StoryContext): boolean {
  if (!when) return true;
  if (when.firstChapter && ctx.done.size > 0) return false;
  if (when.anyDone && ctx.done.size === 0) return false;
  if (when.done && !when.done.every((id) => ctx.done.has(id))) return false;
  if (when.notDone && when.notDone.some((id) => ctx.done.has(id))) return false;
  if (when.allDone !== undefined && when.allDone !== ctx.allDone) return false;
  if (when.next !== undefined && when.next !== Boolean(ctx.next)) return false;
  return true;
}

/** «в Лесу Селекторов, в Крепости Блоков и в Парящих землях» */
function cursedPlaces(ctx: StoryContext): string {
  const places = lands.filter((land) => !ctx.done.has(land.id)).map((land) => land.where);
  return places.length > 1 ? `${places.slice(0, -1).join(', ')} и ${places[places.length - 1]}` : (places[0] ?? '');
}

/** Кадры, подходящие герою, с подставленными {name}, {next} и {cursed}. */
function resolveFrames(frames: StoryFrame[], ctx: StoryContext): StoryFrame[] {
  return frames
    .filter((frame) => matches(frame.when, ctx))
    .map((frame) => ({
      ...frame,
      text: frame.text
        .replaceAll('{name}', ctx.name)
        .replaceAll('{next}', ctx.next?.title ?? '')
        .replaceAll('{cursed}', cursedPlaces(ctx)),
    }));
}

function landOf(region: Region): Land | undefined {
  return lands.find((land) => land.regions.includes(region));
}

export function storyOf(region: Region, part: 'intro' | 'outro'): OpenStory | null {
  if (!region.story) return null;
  const frames = resolveFrames(region.story[part], storyContext(landOf(region)));
  // Ни один кадр не подошёл герою — сценки нет
  if (!frames.length) return null;
  return part === 'intro'
    ? { key: `intro:${region.id}`, title: `Пролог: ${region.title}`, frames, finishLabel: 'В путь!' }
    : { key: `outro:${region.id}`, title: `Эпилог: ${region.title}`, frames, finishLabel: 'Закрыть' };
}

export function gamePrologue(): OpenStory {
  return { key: PROLOGUE_KEY, title: 'Пролог: Великий Сброс', frames: resolveFrames(GAME_PROLOGUE, storyContext()), finishLabel: 'К карте' };
}

export function scriptoriaPrologue(): OpenStory {
  return { key: SCRIPTORIA_KEY, title: 'Пролог: За дверью <script>', frames: resolveFrames(SCRIPTORIA_PROLOGUE, storyContext()), finishLabel: 'В Скрипторию' };
}

export function grandFinale(): OpenStory {
  return { key: FINALE_KEY, title: 'Финал: Магистр Стилемантии', frames: resolveFrames(GRAND_FINALE, storyContext()), finishLabel: 'Закрыть' };
}

export function isSeen(key: string): boolean {
  return Boolean(stats.get().seen[key]);
}

export function markSeen(key: string): void {
  stats.update((s) => ({ seen: { ...s.seen, [key]: true } }));
}
