import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { canEnterLand, isScriptoriaOpen } from '../game/access';
import { refreshAccount, useAuth } from '../game/auth';
import { currentLevel, useProgress } from '../game/progress';
import { hrefFor } from '../game/router';
import { fullEffects } from '../game/settings';
import { read, scopedKey, write } from '../game/storage';
import { useStats } from '../game/stats';
import {
  allLandsDone,
  gamePrologue,
  isLandDone,
  isSeen,
  markSeen,
  PROLOGUE_KEY,
  SCRIPTORIA_KEY,
  scriptoriaPrologue,
  type OpenStory,
} from '../game/story';
import { findLevel, isScriptLand, lands, scriptLands, type Land } from '../levels';
import { spriteAnimElement } from '../pixel/sheet';
import {
  CLOUD,
  EMBLEM_SCALE,
  EMBLEMS,
  FOG,
  GEAR_FRAMES,
  HERO_ANIMATIONS,
  LAND_ROCKS,
  SCRIPT_DOOR,
  SCRIPT_DOOR_OPEN,
  SKY_SPARK,
} from '../pixel/sprites';
import { PixelArt } from './PixelArt';
import { Portrait } from './Portrait';
import { SpriteAnim } from './SpriteAnim';
import { StoryScene } from './StoryScene';

export type WorldId = 'cascadia' | 'scriptoria';

/** Тропа по карте: точки в процентах ширины и высоты — центры земель и двери по порядку пути */
const PATHS: Record<WorldId, [number, number][]> = {
  // Четыре земли по порядку курса, а в конце — дверь <script>
  cascadia: [
    [17, 9],
    [83, 11],
    [50, 42],
    [83, 74],
    [17, 74],
  ],
  // Сначала дверь, через которую пришёл, потом земли Скриптории
  scriptoria: [
    [17, 11],
    [83, 11],
    [50, 42],
    [83, 74],
    [17, 74],
  ],
};

/** Где герой стоял в прошлый раз — чтобы пройти к новой земле пешком. У каждого мира свой ключ */
const HERO_KEYS: Record<WorldId, string> = { cascadia: 'cascadia.hero.v1', scriptoria: 'cascadia.hero.scriptoria.v1' };
/** Дверь на карте — для героя она такая же остановка, как земля */
const DOOR = 'door';
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

interface Tile {
  key: string;
  className: string;
  href?: string;
  art: ReactNode;
  title: string;
  topic: string;
  status: string;
}

/**
 * Карта мира: земли — темы курса. Каскадия (HTML и CSS) и Скриптория (JavaScript) соединены дверью <script>:
 * в Каскадии она стоит в конце тропы, в Скриптории — в начале. Земли без уровней пока в тумане.
 */
