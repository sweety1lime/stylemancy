import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isLandOpen, refreshAccount, useAuth } from '../game/auth';
import { currentLevel, useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import { fullEffects } from '../game/settings';
import { read, scopedKey, write } from '../game/storage';
import { gamePrologue, isLandDone, isSeen, markSeen, PROLOGUE_KEY } from '../game/story';
import { findLevel, lands, type Land } from '../levels';
import { spriteAnimElement } from '../pixel/sheet';
import { CLOUD, EMBLEMS, FOG, HERO_ANIMATIONS, LAND_ROCKS, SKY_SPARK } from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { Portrait } from './Portrait';
import { SpriteAnim } from './SpriteAnim';
import { StoryScene } from './StoryScene';

/** Тропа на карте: центры земель по порядку курса, в процентах ширины и высоты карты */
const PATH_POINTS: [number, number][] = [
  [17, 9],
  [83, 11],
  [50, 42],
  [83, 74],
];

/** Где герой стоял в прошлый раз — чтобы пройти к новой земле пешком */
const HERO_KEY = 'cascadia.hero.v1';
/** Масштаб героя на карте */
const HERO_SCALE = 2;

/** Герой идёт от одной земли к другой: шагает в четыре кадра, а настоящий герой ждёт на месте. onArrive — когда дошёл. */
function walk(map: HTMLElement, from: Element, hero: HTMLElement, onArrive: () => void): () => void {
  const start = from.getBoundingClientRect();
  const end = hero.getBoundingClientRect();
  const base = map.getBoundingClientRect();
  const walker = spriteAnimElement(HERO_ANIMATIONS.walk, 8, HERO_SCALE);
  walker.classList.add('land__walker');
  Object.assign(walker.style, { left: `${end.left - base.left}px`, top: `${end.top - base.top}px` });
  hero.style.visibility = 'hidden';
  map.append(walker);
  const dx = start.left + start.width * 0.15 - end.left;
  const dy = start.top + start.height * 0.45 - end.top;
  const animation = walker.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
    duration: 2200,
    delay: 400,
    easing: 'ease-in-out',
    fill: 'backwards',
  });
  const finish = () => {
    walker.remove();
    hero.style.visibility = '';
  };
  animation.onfinish = () => {
    finish();
    onArrive();
  };
  return () => {
    animation.cancel();
    finish();
  };
}

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

  const open = (land: Land) => land.regions.length > 0 && isLandOpen(account, land.id);
  const saved = lands.map((land) => isLandDone(land, progress));
  // Герой стоит у земли, где открыт последний уровень, или у первой открытой и ещё не спасённой
  const heroLand = resume?.land.id ?? lands.find((land, i) => open(land) && !saved[i])?.id ?? lands[0].id;
  const mapRef = useRef<HTMLDivElement>(null);

  // Герой сменил землю — идёт к ней пешком по карте. Новое место запоминаем, когда дошёл
  useLayoutEffect(() => {
    const was = read<string | null>(scopedKey(HERO_KEY), null);
    const arrive = () => write(scopedKey(HERO_KEY), heroLand);
    const map = mapRef.current;
    const from = was && was !== heroLand ? map?.querySelector(`[data-land="${was}"] .land__art`) : null;
    const hero = map?.querySelector<HTMLElement>(`[data-land="${heroLand}"] .land__hero`);
    if (!map || !from || !hero || !fullEffects()) {
      arrive();
      return;
    }
    return walk(map, from, hero, arrive);
  }, [heroLand]);

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

      <div className="world-map" ref={mapRef}>
        <div className="world-map__sky" aria-hidden="true">
          <PixelArt className="cloud cloud--1" sprite={CLOUD} scale={5} />
          <PixelArt className="cloud cloud--2" sprite={CLOUD} scale={4} />
          <PixelArt className="cloud cloud--3" sprite={CLOUD} scale={6} />
        </div>
        {/* Тропа загорается за спасёнными землями, а к следующей земле по ней бегут огоньки */}
        <svg className="world-map__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {PATH_POINTS.slice(1).map(([x2, y2], k) => {
            const [x1, y1] = PATH_POINTS[k];
            const state = saved[k] ? (saved[k + 1] ? 'walked' : 'open') : 'dim';
            return <line key={k} className={`path path--${state}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </svg>
        {lands.map((land, i) => {
          const stats = landStats(land);
          const built = land.regions.length > 0;
          const isOpen = open(land);
          const body = (
            <>
              <span className="land__art">
                <PixelArt className="land__emblem" sprite={EMBLEMS[land.emblem]} scale={land.emblem === 'crystal' ? 3 : 4} />
                <PixelArt className="land__rock" sprite={LAND_ROCKS[land.emblem]} scale={4} />
                {saved[i] && <PixelArt className="land__spark" sprite={SKY_SPARK} scale={4} />}
                {!isOpen && (
                  <>
                    <PixelArt className="land__fog land__fog--a" sprite={FOG} scale={4} />
                    <PixelArt className="land__fog land__fog--b" sprite={FOG} scale={3} />
                  </>
                )}
                {land.id === heroLand && <SpriteAnim className="land__hero" frames={HERO_ANIMATIONS.idle} fps={2} scale={HERO_SCALE} />}
              </span>
              <span className="land__title">{land.title}</span>
              <span className="land__topic">{land.topic}</span>
              <span className="land__status">
                {isOpen
                  ? `Пройдено ${stats.done} из ${stats.total} · ★ ${stats.stars}`
                  : built
                    ? 'Закрыто учителем'
                    : 'В тумане — скоро'}
              </span>
            </>
          );
          return isOpen ? (
            <a key={land.id} className={`land land--${i + 1}`} data-land={land.id} href={hrefFor({ name: 'land', id: land.id })}>
              {body}
            </a>
          ) : (
            <div key={land.id} className={`land land--${i + 1} land--fog`} data-land={land.id} aria-disabled="true">
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
