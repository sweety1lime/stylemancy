import { useState } from 'react';
import { deleteMyAccount, type Account } from '../game/auth';
import { Modal } from './Modal';

/** Аккаунт студента: ник, класс и удаление аккаунта со всем прогрессом. */
export function AccountDialog({ account, onClose }: { account: Account; onClose: () => void }) {
  const [step, setStep] = useState<'view' | 'confirm' | 'deleting' | 'deleted'>('view');
  const [error, setError] = useState('');

  async function remove() {
    setStep('deleting');
    setError('');
    try {
      await deleteMyAccount();
      setStep('deleted');
    } catch (failure) {
      setError((failure as Error).message);
      setStep('confirm');
    }
  }

  if (step === 'deleted') {
    return (
      <Modal title="Аккаунт удалён" onClose={onClose}>
        <p>Прогресс, заметки и сообщения учителю стёрты. Играть можно гостем, а новый аккаунт заводится через «Войти».</p>
        <a className="button button--cast" href="#/" onClick={onClose}>
          На карту
        </a>
      </Modal>
    );
  }

  return (
    <Modal title="Аккаунт" onClose={onClose}>
      <p>
        Ник: <strong>{account.nickname}</strong>
        {account.classInfo && <>, класс «{account.classInfo.name}»</>}
      </p>
      <p>
        Если удалить аккаунт, с сервера и с этого компьютера пропадут прогресс, достижения, заметки и сообщения учителю.
        Вернуть их не получится.
      </p>
      {step === 'view' ? (
        <button type="button" className="button button--ghost" onClick={() => setStep('confirm')}>
          Удалить аккаунт…
        </button>
      ) : (
        <div className="button-row">
          <button
            type="button"
            className="button button--danger"
            disabled={step === 'deleting'}
            onClick={() => void remove()}
          >
            {step === 'deleting' ? 'Удаляем…' : 'Удалить навсегда'}
          </button>
          {/* Фокус на отмене: случайный Enter не удалит аккаунт */}
          <button
            type="button"
            className="button button--ghost"
            disabled={step === 'deleting'}
            onClick={() => setStep('view')}
            autoFocus
          >
            Отмена
          </button>
        </div>
      )}
      {error && (
        <p className="login__error" role="alert">
          {error}
        </p>
      )}
    </Modal>
  );
}
