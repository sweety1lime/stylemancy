import { useEffect, useState } from 'react';
import { isLandOpen, refreshAccount, useAuth } from '../game/auth';
import { currentLevel, useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import { gamePrologue, isSeen, markSeen, PROLOGUE_KEY } from '../game/story';
import { findLevel, lands, type Land } from '../levels';
import { EMBLEMS, LAND_ROCKS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { Portrait } from './Portrait';
import { StoryScene } from './StoryScene';

/** Карта королевства: земли-темы курса. Земли без уровней пока в тумане. */
export function WorldMap() {
  const progress = useProgress();
  const { account, ready } = useAuth();
  const resume = findLevel(currentLevel.get() ?? '');
  // Пролог всей игры — один раз, при первом входе на карту. Ник героя известен, когда аккаунт загрузился
  const [prologueOpen, setPrologueOpen] = useState(() => !isSeen(PROLOGUE_KEY));
  const prologue = prologueOpen && ready ? gamePrologue() : null;

  // Учитель мог открыть классу новые земли — подтягиваем свежие настройки
  useEffect(() => {
    void refreshAccount();
  }, []);

  function landStats(land: Land) {
    const levels = land.regions.flatMap((region) => region.levels);
    return {
      total: levels.length,
      done: levels.filter((level) => progress[level.id]?.completed).length,
      stars: levels.reduce((sum, level) => sum + (progress[level.id]?.stars ?? 0), 0),
    };
  }

  return (
    <main className="world">
      <section className="world__intro px-panel">
        <Portrait id="default" />
        <div>
          <h1 className="pixel-title">Карта Каскадии</h1>
          <p>
            Лорд Дефолт проклял королевство: он хочет, чтобы всё снова выглядело как страница без стилей — Times New
            Roman и синие ссылки. Каждая земля — тема вёрстки. Освой её магию и сними проклятие.
          </p>
          {account?.classInfo && <p className="world__class">Класс «{account.classInfo.name}»</p>}
          <div className="world__actions">
            {resume && (
              <a className="button button--cast" href={hrefFor({ name: 'level', id: resume.level.id })}>
                Продолжить: {resume.level.title}
              </a>
            )}
            <a className="button button--ghost" href={hrefFor({ name: 'chronicle' })}>
              Летопись героя
            </a>
          </div>
        </div>
      </section>

      {ready && !account && (
        <section className="world__guest px-panel">
          <p>
            Ты играешь как гость: прогресс хранится только в этом браузере. Войди по коду класса, чтобы учитель видел
            твои успехи, а прогресс сохранялся на любом компьютере.
          </p>
          <a className="button button--ghost" href="#/login">
            Войти
          </a>
        </section>
      )}

      <div className="world-map">
        <svg className="world-map__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="17,9 83,11 50,42 83,74" />
        </svg>
        {lands.map((land, i) => {
          const stats = landStats(land);
          const built = land.regions.length > 0;
          const open = built && isLandOpen(account, land.id);
          const body = (
            <>
              <span className="land__art">
                <PixelArt className="land__emblem" sprite={EMBLEMS[land.emblem]} scale={land.emblem === 'crystal' ? 3 : 4} />
                <PixelArt className="land__rock" sprite={LAND_ROCKS[land.emblem]} scale={4} />
              </span>
              <span className="land__title">{land.title}</span>
              <span className="land__topic">{land.topic}</span>
              <span className="land__status">
                {open
                  ? `Пройдено ${stats.done} из ${stats.total} · ★ ${stats.stars}`
                  : built
                    ? 'Закрыто учителем'
                    : 'В тумане — скоро'}
              </span>
            </>
          );
          return open ? (
            <a key={land.id} className={`land land--${i + 1}`} href={hrefFor({ name: 'land', id: land.id })}>
              {body}
            </a>
          ) : (
            <div key={land.id} className={`land land--${i + 1} land--fog`} aria-disabled="true">
              {body}
            </div>
          );
        })}
      </div>

      {prologue && (
        <StoryScene
          title={prologue.title}
          frames={prologue.frames}
          finishLabel={prologue.finishLabel}
          onClose={() => {
            markSeen(PROLOGUE_KEY);
            setPrologueOpen(false);
          }}
        />
      )}
    </main>
  );
}
