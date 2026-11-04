import { NOIR_DEFS } from '../../noir/defs';
import { HERO_NOIR, MENTOR_NOIR, VILLAIN_NOIR } from '../../noir/figures';
import { NIGHT, NOIR_ISLAND, NOIR_OVERLAY, NOIR_SKY, NoirGem } from '../../noir/scene';
import { DUNGEON_MAP, sparkle, TILE } from '../shapes';
import type { Kit } from '../types';
import { Glow, Silhouette } from '../../noir/light';

/*
  Сумрак — серьёзная версия «Силуэтов и света». Холодная луна против тёплой магии:
  окружение в сине-серых тонах, цветом горит только волшебство. Взрослые пропорции,
  руины и туман, медленное движение, зерно плёнки и виньетка.
*/

const isWall = (x: number, y: number) => {
  const cell = DUNGEON_MAP[y]?.[x];
  return cell === undefined || cell === '#' || cell === 'T';
};

/** Баг в темноте: длинные суставчатые лапы, вытянутое тело, красные глаза */
const BUG_BODY = 'M20 14 Q26 18 26 26 Q25 34 20 37 Q15 34 14 26 Q14 18 20 14 Z M17 9 Q20 6 23 9 Q23 13 20 14 Q17 13 17 9 Z';
const BUG_LEGS =
  'M15 20 L8 15 L3 18 M14.5 25 L6 25 L1 30 M15 30 L9 34 L5 39 M25 20 L32 15 L37 18 M25.5 25 L34 25 L39 30 M25 30 L31 34 L35 39 M18.5 8 Q14 2 8 1 M21.5 8 Q26 2 32 1';

export const noirKit: Kit = {
  id: 'noir',
  name: 'Сумрак',
  about: 'Серьёзная версия силуэтов: холодная луна против тёплой магии, руины и туман, взрослые пропорции и медленное движение.',
  traits: ['Шрифты Cormorant Garamond и Golos Text', 'Холодный лунный свет, цветом горит только магия', 'Без мультяшности: острые формы, лица в тени'],
  defs: NOIR_DEFS,
  sky: NOIR_SKY,
  island: NOIR_ISLAND,
  hero: <Silhouette figure={HERO_NOIR} rim="noir-rim" fill={NIGHT} lit={{ crystal: '#e9f6ff' }} light="ice" />,
  villain: (
    <g>
      <Silhouette figure={VILLAIN_NOIR} rim="noir-rim" fill={NIGHT} />
      <path className="a-twinkle" d={sparkle(53.4, 35.4, 2.6)} fill="#d6e6ff" filter="url(#sil-glow)" />
    </g>
  ),
  mentor: (
    <g>
      <rect width="120" height="120" fill="url(#noir-portrait)" />
      <Silhouette figure={MENTOR_NOIR} rim="noir-rim" fill={NIGHT} />
      <g className="a-blink" fill="#ffb067" filter="url(#sil-glow)">
        {MENTOR_NOIR.dots.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </g>
  ),
  gem: (kind) => <NoirGem kind={kind} />,
  wall: (x, y) => (
    <g>
      <rect width="40" height="40" fill="#0b0e16" />
      <path d="M2 2 H22 V18 H2 Z M25 2 H38 V18 H25 Z M2 21 H11 V38 H2 Z M14 21 H38 V38 H14 Z" fill="none" stroke="#141a27" strokeWidth="1" />
      {!isWall(x, y + 1) && <rect y="38" width="40" height="2" fill="#2a3550" />}
      {!isWall(x - 1, y) && <rect width="1.5" height="40" fill="#1c2438" />}
      {!isWall(x + 1, y) && <rect x="38.5" width="1.5" height="40" fill="#1c2438" />}
    </g>
  ),
  floor: (x, y) => (
    <g>
      <rect width="40" height="40" fill="#0a0c12" />
      {(x * 5 + y * 3) % 4 === 0 && <path d="M8 30 L15 24 L19 27 L26 20" fill="none" stroke="#141a26" strokeWidth="1" />}
    </g>
  ),
  torch: (
    <g>
      <Glow className="a-glow" x={20} y={20} r={84} light="ember" />
      <path d={`${TILE.plate} ${TILE.handle} ${TILE.cup}`} fill={NIGHT} />
      <g className="a-flicker" filter="url(#sil-glow)">
        <path d={TILE.flameOuter} fill="#e8743a" />
        <path d={TILE.flameMid} fill="#ffb067" />
        <path d={TILE.flameCore} fill="#fff1d6" />
      </g>
    </g>
  ),
  exit: (
    <g>
      <Glow className="a-glow" x={20} y={24} r={46} light="green" />
      <path d={TILE.archOuter} fill={NIGHT} />
      <path d={TILE.archLight} fill="#4fd486" opacity="0.85" filter="url(#sil-glow)" />
      <path d={TILE.archCore} fill="#e6fff0" />
    </g>
  ),
  bug: (
    <g>
      <path d={BUG_LEGS} fill="none" stroke={NIGHT} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <path d={BUG_BODY} fill={NIGHT} filter="url(#noir-rim)" />
      <g className="a-blink" fill="#ff4d5e" filter="url(#sil-glow)">
        <circle cx="18.6" cy="10" r="0.9" />
        <circle cx="21.4" cy="10" r="0.9" />
      </g>
    </g>
  ),
  sceneOverlay: NOIR_OVERLAY,
  dungeonOverlay: (width, height) => <rect width={width} height={height} fill="url(#noir-vignette)" pointerEvents="none" />,
  icon: (d) => (
    <g>
      <rect width="512" height="512" fill="url(#noir-portrait)" />
      <path d={d} fill={NIGHT} filter="url(#noir-rim-big)" />
    </g>
  ),
};

