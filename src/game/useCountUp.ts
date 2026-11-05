import { useEffect, useRef, useState } from 'react';
import { fullEffects } from './settings';

const DURATION = 900;

/**
 * Число, которое плавно догоняет значение, когда оно выросло: опыт «набегает», а не прыгает.
 * Выключено (enabled) — или у игрока лёгкие эффекты, или он просит меньше движения — число сразу равно значению.
 * Анимация всегда заканчивается ровно на нём.
 */
export function useCountUp(value: number, enabled: boolean): number {
  const [shown, setShown] = useState(value);
  // Что показано сейчас: следующий рост начинается оттуда, а не с прежнего значения, и смена цели на ходу не рвёт счёт
  const current = useRef(value);

  useEffect(() => {
    const from = current.current;
    if (value <= from || !enabled || !fullEffects() || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      current.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION);
      const next = progress === 1 ? value : Math.round(from + (value - from) * (1 - (1 - progress) ** 3));
      current.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, enabled]);

  return shown;
}
