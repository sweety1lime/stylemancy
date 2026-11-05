import { useEffect, useState } from 'react';
import { fullEffects } from '../game/settings';
import { sfx } from '../game/sound';
import { useNoir } from '../noir/look';

/** Сколько карточка на экране: пауза 0.5 с (пусть сначала вспыхнет свет) и 3.6 с самого титра; совпадает с noir.css */
const SHOWN_MS = 4100;

/**
 * Новый ранг: на несколько секунд поверх экрана встают шторки и проявляется название, как титр в кино.
 * Ничего не блокирует и не перехватывает клики. Только в «Сумраке» с полными эффектами — в остальных случаях о ранге говорит панель результата.
 */
export function RankUp({ title }: { title: string }) {
  const noir = useNoir();
  const on = noir && fullEffects() && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [visible, setVisible] = useState(on);

  useEffect(() => {
    if (!on) return;
    const sound = setTimeout(() => sfx.beacon(), 500);
    const hide = setTimeout(() => setVisible(false), SHOWN_MS);
    return () => {
      clearTimeout(sound);
      clearTimeout(hide);
    };
  }, [on]);

  if (!visible) return null;
  return (
    <div className="rankup" aria-hidden="true">
      <span className="rankup__bar rankup__bar--top" />
      <span className="rankup__bar rankup__bar--bottom" />
      <p className="rankup__card">
        <span className="rankup__caption">Ранг повышен</span>
        <span className="rankup__title">{title}</span>
      </p>
    </div>
  );
}
