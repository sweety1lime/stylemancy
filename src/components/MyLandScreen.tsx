import { useMemo, useState } from 'react';
import { useAuth } from '../game/auth';
import { useProgress } from '../game/progress';
import { hrefFor, navigate } from '../game/router';
import { canBuildLands, LAND_UNLOCK_ID, unlockLandTitle } from '../land/access';
import { useLandImages } from '../land/images';
import { deleteLand, saveLand, useLands } from '../land/lands';
import { LAND_LIMITS, MAX_LANDS, type Land } from '../land/model';
import { renderLand, type LandImages } from '../land/sanitize';
import { cleanLine } from '../land/share';
import { LAND_TEMPLATES, type LandTemplate } from '../land/templates';
import { ShareDialog } from './ShareDialog';
import '../land/land.css';

const FAILURES = {
  slot: 'Эта ячейка не подходит.',
  long: 'Заготовка длиннее предела.',
  space: 'В аккаунте не хватает места под новую землю: удали заметки в гримуаре или одну из земель.',
};

/** «Мои земли»: три ячейки. Пустую можно заполнить заготовкой, занятую — открыть, отправить ссылкой или удалить */
export function MyLandScreen() {
  const { account } = useAuth();
  const progress = useProgress();
  const lands = useLands();
  const images = useLandImages();
  const [sharing, setSharing] = useState<Land | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [problem, setProblem] = useState('');
  const nick = account?.nickname ? cleanLine(account.nickname, LAND_LIMITS.nick) : '';

  function create(slot: number, template: LandTemplate) {
    const result = saveLand({ slot, title: template.title, html: template.html, css: template.css, signed: false });
    if (result.ok) navigate({ name: 'myland', slot });
    else setProblem(FAILURES[result.reason]);
  }

  return (
    <main className="myland">
      <header className="myland__head">
        <h1 className="pixel-title">Моя земля</h1>
        <p className="myland__lead">
          Построй свою страницу из HTML и CSS: заголовки, картинки, цвета, сетка. Можно держать до {MAX_LANDS} земель. Готовой
          землёй делятся ссылкой, и открыть её сможет любой, кому ты её отправишь.
          {account?.role === 'student' && account.classInfo && ' Учитель класса видит твои земли в своей панели, подписаны они ником или нет.'}
        </p>
      </header>

      {!canBuildLands(account, progress) ? (
        <section className="myland__locked px-panel" aria-label="Моя земля пока закрыта">
          <h2 className="pixel-subtitle">Пока закрыто</h2>
          <p>
            Своя земля откроется, когда ты спасёшь землю «{unlockLandTitle()}»: там ты учишься тегам, из которых страница и
            строится.
          </p>
          <a className="button button--cast" href={hrefFor({ name: 'land', id: LAND_UNLOCK_ID })}>
            К земле «{unlockLandTitle()}»
          </a>
        </section>
      ) : (
        <>
          {problem && (
            <p className="myland__problem" role="alert">
              {problem}
            </p>
          )}
          <ul className="myland__slots">
            {Array.from({ length: MAX_LANDS }, (_, slot) => {
              const land = lands.find((item) => item.slot === slot);
              return (
                <li key={slot}>
                  {land ? (
                    <LandCard
                      land={land}
                      images={images}
                      confirming={confirming === slot}
                      onAskDelete={() => setConfirming(slot)}
                      onCancelDelete={() => setConfirming(null)}
                      onDelete={() => {
                        deleteLand(slot);
                        setConfirming(null);
                      }}
                      onShare={() => setSharing(land)}
                    />
                  ) : (
                    <section className="land-card land-card--empty px-panel" aria-label={`Ячейка ${slot + 1}: пусто`}>
                      <h2 className="pixel-subtitle">Ячейка {slot + 1}</h2>
                      <p className="land-card__lead">Здесь пока ничего нет. С чего начнём?</p>
                      <div className="land-card__actions">
                        {LAND_TEMPLATES.map((template) => (
                          <button key={template.id} type="button" className="button button--ghost button--small" onClick={() => create(slot, template)}>
                            {template.name}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}

      {sharing && (
        <ShareDialog
          land={{ title: sharing.title, html: sharing.html, css: sharing.css, nick: sharing.signed ? nick : '' }}
          images={images}
          onClose={() => setSharing(null)}
        />
      )}
    </main>
  );
}

interface LandCardProps {
  land: Land;
  images: LandImages;
  confirming: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
  onShare: () => void;
}

function LandCard({ land, images, confirming, onAskDelete, onCancelDelete, onDelete, onShare }: LandCardProps) {
  const page = useMemo(() => renderLand(land, images).document, [land, images]);
  return (
    <section className="land-card px-panel" aria-label={`Ячейка ${land.slot + 1}: ${land.title || 'Без названия'}`}>
      <h2 className="pixel-subtitle">{land.title || 'Без названия'}</h2>
      <div className="land-card__thumb" aria-hidden="true">
        <iframe title="" sandbox="" srcDoc={page} tabIndex={-1} />
      </div>
      <div className="land-card__actions">
        <a className="button button--cast button--small" href={hrefFor({ name: 'myland', slot: land.slot })}>
          Открыть
        </a>
        <button type="button" className="button button--ghost button--small" onClick={onShare}>
          Поделиться
        </button>
        {confirming ? (
          <span className="land-card__confirm" role="group" aria-label="Удалить землю?">
            <button type="button" className="button button--danger button--small" onClick={onDelete}>
              Да, удалить
            </button>
            <button type="button" className="text-button" onClick={onCancelDelete}>
              Нет
            </button>
          </span>
        ) : (
          <button type="button" className="text-button" onClick={onAskDelete}>
            Удалить
          </button>
        )}
      </div>
    </section>
  );
}
