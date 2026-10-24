import { Component, useState, type MouseEvent, type ReactNode } from 'react';
import { useAuth } from '../game/auth';
import { sendFeedback } from '../game/feedback';
import { drafts } from '../game/progress';
import { parseHash, useHash } from '../game/router';

interface ErrorBoundaryProps {
  fallback: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

/** Ловит ошибку отрисовки: вместо пустой страницы игра показывает, что делать дальше. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }

  reset = () => this.setState({ error: null });

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.reset) : this.props.children;
  }
}

/**
 * Экран вместо сломанной страницы. wholePage: сломалась вся игра, и помогает только перезагрузка.
 * Студент на уровне может одной кнопкой сообщить учителю, что случилось, вместе со своим кодом.
 */
export function CrashScreen({ error, onRetry, wholePage = false }: { error: Error; onRetry: () => void; wholePage?: boolean }) {
  const { account } = useAuth();
  const route = parseHash(useHash());
  const levelId = route.name === 'level' ? route.id : null;
  const [report, setReport] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [reportError, setReportError] = useState('');

  async function sendReport(studentId: string, level: string) {
    setReport('sending');
    setReportError('');
    try {
      await sendFeedback({
        studentId,
        levelId: level,
        kind: 'bug',
        message: `Страница уровня сломалась: ${error.message}`,
        code: drafts.get(level),
      });
      setReport('sent');
    } catch (failure) {
      setReportError((failure as Error).message);
      setReport('idle');
    }
  }

  // Вся игра перерисуется только после перезагрузки, поэтому на карту ведём через неё
  function goHome(event: MouseEvent) {
    if (!wholePage) return;
    event.preventDefault();
    window.location.hash = '#/';
    window.location.reload();
  }

  return (
    <main className="crash">
      <section className="crash__card px-panel" aria-labelledby="crash-title">
        <div role="alert">
          <h1 id="crash-title" className="pixel-title">
            Здесь что-то сломалось
          </h1>
          <p>
            Пройденные уровни и звёзды сохранены.{' '}
            {wholePage ? 'Перезагрузи страницу или вернись на карту.' : 'Вернись на карту или попробуй ещё раз.'}
          </p>
        </div>
        <p className="crash__detail">
          Если повторится, покажи учителю: <code>{error.message || error.name}</code>
        </p>
        <div className="button-row">
          <a className="button button--cast" href="#/" onClick={goHome}>
            На карту
          </a>
          <button type="button" className="button button--ghost" onClick={onRetry}>
            {wholePage ? 'Перезагрузить' : 'Попробовать снова'}
          </button>
        </div>
        {account?.role === 'student' &&
          levelId &&
          (report === 'sent' ? (
            <p>Учитель получил сообщение вместе с твоим кодом.</p>
          ) : (
            <button
              type="button"
              className="button button--ghost"
              disabled={report === 'sending'}
              onClick={() => void sendReport(account.id, levelId)}
            >
              {report === 'sending' ? 'Отправляем…' : 'Сообщить учителю'}
            </button>
          ))}
        {reportError && (
          <p className="login__error" role="alert">
            {reportError}
          </p>
        )}
      </section>
    </main>
  );
}
