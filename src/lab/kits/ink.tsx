import { circle, GEM, GEM_COLORS, HERO, ISLAND, MENTOR, TILE, VILLAIN } from '../shapes';
import type { Kit } from '../types';

/*
  Тушь и акварель — страница гримуара. Контур тушью «кипит» (дрожит, как в рисованной анимации),
  заливка — акварель с неровным краем и сдвигом мимо линии, тень — штриховкой.
*/

import { Hatch, Ink, INK, Line, PAPER } from './inkParts';

const SKIN = '#f2c39b';

const defs = (
  <>
    <linearGradient id="ink-dusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#34427a" />
      <stop offset="0.6" stopColor="#6c62a0" />
      <stop offset="1" stopColor="#c7a6a6" />
    </linearGradient>
    <pattern id="ink-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <path d="M0 0 V4" stroke={INK} strokeWidth="0.8" opacity="0.55" />
    </pattern>
    {/* Линия «кипит»: шум меняется скачками, контур чуть дрожит — как перерисованный от руки кадр */}
    <filter id="ink-line" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="turbulence" baseFrequency="0.06" numOctaves="2" seed="1" result="noise">
        <animate attributeName="seed" values="1;2;3" dur="0.45s" calcMode="discrete" repeatCount="indefinite" />
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.6" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* Акварель: неровный край, мягкость и зерно пигмента */}
    <filter id="ink-wash" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="7" result="edge" />
      <feDisplacementMap in="SourceGraphic" in2="edge" scale="5" xChannelSelector="R" yChannelSelector="G" result="spread" />
      <feGaussianBlur in="spread" stdDeviation="0.5" result="soft" />
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" result="grain" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.5 0 0 0 -0.12" result="dots" />
      <feComposite in="dots" in2="soft" operator="in" result="pigment" />
      <feMerge>
        <feMergeNode in="soft" />
        <feMergeNode in="pigment" />
      </feMerge>
    </filter>
    <filter id="ink-wash-big" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="2" result="edge" />
      <feDisplacementMap in="SourceGraphic" in2="edge" scale="22" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    {/* Зерно бумаги поверх картинки */}
    <filter id="ink-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="5" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.17  0 0 0 0 0.13  0 0 0 0 0.09  0.8 0 0 0 -0.3" />
    </filter>
  </>
);

