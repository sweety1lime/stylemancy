import { useState, type FormEvent } from 'react';
import { FEEDBACK_KINDS, sendFeedback, type FeedbackKind } from '../game/feedback';
import { Modal } from './Modal';

interface FeedbackDialogProps {
  studentId: string;
  levelId: string;
  levelTitle: string;
  code: string;
  onClose: () => void;
}

/** Сообщить учителю о проблеме в уровне: причина, пара слов и, по желанию, свой код. */
export function FeedbackDialog({ studentId, levelId, levelTitle, code, onClose }: FeedbackDialogProps) {
  const [kind, setKind] = useState<FeedbackKind | null>(null);
  const [message, setMessage] = useState('');
  const [attachCode, setAttachCode] = useState(true);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!kind) {
      setError('Выбери, что случилось.');
      return;
    }
    if (kind === 'other' && !message.trim()) {
      setError('Напиши пару слов: что не так?');
      return;
    }
    setStatus('sending');
    setError('');
    try {
      await sendFeedback({ studentId, levelId, kind, message, code: attachCode ? code : undefined });
      setStatus('sent');
    } catch (failure) {
      setError((failure as Error).message);
      setStatus('idle');
    }
  }

  return (
    <Modal title={`Сообщить о проблеме · ${levelTitle}`} onClose={onClose}>
      {status === 'sent' ? (
        <>
          <p>Сообщение ушло учителю. Спасибо — так игра станет лучше!</p>
          <button type="button" className="button button--cast" onClick={onClose}>
            Вернуться к уровню
          </button>
        </>
      ) : (
        <form className="login__form" onSubmit={submit}>
          <fieldset className="feedback__kinds">
            <legend>Что случилось?</legend>
            {(Object.entries(FEEDBACK_KINDS) as [FeedbackKind, string][]).map(([value, label]) => (
              <label key={value} className="field--check">
                <input type="radio" name="feedback-kind" checked={kind === value} onChange={() => setKind(value)} />
                <span>{label}</span>
              </label>
            ))}
          </fieldset>
          <label className="field">
            <span>Подробности — если хочешь</span>
            <textarea
              value={message}
              maxLength={1000}
              placeholder="Например: код как в подсказке, а кристалл не встаёт на место"
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <label className="field--check">
            <input type="checkbox" checked={attachCode} onChange={(event) => setAttachCode(event.target.checked)} />
            <span>Приложить мой код — так учителю проще разобраться</span>
          </label>
          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="button button--cast" disabled={status === 'sending'}>
            {status === 'sending' ? 'Отправляем…' : 'Отправить учителю'}
          </button>
        </form>
      )}
    </Modal>
  );
}
