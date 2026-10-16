import { useState, type CSSProperties } from 'react';
import type { Dungeon, StoryFrame } from '../engine/types';
import { recolor } from '../pixel/pixelArt';
import {
  AMANITA,
  BOLETUS,
  EMBLEMS,
  FIREFLY_FRAMES,
  FLAG_FRAMES,
  GEAR_FRAMES,
  GEMS,
  GHOST,
  GLASS,
  HERO_ANIMATIONS,
  ISLAND_ROCK,
  JESTER,
  MOON,
  OAK,
  PORTRAITS,
  POTION,
  SCRIPT_DOOR_OPEN,
  SKY_SPARK,
  SPRUCE,
  VILLAIN_ANIMATIONS,
} from '../pixel/sprites';
import { DungeonView } from './DungeonView';
import { PixelArt } from './PixelArt';
import { Face } from './Portrait';
import { SpriteAnim } from './SpriteAnim';

const ROW = [GEMS.amethyst, GEMS.emerald, GEMS.ruby];
const CROWN = [GEMS.amethyst, GEMS.emerald, GEMS.sapphire, GEMS.ruby, GEMS.topaz];
/** Лес в кадре — уже расколдованный: заливка, блик и тень — сплошные оттенки одного цвета */
const FOREST_ART = {
  spruce: recolor(SPRUCE, { c: '#15803d', h: '#4ade80', d: '#14532d' }),
  oak: recolor(OAK, { c: '#22c55e', h: '#86efac', d: '#15803d' }),
  amanita: recolor(AMANITA, { c: '#dc2626', h: '#f87171', d: '#991b1b' }),
  firefly: FIREFLY_FRAMES.map((frame) => recolor(frame, { c: '#fde047', h: '#fef9c3' })),
  boletus: recolor(BOLETUS, { c: '#ea580c', h: '#fb923c', d: '#9a3412' }),
};
/** Колбы на полке Зала Оракула: число, строка, логическое и пустая — как на сцене JS-уровней */
const FLASKS = [
  recolor(POTION, { r: '#3b82f6', R: '#93c5fd' }),
  recolor(POTION, { r: '#10b981', R: '#6ee7b7' }),
  recolor(POTION, { r: '#f59e0b', R: '#fde68a' }),
  recolor(POTION, { r: 'rgba(148, 163, 184, 0.14)', R: 'rgba(148, 163, 184, 0.22)' }),
];
/** Строчки, которые бегут по Скриптории: здесь всё — приказы */
const SCRIPT_LINES = ["let gems = 5;", "console.log('Привет!');", 'button.onclick = …'];
/** Лабиринт Решений в кадре: развилки, кристаллы, баг и выход */
const STORY_MAZE: Dungeon = {
  map: ['#############', '#>..#...#..g#', '##.##.#.#.###', '#..b..#...#E#', '#.#####.#.#.#', '#g......#...#', '#############'],
};
/** Сиденья Карусели Циклопа */
const CAROUSEL = [GEMS.ruby, GEMS.topaz, GEMS.emerald, GEMS.sapphire, GEMS.amethyst, GEMS.ruby];
/** Вагоны Обоза: груз и номер с нуля */
const TRAIN = ['уголь', 'руда', 'мёд', 'кристаллы'];
/** Карточки Картотеки: поля «ключ: значение» */
const CARDS: [string, string][][] = [
  [
    ['name', "'Мята'"],
    ['price', '3'],
  ],
  [
    ['name', "'Мёд'"],
    ['stock', '0'],
  ],
  [
    ['color', "'синий'"],
    ['size', '2'],
  ],
];

/** Стёкла витража в кадре: так же стоят в испытании Витражной обители */
const PANES = [GLASS.star, GLASS.rose, GLASS.moon, GLASS.tree, GLASS.leaf, GLASS.crown].map((glass) => glass.color);

function Pane({ color }: { color: string }) {
  return <span style={{ '--pane': color } as CSSProperties} />;
}

/** Настроение Лорда Дефолта по его реплике: проигрыш и возмущённое «?!» его злят, всё остальное — смешит */
function villainMood(text = ''): 'laugh' | 'angry' {
  return /опять ты|(^|[^а-яё])пал[аио]?([^а-яё]|$)|не побеждён|не думай|невозможно|\?!/i.test(text) ? 'angry' : 'laugh';
}

/** Лорд Дефолт во весь рост: сначала хохочет или злится, потом ухмыляется и поблёскивает моноклем. */
function VillainActor({ mood }: { mood: 'laugh' | 'angry' }) {
  const [calm, setCalm] = useState(false);
  const move = calm ? 'idle' : mood;
  return (
    <SpriteAnim
      key={move}
      className="sa-villain"
      frames={VILLAIN_ANIMATIONS[move]}
      fps={move === 'idle' ? 2 : move === 'laugh' ? 8 : 6}
      repeat={calm ? undefined : 3}
      fluid
      onEnd={calm ? undefined : () => setCalm(true)}
    />
  );
}

