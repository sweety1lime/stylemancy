import { useEffect, useMemo, useState } from 'react';
import { hrefFor } from '../game/router';
import { useLandImages } from '../land/images';
import { renderLand } from '../land/sanitize';
import { decodeLand, downloadLand, type SharedLand } from '../land/share';
import { LandFrame } from './LandFrame';
import '../land/land.css';

/**
 * Чужая земля по ссылке. Вся земля лежит в самой ссылке, поэтому показать её можно без сервера и без входа.
 * Игра не проверяла эту страницу: перед показом её пересобирает санитайзер, а сама она живёт в изолированной рамке.
 */
export function SharedLandScreen({ code }: { code: string }) {
  const [land, setLand] = useState<SharedLand | 'loading' | 'bad'>('loading');
  useEffect(() => {
    let current = true;
    void decodeLand(code).then((value) => {
      if (current) setLand(value ?? 'bad');
    });
    return () => {
      current = false;
    };
  }, [code]);

  if (land === 'loading') {
    return (
      <p className="loading" role="status">
        Открываю землю…
      </p>
    );
  }
  if (land === 'bad') {
    return (
      <main className="myland">
        <section className="myland__locked px-panel" aria-label="Ссылка не открывается">
          <h1 className="pixel-subtitle">Эта ссылка не открывается</h1>
          <p>Скорее всего, ссылку скопировали не целиком или повредили по дороге. Попроси автора прислать её ещё раз.</p>
          <a className="button button--cast" href={hrefFor({ name: 'map' })}>
            На карту
          </a>
        </section>
      </main>
    );
  }
  return <SharedLandView land={land} />;
}

function SharedLandView({ land }: { land: SharedLand }) {
  const images = useLandImages();
  const [codeShown, setCodeShown] = useState(false);
  const rendered = useMemo(() => renderLand(land, images), [land, images]);

  return (
    <main className="shared-land">
      <header className="shared-land__head">
        <h1 className="pixel-title">{land.title || 'Без названия'}</h1>
        <p className="shared-land__by">{land.nick ? `Построил игрок ${land.nick}` : 'Автор не подписался'}</p>
      </header>

      <LandFrame page={rendered.document} title={land.title} height={560} />

      <p className="shared-land__warning">
        Эту землю построил игрок, игра её не проверяла. Код и переходы по чужим адресам в ней отключены, поэтому страница
        ничего не может сделать с твоим компьютером.
      </p>

      {rendered.notes.length > 0 && (
        <details className="land-notes px-panel">
          <summary>Что игра убрала из этой земли ({rendered.notes.length})</summary>
          <ul>
            {rendered.notes.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </details>
      )}

      <div className="shared-land__actions">
        <a className="button button--cast" href={hrefFor({ name: 'myland' })}>
          Построить свою землю
        </a>
        <button type="button" className="button button--ghost" aria-expanded={codeShown} onClick={() => setCodeShown(!codeShown)}>
          {codeShown ? 'Спрятать код' : 'Показать код'}
        </button>
        <button type="button" className="button button--ghost" onClick={() => downloadLand(land, images)}>
          Скачать файл .html
        </button>
      </div>

      {codeShown && (
        <section className="shared-land__code px-panel" aria-label="Код земли">
          <h2 className="pixel-subtitle">index.html</h2>
          <pre>{land.html || '(пусто)'}</pre>
          <h2 className="pixel-subtitle">style.css</h2>
          <pre>{land.css || '(пусто)'}</pre>
        </section>
      )}
    </main>
  );
}
