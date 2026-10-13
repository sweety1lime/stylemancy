import { useEffect, useState } from 'react';
import { onUnlock, type Achievement } from '../game/achievements';
import { Medal } from './Medal';

let nextKey = 0;

/** Всплывающие уведомления о новых достижениях — где бы их ни получили. */
export function Toasts() {
  const [items, setItems] = useState<{ key: number; achievement: Achievement }[]>([]);

  useEffect(
    () =>
      onUnlock((achievement) => {
        const key = ++nextKey;
        setItems((list) => [...list, { key, achievement }]);
        setTimeout(() => setItems((list) => list.filter((item) => item.key !== key)), 5000);
      }),
    [],
  );

  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map(({ key, achievement }) => (
        <div key={key} className="toast px-panel">
          <Medal category={achievement.category} scale={3} />
          <div>
            <p className="toast__label">Достижение!</p>
            <p className="toast__title">{achievement.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
