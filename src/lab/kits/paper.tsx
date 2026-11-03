import { circle, GEM, GEM_COLORS, HERO, ISLAND, MENTOR, star, TILE, VILLAIN } from '../shapes';
import type { Kit } from '../types';
import { Brad, Cut, Thread } from './paperParts';

/*
  Бумажная аппликация: каждая деталь вырезана из цветной бумаги и отбрасывает тень на ту, что под ней.
  Руки крепятся заклёпками, луна и звёзды висят на нитках, как в кукольном театре,
  а движение — рывками, как в покадровой съёмке.
*/

const SKIN = '#f3c6a0';

const defs = (
  <>
    <filter id="paper-cut" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="edge" />
      <feDisplacementMap in="SourceGraphic" in2="edge" scale="1.4" xChannelSelector="R" yChannelSelector="G" result="cut" />
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="4" result="noise" />
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.32 0 0 0 -0.08" result="grain" />
      <feComposite in="grain" in2="cut" operator="in" result="grainIn" />
      <feMerge result="paper">
        <feMergeNode in="cut" />
        <feMergeNode in="grainIn" />
      </feMerge>
      <feDropShadow in="paper" dx="1" dy="1.8" stdDeviation="1.1" floodColor="#070b1c" floodOpacity="0.55" />
    </filter>
  </>
);

