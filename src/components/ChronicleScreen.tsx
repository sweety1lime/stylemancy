import { useState } from 'react';
import { canEnterLand } from '../game/access';
import { useAuth } from '../game/auth';
import { useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import { useStats } from '../game/stats';
import {
  allLandsDone,
  allScriptLandsDone,
  FINALE_KEY,
  gamePrologue,
  grandFinale,
  isLandDone,
  markSeen,
  PROLOGUE_KEY,
  SCRIPTORIA_FINALE_KEY,
  SCRIPTORIA_KEY,
  scriptoriaFinale,
  scriptoriaPrologue,
  storyOf,
  type OpenStory,
} from '../game/story';
import { lands, scriptLands, type Land } from '../levels';
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
  const scriptDone = allScriptLandsDone(progress);

  /** Глава летописи — земля: её сценки по районам и грамота. */
  function chapter(land: Land, number: number) {
    const done = isLandDone(land, progress);
    const status = !land.regions.length
      ? 'в тумане'
      : done
        ? 'спасена'
        : canEnterLand(account, land, progress)
          ? 'в пути'
          : 'закрыта';
    // Грамота — когда земля построена целиком, без районов в тумане
    const complete = land.regions.length > 0 && land.upcoming.length === 0;
    return (
      <li key={land.id} className={done ? 'chronicle__chapter chronicle__chapter--done px-panel' : 'chronicle__chapter px-panel'}>
        <h2 className="pixel-subtitle">
          Глава {number}. {land.title}
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
        {complete && (done || teacher) && (
          <a className="button button--ghost chronicle__certificate" href={hrefFor({ name: 'certificate', id: land.id })}>
            {done ? 'Грамота' : 'Образец грамоты'}: {land.title}
          </a>
        )}
      </li>
    );
  }

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

        {lands.map((land, i) => chapter(land, i + 1))}

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

      {/* Часть II: за дверью <script> — главы по JavaScript */}
      <h2 className="pixel-title chronicle__part">Часть II. Скриптория</h2>
      <ol className="chronicle__chapters">
        <li className="chronicle__chapter px-panel">
          <h2 className="pixel-subtitle">Пролог: За дверью &lt;script&gt;</h2>
          {canWatch(SCRIPTORIA_KEY) ? (
            <button type="button" className="text-button" onClick={() => setStory(scriptoriaPrologue())}>
              Смотреть пролог
            </button>
          ) : (
            <p className="chronicle__locked">Покажется, когда герой шагнёт за дверь &lt;script&gt;.</p>
          )}
        </li>
        {scriptLands.map((land, i) => chapter(land, lands.length + i + 1))}

        <li className={scriptDone ? 'chronicle__chapter chronicle__chapter--done px-panel' : 'chronicle__chapter px-panel'}>
          <h2 className="pixel-subtitle">Финал: Магистр Скриптории</h2>
          {canWatch(SCRIPTORIA_FINALE_KEY) ? (
            <button type="button" className="text-button" onClick={() => setStory(scriptoriaFinale())}>
              Смотреть финал
            </button>
          ) : (
            <p className="chronicle__locked">Откроется, когда все земли Скриптории будут спасены.</p>
          )}
          {(scriptDone || teacher) && (
            <a className="button button--ghost chronicle__certificate" href={hrefFor({ name: 'certificate', id: 'master-script' })}>
              {scriptDone ? 'Грамота Магистра Скриптории' : 'Образец грамоты Магистра Скриптории'}
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
