import { useEffect, useState } from 'react';
import { sparkle, type GemKind } from './geometry';
import { VILLAIN_RIG } from './rig/villainRig';
import { Rig } from './rig/Rig';
import { BUSTS } from './mentors';
import { NoirBust } from './NoirFace';
import { NIGHT, NOIR_ISLAND, NOIR_OVERLAY, NOIR_SKY, NoirGem } from './scene';

/*
  Сценки сюжета Парящих островов в «Сумраке». Кадр 16:9 вырезан из сцены 800 × 360 по центру.
  Пролог: королевство, кристаллы рухнули, Лорд Дефолт, наставник. Победа: корона из пяти кристаллов.
*/

const ROW: GemKind[] = ['amethyst', 'emerald', 'ruby'];
const CROWN: GemKind[] = ['amethyst', 'emerald', 'sapphire', 'ruby', 'topaz'];

/** Остров сцены: центр 400, трава около y = 256 */
const island = <g transform="translate(190 232)">{NOIR_ISLAND}</g>;

function Gem({ kind, x, y, delay = 0, cursed = false }: { kind: GemKind; x: number; y: number; delay?: number; cursed?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`} filter={cursed ? 'url(#noir-cursed)' : undefined}>
      <g className={cursed ? undefined : 'a-float'} style={{ animationDelay: `${delay}s` }}>
        <NoirGem kind={kind} />
      </g>
    </g>
  );
}

/** Лорд Дефолт во весь рост на острове: сначала хохочет или злится, потом ухмыляется */
function Villain({ mood }: { mood: 'laugh' | 'angry' }) {
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setCalm(true), 2600);
    return () => clearTimeout(timer);
  }, []);
  const move = calm ? 'idle' : mood;
  return <Rig key={move} rig={VILLAIN_RIG} kind="villain" move={move} rim="noir-rim" fill={NIGHT} x={280} y={-7} width={240} height={300} viewBox="-30 -30 160 200" />;
}

export function NoirStoryArt({ art, speaker, mood = 'laugh' }: { art: string; speaker?: string; mood?: 'laugh' | 'angry' }) {
  return (
    <div className={`story-art story-art--noir story-art--${art}`} aria-hidden="true">
      <svg className="story-art__noir noir-art" viewBox="80 0 640 360" preserveAspectRatio="xMidYMid slice">
        {NOIR_SKY}
        {art === 'kingdom' && (
          <>
            {island}
            {ROW.map((kind, i) => (
              <Gem key={kind} kind={kind} x={335 + i * 45} y={150} delay={i * -0.7} />
            ))}
          </>
        )}
        {/* Проклятие: кристаллы рухнули друг на друга и потухли, остров накренился */}
        {art === 'fallen' && (
          <>
            <g transform="rotate(6 400 300)">{island}</g>
            {ROW.map((kind, i) => (
              <Gem key={kind} kind={kind} x={380} y={86 + i * 52} cursed />
            ))}
          </>
        )}
        {art === 'villain' && (
          <>
            {island}
            <Villain mood={mood} />
          </>
        )}
        {art === 'mentor' && (
          <>
            <g transform="translate(244 52) scale(2.6)">
              <NoirBust bust={BUSTS[speaker ?? 'flex'] ?? BUSTS.flex} />
            </g>
            <path className="a-twinkle" d={`${sparkle(200, 90, 6)} ${sparkle(610, 140, 5)}`} fill="#e6eefc" filter="url(#sil-glow)" />
          </>
        )}
        {/* Победа: кристаллы снова горят — корона над островом, свет льётся вниз */}
        {art === 'crown' && (
          <>
            <circle cx="400" cy="170" r="200" fill="url(#noir-halo)" />
            {island}
            {CROWN.map((kind, i) => (
              <Gem key={kind} kind={kind} x={300 + i * 45} y={128 + Math.abs(i - 2) * 16} delay={i * -0.5} />
            ))}
          </>
        )}
        {NOIR_OVERLAY}
      </svg>
      {art === 'villain' && (
        <>
          <span className="sa-default-text sa-default-text--1">Times New Roman</span>
          <span className="sa-default-text sa-default-text--2">синяя ссылка</span>
          <span className="sa-default-text sa-default-text--3">&lt;div&gt;&lt;div&gt;&lt;div&gt;</span>
        </>
      )}
    </div>
  );
}
