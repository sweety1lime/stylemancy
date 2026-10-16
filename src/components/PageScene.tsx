import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { runtimeProblem } from '../engine/jsLint';
import type { OutputLine } from '../engine/jsRun';
import { LOOP_MESSAGE, RELOAD_MESSAGE, type PageEvaluation } from '../engine/pageCheck';
import { pageDocument } from '../engine/pageHarness';
import { levelPage, type PageError } from '../engine/pageRun';
import type { JsLevel } from '../engine/types';
import { GoalList } from './GoalList';
import { OracleLine } from './JsScene';
import { RichText } from './RichText';

interface PageSceneProps {
  level: JsLevel;
  code: string;
  evaluation: PageEvaluation | null;
  /** Код ещё проверяется после последнего изменения */
  busy: boolean;
  celebrate: boolean;
}

/** Сколько последних строк Оракула показывать под страницей */
const LOG_SIZE = 4;

interface LiveState {
  output: OutputLine[];
  error: PageError | null;
  /** Форма перезагрузила страницу */
  reloaded: boolean;
}

const QUIET: LiveState = { output: [], error: null, reloaded: false };

/** Короткий отпечаток кода: новый код — новая страница */
function fingerprint(text: string): string {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = (hash * 33) ^ text.charCodeAt(i);
  return (hash >>> 0).toString(36);
}

/**
 * Сцена Города Механизмов: живая страница в рамке «браузера». Код студента работает прямо в ней —
 * по кнопкам можно щёлкать, в поля писать. Страница отделена от игры: sandbox без allow-same-origin.
 */
export function PageScene({ level, code, evaluation, busy, celebrate }: PageSceneProps) {
  const page = useMemo(() => levelPage(level), [level]);
  const syntax = evaluation?.errors.find((problem) => problem.kind !== 'required' && problem.kind !== 'runtime');
  // Код с ошибкой разбора на страницу не попадает: она остаётся как есть
  const liveCode = syntax ? '' : code;
  // Каждый запуск страницы — новый ключ: старая страница не может прислать вести в новую
  const [launch, setLaunch] = useState(0);
  const sceneId = useId();
  const nonce = `${sceneId}${launch}-${fingerprint(liveCode)}`;
  const srcDoc = useMemo(() => pageDocument(page, liveCode, { mode: 'live', nonce }), [page, liveCode, nonce]);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [live, setLive] = useState<LiveState>(QUIET);
  // Новый код — страница запускается заново, и вести от старой забываются
  const [shownCode, setShownCode] = useState(liveCode);
  if (shownCode !== liveCode) {
    setShownCode(liveCode);
    setLive(QUIET);
  }

  useEffect(() => {
    const listen = (event: MessageEvent) => {
      const data = event.data as { nonce?: string; type?: string; line?: OutputLine; error?: PageError } | null;
      if (event.source !== frameRef.current?.contentWindow || data?.nonce !== nonce) return;
      if (data.type === 'output' && data.line) {
        const line = data.line;
        setLive((state) => ({ ...state, output: [...state.output, line].slice(-LOG_SIZE) }));
      } else if (data.type === 'error' && data.error) {
        const error = data.error;
        setLive((state) => (state.error ? state : { ...state, error }));
      } else if (data.type === 'reload') {
        // Форма без preventDefault: страница загружается заново — всё сделанное пропадает
        setLive({ ...QUIET, reloaded: true });
        setLaunch((value) => value + 1);
      }
    };
    window.addEventListener('message', listen);
    return () => window.removeEventListener('message', listen);
  }, [nonce]);

  function restart() {
    setLive(QUIET);
    setLaunch((value) => value + 1);
  }

  function download() {
    const file = new Blob([pageDocument(page, code, { mode: 'download' })], { type: 'text/html' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = level.download ?? 'game.html';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const lineOf = (from: number) => code.slice(0, from).split('\n').length;
  const failure = live.error;
  // rich — в тексте есть `код`
  let message: { kind: 'error' | 'info' | 'ok'; text: string; rich?: boolean };
  if (syntax) message = { kind: 'error', text: `✖ Строка ${lineOf(syntax.from)}: ${syntax.message}` };
  else if (failure?.loop) message = { kind: 'error', text: `✖ ${LOOP_MESSAGE}` };
  else if (failure) {
    const problem = runtimeProblem(code, failure);
    message = { kind: 'error', text: `✖ Код остановился: строка ${lineOf(problem.from)} — ${problem.message}` };
  } else if (live.reloaded) message = { kind: 'error', text: `↻ ${RELOAD_MESSAGE}`, rich: true };
  else if (evaluation?.passed) message = { kind: 'ok', text: '✦ Механизм работает — как задумано' };
  else message = { kind: 'info', text: 'Страница живая: нажимай кнопки и пиши в поля — код отвечает' };

  return (
    <section className="stage stage--page" aria-label="Страница Города Механизмов">
      <div className={`browser page-scene${celebrate ? ' browser--celebrate' : ''}${busy ? ' page-scene--busy' : ''}`}>
        <div className="browser__bar">
          <span className="browser__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="browser__tab">{level.title}</span>
          <button type="button" className="page-scene__restart" onClick={restart} title="Загрузить страницу заново">
            ↻ Заново
          </button>
        </div>
        <iframe
          key={nonce}
          ref={frameRef}
          className={live.reloaded ? 'browser__page page-scene__page page-scene__page--reloaded' : 'browser__page page-scene__page'}
          title="Страница Города Механизмов"
          sandbox="allow-scripts allow-forms"
          srcDoc={srcDoc}
          style={{ height: level.scene.height }}
        />
        <p className={`browser__status page-scene__status page-scene__status--${message.kind}`} aria-live="polite">
          {message.rich ? <RichText text={message.text} /> : message.text}
        </p>
        {live.output.length > 0 && (
          <ol className="oracle-scroll__lines page-scene__log" aria-label="Что сказал Оракул">
            {live.output.map((line, i) => (
              <OracleLine key={i} line={line} />
            ))}
          </ol>
        )}
      </div>

      {level.download && (
        <div className="page-download px-panel">
          <button type="button" className="button button--ghost" onClick={download}>
            ⬇ Скачать игру
          </button>
          <p>
            Файл <code>{level.download}</code> — твоя игра целиком: открой его в любом браузере, хоть без интернета, и покажи друзьям.
          </p>
        </div>
      )}

      {evaluation && <GoalList goals={evaluation.goals} />}
    </section>
  );
}
