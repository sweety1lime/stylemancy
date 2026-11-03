import type { Sprite } from '../pixel/pixelArt';
import * as SPRITES from '../pixel/sprites';
import { colorKey, parseColor, type Rgba } from './color';

/** Один экспонат мастерской: спрайт или анимация, найденные в экспортах sprites.ts. */
export interface Entry {
  /** Путь в коде: GEMS.amethyst.sprite, HERO_ANIMATIONS.walk */
  id: string;
  /** Имя экспорта верхнего уровня — по нему спрайты группируются */
  group: string;
  frames: Sprite[];
  width: number;
  height: number;
}

export function isSprite(value: unknown): value is Sprite {
  if (!value || typeof value !== 'object') return false;
  const { rows, palette } = value as Partial<Sprite>;
  return Array.isArray(rows) && rows.every((row) => typeof row === 'string') && !!palette && typeof palette === 'object';
}

function isFrames(value: unknown): value is Sprite[] {
  return Array.isArray(value) && value.length > 0 && value.every(isSprite);
}

export function sizeOf(frames: Sprite[]): { width: number; height: number } {
  return {
    width: Math.max(...frames.map((frame) => Math.max(...frame.rows.map((row) => row.length)))),
    height: Math.max(...frames.map((frame) => frame.rows.length)),
  };
}

/** Обходит экспорт вглубь: спрайты бывают в словарях (GEMS.ruby.sprite) и словарях анимаций. */
function walk(value: unknown, path: string, group: string, out: Entry[]): void {
  if (isSprite(value) || isFrames(value)) {
    const frames = isSprite(value) ? [value] : value;
    out.push({ id: path, group, frames, ...sizeOf(frames) });
    return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  for (const [key, inner] of Object.entries(value)) walk(inner, `${path}.${key}`, group, out);
}

/** Все спрайты игры, по алфавиту: экспорты модуля JS отдаёт отсортированными. */
export function collectEntries(): Entry[] {
  const out: Entry[] = [];
  for (const [name, value] of Object.entries(SPRITES)) walk(value, name, name, out);
  return out;
}

/** Буквы, которые реально стоят в строках: в палитре бывают лишние (после recolor). */
export function usedLetters(frames: Sprite[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const frame of frames) {
    for (const row of frame.rows) {
      for (const ch of row) {
        if (ch === '.' || !(ch in frame.palette)) continue;
        counts.set(ch, (counts.get(ch) ?? 0) + 1);
      }
    }
  }
  return counts;
}

export interface PaletteColor {
  key: string;
  rgba: Rgba;
  /** Сколько пикселей этого цвета во всех спрайтах */
  pixels: number;
  /** id спрайтов, где он встречается */
  entries: Set<string>;
}

/** Все цвета игры: сколько пикселей и в каких спрайтах. */
export function collectPalette(entries: Entry[]): PaletteColor[] {
  const colors = new Map<string, PaletteColor>();
  for (const entry of entries) {
    const palette = entry.frames[0].palette;
    for (const [letter, pixels] of usedLetters(entry.frames)) {
      const css = palette[letter];
      if (!css) continue;
      const key = colorKey(css);
      let color = colors.get(key);
      if (!color) {
        color = { key, rgba: parseColor(css), pixels: 0, entries: new Set() };
        colors.set(key, color);
      }
      color.pixels += pixels;
      color.entries.add(entry.id);
    }
  }
  return [...colors.values()];
}

/** Использует ли спрайт цвет (по ключу colorKey). */
export function entryUsesColor(entry: Entry, key: string): boolean {
  const palette = entry.frames[0].palette;
  return [...usedLetters(entry.frames).keys()].some((letter) => palette[letter] && colorKey(palette[letter]) === key);
}
