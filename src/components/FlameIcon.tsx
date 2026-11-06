import { NoirIcon } from '../noir/icons';
import { useNoir } from '../noir/look';
import { FLAME } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

/** Огонёк серии «Свитка дня»: в «Сумраке» линия с янтарным свечением, в пикселе — маленький спрайт */
export function FlameIcon({ size = 24 }: { size?: number }) {
  const noir = useNoir();
  return noir ? <NoirIcon name="flame" size={size} /> : <PixelArt sprite={FLAME} scale={Math.max(2, Math.round(size / 8))} />;
}
