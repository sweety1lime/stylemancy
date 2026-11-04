import type { ReactNode } from 'react';
import { billows, gear, spruce, type GemKind } from './geometry';
import { HERO_RIG } from './rig/heroRig';
import { Rig } from './rig/Rig';
import { NIGHT, NOIR_ROCK, NoirGem } from './scene';

/*
  Земля на карте в «Сумраке»: парящая скала, на ней — силуэт её мира (диорама), за ней — свет её настроения
  из «Света земель». Свет показывает прогресс: у спасённой земли он яркий, у открытой — приглушённый,
  земля в тумане тёмная. Рамка 160 × 124, верх скалы около y = 79.
*/

/** Цвет света каждой земли: рассвет Долины, луна Леса, зарево Крепости, сумерки Островов, огни Скриптории */
const MOODS: Record<string, string> = {
  tags: '#ffcf96',
  forest: '#a6e8c8',
  fortress: '#ff9a5a',
  crystal: '#b9a6ff',
  door: '#6dffa8',
  flask: '#8ff0e0',
  maze: '#8ff0e0',
  cauldron: '#7dff9a',
  gear: '#ffc27a',
};

/** Стена с зубцами: от x1 до x2, верх на top, низ на bottom */
function battlement(x1: number, x2: number, top: number, bottom: number, w: number): string {
  let d = `M${x1} ${bottom} V${top}`;
  for (let x = x1; x < x2; x += w * 2) d += ` H${Math.min(x + w, x2)} V${top - w} H${Math.min(x + w * 2, x2)} V${top}`;
  return `${d} H${x2} V${bottom} Z`;
}

interface Diorama {
  /** Силуэт: тёмный, с лунной кромкой */
  shape: string;
  /** Огни: окна, руны, факелы, светлячки — горят цветом земли */
  lights?: ReactNode;
}

/** Огоньки-точки: окна и светлячки */
function dots(points: [number, number, number?][], color: string, className = 'a-twinkle'): ReactNode {
  return (
    <g fill={color} filter="url(#sil-glow)">
      {points.map(([x, y, r = 1.4], i) => (
        <circle key={i} className={i % 2 ? className : undefined} cx={x} cy={y} r={r} />
      ))}
    </g>
  );
}