export function WorldMap({ world = 'cascadia' }: { world?: WorldId }) {
  const progress = useProgress();
  const { seen } = useStats();
  const { account, ready } = useAuth();
  const worldLands = world === 'cascadia' ? lands : scriptLands;
  const resume = findLevel(currentLevel.get() ?? '');
  const prologueKey = world === 'cascadia' ? PROLOGUE_KEY : SCRIPTORIA_KEY;
  // Пролог мира — один раз, при первом входе на его карту. Ник героя известен, когда аккаунт загрузился
  const [prologueOpen, setPrologueOpen] = useState(() => !isSeen(prologueKey));
  const prologue: OpenStory | null = prologueOpen && ready ? (world === 'cascadia' ? gamePrologue() : scriptoriaPrologue()) : null;

  // Учитель мог открыть классу новые земли — подтягиваем свежие настройки
  useEffect(() => {
    void refreshAccount();
  }, []);

  const open = (land: Land) => land.regions.length > 0 && canEnterLand(account, land, progress);
  const saved = worldLands.map((land) => isLandDone(land, progress));
  const doorOpen = world === 'scriptoria' || isScriptoriaOpen(account, progress);
  const allDone = allLandsDone(progress);
  const visited = Boolean(seen[SCRIPTORIA_KEY]);

  // Где стоит герой: у земли последнего открытого уровня, у первой открытой и не спасённой — или у двери
  const resumeHere = resume && isScriptLand(resume.land) === (world === 'scriptoria') ? resume.land.id : undefined;
  // Последний уровень — в другом мире: в Каскадии герой ждёт у двери
  const resumeElsewhere = Boolean(resume) && !resumeHere;
  const nextLand = worldLands.find((land, i) => open(land) && !saved[i])?.id;
  const heroLand =
    resumeHere ??
    (world === 'cascadia' ? (resumeElsewhere || (allDone && doorOpen) ? DOOR : (nextLand ?? lands[0].id)) : (nextLand ?? DOOR));
  const mapRef = useRef<HTMLDivElement>(null);

  // Герой сменил землю — идёт к ней пешком по карте. Новое место запоминаем, когда дошёл
  useLayoutEffect(() => {
    const key = scopedKey(HERO_KEYS[world]);
    const was = read<string | null>(key, null);
    const arrive = () => write(key, heroLand);
    const map = mapRef.current;
    const from = was && was !== heroLand ? map?.querySelector(`[data-land="${was}"] .land__art`) : null;
    const hero = map?.querySelector<HTMLElement>(`[data-land="${heroLand}"] .land__hero`);
    if (!map || !from || !hero || !fullEffects()) {
      arrive();
      return;
    }
    return walk(map, from, hero, arrive);
  }, [heroLand, world]);

  function landStats(list: Land[]) {
    const levels = list.flatMap((land) => land.regions.flatMap((region) => region.levels));
    return {
      total: levels.length,
      done: levels.filter((level) => progress[level.id]?.completed).length,
      stars: levels.reduce((sum, level) => sum + (progress[level.id]?.stars ?? 0), 0),
    };
  }

  const heroHere = (id: string) =>
    id === heroLand && <SpriteAnim className="land__hero" frames={HERO_ANIMATIONS.idle} fps={2} scale={HERO_SCALE} />;

  const landTiles: Tile[] = worldLands.map((land, i) => {
    const stats = landStats([land]);
    const built = land.regions.length > 0;
    const isOpen = open(land);
    return {
      key: land.id,
      className: `land land--${i + 1}${isOpen ? '' : ' land--fog'}`,
      href: isOpen ? hrefFor({ name: 'land', id: land.id }) : undefined,
      art: (
        <>
          <PixelArt className="land__emblem" sprite={EMBLEMS[land.emblem]} scale={EMBLEM_SCALE[land.emblem] ?? 4} />
          <PixelArt className="land__rock" sprite={LAND_ROCKS[land.emblem]} scale={4} />
          {saved[i] && <PixelArt className="land__spark" sprite={SKY_SPARK} scale={4} />}
          {!isOpen && (
            <>
              <PixelArt className="land__fog land__fog--a" sprite={FOG} scale={4} />
              <PixelArt className="land__fog land__fog--b" sprite={FOG} scale={3} />
            </>
          )}
          {heroHere(land.id)}
        </>
      ),
      title: land.title,
      topic: land.topic,
      status: isOpen ? `Пройдено ${stats.done} из ${stats.total} · ★ ${stats.stars}` : built ? 'Закрыто учителем' : 'В тумане — скоро',
    };
  });

  const script = landStats(scriptLands);
  const doorTile: Tile =
    world === 'cascadia'
      ? {
          key: DOOR,
          className: `land land--door${doorOpen ? '' : ' land--locked'}`,
          href: doorOpen ? hrefFor({ name: 'scriptoria' }) : undefined,
          art: (
            <>
              <PixelArt className="land__door" sprite={doorOpen ? SCRIPT_DOOR_OPEN : SCRIPT_DOOR} scale={3} />
              <PixelArt className="land__rock" sprite={LAND_ROCKS.door} scale={4} />
              {heroHere(DOOR)}
            </>
          ),
          title: 'Дверь <script>',
          topic: 'JavaScript',
          status: !doorOpen
            ? 'Заперта: откроет учитель или общий финал'
            : visited
              ? `Скриптория · пройдено ${script.done} из ${script.total}`
              : 'Открыта — шагни за порог!',
        }
      : {
          key: DOOR,
          className: 'land land--door',
          href: hrefFor({ name: 'map' }),
          art: (
            <>
              <PixelArt className="land__door" sprite={SCRIPT_DOOR_OPEN} scale={3} />
              <PixelArt className="land__rock" sprite={LAND_ROCKS.door} scale={4} />
              {heroHere(DOOR)}
            </>
          ),
          title: 'Дверь в Каскадию',
          topic: 'HTML и CSS',
          status: 'Назад, на карту Каскадии',
        };
  const tiles = [...landTiles, doorTile];

  // Остановки тропы по порядку: пройдена ли каждая и можно ли к ней идти. К двери Каскадии ведёт только общий финал
  const passed = world === 'cascadia' ? [...saved, allDone && doorOpen && visited] : [true, ...saved];
  const reachable = world === 'cascadia' ? [...saved.map(() => true), allDone && doorOpen] : passed.map(() => true);
  const path = PATHS[world];

  return (
    <main className={`world world--${world}`}>
      <section className="world__intro px-panel">
        <Portrait id={world === 'cascadia' ? 'default' : 'oracle'} />
        <div>
          <h1 className="pixel-title">{world === 'cascadia' ? 'Карта Каскадии' : 'Карта Скриптории'}</h1>
          {world === 'cascadia' ? (
            <p>
              Лорд Дефолт проклял королевство: он хочет, чтобы всё снова выглядело как страница без стилей — Times New
              Roman и синие ссылки. Каждая земля — тема вёрстки. Освой её магию и сними проклятие. А в углу карты стоит
              загадочная дверь <code>&lt;script&gt;</code> — за ней начинается совсем другая магия.
            </p>
          ) : (
            <p>
              За дверью <code>&lt;script&gt;</code> всё движется само. Лорд Дефолт хочет всё обнулить: опустошить
              колбы-переменные и остановить кнопки. Каждая земля — тема JavaScript: освой её приказы и догони злодея.
            </p>
          )}
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

      <div className={`world-map world-map--${world}`} ref={mapRef}>
        <div className="world-map__sky" aria-hidden="true">
          {world === 'cascadia' ? (
            <>
              <PixelArt className="cloud cloud--1" sprite={CLOUD} scale={5} />
              <PixelArt className="cloud cloud--2" sprite={CLOUD} scale={4} />
              <PixelArt className="cloud cloud--3" sprite={CLOUD} scale={6} />
            </>
          ) : (
            <>
              <SpriteAnim className="sky-gear sky-gear--1" frames={GEAR_FRAMES} fps={3} scale={5} />
              <SpriteAnim className="sky-gear sky-gear--2" frames={GEAR_FRAMES} fps={2} scale={3} />
              <SpriteAnim className="sky-gear sky-gear--3" frames={GEAR_FRAMES} fps={4} scale={4} />
            </>
          )}
        </div>
        {/* Тропа: за пройденным — золото, к следующей остановке бегут огоньки, дальше — пунктир */}
        <svg className="world-map__path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {path.slice(1).map(([x2, y2], k) => {
            const [x1, y1] = path[k];
            const state = passed[k] ? (passed[k + 1] ? 'walked' : reachable[k + 1] ? 'open' : 'dim') : 'dim';
            return <line key={k} className={`path path--${state}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
          })}
        </svg>
        {tiles.map((tile) => {
          const body = (
            <>
              <span className="land__art">{tile.art}</span>
              <span className="land__title">{tile.title}</span>
              <span className="land__topic">{tile.topic}</span>
              <span className="land__status">{tile.status}</span>
            </>
          );
          return tile.href ? (
            <a key={tile.key} className={tile.className} data-land={tile.key} href={tile.href}>
              {body}
            </a>
          ) : (
            <div key={tile.key} className={tile.className} data-land={tile.key} aria-disabled="true">
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
            markSeen(prologueKey);
            setPrologueOpen(false);
          }}
        />
      )}
    </main>
  );
}
