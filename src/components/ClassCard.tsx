import { useEffect } from 'react';
import type { ClassRow } from '../game/teacher';
import { Modal } from './Modal';

/** Карточка для проектора или печати: адрес игры, код класса и шаги входа. */
export function ClassCard({ klass, joinLink, onClose }: { klass: ClassRow; joinLink: string; onClose: () => void }) {
  // Пока карточка открыта, на печать уходит только она
  useEffect(() => {
    document.body.classList.add('print-card');
    return () => document.body.classList.remove('print-card');
  }, []);

  return (
    <Modal title="Карточка для урока" onClose={onClose} className="class-card-modal">
      <div className="class-card">
        <p className="class-card__title">Стилемантия — вход для класса «{klass.name}»</p>
        <ol className="class-card__steps">
          <li>
            Открой сайт: <span className="class-card__link">{joinLink}</span>
          </li>
          <li>Нажми «Войти», затем «Создать аккаунт».</li>
          <li>
            Введи код класса: <span className="class-card__code">{klass.code}</span>
          </li>
          <li>Придумай ник (не настоящие имя и фамилию) и пароль. Запиши их, чтобы не забыть.</li>
        </ol>
        <p className="class-card__note">Пароль забылся — учитель сбросит его в своей панели.</p>
      </div>
      <button type="button" className="button button--cast" onClick={() => window.print()}>
        Распечатать
      </button>
    </Modal>
  );
}