function diorama(emblem: string, color: string): Diorama {
  switch (emblem) {
    // Долина Тегов: древние камни < и >, деревня, где уже зажгли окна, башенка с флагом
    case 'tags':
      return {
        shape:
          'M36 62 L28 70 L36 78 L39 75 L34 70 L39 65 Z M46 62 L54 70 L46 78 L43 75 L48 70 L43 65 Z ' +
          'M64 79 V67 L72 60 L80 67 V79 Z M82 79 V63 L92 54 L102 63 V79 Z M104 79 V69 L111 63 L118 69 V79 Z ' +
          'M122 79 V50 L126 43 L130 50 V79 Z M126 43 V35 L134 38 L126 41 Z',
        lights: (
          <>
            <path className="a-glow" d="M35 67 L32 70 L35 73 M47 67 L50 70 L47 73" stroke={color} strokeWidth="1.2" fill="none" filter="url(#sil-glow)" />
            {dots(
              [
                [71, 71, 1.3],
                [89, 68, 1.3],
                [95, 68, 1.3],
                [111, 73, 1.2],
                [126, 57, 1.1],
              ],
              color,
            )}
          </>
        ),
      };
    // Лес Селекторов: ельник в лунном свете, между елями светлячки
    case 'forest':
      return {
        shape: [spruce(46, 79, 30, 15, 1), spruce(64, 79, 44, 22, 2), spruce(84, 79, 52, 26, 3), spruce(104, 79, 40, 20, 4), spruce(122, 79, 28, 14, 5)].join(' '),
        lights: dots(
          [
            [56, 58],
            [96, 48],
            [115, 64],
            [74, 67],
            [132, 55],
          ],
          '#e4ff9a',
          'a-firefly',
        ),
      };
    // Крепость Блоков: стены с зубцами, донжон из блоков, факелы и свет из ворот
    case 'fortress':
      return {
        shape: [
          battlement(36, 128, 64, 79, 4),
          battlement(30, 44, 54, 79, 3),
          battlement(120, 134, 54, 79, 3),
          battlement(66, 98, 50, 64, 4),
          battlement(74, 90, 38, 50, 4),
        ].join(' '),
        lights: (
          <>
            <path d="M77 79 V72 Q77 68 82 68 Q87 68 87 72 V79 Z" fill={color} opacity="0.9" />
            {dots(
              [
                [37, 46, 1.6],
                [127, 46, 1.6],
                [82, 30, 1.6],
              ],
              '#ffb067',
              'a-flicker',
            )}
          </>
        ),
      };
    // Парящие острова: обломок колонны, руина арки и три кристалла над скалой
    case 'crystal':
      return {
        shape: 'M36 79 V52 L39 48 L41 53 L43 49 V79 Z M34 56 H45 V53 H34 Z M112 79 V58 Q112 46 124 46 Q134 46 134 56 L130 56 Q130 50 124 50 Q116 50 116 58 V79 Z',
        lights: (['amethyst', 'emerald', 'ruby'] as GemKind[]).map((kind, i) => (
          <g key={kind} transform={`translate(${64 + i * 13} ${38 + (i === 1 ? -4 : 0)}) scale(0.32)`}>
            <g className="a-float" style={{ animationDelay: `${i * -0.8}s` }}>
              <NoirGem kind={kind} />
            </g>
          </g>
        )),
      };
    // Дверь <script>: каменная арка, из проёма льётся зелёный свет
    case 'door':
      return {
        shape: 'M64 79 V54 Q64 36 82 36 Q100 36 100 54 V79 Z M70 79 V56 Q70 43 82 43 Q94 43 94 56 V79 Z M58 79 H106 V82 H58 Z',
        lights: (
          <>
            <path d="M70 79 V56 Q70 43 82 43 Q94 43 94 56 V79 Z" fill={color} opacity="0.85" filter="url(#sil-glow)" />
            <path d="M70 79 L94 79 L112 92 L52 92 Z" fill={color} opacity="0.22" filter="url(#noir-mist)" />
          </>
        ),
      };
    // Скриптория: башня алхимика с куполом и паром
    case 'flask':
      return {
        shape: 'M72 79 V52 H92 V79 Z M68 52 Q68 34 82 30 Q96 34 96 52 Z M81 30 V22 H83 V30 Z M100 79 V62 H112 V79 Z M104 62 V54 H108 V62 Z',
        lights: dots(
          [
            [79, 60, 1.4],
            [85, 68, 1.4],
            [106, 70, 1.2],
          ],
          color,
        ),
      };
    // Лабиринт Решений: живые изгороди и арка выхода с зелёным светом
    case 'maze':
      return {
        shape: 'M30 79 V68 H60 V79 Z M62 79 V58 H102 V79 Z M104 79 V68 H134 V79 Z',
        lights: <path d="M76 79 V70 Q76 64 82 64 Q88 64 88 70 V79 Z" fill={color} opacity="0.9" filter="url(#sil-glow)" />,
      };
    // Мастерская Рецептов: котёл на огне, над ним всплывают пузыри
    case 'cauldron':
      return {
        shape: 'M58 64 H106 Q106 80 82 80 Q58 80 58 64 Z M56 61 H108 V65 H56 Z M64 78 L60 84 H66 Z M100 78 L98 84 H104 Z',
        lights: (
          <>
            <ellipse className="a-glow" cx="82" cy="61" rx="22" ry="3" fill={color} opacity="0.8" filter="url(#sil-glow)" />
            {dots(
              [
                [74, 52, 1.8],
                [86, 46, 1.4],
                [92, 54, 1.2],
              ],
              color,
              'a-rise',
            )}
          </>
        ),
      };
    // Город Механизмов: часовая башня с шестернёй, мастерские с тёплыми окнами
    default:
      return {
        shape: `M74 79 V44 H90 V79 Z M72 44 L82 34 L92 44 Z M50 79 V62 H70 V79 Z M94 79 V66 H116 V79 Z`,
        lights: (
          <>
            <g className="a-spin" style={{ transformOrigin: '82px 56px' }} fill={color} opacity="0.85">
              <path d={gear(82, 56, 7, 8)} fillRule="evenodd" />
            </g>
            {dots(
              [
                [58, 68, 1.3],
                [102, 72, 1.3],
              ],
              color,
            )}
          </>
        ),
      };
  }
}

