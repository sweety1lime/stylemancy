import type { StoryFrame } from '../engine/types';
import { GEMS, ISLAND_ROCK, MOON, PORTRAITS, SKY_SPARK } from '../pixel/sprites';
import { PixelArt } from './PixelArt';

const ROW = [GEMS.amethyst, GEMS.emerald, GEMS.ruby];
const CROWN = [GEMS.amethyst, GEMS.emerald, GEMS.sapphire, GEMS.ruby, GEMS.topaz];

/** Пиксельная картинка кадра сценки. Размеры — в долях ширины кадра, поэтому кадр масштабируется целиком. */
export function StoryArt({ art }: { art: StoryFrame['art'] }) {
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
          <PixelArt className="sa-portrait" sprite={PORTRAITS.flex} />
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
    </div>
  );
}
