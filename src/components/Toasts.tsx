import { useEffect, useState } from 'react';
import { onUnlock, type Achievement } from '../game/achievements';
import { onNotice, type Notice } from '../game/notices';
import { sfx } from '../game/sound';
import { Medal } from './Medal';

let nextKey = 0;

/** Всплывающие уведомления о новых достижениях — где бы их ни получили. */
export function Toasts() {
  const [items, setItems] = useState<{ key: number; achievement: Achievement }[]>([]);
  const [notices, setNotices] = useState<{ key: number; notice: Notice }[]>([]);

  useEffect(
    () =>
      onUnlock((achievement) => {
        const key = ++nextKey;
        sfx.achievement();
        setItems((list) => [...list, { key, achievement }]);
        setTimeout(() => setItems((list) => list.filter((item) => item.key !== key)), 5000);
      }),
    [],
  );

  // Сообщения игры: дольше, чем достижения, — их нужно успеть прочитать
  useEffect(
    () =>
      onNotice((notice) => {
        const key = ++nextKey;
        setNotices((list) => [...list, { key, notice }]);
        setTimeout(() => setNotices((list) => list.filter((item) => item.key !== key)), 9000);
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
      {notices.map(({ key, notice }) => (
        <div key={key} className="toast toast--notice px-panel">
          <div>
            <p className="toast__label">{notice.title}</p>
            <p className="toast__text">{notice.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
