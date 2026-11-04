import { GEM, GEM_COLORS, type GemKind } from './geometry';
import { Glow } from './light';
import { random } from './random';

/*
  Сцена «Сумрака» над Парящими островами: холодное небо с луной в облаках, Академия на дальней скале,
  зубчатый остров с руинами и кристаллы с цветным светом. Рамка 800 × 360, остров — 420 × 140.
  Классы a-* — медленное движение (облака, туман, пыль), его задаёт noir.css.
*/

export const NIGHT = '#06070c';
const MOON = { x: 604, y: 92, r: 44 };

/** Академия вдали: скала с башнями и острыми крышами, несколько тёплых окон */
const ACADEMY_ROCK = 'M54 198 Q150 188 252 198 Q234 214 204 224 Q166 240 134 228 Q92 216 54 198 Z';
const ACADEMY_TOWERS =
  'M92 198 V150 L99 132 L106 150 V198 Z ' +
  'M112 198 V128 L122 96 L132 128 V198 Z ' +
  'M106 198 V164 H112 V198 Z M132 198 V158 H146 V198 Z ' +
  'M146 198 V140 L154 116 L162 140 V198 Z ' +
  'M162 198 V170 H190 V198 Z M176 170 V160 L183 150 L190 160 V170 Z ' +
  'M200 198 V176 L206 164 L212 176 V198 Z';
const WINDOWS: [number, number][] = [
  [120, 136],
  [124, 150],
  [152, 148],
  [168, 180],
  [98, 160],
];

const dust = random(5);
const DUST = Array.from({ length: 26 }, () => [40 + dust() * 720, 60 + dust() * 280, 0.5 + dust() * 0.9, dust()] as const);
const starRandom = random(19);
const STARS = Array.from({ length: 34 }, () => [starRandom() * 800, starRandom() * 130, 0.4 + starRandom() * 0.7] as const);

export const NOIR_SKY = (
  <g>
    <rect width="800" height="360" fill="url(#noir-sky)" />
    {STARS.map(([x, y, r], i) => (
      <circle key={i} className={i % 6 ? undefined : 'a-twinkle'} cx={x} cy={y} r={r} fill="#dfe7f4" opacity={0.7 - y / 260} />
    ))}
    <circle cx={MOON.x} cy={MOON.y} r="230" fill="url(#noir-halo)" />
    {/* Холодные лучи луны вниз и влево */}
    <path d={`M${MOON.x - 20} ${MOON.y + 30} L250 360 L330 360 Z M${MOON.x} ${MOON.y + 40} L470 360 L520 360 Z`} fill="url(#noir-beam)" opacity="0.07" />
    <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill="url(#noir-moon)" />
    <path d="M592 80 a6 5 0 1 0 12 0 a6 5 0 1 0 -12 0 Z M614 104 a4 3.4 0 1 0 8 0 a4 3.4 0 1 0 -8 0 Z" fill="#b8c3d4" opacity="0.6" />
    {/* Облака проходят перед луной */}
    <g className="a-drift" filter="url(#noir-cloud)">
      <path d="M500 128 Q540 112 580 118 Q610 106 646 114 Q690 108 724 124 Q700 134 660 132 Q620 138 580 134 Q540 138 500 128 Z" fill="#0d1321" opacity="0.9" />
      <path d="M548 112 Q576 104 604 108 Q630 102 656 110 Q634 116 606 115 Q578 118 548 112 Z" fill="#141c2e" opacity="0.55" />
    </g>
    {/* Академия на дальней скале, под ней цепи */}
    <g className="a-hover">
      <path d="M118 226 V262 M190 220 V250" stroke="#1d2638" strokeWidth="1.4" strokeDasharray="2.5 2" />
      <path d={`${ACADEMY_ROCK} ${ACADEMY_TOWERS}`} fill="#1a2234" />
      {WINDOWS.map(([x, y], i) => (
        <rect key={i} className={i === 2 ? 'a-twinkle' : undefined} x={x} y={y} width="2.4" height="4" fill="#ffc77a" />
      ))}
    </g>
    <g className="a-hover a-delay">
      <path d="M686 214 Q722 206 770 214 Q756 230 734 238 Q704 232 686 214 Z M700 214 L704 196 L708 214 Z M744 213 L747 200 L750 213 Z" fill="#141b2b" />
    </g>
    <path d="M0 300 Q120 286 260 298 Q420 284 560 298 Q690 288 800 296 V360 H0 Z" fill="#0e131f" />
    <g className="a-drift a-delay" filter="url(#noir-mist)">
      <ellipse cx="160" cy="290" rx="190" ry="14" fill="#3a4560" opacity="0.35" />
      <ellipse cx="620" cy="300" rx="220" ry="16" fill="#3a4560" opacity="0.3" />
    </g>
    {DUST.map(([x, y, r, delay], i) => (
      <circle key={i} className="a-rise" cx={x} cy={y} r={r} fill={i % 4 ? '#c9d6ea' : '#ffc890'} opacity="0.7" style={{ animationDelay: `${-delay * 6}s`, animationDuration: '11s' }} />
    ))}
  </g>
);

