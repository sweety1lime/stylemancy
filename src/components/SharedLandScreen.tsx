import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../game/auth';
import { useProgress } from '../game/progress';
import { hrefFor, navigate } from '../game/router';
import { canBuildLands, unlockLandTitle } from '../land/access';
import { useLandImages } from '../land/images';
import { saveLand, useLands } from '../land/lands';
import { LAND_LIMITS, MAX_LANDS } from '../land/model';
import { renderLand } from '../land/sanitize';
import { decodeLand, downloadLand, type SharedLand } from '../land/share';
import { LandFrame } from './LandFrame';
import '../land/land.css';

/** Почему чужую землю не удалось взять за основу */
type Refusal = 'full' | 'long' | 'space' | 'slot';

const REFUSALS: Record<Exclude<Refusal, 'full'>, string> = {
  long: `Эта земля длиннее предела «Моей земли»: в ней помещается не больше ${LAND_LIMITS.html} знаков HTML и ${LAND_LIMITS.css} знаков CSS.`,
  space: 'В аккаунте не хватает места под ещё одну землю: удали заметки в гримуаре или одну из своих земель.',
  slot: 'Не нашлось ячейки для этой земли.',
};

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
  const { account } = useAuth();
  const progress = useProgress();
  const mine = useLands();
  const images = useLandImages();
  const [codeShown, setCodeShown] = useState(false);
  const [refusal, setRefusal] = useState<Refusal | null>(null);
  const rendered = useMemo(() => renderLand(land, images), [land, images]);
  const canBuild = canBuildLands(account, progress);

  /**
   * Копия чужой земли ложится в первую свободную ячейку без подписи, и игрок попадает в редактор. Чужую землю игра не перезаписывает
   * и свою не затирает: если ячеек нет, надо сначала освободить одну. Основа запоминается, чтобы задания не засчитывались за чужой труд
   */
  function adopt() {
    const slot = Array.from({ length: MAX_LANDS }, (_, index) => index).find((index) => !mine.some((item) => item.slot === index));
    if (slot === undefined) {
      setRefusal('full');
      return;
    }
    const source = { html: land.html, css: land.css };
    const result = saveLand({ slot, title: `Копия: ${land.title || 'Без названия'}`, ...source, signed: false, base: source });
    if (result.ok) navigate({ name: 'myland', slot });
    else setRefusal(result.reason);
  }

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
        {canBuild && (
          <button type="button" className="button button--cast" onClick={adopt}>
            Взять за основу
          </button>
        )}
        <a className={canBuild ? 'button button--ghost' : 'button button--cast'} href={hrefFor({ name: 'myland' })}>
          Построить свою землю
        </a>
        <button type="button" className="button button--ghost" aria-expanded={codeShown} onClick={() => setCodeShown(!codeShown)}>
          {codeShown ? 'Спрятать код' : 'Показать код'}
        </button>
        <button type="button" className="button button--ghost" onClick={() => downloadLand(land, images)}>
          Скачать файл .html
        </button>
      </div>

      {!canBuild && (
        <p className="shared-land__hint">
          Взять эту землю за основу и переделать по-своему можно будет, когда ты спасёшь землю «{unlockLandTitle()}»: там учат тегам,
          из которых страница и строится.
        </p>
      )}

      {refusal === 'full' && (
        <p className="shared-land__problem" role="alert">
          Все {MAX_LANDS} ячейки «Моей земли» заняты, а свою землю игра не затирает. Освободи одну в <a href={hrefFor({ name: 'myland' })}>списке твоих земель</a> и
          вернись сюда по этой же ссылке.
        </p>
      )}
      {refusal && refusal !== 'full' && (
        <p className="shared-land__problem" role="alert">
          {REFUSALS[refusal]}
        </p>
      )}

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
