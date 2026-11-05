import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { onUnlock, type Achievement } from '../game/achievements';
import { onNotice, type Notice } from '../game/notices';
import { sfx } from '../game/sound';
import { Medal } from './Medal';

let nextKey = 0;

/** За сколько до конца тост начинает уходить: в «Сумраке» он гаснет и уезжает вправо */
const LEAVE_MS = 300;

/** Тост живёт ms миллисекунд: за LEAVE_MS до конца ему ставится флаг ухода, потом он убирается из списка */
function expire<T extends { key: number; leaving?: boolean }>(set: Dispatch<SetStateAction<T[]>>, key: number, ms: number) {
  setTimeout(() => set((list) => list.map((item) => (item.key === key ? { ...item, leaving: true } : item))), ms - LEAVE_MS);
  setTimeout(() => set((list) => list.filter((item) => item.key !== key)), ms);
}

/** Всплывающие уведомления о новых достижениях — где бы их ни получили. */
export function Toasts() {
  const [items, setItems] = useState<{ key: number; achievement: Achievement; leaving?: boolean }[]>([]);
  const [notices, setNotices] = useState<{ key: number; notice: Notice; leaving?: boolean }[]>([]);

  useEffect(
    () =>
      onUnlock((achievement) => {
        const key = ++nextKey;
        sfx.achievement();
        setItems((list) => [...list, { key, achievement }]);
        expire(setItems, key, 5000);
      }),
    [],
  );

  // Сообщения игры: дольше, чем достижения, — их нужно успеть прочитать
  useEffect(
    () =>
      onNotice((notice) => {
        const key = ++nextKey;
        setNotices((list) => [...list, { key, notice }]);
        expire(setNotices, key, 9000);
      }),
    [],
  );

  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map(({ key, achievement, leaving }) => (
        <div key={key} className={`toast px-panel${leaving ? ' toast--leaving' : ''}`}>
          <Medal category={achievement.category} scale={3} />
          <div>
            <p className="toast__label">Достижение!</p>
            <p className="toast__title">{achievement.title}</p>
          </div>
        </div>
      ))}
      {notices.map(({ key, notice, leaving }) => (
        <div key={key} className={`toast toast--notice px-panel${leaving ? ' toast--leaving' : ''}`}>
          <div>
            <p className="toast__label">{notice.title}</p>
            <p className="toast__text">{notice.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
