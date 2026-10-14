import { FEEDBACK_KINDS } from '../game/feedback';
import type { FeedbackRow, StudentRow } from '../game/teacher';
import { findLevel } from '../levels';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

interface FeedbackListProps {
  feedback: FeedbackRow[];
  students: StudentRow[];
  onShowCode: (item: FeedbackRow) => void;
  onToggle: (item: FeedbackRow) => void;
  onRemove: (item: FeedbackRow) => void;
}

/** Сообщения студентов о проблемах в уровнях: новые сверху, решённые свёрнуты. */
export function FeedbackList({ feedback, students, onShowCode, onToggle, onRemove }: FeedbackListProps) {
  const fresh = feedback.filter((item) => !item.resolved);
  const resolved = feedback.filter((item) => item.resolved);
  const nickname = (id: string) => students.find((student) => student.id === id)?.nickname ?? 'Студент';

  const renderItem = (item: FeedbackRow) => {
    const place = findLevel(item.level_id);
    const where = place ? `${place.region.title}, «${place.level.title}»` : item.level_id;
    return (
      <li key={item.id} className={item.resolved ? 'feedback-item feedback-item--resolved' : 'feedback-item'}>
        <p className="feedback-item__head">
          <strong>{nickname(item.student_id)}</strong> · {where} · {formatTime(item.created_at)}
        </p>
        <p className="feedback-item__kind">{FEEDBACK_KINDS[item.kind] ?? item.kind}</p>
        {item.message && <p className="feedback-item__text">{item.message}</p>}
        <div className="feedback-item__actions">
          {item.code && (
            <button type="button" className="text-button" onClick={() => onShowCode(item)}>
              Код
            </button>
          )}
          <button type="button" className="text-button" onClick={() => onToggle(item)}>
            {item.resolved ? 'Вернуть в новые' : 'Решено'}
          </button>
          <button type="button" className="text-button" onClick={() => onRemove(item)}>
            Удалить
          </button>
        </div>
      </li>
    );
  };

  return (
    <section className="feedback-list px-panel" aria-label="Сообщения студентов">
      <h3 className="teacher__label">{fresh.length ? `Сообщения студентов · новых: ${fresh.length}` : 'Сообщения студентов'}</h3>
      {fresh.length > 0 ? <ul>{fresh.map(renderItem)}</ul> : <p className="teacher__muted">Новых сообщений нет.</p>}
      {resolved.length > 0 && (
        <details className="feedback-list__resolved">
          <summary>Решённые: {resolved.length}</summary>
          <ul>{resolved.map(renderItem)}</ul>
        </details>
      )}
    </section>
  );
}
