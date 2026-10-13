import { currentLevel, useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import { findLevel, lands, type Land } from '../levels';
import { EMBLEMS, LAND_ROCKS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { Portrait } from './Portrait';

/** Карта королевства: земли-темы курса. Земли без уровней пока в тумане. */
export function WorldMap() {
  const progress = useProgress();
  const resume = findLevel(currentLevel.get() ?? '');

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
          {resume && (
            <a className="button button--cast world__resume" href={hrefFor({ name: 'level', id: resume.level.id })}>
              Продолжить: {resume.level.title}
            </a>
          )}
        </div>
      </section>

      <div className="world-map">
        <svg className="world-map__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline points="17,9 83,11 50,42 83,74" />
        </svg>
        {lands.map((land, i) => {
          const stats = landStats(land);
          const open = land.regions.length > 0;
          const body = (
            <>
              <span className="land__art">
                <PixelArt className="land__emblem" sprite={EMBLEMS[land.emblem]} scale={land.emblem === 'crystal' ? 3 : 4} />
                <PixelArt className="land__rock" sprite={LAND_ROCKS[land.emblem]} scale={4} />
              </span>
              <span className="land__title">{land.title}</span>
              <span className="land__topic">{land.topic}</span>
              <span className="land__status">
                {open ? `Пройдено ${stats.done} из ${stats.total} · ★ ${stats.stars}` : 'В тумане — скоро'}
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
    </main>
  );
}