/** Ближний остров: зубчатая скала, обломок колонны и мёртвое дерево */
export const NOIR_ROCK =
  'M10 30 L40 26 L80 28 L130 24 L210 26 L290 23 L350 27 L410 30 L396 44 L372 56 L356 74 L330 86 L306 104 L282 112 L262 130 L236 136 L214 152 L198 136 L176 128 L150 112 L126 102 L104 84 L80 70 L56 58 L30 44 Z';
const PILLAR = 'M396 28 V-14 L399 -18 L402 -12 L404 -22 L407 -16 L410 -20 V28 Z M392 28 H414 V22 H392 Z M394 -10 H412 V-14 H394 Z';
const DEAD_TREE =
  'M20 28 Q22 14 18 2 Q14 -6 6 -12 L7.6 -13.4 Q15 -8 19 -2 Q20 -12 26 -20 L27.6 -19 Q22 -10 22 -2 Q26 -8 32 -10 L32.6 -8.4 Q26 -5 23 2 Q24 14 24.6 28 Z';
const CRAGS = 'M60 26 L64 18 L68 26 Z M240 25 L243 19 L246 25 Z M330 26 L333 21 L336 26 Z';

export const NOIR_ISLAND = (
  <g filter="url(#noir-rim)">
    <path d="M150 112 L146 140 M214 152 L216 176 M262 130 L268 150" stroke={NIGHT} strokeWidth="1.4" strokeDasharray="2.5 2" />
    <path d={`${NOIR_ROCK} ${PILLAR} ${DEAD_TREE} ${CRAGS}`} fill={NIGHT} />
  </g>
);

/** Кристалл парит, внутри горит цветом, вниз падает луч света */
export function NoirGem({ kind }: { kind: GemKind }) {
  const c = GEM_COLORS[kind];
  return (
    <g>
      <path d="M14 50 L26 50 L44 104 L-4 104 Z" fill={c.main} opacity="0.16" filter="url(#noir-shaft)" style={{ mixBlendMode: 'screen' }} />
      <Glow className="a-glow" x={20} y={28} r={36} light={kind} />
      <g filter="url(#sil-glow)">
        <path d={GEM.outer} fill={c.dark} />
        <path d={GEM.mid} fill={c.main} />
        <path d="M20 10 L24 20 L20 46 L16 20 Z" fill="#ffffff" opacity="0.85" />
      </g>
    </g>
  );
}

/** Слой поверх кадра: виньетка и зерно плёнки */
export const NOIR_OVERLAY = (
    <g pointerEvents="none">
      <rect width="800" height="360" fill="url(#noir-vignette)" />
      <rect width="800" height="360" filter="url(#noir-grain)" opacity="0.5" />
    </g>
  );
