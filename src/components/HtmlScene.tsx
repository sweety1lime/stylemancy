import { useEffect, useMemo, useRef, useState } from 'react';
import { htmlPage } from '../engine/htmlCheck';
import type { HtmlLevel } from '../engine/types';

interface HtmlSceneProps {
  level: HtmlLevel;
  code: string;
  /** Картинки по именам: src="potion.png" → спрайт */
  images: Record<string, string>;
  celebrate?: boolean;
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
export function HtmlScene({ level, code, images, celebrate }: HtmlSceneProps) {
  const page = useMemo(() => htmlPage(level, code, images), [level, code, images]);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const pageRef = useRef(page);
  const codeRef = useRef(code);
  // Документ для первой загрузки; дальше содержимое страницы меняется на месте
  const [initialHtml] = useState(page.html);
  // Строка состояния относится к тому коду, при котором её показали
  const [status, setStatus] = useState({ code, text: '' });

  useEffect(() => {
    pageRef.current = page;
    codeRef.current = code;
    if (!level.document) showBody(frameRef.current, page.body);
  }, [page, code, level.document]);

  function handleLoad() {
    const frame = frameRef.current;
    const doc = frame?.contentDocument;
    if (!doc) return;
    if (!level.document) showBody(frame, pageRef.current.body);
    const say = (text: string) => setStatus({ code: codeRef.current, text });
    const linkOf = (target: EventTarget | null) => (target instanceof doc.defaultView!.Element ? target.closest('a') : null);

    doc.addEventListener('mouseover', (event) => {
      const link = linkOf(event.target);
      say(link ? `Ссылка → ${link.getAttribute('href') || 'никуда: у неё нет href'}` : '');
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
    <div className={celebrate ? 'browser browser--celebrate' : 'browser'}>
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
        {(status.code === code && status.text) || ' '}
      </p>
    </div>
  );
}
