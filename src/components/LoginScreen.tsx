import { useEffect, useState, type FormEvent } from 'react';
import {
  classNameByCode,
  normalizeCode,
  signInStudent,
  signInTeacher,
  signUpStudent,
  signUpTeacher,
} from '../game/auth';
import { useProgress } from '../game/progress';
import { navigate } from '../game/router';
import { currentScope } from '../game/storage';
import { PORTRAITS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

type Who = 'student' | 'teacher';
type Mode = 'signin' | 'signup';

/** Название класса по мере ввода кода — чтобы студент видел, что код верный. */
function useClassName(code: string): string | null | undefined {
  const [result, setResult] = useState<{ code: string; name: string | null } | null>(null);
  const normalized = normalizeCode(code);
  useEffect(() => {
    if (normalized.length !== 6) return;
    let cancelled = false;
    classNameByCode(normalized)
      .then((name) => !cancelled && setResult({ code: normalized, name }))
      .catch(() => !cancelled && setResult({ code: normalized, name: null }));
    return () => {
      cancelled = true;
    };
  }, [normalized]);
  if (normalized.length !== 6) return undefined;
  return result?.code === normalized ? result.name : undefined;
}

export function LoginScreen() {
  const [who, setWho] = useState<Who>('student');
  const [mode, setMode] = useState<Mode>('signin');
  const [classCode, setClassCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [keepGuest, setKeepGuest] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const className = useClassName(who === 'student' ? classCode : '');
  // Прогресс, набранный без входа, можно унести в новый аккаунт
  const guestProgress = useProgress();
  const guestLevels = currentScope() ? 0 : Object.values(guestProgress).filter((item) => item.completed).length;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (who === 'student' && mode === 'signup') {
      const length = nickname.trim().length;
      if (length < 2 || length > 24) return setError('Ник — от 2 до 24 символов.');
    }
    if (password.length < 6) return setError('Пароль — минимум 6 символов.');
    setBusy(true);
    try {
      if (who === 'student') {
        const input = { classCode, nickname, password };
        await (mode === 'signup' ? signUpStudent({ ...input, keepGuestProgress: keepGuest && guestLevels > 0 }) : signInStudent(input));
        navigate({ name: 'map' });
      } else {
        await (mode === 'signup' ? signUpTeacher({ email, password, name }) : signInTeacher({ email, password }));
        navigate({ name: 'teacher' });
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  }

  function switchTo(next: Who) {
    setWho(next);
    setError('');
  }

  return (
    <main className="login">
      <section className="login__card px-panel">
        <div className="login__head">
          <PixelArt sprite={PORTRAITS.flex} scale={3} />
          <h1 className="pixel-title">Вход в Стилемантию</h1>
        </div>

        <div className="tabs" role="tablist">
          <button type="button" role="tab" aria-selected={who === 'student'} className="tab" onClick={() => switchTo('student')}>
            Я студент
          </button>
          <button type="button" role="tab" aria-selected={who === 'teacher'} className="tab" onClick={() => switchTo('teacher')}>
            Я преподаватель
          </button>
        </div>

        <form className="login__form" onSubmit={submit}>
          {who === 'student' ? (
            <>
              <label className="field">
                <span>Код класса</span>
                <input
                  value={classCode}
                  onChange={(event) => setClassCode(event.target.value)}
                  placeholder="Например, 8P77SK"
                  autoComplete="off"
                  maxLength={8}
                  required
                />
                {className && <small className="field__ok">Класс «{className}»</small>}
                {className === null && <small className="field__error">Класса с таким кодом нет</small>}
              </label>
              <label className="field">
                <span>Ник</span>
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  autoComplete="username"
                  maxLength={24}
                  required
                />
              </label>
            </>
          ) : (
            <>
              <label className="field">
                <span>Почта</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </label>
              {mode === 'signup' && (
                <label className="field">
                  <span>Имя — так вас увидят студенты</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} maxLength={24} required />
                </label>
              )}
            </>
          )}

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              minLength={6}
              required
            />
          </label>

          {who === 'student' && mode === 'signup' && guestLevels > 0 && (
            <label className="field field--check">
              <input type="checkbox" checked={keepGuest} onChange={(event) => setKeepGuest(event.target.checked)} />
              <span>Перенести прогресс, набранный без входа: уровней пройдено — {guestLevels}</span>
            </label>
          )}

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="button button--cast" disabled={busy}>
            {busy ? 'Минутку…' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="login__switch">
          {mode === 'signin' ? 'Ещё нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
            }}
          >
            {mode === 'signin' ? 'Создать аккаунт' : 'Войти'}
          </button>
        </p>
        {who === 'student' && (
          <p className="login__hint">
            Код класса даёт учитель. Почта не нужна. Если забудешь пароль — учитель сбросит его в своей панели.
          </p>
        )}
      </section>
    </main>
  );
}
