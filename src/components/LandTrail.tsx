import type { CSSProperties } from 'react';
import { useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import type { Land } from '../levels';
import { EMBLEMS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { Portrait } from './Portrait';
import { Stars } from './Stars';

/** Тропа земли: районы и их уровни извилистой дорожкой. */
export function LandTrail({ land }: { land: Land }) {
  const progress = useProgress();

  return (
    <main className="trail">
      <header className="trail__head">
        <PixelArt sprite={EMBLEMS[land.emblem]} scale={land.emblem === 'crystal' ? 3 : 5} />
        <div>
          <h1 className="pixel-title">{land.title}</h1>
          <p className="trail__blurb">
            {land.topic} · {land.blurb}
          </p>
        </div>
      </header>

      {land.regions.map((region) => {
        const firstUnsolved = region.levels.findIndex((level) => !progress[level.id]?.completed);
        const stars = region.levels.reduce((sum, level) => sum + (progress[level.id]?.stars ?? 0), 0);
        return (
          <section key={region.id} className="district px-panel">
            <div className="district__head">
              <Portrait id={region.npc.portrait} scale={3} />
              <div>
                <h2 className="pixel-subtitle">{region.title}</h2>
                <p className="district__meta">
                  {region.topic} · {region.npc.name} · ★ {stars} из {region.levels.length * 3}
                </p>
              </div>
            </div>
            <ol className="path">
              {region.levels.map((level, i) => {
                const done = progress[level.id]?.completed;
                const current = i === firstUnsolved;
                const classes = [
                  'path__node',
                  done && 'path__node--done',
                  current && 'path__node--current',
                  level.trial && 'path__node--trial',
                ];
                // Дорожка петляет: каждый следующий уровень смещён по синусоиде
                const offset = { '--offset': `${Math.round(Math.sin(i * 0.9) * 90)}px` } as CSSProperties;
                return (
                  <li key={level.id} className="path__step" style={offset}>
                    <a
                      className={classes.filter(Boolean).join(' ')}
                      href={hrefFor({ name: 'level', id: level.id })}
                      aria-label={`Уровень ${i + 1}: ${level.title}`}
                    >
                      {level.trial ? '♛' : i + 1}
                    </a>
                    <span className="path__label">
                      <span className="path__title">{level.title}</span>
                      {done ? (
                        <Stars count={progress[level.id].stars} scale={2} />
                      ) : (
                        current && <span className="path__here">ты здесь</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}

      {land.upcoming.map((name) => (
        <section key={name} className="district district--fog px-panel">
          <h2 className="pixel-subtitle">{name}</h2>
          <p className="district__meta">В тумане — откроется позже</p>
        </section>
      ))}
    </main>
  );
}
