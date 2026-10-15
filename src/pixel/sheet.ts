import { spriteDataUri, type Sprite } from './pixelArt';

/** Лента кадров: все кадры анимации стоят рядом в одной картинке. */
export interface SpriteSheet {
  uri: string;
  /** Размер одного кадра в пикселях спрайта */
  width: number;
  height: number;
  count: number;
}

const cache = new WeakMap<Sprite[], SpriteSheet>();

/** Склеивает кадры в ленту. Палитра — у первого кадра: у кадров одной анимации она общая. */
export function spriteSheet(frames: Sprite[]): SpriteSheet {
  const cached = cache.get(frames);
  if (cached) return cached;
  const width = Math.max(...frames[0].rows.map((row) => row.length));
  const height = frames[0].rows.length;
  const rows = Array.from({ length: height }, (_, y) => frames.map((frame) => (frame.rows[y] ?? '').padEnd(width, '.')).join(''));
  const sheet = { uri: spriteDataUri({ rows, palette: frames[0].palette }), width, height, count: frames.length };
  cache.set(frames, sheet);
  return sheet;
}

/** Анимация ленты: CSS-кадры @keyframes sprite-frames сдвигают её на кадр за шаг. */
export function sheetAnimation(sheet: SpriteSheet, fps: number, repeat?: number): string {
  return `sprite-frames ${sheet.count / fps}s steps(${sheet.count}, end) ${repeat ?? 'infinite'}`;
}

/** Та же анимация без React — для героя, который идёт по карте. */
export function spriteAnimElement(frames: Sprite[], fps: number, scale: number): HTMLElement {
  const sheet = spriteSheet(frames);
  const box = document.createElement('span');
  box.className = 'sprite-anim';
  Object.assign(box.style, { width: `${sheet.width * scale}px`, height: `${sheet.height * scale}px` });
  const img = document.createElement('img');
  img.src = sheet.uri;
  img.alt = '';
  img.width = sheet.width * scale * sheet.count;
  img.height = sheet.height * scale;
  img.style.animation = sheetAnimation(sheet, fps);
  box.append(img);
  return box;
}
