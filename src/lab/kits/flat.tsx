import { circle, ellipse, GEM, GEM_COLORS, HERO, ISLAND, MENTOR, sparkle, TILE, VILLAIN } from '../shapes';
import type { Kit } from '../types';

/* Плоская иллюстрация: без контуров, мягкие формы, тень — плоским пятном того же цвета, но темнее */

const SKIN = '#f6c9a0';
const SKIN_SHADE = '#e3a87c';

const hero = (
  <g>
    <path d={HERO.shadow} fill="#0b0820" opacity="0.35" />
    <path className="a-glow" d={HERO.glow} fill="#22d3ee" opacity="0.28" />
    <path d={HERO.staff} fill="#9a6435" />
    <path d={HERO.staffRing} fill="#f6c453" />
    <path d={HERO.crystal} fill="#22d3ee" />
    <path d={HERO.crystalLight} fill="#a5f3fc" />
    <path d={HERO.bootL} fill="#5b3413" />
    <path d={HERO.bootR} fill="#4a2a10" />
    <path d={HERO.cloak} fill="#3b6ff0" />
    <path d={HERO.cloakShade} fill="#2448b8" />
    <path d={HERO.tunic} fill="#eef1ff" />
    <path d={HERO.belt} fill="#f6c453" />
    <path d={HERO.buckle} fill="#c98f2c" />
    <path d={HERO.armL} fill="#3b6ff0" />
    <path d={HERO.handL} fill={SKIN} />
    <path d={HERO.head} fill={SKIN} />
    <path d={HERO.headShade} fill={SKIN_SHADE} opacity="0.6" />
    <path d={HERO.hair} fill="#7a4a24" />
    <g className="a-blink" fill="#2a1d4a">
      {HERO.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    {HERO.cheeks.map((d) => (
      <path key={d} d={d} fill="#f28b82" opacity="0.5" />
    ))}
    <path d={HERO.mouth} fill="none" stroke="#7c2d12" strokeWidth="1.2" strokeLinecap="round" />
    <path d={HERO.brimBack} fill="#5b21b6" />
    <path d={HERO.hatCone} fill="#8b5cf6" />
    <path d={HERO.hatShade} fill="#6d3fe0" />
    <path d={HERO.hatBand} fill="#f6c453" />
    <path d={HERO.brimFront} fill="#7c3aed" />
    <path d={HERO.hatStar} fill="#ffe08a" />
    <path d={HERO.armR} fill="#2f5fd8" />
    <path d={HERO.handR} fill={SKIN} />
  </g>
);

const villain = (
  <g>
    <path d={VILLAIN.shadow} fill="#0b0820" opacity="0.35" />
    <path d={VILLAIN.legL} fill="#1f2937" />
    <path d={VILLAIN.legR} fill="#18202c" />
    <path d={VILLAIN.shoeL} fill="#0b0f19" />
    <path d={VILLAIN.shoeR} fill="#0b0f19" />
    <path d={VILLAIN.coat} fill="#414b5c" />
    <path d={VILLAIN.coatShade} fill="#2b3341" />
    <path d={VILLAIN.shirt} fill="#f9fafb" />
    <path d={VILLAIN.lapelL} fill="#2b3341" />
    <path d={VILLAIN.lapelR} fill="#232a36" />
    <path d={VILLAIN.tie} fill="#2563eb" />
    <path d={VILLAIN.collar} fill="#ffffff" />
    <path d={VILLAIN.armL} fill="#323a48" />
    <path d={VILLAIN.gloveL} fill="#f9fafb" />
    <path d={VILLAIN.head} fill="#e8ebf0" />
    <path d={VILLAIN.headShade} fill="#cbd2dc" />
    <path d={VILLAIN.brow} fill="none" stroke="#111827" strokeWidth="1.6" strokeLinecap="round" />
    <g className="a-blink" fill="#111827">
      {VILLAIN.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <path d={VILLAIN.monocle} fill="#93c5fd" fillOpacity="0.3" stroke="#3b82f6" strokeWidth="1.5" />
    <path d={VILLAIN.chain} fill="none" stroke="#3b82f6" strokeWidth="0.9" />
    <path d={VILLAIN.mustache} fill="#111827" />
    <path d={VILLAIN.mouth} fill="none" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" />
    <path d={VILLAIN.hatCrown} fill="#4b5563" />
    <path d={VILLAIN.hatShine} fill="#6b7280" />
    <path d={VILLAIN.hatBand} fill="#3b82f6" />
    <path d={VILLAIN.hatUnderline} fill="#3b82f6" />
    <path d={VILLAIN.hatBrim} fill="#374151" />
    <path d={VILLAIN.cane} fill="#cbd5e1" />
    <path d={VILLAIN.armR} fill="#2b3240" />
    <path d={VILLAIN.caneKnob} fill="#e5e7eb" />
    <path d={VILLAIN.gloveR} fill="#f9fafb" />
  </g>
);

const mentor = (
  <g>
    <path d={MENTOR.robe} fill="#5b34c9" />
    <path d={MENTOR.robeShade} fill="#4524a6" />
    {MENTOR.robeStars.map((d) => (
      <path key={d} d={d} fill="#f6c453" />
    ))}
    <path d={MENTOR.face} fill={SKIN} />
    <path d={MENTOR.faceShade} fill={SKIN_SHADE} opacity="0.6" />
    <path d={MENTOR.beard} fill="#f4f6fb" />
    <path d={MENTOR.beardLines} fill="none" stroke="#cdd3e1" strokeWidth="1.6" strokeLinecap="round" />
    {MENTOR.cheeks.map((d) => (
      <path key={d} d={d} fill="#f28b82" opacity="0.45" />
    ))}
    <g className="a-blink" fill="#2a1d4a">
      {MENTOR.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <path d={MENTOR.brows} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    <path d={MENTOR.nose} fill={SKIN_SHADE} />
    <path d={MENTOR.mustache} fill="#ffffff" />
    <path d={MENTOR.brimBack} fill="#5b21b6" />
    <path d={MENTOR.hatCone} fill="#8b5cf6" />
    <path d={MENTOR.hatShade} fill="#6d3fe0" />
    <path d={MENTOR.brimFront} fill="#7c3aed" />
    {MENTOR.hatStars.map((d) => (
      <path key={d} d={d} fill="#ffe08a" />
    ))}
  </g>
);

function gem(kind: keyof typeof GEM_COLORS) {
  const c = GEM_COLORS[kind];
  return (
    <g>
      <path d={ellipse(20, 62, 12, 2.5)} fill="#0b0820" opacity="0.3" />
      <path d={GEM.mid} fill={c.main} />
      <path d={GEM.left} fill={c.light} />
      <path d={GEM.right} fill={c.dark} />
      <path d={GEM.top} fill="#ffffff" opacity="0.55" />
      <path className="a-twinkle" d={GEM.sparkle} fill="#ffffff" />
    </g>
  );
}

const STARS: [number, number, number][] = [
  [60, 40, 1.6], [140, 90, 1.2], [210, 30, 2], [300, 70, 1.3], [380, 24, 1.6], [470, 60, 1.2],
  [540, 120, 1.5], [600, 30, 1.2], [760, 50, 1.8], [720, 150, 1.2], [40, 160, 1.3], [260, 140, 1.1],
];

const sky = (
  <g>
    <rect width="800" height="360" fill="#1d1650" />
    <path d={circle(680, 82, 120)} fill="#2a2168" />
    <path d={circle(680, 82, 80)} fill="#352a7c" />
    {STARS.map(([x, y, r]) => (
      <path key={`${x},${y}`} d={circle(x, y, r)} fill="#e9e4ff" opacity="0.85" />
    ))}
    <path className="a-twinkle" d={sparkle(120, 52, 9)} fill="#fff3c4" />
    <path className="a-twinkle a-delay" d={sparkle(430, 110, 7)} fill="#fff3c4" />
    <path d={circle(680, 82, 38)} fill="#ffe9a8" />
    <path d={circle(668, 72, 7)} fill="#f6d27a" />
    <path d={circle(692, 96, 5)} fill="#f6d27a" />
    <path d={circle(694, 68, 3.5)} fill="#f6d27a" />
    {/* Дальние острова */}
    <path d="M40 210 Q80 198 130 206 Q120 226 92 234 Q60 228 40 210 Z" fill="#2c2373" />
    <path d="M640 236 Q690 226 750 234 Q738 254 700 262 Q660 256 640 236 Z" fill="#2c2373" />
    {/* Облака снизу — два слоя */}
    <path d="M0 300 Q60 268 130 292 Q190 262 270 290 Q340 266 420 292 Q500 264 580 290 Q660 268 730 290 Q770 280 800 288 V360 H0 Z" fill="#2a2270" />
    <path d="M0 330 Q80 304 160 324 Q240 300 330 324 Q420 302 500 326 Q590 304 680 326 Q740 312 800 322 V360 H0 Z" fill="#342b84" />
  </g>
);

const island = (
  <g>
    <path d={ISLAND.rock} fill="#6b4f9a" />
    <path d={ISLAND.rockShade} fill="#523a7d" />
    <path d={ISLAND.strata} fill="none" stroke="#5a4288" strokeWidth="4" strokeLinecap="round" />
    {ISLAND.bushes.map((d) => (
      <path key={d} d={d} fill="#3fae6e" />
    ))}
    <path d={ISLAND.grass} fill="#5fd38d" />
    <path d={ISLAND.grassShade} fill="#3fae6e" />
  </g>
);

const torch = (
  <g>
    <path d={TILE.plate} fill="#6b7280" />
    <path d={TILE.handle} fill="#8b5a2b" />
    <path d={TILE.cup} fill="#9ca3af" />
    <path className="a-glow" d={TILE.glow} fill="#fde68a" opacity="0.14" />
    <g className="a-flicker">
      <path d={TILE.flameOuter} fill="#f97316" />
      <path d={TILE.flameMid} fill="#fbbf24" />
      <path d={TILE.flameCore} fill="#fff7d6" />
    </g>
  </g>
);

export const flatKit: Kit = {
  id: 'flat',
  name: 'Плоская иллюстрация',
  about: 'Мягкие формы без контуров, тень — плоским пятном. Современно, чисто, хорошо читается на любом экране.',
  traits: [
    'Шрифт Nunito: круглый и дружелюбный',
    'Плавная анимация: дыхание, мерцание, моргание',
    'Самый быстрый в работе: фигуры простые',
  ],
  sky,
  island,
  hero,
  villain,
  mentor,
  gem,
  wall: () => (
    <g>
      <rect width="40" height="40" fill="#231c4d" />
      {TILE.bricks.map(([x, y, w, h]) => (
        <g key={`${x},${y}`}>
          <rect x={x} y={y} width={w} height={h} rx="4" fill="#4a4580" />
          <rect x={x} y={y} width={w} height="5" rx="2.5" fill="#5f5a99" />
        </g>
      ))}
    </g>
  ),
  floor: (x, y) => (
    <g>
      <rect width="40" height="40" fill="#17123a" />
      {(x + y) % 2 === 0 && <rect x="3" y="3" width="34" height="34" rx="6" fill="#1c1645" />}
    </g>
  ),
  torch,
  exit: (
    <g>
      <path className="a-glow" d={circle(20, 24, 18)} fill="#4ade80" opacity="0.2" />
      <path d={TILE.archOuter} fill="#15803d" />
      <path d={TILE.archLight} fill="#4ade80" />
      <path d={TILE.archCore} fill="#dcfce7" />
    </g>
  ),
  bug: (
    <g>
      <path d={TILE.bugLegs} stroke="#1f1235" strokeWidth="2" strokeLinecap="round" />
      <path d={TILE.bugAntennae} fill="none" stroke="#1f1235" strokeWidth="1.6" strokeLinecap="round" />
      <path d={TILE.bugHead} fill="#1f1235" />
      <path d={TILE.bugBody} fill="#ef4444" />
      <path d="M20 14 A11 10 0 0 1 20 34 Q27 28 27 24 Q27 19 20 14 Z" fill="#b91c1c" />
      <path d={TILE.bugSplit} stroke="#1f1235" strokeWidth="1.4" />
      {TILE.bugSpots.map((d) => (
        <path key={d} d={d} fill="#1f1235" />
      ))}
      {TILE.bugEyes.map((d) => (
        <path key={d} d={d} fill="#ffffff" />
      ))}
    </g>
  ),
};

