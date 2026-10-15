import type { CSSProperties } from 'react';
import type { StoryFrame } from '../engine/types';
import { FLAG, GEMS, GLASS, ISLAND_ROCK, MOON, PORTRAITS, SKY_SPARK } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

const ROW = [GEMS.amethyst, GEMS.emerald, GEMS.ruby];
const CROWN = [GEMS.amethyst, GEMS.emerald, GEMS.sapphire, GEMS.ruby, GEMS.topaz];
/** Стёкла витража в кадре: так же стоят в испытании Витражной обители */
const PANES = [GLASS.star, GLASS.rose, GLASS.moon, GLASS.tree, GLASS.leaf, GLASS.crown].map((glass) => glass.color);

function Pane({ color }: { color: string }) {
  return <span style={{ '--pane': color } as CSSProperties} />;
}

/**
 * Пиксельная картинка кадра сценки. Размеры — в долях ширины кадра, поэтому кадр масштабируется целиком.
 * speaker — чей портрет показать в кадре наставника.
 */
export function StoryArt({ art, speaker }: { art: StoryFrame['art']; speaker?: string }) {
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
          <PixelArt className="sa-portrait" sprite={PORTRAITS.default} />
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
          <PixelArt className="sa-portrait" sprite={PORTRAITS[speaker ?? 'flex'] ?? PORTRAITS.flex} />
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
          <PixelArt className="sa-fortress-flag" sprite={FLAG} />
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
