import { GEM } from './geometry';
import { HERO_RIG } from './rig/heroRig';
import { Rig } from './rig/Rig';
import { NIGHT, NOIR_ROCK } from './scene';

/*
  Земля на карте в «Сумраке»: силуэт скалы и эмблема над ней. Свет показывает прогресс:
  спасённая земля горит тёплым, открытая — холодным, земля в тумане едва видна.
*/

/** Эмблемы земель в рамке 40 × 40 */
const EMBLEMS: Record<string, string> = {
  tags: 'M14 10 L4 20 L14 30 L17 27 L10 20 L17 13 Z M26 10 L36 20 L26 30 L23 27 L30 20 L23 13 Z',
  forest: 'M20 2 L30 15 L25 15 L33 25 L27 25 L35 35 L5 35 L13 25 L7 25 L15 15 L10 15 Z M18 35 H22 V40 H18 Z',
  fortress: 'M8 40 V16 H12 V11 H16 V16 H18 V11 H22 V16 H24 V11 H28 V16 H32 V40 H23 V32 Q20 28 17 32 V40 Z',
  crystal: '',
  flask: 'M16 4 H24 V14 L33 31 Q36 38 28 38 H12 Q4 38 7 31 L16 14 Z',
  maze: 'M4 4 H36 V36 H4 Z M8 8 V32 H32 V8 Z M12 12 H28 V28 H12 Z M16 16 V24 H24 V16 Z',
  cauldron: 'M5 15 H35 V18 H33 Q33 36 20 36 Q7 36 7 18 H5 Z M10 36 L8 40 H12 Z M30 36 L28 40 H32 Z',
  gear: 'M17 2 H23 L24 7 L28 9 L32 6 L36 10 L33 14 L35 18 L40 19 V25 L35 26 L33 30 L36 34 L32 38 L28 35 L24 37 L23 40 H17 L16 37 L12 35 L8 38 L4 34 L7 30 L5 26 L0 25 V19 L5 18 L7 14 L4 10 L8 6 L12 9 L16 7 Z M20 14 A7 7 0 1 0 20.01 14 Z',
  door: 'M10 40 V18 Q10 6 20 6 Q30 6 30 18 V40 Z',
};

/** Скала под землёй: та же зубчатая скала, что под островом, только меньше */
const ROCK_SCALE = 0.28;

interface NoirLandArtProps {
  emblem: string;
  /** Земля спасена — эмблема горит тёплым */
  saved?: boolean;
  /** Земля в тумане: ещё закрыта */
  fog?: boolean;
}

export function NoirLandArt({ emblem, saved = false, fog = false }: NoirLandArtProps) {
  const light = saved ? 'ember' : 'ice';
  const color = fog ? '#2c3548' : saved ? '#ffd9a0' : '#c9d6ea';
  return (
    <svg className={`noir-land noir-art${fog ? ' noir-land--fog' : ''}`} viewBox="0 0 130 96" width="130" height="96" aria-hidden="true">
      {!fog && <circle className="a-glow" cx="65" cy="34" r="34" fill={`url(#sil-light-${light})`} style={{ mixBlendMode: 'screen' }} />}
      <g transform={`translate(6 50) scale(${ROCK_SCALE})`} filter="url(#noir-rim)">
        <path d={NOIR_ROCK} fill={NIGHT} />
      </g>
      <g transform="translate(45 12)" filter={fog ? undefined : 'url(#sil-glow)'}>
        {emblem === 'crystal' ? (
          <g transform="translate(6 0) scale(0.7)">
            <path d={GEM.outer} fill={fog ? color : '#a78bfa'} />
            <path d={GEM.mid} fill={fog ? color : '#c4b5fd'} opacity="0.9" />
          </g>
        ) : (
          <path d={EMBLEMS[emblem] ?? EMBLEMS.door} fill={color} fillRule="evenodd" />
        )}
      </g>
      {fog && (
        <g className="a-drift" filter="url(#noir-mist)">
          <ellipse cx="50" cy="40" rx="46" ry="10" fill="#3a4560" opacity="0.55" />
          <ellipse cx="84" cy="60" rx="40" ry="8" fill="#3a4560" opacity="0.45" />
        </g>
      )}
    </svg>
  );
}

/** Герой на карте: маленький силуэт в покое, кристалл на посохе светится */
export function NoirMapHero({ width = 44 }: { width?: number }) {
  return (
    <span className="land__hero land__hero--noir noir-art">
      <Rig rig={HERO_RIG} kind="hero" move="idle" rim="noir-rim" fill={NIGHT} x={0} y={0} width={width} height={(width * 190) / 160} viewBox="-30 -40 160 190" />
    </span>
  );
}