const hero = (
  <g>
    <Hatch d={HERO.shadow} />
    <path className="a-glow" d={HERO.glow} fill="#5ad1e6" opacity="0.3" filter="url(#ink-wash)" />
    <Ink d={HERO.staff} fill="#a36a3c" />
    <Ink d={HERO.staffRing} fill="#e0b04a" />
    <Ink d={HERO.crystal} fill="#4cc9e0" />
    <path d={HERO.crystalLight} fill="#ffffff" opacity="0.4" />
    <Ink d={HERO.bootL} fill="#6b3f1d" />
    <Ink d={HERO.bootR} fill="#6b3f1d" />
    <Ink d={HERO.cloak} fill="#3f63c9" />
    <Hatch d={HERO.cloakShade} />
    <Ink d={HERO.tunic} fill="#e9defa" wash={0.6} />
    <Ink d={HERO.belt} fill="#e0b04a" line={1.1} />
    <Ink d={HERO.armL} fill="#3f63c9" />
    <Ink d={HERO.handL} fill={SKIN} line={1.1} />
    <Ink d={HERO.head} fill={SKIN} />
    <Hatch d={HERO.headShade} opacity={0.45} />
    <Ink d={HERO.hair} fill="#8a5a33" line={1.1} />
    <g className="a-blink" fill={INK}>
      {HERO.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    {HERO.cheeks.map((d) => (
      <path key={d} d={d} fill="#e8776b" opacity="0.4" filter="url(#ink-wash)" />
    ))}
    <Line d={HERO.mouth} width={1.1} />
    <Ink d={HERO.brimBack} fill="#5d36b0" />
    <Ink d={HERO.hatCone} fill="#7d55d9" />
    <Hatch d={HERO.hatShade} />
    <Ink d={HERO.hatBand} fill="#e0b04a" line={1.1} />
    <Ink d={HERO.brimFront} fill="#7d55d9" />
    <Ink d={HERO.hatStar} fill="#f2cf63" line={1} />
    <Ink d={HERO.armR} fill="#3f63c9" />
    <Ink d={HERO.handR} fill={SKIN} line={1.1} />
  </g>
);

const villain = (
  <g>
    <Hatch d={VILLAIN.shadow} />
    <Ink d={VILLAIN.legL} fill="#3a3f4a" />
    <Ink d={VILLAIN.legR} fill="#3a3f4a" />
    <Ink d={VILLAIN.shoeL} fill="#1d2027" />
    <Ink d={VILLAIN.shoeR} fill="#1d2027" />
    <Ink d={VILLAIN.coat} fill="#5b6474" />
    <Hatch d={VILLAIN.coatShade} />
    <Ink d={VILLAIN.shirt} />
    <Ink d={VILLAIN.lapelL} fill="#3a404c" line={1.1} />
    <Ink d={VILLAIN.lapelR} fill="#3a404c" line={1.1} />
    <Ink d={VILLAIN.tie} fill="#3d6fd6" line={1} />
    <Ink d={VILLAIN.collar} line={1} />
    <Ink d={VILLAIN.armL} fill="#5b6474" />
    <Ink d={VILLAIN.gloveL} line={1.1} />
    <Ink d={VILLAIN.head} fill="#e3e6ea" wash={0.6} />
    <Hatch d={VILLAIN.headShade} opacity={0.4} />
    <Line d={VILLAIN.brow} width={1.5} />
    <g className="a-blink" fill={INK}>
      {VILLAIN.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <path d={VILLAIN.monocle} fill="#9cc3f5" opacity="0.35" filter="url(#ink-wash)" />
    <Line d={VILLAIN.monocle} width={1.3} color="#2c55a8" />
    <Line d={VILLAIN.chain} width={0.8} color="#2c55a8" />
    <path d={VILLAIN.mustache} fill={INK} filter="url(#ink-line)" />
    <Line d={VILLAIN.mouth} width={1.1} />
    <Ink d={VILLAIN.hatCrown} fill="#59606e" />
    <Ink d={VILLAIN.hatBand} fill="#3d6fd6" line={1} />
    <Ink d={VILLAIN.hatUnderline} fill="#3d6fd6" line={false} />
    <Ink d={VILLAIN.hatBrim} fill="#4a505c" />
    <Ink d={VILLAIN.cane} fill="#c7ccd4" line={1} />
    <Ink d={VILLAIN.armR} fill="#555e6d" />
    <Ink d={VILLAIN.caneKnob} fill="#e5e7eb" line={1} />
    <Ink d={VILLAIN.gloveR} line={1.1} />
  </g>
);

const mentor = (
  <g>
    <Ink d={MENTOR.robe} fill="#5a3fb0" line={1.6} />
    <Hatch d={MENTOR.robeShade} />
    {MENTOR.robeStars.map((d) => (
      <Ink key={d} d={d} fill="#f2cf63" line={1} />
    ))}
    <Ink d={MENTOR.face} fill={SKIN} line={1.6} />
    <Hatch d={MENTOR.faceShade} opacity={0.45} />
    <Ink d={MENTOR.beard} line={1.6} />
    <Line d={MENTOR.beardLines} width={1.1} />
    {MENTOR.cheeks.map((d) => (
      <path key={d} d={d} fill="#e8776b" opacity="0.4" filter="url(#ink-wash)" />
    ))}
    <g className="a-blink" fill={INK}>
      {MENTOR.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <Line d={MENTOR.brows} width={1.8} />
    <Ink d={MENTOR.nose} fill="#e2a47c" line={1.2} />
    <Ink d={MENTOR.mustache} line={1.4} />
    <Ink d={MENTOR.brimBack} fill="#5d36b0" line={1.6} />
    <Ink d={MENTOR.hatCone} fill="#7d55d9" line={1.6} />
    <Hatch d={MENTOR.hatShade} />
    <Ink d={MENTOR.brimFront} fill="#7d55d9" line={1.6} />
    {MENTOR.hatStars.map((d) => (
      <Ink key={d} d={d} fill="#f2cf63" line={1} />
    ))}
  </g>
);

function gem(kind: keyof typeof GEM_COLORS) {
  const c = GEM_COLORS[kind];
  return (
    <g>
      <Ink d={GEM.outer} fill={c.main} line={1.3} />
      <path d={GEM.left} fill="#ffffff" opacity="0.35" />
      <Hatch d={GEM.right} opacity={0.7} />
      <Line d="M12 17 V39 M28 17 V39 M12 17 H28 M20 2 L12 17 M20 2 L28 17 M12 39 L20 54 L28 39" width={0.9} />
      <path className="a-twinkle" d={GEM.sparkle} fill="#ffffff" />
    </g>
  );
}

const STARS: [number, number][] = [
  [60, 44], [150, 92], [214, 34], [300, 74], [384, 28], [470, 64], [548, 118], [604, 34], [760, 56], [40, 160], [262, 140],
];

/** Звёздочка тушью: три перечёркнутые линии */
const asterisk = (x: number, y: number, r: number) =>
  `M${x - r} ${y} H${x + r} M${x - r * 0.6} ${y - r * 0.8} L${x + r * 0.6} ${y + r * 0.8} M${x - r * 0.6} ${y + r * 0.8} L${x + r * 0.6} ${y - r * 0.8}`;

const cloud = (x: number, y: number, s: number) =>
  `M${x} ${y} q${8 * s} ${-14 * s} ${22 * s} ${-6 * s} q${10 * s} ${-14 * s} ${26 * s} ${-2 * s} q${16 * s} ${-6 * s} ${18 * s} ${8 * s} Z`;

const sky = (
  <g>
    <rect width="800" height="360" fill={PAPER} />
    <rect x="16" y="14" width="768" height="332" fill="url(#ink-dusk)" filter="url(#ink-wash-big)" />
    {STARS.map(([x, y], i) => (
      <Line key={`${x},${y}`} d={asterisk(x, y, i % 3 ? 3 : 4.5)} width={1} color="#fbf3dc" />
    ))}
    <Ink d={circle(680, 84, 36)} fill="#f7e7b0" wash={0.7} line={1.5} />
    <Line d={`${circle(667, 74, 6)} ${circle(691, 97, 4.5)} ${circle(694, 70, 3)}`} width={0.9} />
    <Ink d={cloud(560, 92, 2.2)} fill="#c9bfe0" wash={0.55} />
    <Ink d={cloud(60, 120, 1.8)} fill="#c9bfe0" wash={0.55} />
    <Ink d="M40 214 Q80 202 130 210 Q120 230 92 238 Q60 232 40 214 Z" fill="#8d7fb3" wash={0.7} />
    <Ink d="M640 240 Q690 230 750 238 Q738 258 700 266 Q660 260 640 240 Z" fill="#8d7fb3" wash={0.7} />
    <rect width="800" height="360" filter="url(#ink-grain)" opacity="0.6" />
  </g>
);

const tufts = Array.from({ length: 14 }, (_, i) => {
  const x = 40 + i * 26 + (i % 3) * 4;
  const y = 22 + Math.abs(i - 6.5) * 1.1;
  return `M${x} ${y} l2 -6 l1.5 6 l2.5 -4.5`;
}).join(' ');

const island = (
  <g>
    <Ink d={ISLAND.rock} fill="#b08a64" line={1.6} />
    <Hatch d={ISLAND.rockShade} />
    <Line d={ISLAND.strata} width={1.1} />
    {ISLAND.bushes.map((d) => (
      <Ink key={d} d={d} fill="#6aa85a" />
    ))}
    <Ink d={ISLAND.grass} fill="#7cbf6a" line={1.6} />
    <Line d={tufts} width={1} />
  </g>
);

export const inkKit: Kit = {
  id: 'ink',
  name: 'Тушь и акварель',
  about: 'Страница гримуара: линия тушью «кипит», как в рисованном мультфильме, цвет — акварелью мимо контура, тень — штриховкой.',
  traits: [
    'Шрифты Cormorant и Lora: книжные, «магические»',
    'Подземелье выглядит как карта в старой книге',
    'Самый атмосферный под сюжет; фильтры тяжелее для слабых компьютеров',
  ],
  defs,
  sky,
  island,
  hero,
  villain,
  mentor,
  gem,
  wall: () => (
    <g>
      <rect width="40" height="40" fill="#a59cb5" opacity="0.85" filter="url(#ink-wash)" />
      {TILE.bricks.map(([x, y, w, h]) => (
        <g key={`${x},${y}`}>
          <path d={`M${x} ${y + h - 6} h${w} v6 h${-w} Z`} fill="url(#ink-hatch)" />
          <Line d={`M${x + 1} ${y} h${w - 2} q1 0 1 1 v${h - 2} q0 1 -1 1 h${-(w - 2)} q-1 0 -1 -1 v${-(h - 2)} q0 -1 1 -1 Z`} width={1} />
        </g>
      ))}
    </g>
  ),
  floor: (x, y) => (
    <g>
      <rect width="40" height="40" fill={PAPER} />
      {TILE.specks
        .filter((_, i) => (x * 3 + y + i) % 3 === 0)
        .map(([sx, sy]) => (
          <path key={`${sx},${sy}`} d={circle(sx, sy, 0.9)} fill={INK} opacity="0.6" />
        ))}
    </g>
  ),
  torch: (
    <g>
      <path className="a-glow" d={TILE.glow} fill="#f7c948" opacity="0.4" filter="url(#ink-wash)" />
      <Ink d={TILE.plate} fill="#8d8a94" line={1} />
      <Ink d={TILE.handle} fill="#a36a3c" line={1} />
      <Ink d={TILE.cup} fill="#8d8a94" line={1} />
      <g className="a-flicker">
        <Ink d={TILE.flameOuter} fill="#f08a3c" line={1} />
        <path d={TILE.flameMid} fill="#f7c948" opacity="0.9" filter="url(#ink-wash)" />
        <path d={TILE.flameCore} fill="#fffbe8" />
      </g>
    </g>
  ),
  exit: (
    <g>
      <Ink d={TILE.archOuter} fill="#4f9a62" line={1.2} />
      <path d={TILE.archLight} fill="#9ae0a8" opacity="0.9" filter="url(#ink-wash)" />
      <path d={TILE.archCore} fill="#f3fff3" />
      <Line d={TILE.archLight} width={0.8} />
    </g>
  ),
  bug: (
    <g>
      <Line d={TILE.bugLegs} width={1.3} />
      <Line d={TILE.bugAntennae} width={1} />
      <Ink d={TILE.bugHead} fill="#3a2a2a" line={1} />
      <Ink d={TILE.bugBody} fill="#d9473b" line={1.2} />
      <Line d={TILE.bugSplit} width={1} />
      {TILE.bugSpots.map((d) => (
        <path key={d} d={d} fill={INK} />
      ))}
      {TILE.bugEyes.map((d) => (
        <path key={d} d={d} fill={PAPER} />
      ))}
    </g>
  ),
};

