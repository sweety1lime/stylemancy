import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { parseMarkup } from '../engine/htmlCheck';
import { lintHtml } from '../engine/htmlLint';
import { lintCss } from '../engine/lint';
import { useAuth } from '../game/auth';
import { useProgress } from '../game/progress';
import { navigate } from '../game/router';
import { canBuildLands } from '../land/access';
import { useLandImages } from '../land/images';
import { saveLand, useLands, type SaveResult } from '../land/lands';
import { LAND_LIMITS, landSize, type Land } from '../land/model';
import { renderLand } from '../land/sanitize';
import { cleanLine } from '../land/share';
import { CodeEditor } from './CodeEditor';
import { LandFrame } from './LandFrame';
import { ShareDialog } from './ShareDialog';
import '../land/land.css';

type Failure = Extract<SaveResult, { ok: false }>['reason'];
type Status = 'saved' | 'waiting' | Failure;

const STATUS_TEXT: Record<Status, string> = {
  saved: 'Сохранено',
  waiting: 'Сохраняю…',
  long: 'Не сохранено: земля длиннее предела. Убери лишнее.',
  space: 'Не сохранено: в аккаунте не хватает места. Сократи землю или удали заметки в гримуаре.',
  slot: 'Не сохранено: у этой земли нет ячейки.',
};

interface Draft {
  title: string;
  html: string;
  css: string;
  signed: boolean;
}

/** Страница редактора: сначала проверяем, что земля есть, а строить её можно; иначе возвращаем к списку */
export function LandEditorScreen({ slot }: { slot: number }) {
  const { account } = useAuth();
  const progress = useProgress();
  const land = useLands().find((item) => item.slot === slot);
  const allowed = canBuildLands(account, progress);
  useEffect(() => {
    if (!allowed || !land) navigate({ name: 'myland' });
  }, [allowed, land]);
  return allowed && land ? <LandEditor key={slot} land={land} /> : null;
}

/**
 * Редактор земли: слева код (HTML и CSS в двух вкладках), справа страница, которая обновляется, пока игрок печатает.
 * Сохранение само: через секунду после последней правки, при уходе с экрана и когда вкладку прячут.
 */
