import type { Palette, Sprite } from '../pixel/pixelArt';
import { cssOf, deltaE, parseColor, sameColor, type Rgba } from './color';
import { sizeOf } from './collect';

/* Мост между кодом и пиксельными редакторами (Piskel, Aseprite, LibreSprite, Pixelorama). */

/** Кадры лентой слева направо, 1 пиксель спрайта = scale пикселей картинки. */
export function renderStrip(frames: Sprite[], scale: number): HTMLCanvasElement {
  const { width, height } = sizeOf(frames);
  const canvas = document.createElement('canvas');
  canvas.width = width * frames.length * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  frames.forEach((frame, i) => {
    frame.rows.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        const color = frame.palette[ch];
        if (ch === '.' || !color) return;
        ctx.fillStyle = color;
        ctx.fillRect((i * width + x) * scale, y * scale, scale, scale);
      });
    });
  });
  return canvas;
}

export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPng(frames: Sprite[], scale: number, name: string): void {
  renderStrip(frames, scale).toBlob((blob) => blob && downloadBlob(blob, name), 'image/png');
}

/** Картинка из файла как пиксели. */
export async function readImage(file: Blob): Promise<ImageData> {
  const bitmap = await createImageBitmap(file, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' });
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas недоступен');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function pixelAt(image: ImageData, x: number, y: number): Rgba {
  const i = (y * image.width + x) * 4;
  const d = image.data;
  return [d[i], d[i + 1], d[i + 2], d[i + 3]];
}

function samePixel(image: ImageData, x1: number, y1: number, x2: number, y2: number): boolean {
  const a = pixelAt(image, x1, y1);
  const b = pixelAt(image, x2, y2);
  // Полностью прозрачные пиксели равны, какой бы цвет под ними ни сохранил редактор
  if (a[3] === 0 && b[3] === 0) return true;
  return sameColor(a, b);
}

/**
 * Во сколько раз увеличена картинка: самый крупный размер блока, внутри которого все пиксели одинаковые.
 * Редакторы часто сохраняют спрайт ×4 или ×8 — его можно грузить как есть.
 */
export function detectScale(image: ImageData): number {
  const { width, height } = image;
  for (let k = Math.min(width, height); k > 1; k--) {
    if (width % k || height % k) continue;
    let uniform = true;
    for (let y = 0; y < height && uniform; y++) {
      for (let x = 0; x < width; x++) {
        if (!samePixel(image, x, y, x - (x % k), y - (y % k))) {
          uniform = false;
          break;
        }
      }
    }
    if (uniform) return k;
  }
  return 1;
}

/** Буквы для новых цветов: строчные, потом прописные, потом цифры. */
const LETTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export interface NewColor {
  letter: string;
  css: string;
  /** Ближайший цвет игры и насколько он отличается */
  nearest?: { css: string; delta: number };
  /** Цвет заменён ближайшим цветом игры */
  snapped: boolean;
}

export interface ImportOptions {
  /** Сколько кадров в ленте (кадры стоят слева направо) */
  frames: number;
  /** Спрайт, который перерисовали: его буквы сохраняются там, где цвет пикселя не изменился */
  base?: Sprite[];
  /** Все цвета игры — для подсказки «ближайший» и подтягивания */
  projectColors: Rgba[];
  /** Подтягивать новый цвет к цвету игры, если разница меньше этой (0 — не подтягивать) */
  snap: number;
}

export interface ImportResult {
  frames: Sprite[];
  palette: Palette;
  scale: number;
  newColors: NewColor[];
  /** Сколько пикселей отличается от исходного спрайта; null — сравнивать не с чем или размер другой */
  changed: number | null;
  warning?: string;
}

/**
 * PNG → строки и палитра. Пиксель сохраняет букву исходного спрайта, если его цвет не изменился:
 * так у героя не путаются глаза (e) и контур (k), хотя оба цвета INK.
 */
export function importImage(image: ImageData, options: ImportOptions): ImportResult {
  const count = Math.max(1, Math.round(options.frames));
  // Размер исходного спрайта подсказывает увеличение точнее: у мелкого рисунка блоки бывают одинаковыми случайно
  const hint = options.base ? sizeOf(options.base) : null;
  const hinted = hint ? image.width / (hint.width * count) : 0;
  const scale = hint && Number.isInteger(hinted) && image.height === hint.height * hinted ? hinted : detectScale(image);
  const totalWidth = image.width / scale;
  const height = image.height / scale;
  let warning: string | undefined;
  if (totalWidth % count) warning = `Ширина ${totalWidth} не делится на ${count} кадров: последний кадр обрезан`;
  const width = Math.floor(totalWidth / count);

  const basePalette: Palette = options.base?.[0].palette ?? {};
  const baseColors = Object.entries(basePalette).map(([letter, css]) => [letter, parseColor(css)] as const);
  const baseSize = options.base ? sizeOf(options.base) : null;
  const sameSize = !!baseSize && baseSize.width === width && baseSize.height === height && options.base?.length === count;
  if (options.base && !sameSize) {
    warning ??= `Размер другой: было ${baseSize?.width}×${baseSize?.height}, ${options.base.length} кадр.; стало ${width}×${height}, ${count} кадр.`;
  }

  const palette: Palette = { ...basePalette };
  const free = [...LETTERS].filter((letter) => !(letter in palette));
  const newColors: NewColor[] = [];
  const assigned = new Map<string, string>();

  const letterFor = (color: Rgba): string => {
    const key = color.join(',');
    const known = assigned.get(key);
    if (known) return known;
    let letter = baseColors.find(([, rgba]) => sameColor(rgba, color))?.[0];
    if (!letter) {
      const nearestBase = baseColors.map(([l, rgba]) => [l, deltaE(rgba, color)] as const).sort((a, b) => a[1] - b[1])[0];
      if (nearestBase && options.snap > 0 && nearestBase[1] < options.snap) letter = nearestBase[0];
    }
    if (!letter) {
      letter = free.shift() ?? '?';
      const nearest = options.projectColors
        .map((rgba) => ({ css: cssOf(rgba), delta: deltaE(rgba, color) }))
        .sort((a, b) => a.delta - b.delta)[0];
      const snapped = !!nearest && options.snap > 0 && nearest.delta < options.snap;
      const css = snapped ? nearest.css : cssOf(color);
      palette[letter] = css;
      newColors.push({ letter, css, nearest: nearest && nearest.delta > 0.01 ? nearest : undefined, snapped });
    }
    assigned.set(key, letter);
    return letter;
  };

  let changed = 0;
  const frames: Sprite[] = Array.from({ length: count }, (_, f) => {
    const rows: string[] = [];
    for (let y = 0; y < height; y++) {
      let row = '';
      for (let x = 0; x < width; x++) {
        const color = pixelAt(image, (f * width + x) * scale, y * scale);
        const before = sameSize ? (options.base?.[f].rows[y]?.[x] ?? '.') : undefined;
        let ch: string;
        if (color[3] === 0) ch = '.';
        else if (before && before !== '.' && basePalette[before] && sameColor(parseColor(basePalette[before]), color)) ch = before;
        else ch = letterFor(color);
        if (before !== undefined && before !== ch) changed++;
        row += ch;
      }
      rows.push(row);
    }
    return { rows, palette };
  });

  return { frames, palette, scale, newColors, changed: sameSize ? changed : null, warning };
}

/* Код для sprites.ts — в том же виде, в каком там пишут руками */

const INK = '#1a1030';

function paletteKey(letter: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(letter) ? letter : `'${letter}'`;
}

export function paletteCode(palette: Palette, indent = ''): string {
  const parts = Object.entries(palette).map(([letter, css]) => `${paletteKey(letter)}: ${css.toLowerCase() === INK ? 'INK' : `'${css}'`}`);
  const line = `{ ${parts.join(', ')} }`;
  if (line.length + indent.length < 110) return line;
  return `{\n${parts.map((part) => `${indent}  ${part},`).join('\n')}\n${indent}}`;
}

export function rowsCode(rows: string[], indent = ''): string {
  return `[\n${rows.map((row) => `${indent}  '${row}',`).join('\n')}\n${indent}]`;
}

/** Только строки: вставить вместо старых в любом месте sprites.ts (кадры — массивом строк на кадр). */
export function framesRowsCode(frames: Sprite[]): string {
  if (frames.length === 1) return rowsCode(frames[0].rows);
  return `[\n${frames.map((frame) => `  ${rowsCode(frame.rows, '  ')},`).join('\n')}\n]`;
}

/** Готовый экспорт для нового спрайта: одиночный или лента кадров с общей палитрой. */
export function spriteCode(name: string, frames: Sprite[]): string {
  const constName = name.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_') || 'NEW_SPRITE';
  const palette = frames[0].palette;
  if (frames.length === 1) {
    return `export const ${constName}: Sprite = {\n  rows: ${rowsCode(frames[0].rows, '  ')},\n  palette: ${paletteCode(palette, '  ')},\n};`;
  }
  const base = constName.replace(/_FRAMES$/, '');
  return [
    `const ${base}_PALETTE = ${paletteCode(palette)};`,
    '',
    `export const ${base}_FRAMES: Sprite[] = [`,
    ...frames.map((frame) => `  { rows: ${rowsCode(frame.rows, '  ')}, palette: ${base}_PALETTE },`),
    '];',
  ].join('\n');
}

/* Палитра игры для редакторов */

/** GIMP-палитра .gpl: её открывают Aseprite, LibreSprite, Pixelorama и Piskel. Прозрачность в ней не хранится. */
export function gplFile(name: string, colors: Rgba[]): string {
  const lines = colors.map(([r, g, b, a]) => `${String(r).padStart(3)} ${String(g).padStart(3)} ${String(b).padStart(3)}\t${cssOf([r, g, b, a])}`);
  return `GIMP Palette\nName: ${name}\nColumns: 16\n#\n${lines.join('\n')}\n`;
}

/** Палитра .hex, как на Lospec: по цвету на строку. */
export function hexFile(colors: Rgba[]): string {
  return `${colors.map(([r, g, b]) => cssOf([r, g, b, 255]).slice(1)).join('\n')}\n`;
}
