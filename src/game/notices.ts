/* Короткие сообщения игры во всплывающих уведомлениях — рядом с достижениями */

export interface Notice {
  title: string;
  text: string;
}

type NoticeListener = (notice: Notice) => void;
const listeners = new Set<NoticeListener>();

export function onNotice(listener: NoticeListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notify(notice: Notice) {
  listeners.forEach((listener) => listener(notice));
}
