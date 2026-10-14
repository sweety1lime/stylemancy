import { useState } from 'react';
import { isLandOpen, useAuth } from '../game/auth';
import { useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import { useStats } from '../game/stats';
import {
  allLandsDone,
  FINALE_KEY,
  gamePrologue,
  grandFinale,
  isLandDone,
  markSeen,
  PROLOGUE_KEY,
  storyOf,
  type OpenStory,
} from '../game/story';
import { lands } from '../levels';
import { BOOK } from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { StoryScene } from './StoryScene';

/** Летопись героя: вся история по главам — пересмотреть сценки и забрать грамоты. */
export function ChronicleScreen() {
  const progress = useProgress();
  const { seen } = useStats();
  const { account } = useAuth();
  const [story, setStory] = useState<OpenStory | null>(null);
  // Учителю открыты все сценки — чтобы вычитать сюжет целиком
  const teacher = account?.role === 'teacher';
  const canWatch = (key: string) => teacher || Boolean(seen[key]);
  const allDone = allLandsDone(progress);

  return (
    <main className="chronicle">
      <header className="chronicle__head">
        <PixelArt sprite={BOOK} scale={4} />
        <div>
          <h1 className="pixel-title">Летопись героя</h1>
          <p className="chronicle__lead">
            Вся история по главам — в том порядке, в каком её проходят на курсе. Увиденные сценки можно пересмотреть, остальные
            откроются по пути.
          </p>
          {teacher && <p className="chronicle__teacher">Учителю открыты все сценки и образцы грамот — можно вычитать сюжет целиком.</p>}
        </div>
      </header>

      <ol className="chronicle__chapters">
        <li className="chronicle__chapter px-panel">
          <h2 className="pixel-subtitle">Пролог: Великий Сброс</h2>
          {canWatch(PROLOGUE_KEY) ? (
            <button type="button" className="text-button" onClick={() => setStory(gamePrologue())}>
              Смотреть пролог
            </button>
          ) : (
            <p className="chronicle__locked">Пролог покажется на карте королевства.</p>
          )}
        </li>

        {lands.map((land, i) => {
          const done = isLandDone(land, progress);
          const status = !land.regions.length
            ? 'в тумане'
            : done
              ? 'спасена'
              : isLandOpen(account, land.id)
                ? 'в пути'
                : 'закрыта учителем';
          return (
            <li key={land.id} className={done ? 'chronicle__chapter chronicle__chapter--done px-panel' : 'chronicle__chapter px-panel'}>
              <h2 className="pixel-subtitle">
                Глава {i + 1}. {land.title}
              </h2>
              <p className="chronicle__status">
                {land.topic} · {status}
              </p>
              {land.regions.length > 0 && (
                <ul className="chronicle__stories">
                  {land.regions.flatMap((region) =>
                    (['intro', 'outro'] as const).map((part) => {
                      const open = storyOf(region, part);
                      if (!open) return null;
                      return (
                        <li key={open.key}>
                          {canWatch(open.key) ? (
                            <button type="button" className="text-button" onClick={() => setStory(storyOf(region, part))}>
                              {open.title}
                            </button>
                          ) : (
                            <span className="chronicle__locked">{open.title} — впереди</span>
                          )}
                        </li>
                      );
                    }),
                  )}
                </ul>
              )}
              {land.regions.length > 0 && (done || teacher) && (
                <a className="button button--ghost chronicle__certificate" href={hrefFor({ name: 'certificate', id: land.id })}>
                  {done ? 'Грамота' : 'Образец грамоты'}: {land.title}
                </a>
              )}
            </li>
          );
        })}

        <li className={allDone ? 'chronicle__chapter chronicle__chapter--done px-panel' : 'chronicle__chapter px-panel'}>
          <h2 className="pixel-subtitle">Финал: Магистр Стилемантии</h2>
          {canWatch(FINALE_KEY) ? (
            <button type="button" className="text-button" onClick={() => setStory(grandFinale())}>
              Смотреть финал
            </button>
          ) : (
            <p className="chronicle__locked">Откроется, когда все земли Каскадии будут спасены.</p>
          )}
          {(allDone || teacher) && (
            <a className="button button--ghost chronicle__certificate" href={hrefFor({ name: 'certificate', id: 'master' })}>
              {allDone ? 'Грамота Магистра' : 'Образец грамоты Магистра'}
            </a>
          )}
        </li>
      </ol>

      {story && (
        <StoryScene
          key={story.key}
          title={story.title}
          frames={story.frames}
          finishLabel="Закрыть"
          onClose={() => {
            markSeen(story.key);
            setStory(null);
          }}
        />
      )}
    </main>
  );
}
