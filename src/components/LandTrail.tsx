import { useState, type CSSProperties } from 'react';
import { useAuth } from '../game/auth';
import { useProgress, type ProgressMap } from '../game/progress';
import { hrefFor } from '../game/router';
import { isSeen, markSeen, storyOf, type OpenStory } from '../game/story';
import { gateLevel, isRegionOpen, isRegionReached } from '../game/unlock';
import type { Land } from '../levels';
import { EMBLEMS } from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { Portrait } from './Portrait';
import { Stars } from './Stars';
import { StoryScene } from './StoryScene';

/**
 * Пролог района, до которого студент уже дошёл, но ещё не видел. Чужие прологи раньше времени
 * не открываются — даже у учителя, которому открыты все районы.
 */
function firstUnseenIntro(land: Land, progress: ProgressMap): OpenStory | null {
  for (const [i, region] of land.regions.entries()) {
    const intro = storyOf(region, 'intro');
    if (isRegionReached(land, i, progress) && intro && !isSeen(intro.key)) return intro;
  }
  return null;
}

/** Тропа земли: районы и их уровни извилистой дорожкой. Следующий район открывается после испытания. */
export function LandTrail({ land }: { land: Land }) {
  const progress = useProgress();
  const { account } = useAuth();
  const [story, setStory] = useState<OpenStory | null>(() => firstUnseenIntro(land, progress));

  function closeStory() {
    if (story) markSeen(story.key);
    setStory(null);
  }

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

      {land.regions.map((region, regionIndex) => {
        const open = isRegionOpen(account, land, regionIndex, progress);
        const firstUnsolved = open ? region.levels.findIndex((level) => !progress[level.id]?.completed) : -2;
        const intro = open ? storyOf(region, 'intro') : null;
        const outro = firstUnsolved === -1 ? storyOf(region, 'outro') : null;
        const stars = region.levels.reduce((sum, level) => sum + (progress[level.id]?.stars ?? 0), 0);
        const previous = land.regions[regionIndex - 1];
        const gate = previous && gateLevel(previous);
        // «Испытание: Звёздная корона» → «Звёздная корона»: слово «испытание» уже есть в подписи
        const gateName = gate?.title.replace(/^Испытание:\s*/, '');
        return (
          <section key={region.id} className={open ? 'district px-panel' : 'district district--locked px-panel'}>
            <div className="district__head">
              <Portrait id={region.npc.portrait} scale={3} />
              <div>
                <h2 className="pixel-subtitle">{region.title}</h2>
                <p className="district__meta">
                  {region.topic} · {region.npc.name} · {open ? `★ ${stars} из ${region.levels.length * 3}` : 'закрыто'}
                </p>
              </div>
              <div className="district__story">
                {intro && (
                  <button type="button" className="text-button" onClick={() => setStory(intro)}>
                    Пролог
                  </button>
                )}
                {outro && (
                  <button type="button" className="text-button" onClick={() => setStory(outro)}>
                    Эпилог
                  </button>
                )}
              </div>
            </div>
            {!open && gate && (
              <p className="district__lock">
                Откроется после {gate.trial ? 'испытания' : 'уровня'} «{gateName}» в районе «{previous.title}».
              </p>
            )}
            <ol className="path">
              {region.levels.map((level, i) => {
                const done = progress[level.id]?.completed;
                const current = i === firstUnsolved;
                const classes = [
                  'path__node',
                  done && 'path__node--done',
                  current && 'path__node--current',
                  level.trial && 'path__node--trial',
                  !open && 'path__node--locked',
                ]
                  .filter(Boolean)
                  .join(' ');
                // Дорожка петляет: каждый следующий уровень смещён по синусоиде
                const offset = { '--offset': `${Math.round(Math.sin(i * 0.9) * 90)}px` } as CSSProperties;
                const label = level.trial ? '♛' : i + 1;
                return (
                  <li key={level.id} className="path__step" style={offset}>
                    {open ? (
                      <a className={classes} href={hrefFor({ name: 'level', id: level.id })} aria-label={`Уровень ${i + 1}: ${level.title}`}>
                        {label}
                      </a>
                    ) : (
                      <span className={classes} aria-label={`Уровень ${i + 1}: ${level.title}, закрыт`}>
                        {label}
                      </span>
                    )}
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

      {story && (
        <StoryScene title={story.title} frames={story.frames} finishLabel={story.finishLabel} onClose={closeStory} />
      )}
    </main>
  );
}
