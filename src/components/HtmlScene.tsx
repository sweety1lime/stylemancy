import { useEffect, useMemo, useRef, useState } from 'react';
import { htmlPage } from '../engine/htmlCheck';
import type { HtmlLevel } from '../engine/types';
import { useSettings } from '../game/settings';
import { noirSceneCss } from '../noir/sceneCss';

interface HtmlSceneProps {
  level: HtmlLevel;
  code: string;
  /** Картинки по именам: src="potion.png" → спрайт */
  images: Record<string, string>;
  celebrate?: boolean;
  /** Цели ещё не выполнены: в «Сумраке» страница — белый лист Лорда Дефолта, а не ночная рукопись */
  cursed?: boolean;
}

/** Показать новое содержимое страницы на месте — без перезагрузки iframe и мигания. */
function showBody(frame: HTMLIFrameElement | null, body: string) {
  const doc = frame?.contentDocument;
  if (doc?.body && doc.body.innerHTML !== body) doc.body.innerHTML = body;
}

/**
 * Страница студента в рамке «браузера»: на вкладке — <title>, внизу — строка состояния.
 * Ссылки и формы никуда не уводят: строка состояния рассказывает, куда бы они вели.
 */
export function HtmlScene({ level, code, images, celebrate, cursed }: HtmlSceneProps) {
  const { look, effects } = useSettings();
  const noir = look === 'noir';
  const lookCss = noir ? noirSceneCss(level.regionId, level.id) : '';
  const isCursed = noir && Boolean(cursed);
  // Классы на <html> страницы: сразу в документе, чтобы при загрузке не мигала ночная рукопись, и потом на месте
  const rootClass = [isCursed && 'cursed', noir && effects === 'light' && 'effects-light'].filter(Boolean).join(' ');
  const page = useMemo(() => htmlPage(level, code, images, lookCss, rootClass), [level, code, images, lookCss, rootClass]);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const pageRef = useRef(page);
  // Документ для первой загрузки; дальше содержимое страницы меняется на месте
  const [initialHtml] = useState(page.html);
  // Строка состояния: hover — подсказка от наведения на ссылку. Новый код — строка пустеет
  const [status, setStatus] = useState({ text: '', hover: false });
  const [statusCode, setStatusCode] = useState(code);
  if (statusCode !== code) {
    setStatusCode(code);
    setStatus({ text: '', hover: false });
  }

  useEffect(() => {
    pageRef.current = page;
    if (!level.document) showBody(frameRef.current, page.body);
  }, [page, level.document]);

  // Проклятие снято (или вернулось): страница плавно переходит на месте, без перезагрузки; fade — только на время перехода,
  // чтобы наведение на ссылки не тянулось 0,8 с
  const wasCursed = useRef(isCursed);
  useEffect(() => {
    const root = frameRef.current?.contentDocument?.documentElement;
    if (!root) return;
    root.classList.toggle('cursed', isCursed);
    root.classList.toggle('effects-light', noir && effects === 'light');
    if (wasCursed.current === isCursed) return;
    wasCursed.current = isCursed;
    root.classList.add('cursed-fade');
    const timer = setTimeout(() => root.classList.remove('cursed-fade'), 900);
    return () => {
      clearTimeout(timer);
      root.classList.remove('cursed-fade');
    };
  }, [isCursed, noir, effects]);

  function handleLoad() {
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    if (!doc) return;
    if (!level.document) showBody(frame, pageRef.current.body);
    const say = (text: string, hover = false) => setStatus({ text, hover });
    const linkOf = (target: EventTarget | null) => (target instanceof doc.defaultView!.Element ? target.closest('a') : null);

    doc.addEventListener('mouseover', (event) => {
      const link = linkOf(event.target);
      if (link) say(`Ссылка → ${link.getAttribute('href') || 'никуда: у неё нет href'}`, true);
      // Ушли со ссылки — гасим только подсказку от наведения: сообщения о клике и форме остаются
      else setStatus((current) => (current.hover ? { ...current, text: '' } : current));
    });
    doc.addEventListener('click', (event) => {
      const link = linkOf(event.target);
      if (!link) return;
      event.preventDefault();
      const href = link.getAttribute('href');
      if (href?.startsWith('#')) {
        doc.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
        say(`Якорь ${href}: страница прокрутилась к элементу с id="${href.slice(1)}"`);
      } else {
        say(href ? `Ссылка ведёт на ${href} — в тренажёре переходы отключены` : 'У ссылки нет href — ей некуда вести');
      }
    });
    doc.addEventListener('submit', (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const pairs = Array.from(new FormData(form), ([name, value]) => `${name}=${typeof value === 'string' ? value : value.name}`);
      say(pairs.length ? `Форма отправила бы: ${pairs.join(', ')}` : 'Форма отправилась бы пустой: у полей нет name');
    });
  }

  const title = page.title || (level.document ? 'Без названия' : level.regionTitle);
  return (
    <div className={`browser${celebrate ? ' browser--celebrate' : ''}${isCursed ? ' browser--cursed' : ''}`}>
      <div className="browser__bar">
        <span className="browser__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="browser__tab" title="Заголовок вкладки берётся из <title>">
          {title}
        </span>
      </div>
      <iframe
        ref={frameRef}
        className="browser__page"
        title="Страница студента"
        sandbox="allow-same-origin allow-forms"
        srcDoc={level.document ? page.html : initialHtml}
        onLoad={handleLoad}
        style={{ height: level.scene.height }}
      />
      <p className="browser__status" aria-live="polite">
        {status.text || ' '}
      </p>
    </div>
  );
}