/**
 * Пиксельная картинка кадра сценки. Размеры — в долях ширины кадра, поэтому кадр масштабируется целиком.
 * speaker — чей портрет показать в кадре наставника.
 */
export function StoryArt({ art, speaker, talking = false, text }: { art: StoryFrame['art']; speaker?: string; talking?: boolean; text?: string }) {
  return (
    <div className={`story-art story-art--${art}`} aria-hidden="true">
      {art === 'kingdom' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <div className="sa-row">
            {ROW.map((gem, i) => (
              <PixelArt key={i} className="sa-gem" sprite={gem.sprite} />
            ))}
          </div>
          <PixelArt className="sa-rock" sprite={ISLAND_ROCK} />
        </>
      )}

      {art === 'villain' && (
        <>
          <span className="sa-default-text sa-default-text--1">Times New Roman</span>
          <span className="sa-default-text sa-default-text--2">синяя ссылка</span>
          <span className="sa-default-text sa-default-text--3">&lt;div&gt;&lt;div&gt;&lt;div&gt;</span>
          <VillainActor mood={villainMood(text)} />
        </>
      )}

      {/* Лорд Дефолт в Скриптории: вместо Times New Roman вокруг него — значения по умолчанию из JavaScript */}
      {art === 'villain-script' && (
        <>
          <span className="sa-default-text sa-default-text--1 sa-default-text--script">undefined</span>
          <span className="sa-default-text sa-default-text--2 sa-default-text--script">NaN</span>
          <span className="sa-default-text sa-default-text--3 sa-default-text--script">null</span>
          <VillainActor mood={villainMood(text)} />
        </>
      )}

      {art === 'fallen' && (
        <>
          <div className="sa-stack">
            {ROW.map((gem, i) => (
              <PixelArt key={i} sprite={gem.sprite} />
            ))}
          </div>
          <PixelArt className="sa-rock sa-rock--tilted" sprite={ISLAND_ROCK} />
        </>
      )}

      {art === 'mentor' && (
        <>
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--2" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--3" sprite={SKY_SPARK} />
          <Face className="sa-portrait" id={speaker && PORTRAITS[speaker] ? speaker : 'flex'} talking={talking} />
        </>
      )}

      {art === 'crown' && (
        <>
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--3" sprite={SKY_SPARK} />
          <div className="sa-crown">
            {CROWN.map((gem, i) => (
              <PixelArt key={i} className="sa-gem" sprite={gem.sprite} />
            ))}
          </div>
          <PixelArt className="sa-rock" sprite={ISLAND_ROCK} />
        </>
      )}

      {art === 'window' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--2" sprite={SKY_SPARK} />
          <div className="sa-window">
            {PANES.map((color, i) => (
              <Pane key={i} color={color} />
            ))}
          </div>
        </>
      )}

      {art === 'shards' && (
        <>
          <div className="sa-window sa-window--empty" />
          <div className="sa-shards">
            {PANES.map((color, i) => (
              <Pane key={i} color={color} />
            ))}
          </div>
        </>
      )}

      {art === 'mirrors' && (
        <>
          <PixelArt className="sa-spark sa-spark--2" sprite={SKY_SPARK} />
          <div className="sa-mirror sa-mirror--narrow">
            {ROW.map((gem, i) => (
              <PixelArt key={i} className="sa-gem" sprite={gem.sprite} />
            ))}
          </div>
          <div className="sa-mirror sa-mirror--wide">
            {ROW.map((gem, i) => (
              <PixelArt key={i} className="sa-gem" sprite={gem.sprite} />
            ))}
          </div>
        </>
      )}

      {art === 'village' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <div className="sa-village">
            <span className="sa-house">
              <span>&lt;p&gt;</span>
            </span>
            <span className="sa-house sa-house--tall">
              <span>&lt;h1&gt;</span>
            </span>
            <span className="sa-house">
              <span>&lt;em&gt;</span>
            </span>
          </div>
        </>
      )}

      {art === 'scroll' && (
        <>
          <PixelArt className="sa-spark sa-spark--2" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--3" sprite={SKY_SPARK} />
          <div className="sa-scroll">
            <b>Указ старосты</b>
            <i />
            <i />
            <mark />
            <i />
          </div>
        </>
      )}

      {art === 'fair' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <PixelArt className="sa-spark sa-spark--2" sprite={SKY_SPARK} />
          <div className="sa-fair">
            <span className="sa-stall">
              <span>&lt;ul&gt;</span>
            </span>
            <span className="sa-stall sa-stall--blue">
              <span>&lt;a&gt;</span>
            </span>
            <span className="sa-stall">
              <span>&lt;img&gt;</span>
            </span>
          </div>
        </>
      )}

      {art === 'city' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <div className="sa-village">
            <span className="sa-house sa-house--stone sa-house--tall">
              <span>&lt;header&gt;</span>
            </span>
            <span className="sa-house sa-house--stone sa-house--wide">
              <span>&lt;main&gt;</span>
            </span>
            <span className="sa-house sa-house--stone">
              <span>&lt;aside&gt;</span>
            </span>
          </div>
        </>
      )}

      {art === 'forge' && (
        <>
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--2" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--3" sprite={SKY_SPARK} />
          <div className="sa-village">
            <span className="sa-house sa-house--forge">
              <span>&lt;label&gt;</span>
            </span>
            <span className="sa-house sa-house--forge sa-house--tall">
              <span>&lt;form&gt;</span>
            </span>
            <span className="sa-house sa-house--forge">
              <span>&lt;button&gt;</span>
            </span>
          </div>
        </>
      )}

      {art === 'academy' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--2" sprite={SKY_SPARK} />
          <div className="sa-village">
            <span className="sa-house sa-house--academy sa-house--tall sa-house--wide">
              <span>Академия</span>
            </span>
          </div>
        </>
      )}

      {art === 'chaos' && (
        <>
          <span className="sa-code sa-code--1">&lt;script&gt;</span>
          <span className="sa-code sa-code--2">{'{ }'}</span>
          <span className="sa-code sa-code--3">=&gt;</span>
          <span className="sa-code sa-code--4">onclick</span>
          <span className="sa-code sa-code--5">()</span>
          <span className="sa-code sa-code--6">let</span>
          {/* Лорд Дефолт убегает за дверь <script> */}
          <span className="sa-door">
            <span>&lt;script&gt;</span>
          </span>
          <SpriteAnim className="sa-runner" frames={VILLAIN_ANIMATIONS.run} fps={8} fluid />
        </>
      )}

      {art === 'forest' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <div className="sa-forest">
            <PixelArt sprite={FOREST_ART.spruce} />
            <PixelArt sprite={FOREST_ART.oak} />
            <PixelArt sprite={FOREST_ART.spruce} />
          </div>
          <div className="sa-forest-floor">
            <PixelArt sprite={FOREST_ART.amanita} />
            <SpriteAnim className="sa-firefly" frames={FOREST_ART.firefly} fps={6} fluid />
            <PixelArt sprite={FOREST_ART.boletus} />
          </div>
        </>
      )}

      {art === 'fortress' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--2" sprite={SKY_SPARK} />
          <div className="sa-citadel sa-citadel--sand">
            <span className="sa-tower" />
            <span className="sa-keep" />
            <span className="sa-tower" />
          </div>
          <SpriteAnim className="sa-fortress-flag" frames={FLAG_FRAMES} fps={5} fluid />
        </>
      )}

      {art === 'gate' && (
        <>
          <PixelArt className="sa-moon" sprite={MOON} />
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          {/* Дверь <script> приоткрыта, из неё льётся свет, а герой идёт к порогу */}
          <span className="sa-gate-glow" />
          <PixelArt className="sa-gate" sprite={SCRIPT_DOOR_OPEN} />
          <SpriteAnim className="sa-walker" frames={HERO_ANIMATIONS.walk} fps={8} fluid />
          <PixelArt className="sa-rock" sprite={ISLAND_ROCK} />
        </>
      )}

      {art === 'clockwork' && (
        <>
          <SpriteAnim className="sa-gear sa-gear--1" frames={GEAR_FRAMES} fps={3} fluid />
          <SpriteAnim className="sa-gear sa-gear--2" frames={GEAR_FRAMES} fps={4} fluid />
          <SpriteAnim className="sa-gear sa-gear--3" frames={GEAR_FRAMES} fps={2} fluid />
          {SCRIPT_LINES.map((line, i) => (
            <span key={line} className={`sa-line sa-line--${i + 1}`}>
              {line}
            </span>
          ))}
        </>
      )}

      {art === 'oracle' && (
        <>
          <PixelArt className="sa-spark sa-spark--1" sprite={SKY_SPARK} />
          <PixelArt className="sa-spark sa-spark--3" sprite={SKY_SPARK} />
          <div className="sa-oracle-scroll">
            <span>› Привет, Скриптория!</span>
            <span>› 12</span>
            <span className="sa-oracle-cursor">›_</span>
          </div>
          <div className="sa-shelf">
            {FLASKS.map((sprite, i) => (
              <PixelArt key={i} sprite={sprite} />
            ))}
          </div>
        </>
      )}

      {art === 'shop' && (
        <>
          {/* Лавка Алхимика: вывеска, полки с колбами всех типов и котёл, в котором булькает зелье */}
          <span className="sa-shop-sign">Лавка Алхимика</span>
          <div className="sa-shop-shelf sa-shop-shelf--1">
            {FLASKS.map((sprite, i) => (
              <PixelArt key={i} sprite={sprite} />
            ))}
          </div>
          <div className="sa-shop-shelf sa-shop-shelf--2">
            {FLASKS.slice(0, 3).map((sprite, i) => (
              <PixelArt key={i} sprite={sprite} />
            ))}
          </div>
          <PixelArt className="sa-cauldron" sprite={EMBLEMS.cauldron} />
        </>
      )}

      {art === 'jester' && (
        <>
          {/* Шут NaN жонглирует колбами, а вокруг — его проделки */}
          <span className="sa-nan sa-nan--1">NaN</span>
          <span className="sa-nan sa-nan--2">&apos;5&apos; + &apos;3&apos; = &apos;53&apos;</span>
          <span className="sa-nan sa-nan--3">NaN</span>
          <div className="sa-juggle">
            {FLASKS.slice(0, 3).map((sprite, i) => (
              <PixelArt key={i} sprite={sprite} />
            ))}
          </div>
          <PixelArt className="sa-jester" sprite={JESTER} />
        </>
      )}

      {art === 'maze' && (
        <div className="sa-maze">
          <DungeonView dungeon={STORY_MAZE} compact />
        </div>
      )}

      {art === 'carousel' && (
        <>
          {/* Карусель Циклопа: кристаллы катаются по кругу, а над ней — полосатый шатёр */}
          <span className="sa-carousel-tent" />
          <div className="sa-carousel">
            {CAROUSEL.map((gem, i) => (
              <span key={i} className="sa-carousel__seat" style={{ '--i': i } as CSSProperties}>
                <PixelArt sprite={gem.sprite} />
              </span>
            ))}
          </div>
          <span className="sa-loop-text">for (let i = 0; i &lt; 3; i++)</span>
        </>
      )}

      {art === 'conveyor' && (
        <>
          {/* Котёл Функций: котёл кипит, рецепт записан, а по конвейеру едут флаконы-проверки */}
          <PixelArt className="sa-kitchen-cauldron" sprite={EMBLEMS.cauldron} />
          <span className="sa-recipe">function brew(herb) {'{'} return … {'}'}</span>
          <div className="sa-belt">
            <div className="sa-belt__flasks">
              {[...FLASKS.slice(0, 3), ...FLASKS.slice(0, 3), ...FLASKS.slice(0, 3), ...FLASKS.slice(0, 3)].map((sprite, i) => (
                <PixelArt key={i} sprite={sprite} />
              ))}
            </div>
          </div>
        </>
      )}

      {art === 'ghost' && (
        <>
          {/* Призрак Андефайнд кружит над пустыми флаконами */}
          <span className="sa-nan sa-nan--1 sa-nan--void">undefined</span>
          <span className="sa-nan sa-nan--3 sa-nan--void">undefined</span>
          <PixelArt className="sa-ghost" sprite={GHOST} />
          <div className="sa-empty-flasks">
            {[0, 1, 2].map((i) => (
              <PixelArt key={i} sprite={FLASKS[3]} />
            ))}
          </div>
        </>
      )}

      {art === 'train' && (
        <>
          {/* Обоз: вагоны с грузом катятся по рельсам, у каждого номер — с нуля */}
          <PixelArt className="sa-moon" sprite={MOON} />
          <div className="sa-train">
            {TRAIN.map((cargo, i) => (
              <span key={cargo} className="sa-wagon">
                <span className="sa-wagon__cargo">{cargo}</span>
                <span className="sa-wagon__index">{i}</span>
              </span>
            ))}
          </div>
          <span className="sa-rails" />
        </>
      )}

      {art === 'archive' && (
        <>
          {/* Картотека: ящики до потолка, а на столе — карточки с полями */}
          <div className="sa-drawers">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="sa-cards">
            {CARDS.map((card, i) => (
              <span key={i} className="sa-card">
                {card.map(([key, value]) => (
                  <span key={key}>
                    <b>{key}:</b> {value}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </>
      )}

      {art === 'citadel' && (
        <>
          <span className="sa-default-text sa-default-text--1">Times New Roman</span>
          <span className="sa-default-text sa-default-text--2">синяя ссылка</span>
          <div className="sa-citadel">
            <span className="sa-tower" />
            <span className="sa-keep" />
            <span className="sa-tower" />
          </div>
        </>
      )}
    </div>
  );
}
