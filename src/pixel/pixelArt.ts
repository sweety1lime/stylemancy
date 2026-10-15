export type Palette = Record<string, string>;

/**
 * Пиксельный рисунок: строки одинаковой длины, каждый символ — цвет из палитры,
 * «.» — прозрачный пиксель. Так спрайты можно рисовать прямо в коде.
 */
export interface Sprite {
  rows: string[];
  palette: Palette;
}

/** SVG из пиксельной карты. Соседние пиксели одного цвета склеиваются в один прямоугольник. */
export function spriteSvg({ rows, palette }: Sprite): string {
  const width = Math.max(...rows.map((row) => row.length));
  let rects = '';
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === ch) end++;
      const color = palette[ch];
      if (ch !== '.' && color) rects += `<rect x="${x}" y="${y}" width="${end - x}" height="1" fill="${color}"/>`;
      x = end;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${rows.length}" shape-rendering="crispEdges">${rects}</svg>`;
}

/** Спрайт как data URI — для <img> и для CSS. */
export function spriteDataUri(sprite: Sprite): string {
  return `data:image/svg+xml,${encodeURIComponent(spriteSvg(sprite))}`;
}

/** Спрайт как значение CSS: url("data:…"). */
export function spriteCssUrl(sprite: Sprite): string {
  return `url("${spriteDataUri(sprite)}")`;
}

/** Зеркальное отражение по горизонтали. */
export function mirror(sprite: Sprite): Sprite {
  return { ...sprite, rows: sprite.rows.map((row) => [...row].reverse().join('')) };
}

/** Та же форма в других цветах. */
export function recolor(sprite: Sprite, palette: Palette): Sprite {
  return { rows: sprite.rows, palette: { ...sprite.palette, ...palette } };
}

/**
 * Предмет, который красит свойство color: маска заливки (буквы c, h, d, v) и рисунок поверх неё.
 * В CSS заливка — currentColor под маской, а рисунок кладётся сверху.
 */
export function colorParts(sprite: Sprite, fillChars = 'chdv'): { fill: Sprite; details: Sprite } {
  const fill = { rows: sprite.rows.map((row) => [...row].map((ch) => (fillChars.includes(ch) ? 'x' : '.')).join('')), palette: { x: '#000' } };
  const details = { rows: sprite.rows, palette: Object.fromEntries(Object.entries(sprite.palette).filter(([ch]) => ch !== 'c')) };
  return { fill, details };
}

/**
 * Скала парящего острова: трава сверху, земля сужается книзу с неровными краями.
 * Края случайные, но одинаковые при каждом запуске (зависят только от seed).
 */
export function rockSprite(width: number, height: number, palette: Palette, seed = 7): Sprite {
  let state = seed;
  const random = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  const rows: string[] = [];
  const half = Math.floor(width / 2);
  for (let y = 0; y < height; y++) {
    const t = y / Math.max(1, height - 1);
    const jitter = () => (y > 1 ? Math.round(random() * 2) : 0);
    const left = Math.min(half - 1, Math.round(t * t * (half - 2)) + jitter());
    const right = Math.min(half - 1, Math.round(t * (half - 3)) + jitter());
    let row = '';
    for (let x = 0; x < width; x++) {
      if (x < left || x >= width - right) row += '.';
      else if (x === left || x === width - right - 1) row += 'k';
      else if (y === 0) row += 'G';
      else if (y === 1) row += 'g';
      else row += (x * 3 + y * 5) % 11 === 0 ? 'D' : 'd';
    }
    rows.push(row);
  }
  return { rows, palette };
}
