import { spriteDataUri } from '../../pixel/pixelArt';
import { BOOK, GEMS, MOON } from '../../pixel/sprites';

/**
 * Картинки, которые студент может вставить в HTML-уровнях: src="ruby.png" показывает спрайт.
 * Других адресов сцена не загружает — без них видно, зачем картинке alt.
 */
export const IMAGE_LIBRARY: Record<string, string> = {
  'ruby.png': spriteDataUri(GEMS.ruby.sprite),
  'emerald.png': spriteDataUri(GEMS.emerald.sprite),
  'amethyst.png': spriteDataUri(GEMS.amethyst.sprite),
  'sapphire.png': spriteDataUri(GEMS.sapphire.sprite),
  'topaz.png': spriteDataUri(GEMS.topaz.sprite),
  'moon.png': spriteDataUri(MOON),
  'book.png': spriteDataUri(BOOK),
};