interface NoirLandArtProps {
  emblem: string;
  /** Земля спасена — её свет горит ярко */
  saved?: boolean;
  /** Земля в тумане: ещё закрыта */
  fog?: boolean;
}

/** Облака вокруг основания скалы: остров выплывает из них, как из моря */
const COLLAR = billows(10, 152, 108, 4, 9, 23, 126);

export function NoirLandArt({ emblem, saved = false, fog = false }: NoirLandArtProps) {
  const color = MOODS[emblem] ?? MOODS.door;
  const { shape, lights } = diorama(emblem, color);
  const id = `land-${emblem}`;
  return (
    <svg className={`noir-land noir-art${fog ? ' noir-land--fog' : ''}`} viewBox="0 0 160 124" width="184" height="143" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={color} stopOpacity="0.85" />
          <stop offset="0.4" stopColor={color} stopOpacity="0.3" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
        {/* Столб света спасённой земли: ярче у земли, гаснет в небе */}
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="0.45" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--noir-collar, #2c3750)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--noir-collar-shade, #141b2b)' }} stopOpacity="0.9" />
          <stop offset="1" stopColor="#0b0f19" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={COLLAR} />
        </clipPath>
      </defs>
      {/* Свет земли: у спасённой — в полную силу, у открытой — вполовину; медленно дышит */}
      {!fog && (
        <g className={`noir-land__glow${saved ? '' : ' noir-land__glow--dim'}`}>
          <circle className="a-pulse" cx="82" cy="58" r="72" fill={`url(#${id}-glow)`} />
        </g>
      )}
      {saved && !fog && (
        <g className="a-breathe">
          <path d="M70 80 L60 -30 H104 L94 80 Z" fill={`url(#${id}-beam)`} filter="url(#noir-shaft)" />
        </g>
      )}
      <g filter="url(#noir-rim)">
        <path d="M54 104 q-2 8 1 15 M74 114 q2 6 -1 9 M100 108 q3 6 0 12" fill="none" stroke={NIGHT} strokeWidth="1.2" strokeLinecap="round" />
        <path d={`${shape}`} fill={NIGHT} />
        <g transform="translate(12 70) scale(0.34)">
          <path d={NOIR_ROCK} fill={NIGHT} />
        </g>
      </g>
      {!fog && lights}
      {/* Облака у подножия, сверху на них падает свет земли */}
      <g filter="url(#noir-cloud)" opacity={fog ? 0.6 : 1}>
        <path d={COLLAR} fill={`url(#${id}-collar)`} />
        {!fog && <ellipse cx="82" cy="108" rx="46" ry="8" fill={color} opacity={saved ? 0.3 : 0.16} clipPath={`url(#${id}-clip)`} />}
      </g>
      {fog && (
        <g className="a-drift" filter="url(#noir-mist)">
          <ellipse cx="60" cy="58" rx="56" ry="12" fill="#3a4560" opacity="0.6" />
          <ellipse cx="104" cy="82" rx="50" ry="10" fill="#3a4560" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}

/** Герой на карте: маленький силуэт в покое, кристалл на посохе светится */
export function NoirMapHero({ width = 52 }: { width?: number }) {
  return (
    <span className="land__hero land__hero--noir noir-art">
      <Rig rig={HERO_RIG} kind="hero" move="idle" rim="noir-rim" fill={NIGHT} x={0} y={0} width={width} height={(width * 190) / 160} viewBox="-30 -40 160 190" />
    </span>
  );
}