function LandEditor({ land }: { land: Land }) {
  const { slot } = land;
  const { account } = useAuth();
  const images = useLandImages();
  const [draft, setDraft] = useState<Draft>({ title: land.title, html: land.html, css: land.css, signed: land.signed });
  const [status, setStatus] = useState<Status>('saved');
  const [tab, setTab] = useState<'html' | 'css'>('html');
  const [view, setView] = useState<'desk' | 'phone'>('desk');
  const [sharing, setSharing] = useState(false);
  const draftRef = useRef(draft);
  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    if (!dirty.current) return;
    const result = saveLand({ slot, ...draftRef.current });
    if (result.ok) {
      dirty.current = false;
      setStatus('saved');
    } else {
      setStatus(result.reason);
    }
  }, [slot]);

  function change(patch: Partial<Draft>) {
    const next = { ...draftRef.current, ...patch };
    draftRef.current = next;
    dirty.current = true;
    setDraft(next);
    setStatus('waiting');
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1200);
  }

  // Что не успело сохраниться — сохраняем при уходе с экрана и когда вкладку прячут или закрывают
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [flush]);

  // Страница справа обновляется, когда игрок перестаёт печатать
  const [live, setLive] = useState({ html: draft.html, css: draft.css });
  useEffect(() => {
    const wait = setTimeout(() => setLive({ html: draft.html, css: draft.css }), 300);
    return () => clearTimeout(wait);
  }, [draft.html, draft.css]);
  const rendered = useMemo(() => renderLand(live, images), [live, images]);

  // CSS проверяется по той же странице, что видит игрок: селектор, который ничего не находит, подчёркивается
  const pageDoc = useMemo(() => parseMarkup(live.html), [live.html]);
  const lintMarkup = useCallback((text: string) => lintHtml(text), []);
  const lintStyles = useCallback((text: string) => lintCss(text, { sceneDoc: pageDoc }).problems, [pageDoc]);

  const size = landSize(draft);
  const nick = account?.nickname ? cleanLine(account.nickname, LAND_LIMITS.nick) : '';
  const shared = { title: draft.title, html: draft.html, css: draft.css, nick: draft.signed ? nick : '' };

  return (
    <main className="land-editor">
      <header className="land-editor__head">
        <label className="field land-editor__title">
          Название земли
          <input value={draft.title} maxLength={LAND_LIMITS.title} onChange={(event) => change({ title: event.target.value })} />
        </label>
        {nick ? (
          <label className="field field--check">
            <input type="checkbox" checked={draft.signed} onChange={(event) => change({ signed: event.target.checked })} />
            Подписать землю моим ником: {nick}
          </label>
        ) : (
          <p className="land-editor__hint">Земля без подписи. Войди в аккаунт, чтобы подписывать земли своим ником.</p>
        )}
        <p className={status === 'saved' || status === 'waiting' ? 'land-editor__status' : 'land-editor__status land-editor__status--bad'} role="status">
          {STATUS_TEXT[status]}
        </p>
        <button type="button" className="button button--cast" onClick={() => setSharing(true)}>
          Поделиться
        </button>
      </header>

      <section className="land-editor__code" aria-label="Код земли">
        <div className="editor-card px-panel">
          <div className="tabs" role="tablist" aria-label="Файлы земли">
            <button type="button" role="tab" id="land-tab-html" aria-controls="land-panel-html" aria-selected={tab === 'html'} className="tab" onClick={() => setTab('html')}>
              index.html <span className={size.html > LAND_LIMITS.html ? 'land-count land-count--over' : 'land-count'}>{size.html} / {LAND_LIMITS.html}</span>
            </button>
            <button type="button" role="tab" id="land-tab-css" aria-controls="land-panel-css" aria-selected={tab === 'css'} className="tab" onClick={() => setTab('css')}>
              style.css <span className={size.css > LAND_LIMITS.css ? 'land-count land-count--over' : 'land-count'}>{size.css} / {LAND_LIMITS.css}</span>
            </button>
          </div>
          {/* Оба редактора живут всегда: так у каждого остаётся своя история правок («отменить») */}
          <div role="tabpanel" id="land-panel-html" aria-labelledby="land-tab-html" hidden={tab !== 'html'}>
            <CodeEditor language="html" initialValue={land.html} onChange={(html) => change({ html })} lint={lintMarkup} onSubmit={flush} label="Редактор HTML" autoFocus />
          </div>
          <div role="tabpanel" id="land-panel-css" aria-labelledby="land-tab-css" hidden={tab !== 'css'}>
            <CodeEditor language="css" initialValue={land.css} onChange={(css) => change({ css })} lint={lintStyles} onSubmit={flush} label="Редактор CSS" />
          </div>
        </div>
      </section>

      <section className="land-editor__stage" aria-label="Страница земли">
        <div className="land-view" role="group" aria-label="Ширина страницы">
          <button type="button" className={view === 'desk' ? 'chip chip--on' : 'chip'} aria-pressed={view === 'desk'} onClick={() => setView('desk')}>
            Компьютер
          </button>
          <button type="button" className={view === 'phone' ? 'chip chip--on' : 'chip'} aria-pressed={view === 'phone'} onClick={() => setView('phone')}>
            Телефон 360 px
          </button>
        </div>
        <LandFrame page={rendered.document} title={draft.title} height={520} width={view === 'phone' ? 360 : undefined} />
        {rendered.notes.length > 0 && (
          <section className="land-notes px-panel" aria-label="Что убрала игра">
            <p className="land-notes__head">Игра убрала из земли:</p>
            <ul>
              {rendered.notes.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          </section>
        )}
      </section>

      {sharing && <ShareDialog land={shared} images={images} onClose={() => setSharing(false)} />}
    </main>
  );
}
