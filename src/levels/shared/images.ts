import { spriteSvg, type Sprite } from '../../pixel/pixelArt';
import { BOOK, GEMS, MAP, MOON, PORTRAITS, POTION } from '../../pixel/sprites';

/** Картинка из спрайта со своим размером: без него браузер растянул бы её на 300 пикселей. */
function picture(sprite: Sprite, scale = 4): string {
  const width = Math.max(...sprite.rows.map((row) => row.length)) * scale;
  const height = sprite.rows.length * scale;
  const svg = spriteSvg(sprite).replace('<svg ', `<svg width="${width}" height="${height}" `);
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Картинки, которые студент может вставить в HTML-уровнях: src="potion.png" показывает спрайт.
 * Других адресов сцена не загружает — сломанная картинка покажет alt, и видно, зачем он нужен.
 */
export const IMAGE_LIBRARY: Record<string, string> = {
  'ruby.png': picture(GEMS.ruby.sprite),
  'emerald.png': picture(GEMS.emerald.sprite),
  'amethyst.png': picture(GEMS.amethyst.sprite),
  'sapphire.png': picture(GEMS.sapphire.sprite),
  'topaz.png': picture(GEMS.topaz.sprite),
  'moon.png': picture(MOON),
  'book.png': picture(BOOK, 3),
  'potion.png': picture(POTION),
  'map.png': picture(MAP),
  'merchant.png': picture(PORTRAITS.merchant),
};