const hero = (
  <g>
    <path d={HERO.shadow} fill="#070b1c" opacity="0.35" />
    <path className="a-glow" d={HERO.glow} fill="#7ee7f5" opacity="0.25" />
    <Cut d={HERO.staff} fill="#b07a45" />
    <Cut d={HERO.staffRing} fill="#e8b84a" />
    <Cut d={HERO.crystal} fill="#3cc8de" />
    <Cut d={HERO.crystalLight} fill="#b5f1fa" flat />
    <Cut d={HERO.bootL} fill="#6a3d1d" />
    <Cut d={HERO.bootR} fill="#5a3218" />
    <Cut d={HERO.cloak} fill="#3d68d8" />
    <Cut d={HERO.cloakShade} fill="#2c4fae" flat />
    <Cut d={HERO.tunic} fill="#f4efe2" />
    <Cut d={HERO.belt} fill="#e8b84a" />
    <Cut d={HERO.armL} fill="#3d68d8" />
    <Cut d={HERO.handL} fill={SKIN} />
    <Brad x={39} y={83} />
    <Cut d={HERO.head} fill={SKIN} />
    <Cut d={HERO.hair} fill="#7f4c26" />
    <g className="a-blink" fill="#2a2033">
      {HERO.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    {HERO.cheeks.map((d) => (
      <path key={d} d={d} fill="#f0857a" />
    ))}
    <path d={HERO.mouth} fill="none" stroke="#2a2033" strokeWidth="1.2" strokeLinecap="round" />
    <Cut d={HERO.brimBack} fill="#5b30b8" />
    <Cut d={HERO.hatCone} fill="#8657e8" />
    <Cut d={HERO.hatBand} fill="#e8b84a" />
    <Cut d={HERO.brimFront} fill="#7444d6" />
    <Cut d={HERO.hatStar} fill="#fde68a" />
    <Cut d={HERO.armR} fill="#3460cc" />
    <Cut d={HERO.handR} fill={SKIN} />
    <Brad x={61.5} y={82} />
  </g>
);

const villain = (
  <g>
    <path d={VILLAIN.shadow} fill="#070b1c" opacity="0.35" />
    <Cut d={VILLAIN.legL} fill="#2a2f3a" />
    <Cut d={VILLAIN.legR} fill="#242833" />
    <Cut d={VILLAIN.shoeL} fill="#111318" />
    <Cut d={VILLAIN.shoeR} fill="#111318" />
    <Cut d={VILLAIN.coat} fill="#4d5566" />
    <Cut d={VILLAIN.shirt} fill="#f7f4ec" />
    <Cut d={VILLAIN.lapelL} fill="#363c49" />
    <Cut d={VILLAIN.lapelR} fill="#2f3440" />
    <Cut d={VILLAIN.tie} fill="#3069e0" />
    <Cut d={VILLAIN.collar} fill="#ffffff" />
    <Cut d={VILLAIN.armL} fill="#4d5566" />
    <Cut d={VILLAIN.gloveL} fill="#f7f4ec" />
    <Brad x={39} y={74} />
    <Cut d={VILLAIN.head} fill="#e9eaee" />
    <path d={VILLAIN.brow} fill="none" stroke="#111318" strokeWidth="1.8" strokeLinecap="round" />
    <g className="a-blink" fill="#111318">
      {VILLAIN.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <path d={VILLAIN.monocle} fill="#bcd6fb" fillOpacity="0.5" stroke="#3069e0" strokeWidth="1.6" />
    <path d={VILLAIN.chain} fill="none" stroke="#3069e0" strokeWidth="0.9" strokeDasharray="1.4 1" />
    <Cut d={VILLAIN.mustache} fill="#111318" />
    <path d={VILLAIN.mouth} fill="none" stroke="#5b6170" strokeWidth="1.2" strokeLinecap="round" />
    <Cut d={VILLAIN.hatCrown} fill="#565e6d" />
    <Cut d={VILLAIN.hatBand} fill="#3069e0" />
    <Cut d={VILLAIN.hatUnderline} fill="#3069e0" flat />
    <Cut d={VILLAIN.hatBrim} fill="#3f4552" />
    <Cut d={VILLAIN.cane} fill="#d4d8df" />
    <Cut d={VILLAIN.armR} fill="#454d5d" />
    <Cut d={VILLAIN.caneKnob} fill="#f1f2f5" />
    <Cut d={VILLAIN.gloveR} fill="#f7f4ec" />
    <Brad x={61} y={74} />
  </g>
);

const mentor = (
  <g>
    <Cut d={MENTOR.robe} fill="#5b3cc4" />
    {MENTOR.robeStars.map((d) => (
      <Cut key={d} d={d} fill="#f2c94c" />
    ))}
    <Cut d={MENTOR.face} fill={SKIN} />
    <Cut d={MENTOR.beard} fill="#f6f3ec" />
    <path d={MENTOR.beardLines} fill="none" stroke="#d6cfbf" strokeWidth="1.4" strokeLinecap="round" />
    {MENTOR.cheeks.map((d) => (
      <path key={d} d={d} fill="#f0857a" />
    ))}
    <g className="a-blink" fill="#2a2033">
      {MENTOR.eyes.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
    <path d={MENTOR.brows} fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" />
    <Cut d={MENTOR.nose} fill="#e6a77d" />
    <Cut d={MENTOR.mustache} fill="#ffffff" />
    <Cut d={MENTOR.brimBack} fill="#5b30b8" />
    <Cut d={MENTOR.hatCone} fill="#8657e8" />
    <Cut d={MENTOR.brimFront} fill="#7444d6" />
    {MENTOR.hatStars.map((d) => (
      <Cut key={d} d={d} fill="#fde68a" />
    ))}
  </g>
);

function gem(kind: keyof typeof GEM_COLORS) {
  const c = GEM_COLORS[kind];
  return (
    <g>
      <line x1="20" y1="-60" x2="20" y2="3" stroke="#e8dcc0" strokeWidth="0.7" opacity="0.6" />
      <Cut d={GEM.outer} fill={c.main} />
      <Cut d={GEM.left} fill={c.light} />
      <Cut d={GEM.right} fill={c.dark} flat />
      <path className="a-twinkle" d={GEM.sparkle} fill="#ffffff" />
    </g>
  );
}

const HANGING_STARS: [number, number, number][] = [
  [120, 70, 9],
  [300, 46, 7],
  [470, 96, 8],
  [760, 120, 7],
];

const DOTS: [number, number][] = [
  [60, 40], [210, 30], [384, 24], [560, 40], [600, 150], [40, 150], [250, 130], [720, 40],
];

const sky = (
  <g>
    <rect width="800" height="360" fill="#1b2547" />
    {DOTS.map(([x, y]) => (
      <path key={`${x},${y}`} d={circle(x, y, 1.6)} fill="#c9d3f0" opacity="0.6" />
    ))}
    <Thread x={680} to={46} />
    <Cut d={circle(680, 84, 38)} fill="#f3e2a6" />
    <path d={`${circle(667, 74, 6)} ${circle(692, 98, 5)} ${circle(695, 70, 3)}`} fill="#e3cb84" />
    {HANGING_STARS.map(([x, y, r], i) => (
      <g key={x} className={i % 2 ? 'a-dangle a-delay' : 'a-dangle'}>
        <Thread x={x} to={y - r} />
        <Cut d={star(x, y, r)} fill="#f3e2a6" />
      </g>
    ))}
    <Cut d="M40 214 Q80 202 130 210 Q120 230 92 238 Q60 232 40 214 Z" fill="#2a3a6c" />
    <Cut d="M640 240 Q690 230 750 238 Q738 258 700 266 Q660 256 640 240 Z" fill="#2a3a6c" />
    <Cut d="M0 296 Q50 270 110 290 Q160 262 230 288 Q300 266 370 290 Q450 262 520 288 Q600 266 670 290 Q740 270 800 286 V360 H0 Z" fill="#26335f" />
    <Cut d="M0 324 Q70 300 150 320 Q230 296 320 320 Q410 298 490 322 Q580 300 670 322 Q740 308 800 318 V360 H0 Z" fill="#2f3f73" />
  </g>
);

/** Край травы, вырезанный ножницами-зигзагом */
const grassZigzag = (() => {
  const top = (x: number) => 20 + 10 * ((x - 210) / 204) ** 2;
  const points: string[] = [];
  for (let x = 6, i = 0; x <= 414; x += 6, i++) points.push(`${x} ${(top(x) + (i % 2 ? 3 : 0)).toFixed(1)}`);
  const bottom = (x: number) => 38 + 4 * ((x - 210) / 204) ** 2;
  for (let x = 414; x >= 6; x -= 34) points.push(`${x} ${bottom(x).toFixed(1)}`);
  return `M${points.join(' L')} Z`;
})();

const island = (
  <g>
    <Cut d={ISLAND.rock} fill="#8a5a44" />
    <Cut d={ISLAND.rockShade} fill="#6f4636" />
    <Cut d="M70 60 Q150 70 230 64 Q300 60 352 66 Q330 84 290 92 Q220 100 150 92 Q100 84 70 60 Z" fill="#9b6a50" />
    {ISLAND.bushes.map((d) => (
      <Cut key={d} d={d} fill="#3f9a57" />
    ))}
    <Cut d={grassZigzag} fill="#5fbf6a" />
  </g>
);

export const paperKit: Kit = {
  id: 'paper',
  name: 'Бумажная аппликация',
  about: 'Кукольный театр из цветной бумаги: детали с тенями, руки на заклёпках, луна и звёзды на нитках, движение рывками.',
  traits: [
    'Шрифты Balsamiq Sans и Rubik: «самодельные», тёплые',
    'Анимация как покадровая съёмка: не нужна плавность',
    'Самый узнаваемый и сказочный; тени на каждой детали',
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
      <rect width="40" height="40" fill="#20264a" />
      {TILE.bricks.map(([x, y, w, h]) => (
        <g key={`${x},${y}`}>
          <Cut d={`M${x} ${y} h${w} v${h} h${-w} Z`} fill="#5b6390" />
          <path d={`M${x + 1.5} ${y + 1.5} h${w - 3} v3 h${-(w - 3)} Z`} fill="#7179a6" />
        </g>
      ))}
    </g>
  ),
  floor: (x, y) => (
    <g>
      <rect width="40" height="40" fill="#121733" />
      {(x + y) % 2 === 1 && <path d="M4 4 H36 V36 H4 Z" fill="#161c3d" />}
    </g>
  ),
  torch: (
    <g>
      <Cut d={TILE.plate} fill="#7b8094" />
      <Cut d={TILE.handle} fill="#b07a45" />
      <Cut d={TILE.cup} fill="#9aa0b5" />
      <path className="a-glow" d={TILE.glow} fill="#f7a531" opacity="0.22" />
      <g className="a-flicker">
        <Cut d={TILE.flameOuter} fill="#f2643a" />
        <Cut d={TILE.flameMid} fill="#f7a531" />
        <Cut d={TILE.flameCore} fill="#fde7a1" />
      </g>
    </g>
  ),
  exit: (
    <g>
      <path className="a-glow" d={circle(20, 24, 18)} fill="#62d48a" opacity="0.2" />
      <Cut d={TILE.archOuter} fill="#2f7d4a" />
      <Cut d={TILE.archLight} fill="#62d48a" />
      <Cut d={TILE.archCore} fill="#e4fbe9" />
    </g>
  ),
  bug: (
    <g>
      <path d={TILE.bugLegs} stroke="#2a2033" strokeWidth="2.2" strokeLinecap="round" />
      <path d={TILE.bugAntennae} fill="none" stroke="#2a2033" strokeWidth="1.6" strokeLinecap="round" />
      <Cut d={TILE.bugHead} fill="#2a2033" />
      <Cut d={TILE.bugBody} fill="#e5483d" />
      <path d={TILE.bugSplit} stroke="#2a2033" strokeWidth="1.4" />
      {TILE.bugSpots.map((d) => (
        <Cut key={d} d={d} fill="#2a2033" />
      ))}
      {TILE.bugEyes.map((d) => (
        <path key={d} d={d} fill="#ffffff" />
      ))}
    </g>
  ),
};
