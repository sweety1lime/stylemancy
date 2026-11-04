import type { CSSProperties, ReactNode } from 'react';
import { gear, spruce, type GemKind } from './geometry';
import { Glow } from './light';
import type { Light } from './lights';
import { HERO_RIG } from './rig/heroRig';
import { Rig } from './rig/Rig';
import { VILLAIN_RIG } from './rig/villainRig';
import { NIGHT, NOIR_ISLAND, NOIR_SKY, NoirGem } from './scene';
import { C, E, P, R } from './shapes';

/*
  Сценки сюжета в «Сумраке» для всех земель, кроме пролога островов (он в NoirStoryArt).
  Кадр — сцена 800 × 360, видна середина 640 × 360. Небо Каскадии — с Академией вдали,
  у Скриптории — бирюзовая ночь с шестернями на горизонте, в помещениях — темнота и тёплый свет.
  Силуэты с лунной кромкой (noir-rim), светятся только огонь, магия и надписи-заклинания.
*/

const MONO = 'ui-monospace, "Cascadia Mono", Consolas, monospace';
const SERIF = '"Cormorant Garamond", Georgia, serif';
const AMBER = '#f0c890';
const TEAL = '#8ff0e0';
const WINDOW = '#ffc77a';

/* ===== Общие детали ===== */

/** Надпись, которая светится: теги, код, вывески */
function Glyph({ x, y, children, color = AMBER, size = 22, mono = false, className, rotate = 0, opacity }: {
  x: number;
  y: number;
  children: ReactNode;
  color?: string;
  size?: number;
  mono?: boolean;
  className?: string;
  rotate?: number;
  opacity?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      className={className}
      fill={color}
      fontFamily={mono ? MONO : SERIF}
      fontSize={size}
      fontWeight={600}
      textAnchor="middle"
      filter="url(#sil-glow)"
      opacity={opacity}
      transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}
    >
      {children}
    </text>
  );
}

/** Тёмный силуэт с лунной кромкой */
function Sil({ d, className, style }: { d: string; className?: string; style?: CSSProperties }) {
  return <path d={d} fill={NIGHT} filter="url(#noir-rim)" className={className} style={style} />;
}

/** Ночь Скриптории: бирюзовое небо, луна с зеленцой, шестерни на горизонте */
export function ScriptSky() {
  return (
    <g>
      <rect width="800" height="360" fill="url(#noir-sky-script)" />
      {[
        [130, 40],
        [220, 92],
        [340, 30],
        [470, 70],
        [560, 22],
        [690, 54],
        [260, 150],
        [520, 130],
      ].map(([x, y], i) => (
        <circle key={i} className={i % 3 ? undefined : 'a-twinkle'} cx={x} cy={y} r={0.9} fill="#d8f4ef" opacity={0.7} />
      ))}
      <circle cx="610" cy="88" r="200" fill="url(#noir-halo)" />
      <circle cx="610" cy="88" r="38" fill="url(#noir-moon-script)" />
      <g fill="#0b2224" opacity="0.9">
        <path d={gear(150, 300, 54, 12)} className="a-spin" style={{ transformOrigin: '150px 300px' }} />
        <path d={gear(690, 310, 64, 14)} className="a-spin a-reverse" style={{ transformOrigin: '690px 310px' }} />
      </g>
      <path d="M0 304 Q160 292 320 302 Q480 290 640 300 Q720 296 800 300 V360 H0 Z" fill="#041012" />
      <g className="a-drift" filter="url(#noir-mist)">
        <ellipse cx="240" cy="300" rx="220" ry="14" fill="#2b5552" opacity="0.35" />
        <ellipse cx="620" cy="306" rx="200" ry="12" fill="#2b5552" opacity="0.3" />
      </g>
    </g>
  );
}

/** Помещение: тёмные стены, тёплый свет из глубины. tone — цвет света */
function Room({ tone = 'amber', x = 400, y = 120 }: { tone?: Light; x?: number; y?: number }) {
  return (
    <g>
      <rect width="800" height="360" fill="#05060a" />
      <Glow x={x} y={y} r={360} light={tone} className="a-pulse" />
      <rect width="800" height="360" fill="#05060a" opacity="0.55" />
      <path d="M0 306 H800 V360 H0 Z" fill="#030305" />
      <path d="M0 306 H800" stroke="#b9cbe8" strokeOpacity="0.12" />
    </g>
  );
}

/** Дом-силуэт: стены, двускатная крыша, тёплые окна; над дверью — вывеска-тег */
function House({ x, w, h, label, base = 300, tower = false, light = WINDOW }: { x: number; w: number; h: number; label?: string; base?: number; tower?: boolean; light?: string }) {
  const top = base - h;
  const roof = tower ? P(x - 4, top, x + w / 2, top - w * 0.9, x + w + 4, top) : P(x - 8, top, x + w / 2, top - w * 0.42, x + w + 8, top);
  const windows = [
    [x + w * 0.22, top + h * 0.22],
    [x + w * 0.66, top + h * 0.22],
  ];
  return (
    <g>
      <Sil d={`${R(x, top, w, h)} ${roof}`} />
      <g fill={light} filter="url(#sil-glow)">
        {windows.map(([wx, wy], i) => (
          <rect key={i} className={i ? 'a-twinkle' : undefined} x={wx} y={wy} width={w * 0.12} height={h * 0.16} />
        ))}
      </g>
      <path d={`${R(x + w * 0.4, base - h * 0.32, w * 0.2, h * 0.32)}`} fill="#020203" />
      {label && (
        <Glyph x={x + w / 2} y={base - h * 0.42} size={Math.min(22, w * 0.22)} mono>
          {label}
        </Glyph>
      )}
    </g>
  );
}

/** Колба-силуэт: тёмное стекло, зелье светится. type — тип значения, null — пустая */
const FLASK_LIGHT: Record<string, { color: string; light: Light } | null> = {
  number: { color: '#7fb2ff', light: 'sapphire' },
  string: { color: '#5dffb0', light: 'emerald' },
  boolean: { color: '#ffd36b', light: 'topaz' },
  empty: null,
  array: { color: '#c9a2ff', light: 'amethyst' },
  function: { color: '#ff7bd0', light: 'ruby' },
};
const FLASK_TYPES = ['number', 'string', 'boolean', 'empty'];

function Flask({ x, y, s = 1, type }: { x: number; y: number; s?: number; type: string }) {
  const liquid = FLASK_LIGHT[type];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {liquid && <Glow x={24} y={42} r={30} light={liquid.light} />}
      <path d="M19 9 H29 V22 Q42 28 42 42 A18 18 0 0 1 6 42 Q6 28 19 22 Z" fill="rgba(9, 12, 19, 0.92)" stroke="#b9cbe8" strokeOpacity="0.45" strokeWidth="1" />
      {liquid && <path d="M8.4 37 Q24 32 39.6 37 A16.2 16.2 0 0 1 8.4 37 Z" fill={liquid.color} opacity="0.85" filter="url(#sil-glow)" />}
      <rect x="17" y="3" width="14" height="7" rx="1.5" fill="#2a1d12" />
    </g>
  );
}

/** Шестерня, которая медленно крутится */
function Gear({ x, y, r, teeth, reverse = false, fill = NIGHT }: { x: number; y: number; r: number; teeth: number; reverse?: boolean; fill?: string }) {
  return (
    <g filter="url(#noir-rim)">
      <path d={gear(x, y, r, teeth)} fill={fill} fillRule="evenodd" className={reverse ? 'a-spin a-reverse' : 'a-spin'} style={{ transformOrigin: `${x}px ${y}px` }} />
    </g>
  );
}

/** Фонарь на столбе: тёмная оправа, тёплое стекло */
function Lamp({ x, base = 300, h = 120 }: { x: number; base?: number; h?: number }) {
  const top = base - h;
  return (
    <g>
      <Sil d={`${R(x - 2, top, 4, h)} ${P(x - 12, top - 4, x, top - 14, x + 12, top - 4)} ${R(x - 11, top - 4, 22, 3)} ${R(x - 11, top + 22, 22, 3)}`} />
      <Glow x={x} y={top + 10} r={46} light="amber" className="a-pulse" />
      <rect x={x - 8} y={top - 1} width="16" height="23" fill="#ffcf7a" opacity="0.8" filter="url(#sil-glow)" />
    </g>
  );
}

/** Кристалл в кадре */
function Gem({ kind, x, y, s = 1, delay = 0, cursed = false }: { kind: GemKind; x: number; y: number; s?: number; delay?: number; cursed?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} filter={cursed ? 'url(#noir-cursed)' : undefined}>
      <g className={cursed ? undefined : 'a-float'} style={{ animationDelay: `${delay}s` }}>
        <NoirGem kind={kind} />
      </g>
    </g>
  );
}

/** Дверь <script>: арка, из которой льётся свет */
function ScriptDoor({ x, base = 300, open = true }: { x: number; base?: number; open?: boolean }) {
  const top = base - 110;
  return (
    <g>
      {open && <Glow x={x + 34} y={base - 50} r={140} light="cyan" className="a-pulse" />}
      <Sil d={`M${x - 10} ${base} V${top + 30} A44 44 0 0 1 ${x + 78} ${top + 30} V${base} Z`} />
      <path d={`M${x + 6} ${base} V${top + 34} A28 28 0 0 1 ${x + 62} ${top + 34} V${base} Z`} fill={open ? '#8ff0e0' : '#06090c'} opacity={open ? 0.85 : 1} filter={open ? 'url(#sil-glow)' : undefined} />
      {open && <path d={`M${x + 34} ${base} L${x - 80} ${base + 60} L${x + 150} ${base + 60} Z`} fill="#8ff0e0" opacity="0.12" filter="url(#noir-shaft)" />}
      <Glyph x={x + 34} y={top + 4} size={18} mono color={TEAL}>
        &lt;script&gt;
      </Glyph>
    </g>
  );
}

/** Окно-витраж: стрельчатая арка, стёкла светятся цветами */
const PANES = ['#b9a6ff', '#ff7b98', '#8fc0ff', '#5dffb0', '#c8f070', '#ffb36b'];

function StainedWindow({ x, y, empty = false }: { x: number; y: number; empty?: boolean }) {
  const w = 200;
  const h = 170;
  return (
    <g>
      <Sil d={`M${x - 14} ${y + h + 14} V${y + 40} A${w / 2 + 14} ${w / 2 + 14} 0 0 1 ${x + w + 14} ${y + 40} V${y + h + 14} Z`} />
      <path d={`M${x} ${y + h} V${y + 40} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + 40} V${y + h} Z`} fill="#03050b" />
      {!empty &&
        PANES.map((color, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return <rect key={i} x={x + 8 + col * 64} y={y + 46 + row * 60} width="56" height="54" fill={color} opacity="0.62" filter="url(#sil-glow)" />;
        })}
      {!empty && <path d={`M${x} ${y + 40} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + 40} Z`} fill="#b9a6ff" opacity="0.3" />}
    </g>
  );
}

/* ===== Сценки ===== */

type SceneProps = { mood?: 'laugh' | 'angry' };

const VILLAGE = (
  <>
    {NOIR_SKY}
    <House x={210} w={110} h={100} label="<p>" />
    <House x={345} w={120} h={150} label="<h1>" tower />
    <House x={490} w={110} h={96} label="<em>" />
  </>
);

const SCROLL = (
  <>
    <Room tone="amber" />
    <g>
      <path d="M220 70 H580 V290 H220 Z" fill="#1d1712" stroke="#b9cbe8" strokeOpacity="0.25" />
      <Sil d={`${R(200, 58, 400, 18)} ${R(200, 284, 400, 18)} ${C(200, 67, 9)} ${C(600, 67, 9)} ${C(200, 293, 9)} ${C(600, 293, 9)}`} />
      <Glyph x={400} y={118} size={30}>
        Указ старосты
      </Glyph>
      <g fill="#8a7a62" opacity="0.6">
        <rect x="260" y="150" width="280" height="4" />
        <rect x="260" y="176" width="240" height="4" />
        <rect x="260" y="228" width="260" height="4" />
      </g>
      <rect x="250" y="196" width="300" height="20" fill={AMBER} opacity="0.35" filter="url(#sil-glow)" className="a-pulse" />
    </g>
  </>
);

/** Ярмарка: прилавки под полосатыми навесами, гирлянда фонарей */
function Stall({ x, label, blue = false }: { x: number; label: string; blue?: boolean }) {
  const stripes = [0, 1, 2, 3, 4].map((i) => <path key={i} d={P(x + i * 24, 196, x + i * 24 + 12, 196, x + i * 24 + 6, 214)} fill="#4a141c" />);
  return (
    <g>
      <Sil d={`${R(x + 4, 214, 112, 86)} ${P(x - 6, 196, x + 60, 170, x + 126, 196)} ${R(x - 4, 196, 128, 6)}`} />
      {stripes}
      <Glyph x={x + 60} y={262} size={22} mono color={blue ? '#8fc0ff' : AMBER}>
        {label}
      </Glyph>
    </g>
  );
}

const FAIR = (
  <>
    {NOIR_SKY}
    <path d="M150 150 Q400 200 650 150" fill="none" stroke="#0a0b10" strokeWidth="1.6" />
    {[190, 250, 310, 370, 430, 490, 550, 610].map((x, i) => (
      <circle key={x} className={i % 2 ? 'a-twinkle' : undefined} cx={x} cy={150 + Math.sin(((x - 150) / 500) * Math.PI) * 25} r="3.4" fill={WINDOW} filter="url(#sil-glow)" />
    ))}
    <Stall x={190} label="<ul>" />
    <Stall x={340} label="<a>" blue />
    <Stall x={490} label="<img>" />
  </>
);

const CITY = (
  <>
    {NOIR_SKY}
    <House x={200} w={110} h={170} label="<header>" tower />
    <House x={330} w={170} h={120} label="<main>" />
    <House x={520} w={100} h={110} label="<aside>" />
  </>
);

const FORGE = (
  <>
    <Room tone="ember" x={400} y={300} />
    <House x={200} w={110} h={100} label="<label>" light="#ff9a5a" />
    <House x={340} w={130} h={150} label="<form>" light="#ff9a5a" tower />
    <House x={500} w={110} h={100} label="<button>" light="#ff9a5a" />
    {[
      [380, 120],
      [420, 90],
      [450, 140],
      [340, 100],
    ].map(([x, y], i) => (
      <circle key={i} className="a-rise" cx={x} cy={y + 140} r="1.6" fill="#ffb067" style={{ animationDelay: `${-i * 2.4}s` }} />
    ))}
  </>
);

/** Академия крупно: башни со шпилями, окна горят */
const ACADEMY = (
  <>
    {NOIR_SKY}
    <g>
      <Sil
        d={[
          R(250, 170, 300, 130),
          P(240, 170, 400, 120, 560, 170),
          `${R(280, 110, 50, 190)} ${P(272, 110, 305, 40, 338, 110)}`,
          `${R(470, 110, 50, 190)} ${P(462, 110, 495, 40, 528, 110)}`,
          `${R(375, 70, 50, 230)} ${P(366, 70, 400, -10, 434, 70)}`,
        ].join(' ')}
      />
      <g fill={WINDOW} filter="url(#sil-glow)">
        {[
          [298, 140],
          [298, 190],
          [488, 140],
          [488, 200],
          [393, 110],
          [393, 160],
          [340, 220],
          [440, 230],
        ].map(([x, y], i) => (
          <rect key={i} className={i % 3 ? undefined : 'a-twinkle'} x={x} y={y} width="14" height="20" />
        ))}
      </g>
      <path d={R(385, 250, 30, 50)} fill="#020203" />
    </g>
  </>
);

/** Хаос: Лорд Дефолт убегает за дверь <script>, вокруг летают обрывки кода */
const CHAOS_WORDS: [string, number, number, number][] = [
  ['<script>', 170, 80, -8],
  ['{ }', 290, 150, 6],
  ['=>', 230, 250, -4],
  ['onclick', 470, 60, 5],
  ['()', 380, 200, -10],
  ['let', 640, 150, 8],
];

function Chaos() {
  return (
    <>
      <ScriptSky />
      {CHAOS_WORDS.map(([word, x, y, rotate], i) => (
        <Glyph key={word} x={x} y={y} mono size={24} color={TEAL} rotate={rotate} className={i % 2 ? 'a-float' : 'a-twinkle'}>
          {word}
        </Glyph>
      ))}
      <ScriptDoor x={560} />
      <Rig rig={VILLAIN_RIG} kind="villain" move="run" rim="noir-rim" fill={NIGHT} x={360} y={110} width={150} height={210} viewBox="-30 -30 160 200" />
    </>
  );
}

const FOREST = (
  <>
    <rect width="800" height="360" fill="url(#noir-sky)" />
    <circle cx="610" cy="80" r="200" fill="url(#noir-halo)" />
    <circle cx="610" cy="80" r="34" fill="url(#noir-moon)" />
    <path d={[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => spruce(90 + i * 80, 300, 120 + (i % 3) * 30, 60, i + 3)).join(' ')} fill="#0b1712" />
    <g filter="url(#noir-mist)" className="a-drift">
      <ellipse cx="400" cy="280" rx="380" ry="20" fill="#3a5a52" opacity="0.4" />
    </g>
    <Sil d={`${spruce(200, 312, 220, 110, 2)} ${spruce(600, 312, 240, 120, 5)}`} />
    <Sil d={`${C(400, 150, 60)} ${C(350, 180, 40)} ${C(450, 180, 40)} ${R(388, 190, 24, 122)}`} />
    <path d="M0 312 H800 V360 H0 Z" fill="#030605" />
    {/* Светящиеся грибы и светлячки */}
    <g filter="url(#sil-glow)">
      <path d="M300 312 Q300 286 318 284 Q336 286 336 312 Z" fill="#ff5d6c" />
      <path d="M470 312 Q470 292 486 290 Q502 292 502 312 Z" fill="#ff9a3c" />
    </g>
    <g fill="#f4ecdf" opacity="0.8">
      <circle cx="310" cy="296" r="2.4" />
      <circle cx="324" cy="292" r="2" />
    </g>
    {[
      [260, 230],
      [420, 250],
      [540, 210],
      [360, 270],
      [620, 260],
    ].map(([x, y], i) => (
      <circle key={i} className="a-firefly" cx={x} cy={y} r="2" fill="#d6ff8a" filter="url(#sil-glow)" style={{ animationDelay: `${-i * 1.3}s` }} />
    ))}
  </>
);

/** Крепость: башни и донжон, окна горят, на шпиле — знамя */
function Castle({ cursed = false }: { cursed?: boolean }) {
  const merlons = (x1: number, x2: number, top: number) => {
    let d = '';
    for (let x = x1; x < x2; x += 16) d += R(x, top - 10, 8, 10) + ' ';
    return d;
  };
  return (
    <g filter={cursed ? 'url(#noir-cursed)' : undefined}>
      <Sil d={[R(230, 170, 80, 130), merlons(230, 310, 170), R(490, 170, 80, 130), merlons(490, 570, 170), R(320, 130, 160, 170), merlons(320, 480, 130), R(290, 230, 220, 70)].join(' ')} />
      <g fill={cursed ? '#8b95a8' : WINDOW} filter="url(#sil-glow)">
        {[
          [262, 200],
          [522, 200],
          [380, 160],
          [412, 160],
          [396, 210],
        ].map(([x, y], i) => (
          <rect key={i} className={i % 2 ? 'a-twinkle' : undefined} x={x} y={y} width="10" height="16" />
        ))}
      </g>
      <path d={`M400 300 V262 A18 18 0 0 1 ${436} 262 V300 Z`} transform="translate(-18 0)" fill="#020203" />
    </g>
  );
}

const FORTRESS = (
  <>
    {NOIR_SKY}
    <Castle />
    <Sil d={R(398, 70, 3, 60)} />
    <path className="a-drift" d="M401 72 Q420 66 440 74 Q458 82 470 76 L470 100 Q456 106 440 98 Q420 90 401 96 Z" fill="#4a141c" stroke="#d6a0a8" strokeOpacity="0.3" />
  </>
);

/** Дверь <script> приоткрыта, герой идёт к порогу по острову */
const GATE = (
  <>
    {NOIR_SKY}
    <g transform="translate(190 232)">{NOIR_ISLAND}</g>
    <ScriptDoor x={470} base={262} />
    <Rig rig={HERO_RIG} kind="hero" move="walk" rim="noir-rim" fill={NIGHT} x={300} y={146} width={90} height={120} viewBox="-20 -20 140 186" />
  </>
);

const CLOCKWORK = (
  <>
    <ScriptSky />
    <Gear x={260} y={170} r={90} teeth={16} />
    <Gear x={418} y={120} r={58} teeth={11} reverse />
    <Gear x={540} y={220} r={74} teeth={14} />
    {["let gems = 5;", "console.log('Привет!');", 'button.onclick = …'].map((line, i) => (
      <Glyph key={line} x={400} y={290 + (i - 1) * 26} mono size={18} color={TEAL} className={i === 1 ? 'a-pulse' : undefined}>
        {line}
      </Glyph>
    ))}
  </>
);

/** Свиток Оракула: тёмная плита с зелёными строками и полка колб */
const ORACLE = (
  <>
    <Room tone="cyan" y={80} />
    <rect x="200" y="50" width="400" height="130" fill="#050a0c" stroke={TEAL} strokeOpacity="0.4" />
    <g fontFamily={MONO} fontSize="20" fill="#5dff9b" filter="url(#sil-glow)">
      <text x="222" y="90">› Привет, Скриптория!</text>
      <text x="222" y="122">› 12</text>
      <text x="222" y="154">
        ›<tspan className="a-blink">_</tspan>
      </text>
    </g>
    <path d={R(200, 290, 400, 6)} fill="#1c140d" />
    {FLASK_TYPES.map((type, i) => (
      <Flask key={type} x={250 + i * 80} y={214} s={1.2} type={type} />
    ))}
  </>
);

/** Лавка Алхимика: вывеска, полки с колбами и котёл */
function Cauldron({ x, y = 300, s = 1 }: { x: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Glow x={0} y={-50} r={80} light="green" className="a-pulse" />
      <Sil d={`M-56 -60 Q-60 -10 -30 0 H30 Q60 -10 56 -60 Z ${R(-62, -66, 124, 8)}`} />
      <ellipse cx="0" cy="-62" rx="54" ry="5" fill="#7dff9a" opacity="0.85" filter="url(#sil-glow)" />
      {[
        [-20, -80],
        [10, -96],
        [24, -74],
      ].map(([bx, by], i) => (
        <circle key={i} className="a-rise" cx={bx} cy={by} r="3" fill="none" stroke="#b8ffcc" strokeOpacity="0.6" style={{ animationDelay: `${-i * 3}s` }} />
      ))}
    </g>
  );
}

const SHOP = (
  <>
    <Room tone="green" y={220} />
    <Glyph x={400} y={60} size={30}>
      Лавка Алхимика
    </Glyph>
    <path d={`${R(150, 150, 220, 5)} ${R(150, 250, 220, 5)}`} fill="#1c140d" />
    {FLASK_TYPES.map((type, i) => (
      <Flask key={type} x={156 + i * 52} y={90} s={1.1} type={type} />
    ))}
    {FLASK_TYPES.slice(0, 3).map((type, i) => (
      <Flask key={type} x={170 + i * 60} y={190} s={1.1} type={type} />
    ))}
    <Cauldron x={530} />
  </>
);

/** Шут NaN жонглирует колбами */
function Jester() {
  return (
    <>
      <Room tone="ruby" />
      <Glyph x={210} y={90} size={34} mono color="#ff7b98" rotate={-8} className="a-twinkle">
        NaN
      </Glyph>
      <Glyph x={600} y={110} size={22} mono color="#ff7b98" rotate={6}>
        &apos;5&apos; + &apos;3&apos; = &apos;53&apos;
      </Glyph>
      <Glyph x={620} y={250} size={30} mono color="#ff7b98" rotate={8} className="a-twinkle">
        NaN
      </Glyph>
      <Sil d={`M370 306 L380 220 Q400 200 420 220 L430 306 Z ${E(400, 196, 16, 18)} M384 186 Q360 150 340 160 Q362 168 386 192 Z M416 186 Q440 150 460 160 Q438 168 414 192 Z M396 180 L400 140 L404 180 Z M380 228 Q350 200 330 170 L336 166 Q356 196 386 222 Z M420 228 Q450 200 470 170 L464 166 Q444 196 414 222 Z`} />
      <g fill="#ffd36b" filter="url(#sil-glow)">
        <circle cx="340" cy="160" r="3" />
        <circle cx="460" cy="160" r="3" />
        <circle cx="400" cy="140" r="3" />
      </g>
      <Flask x={300} y={100} s={0.9} type="number" />
      <Flask x={376} y={50} s={0.9} type="string" />
      <Flask x={454} y={100} s={0.9} type="boolean" />
    </>
  );
}

const CAROUSEL_GEMS: GemKind[] = ['ruby', 'topaz', 'emerald', 'sapphire', 'amethyst', 'ruby'];

const CAROUSEL = (
  <>
    <Room tone="topaz" y={100} />
    <Sil d={`${P(260, 120, 400, 30, 540, 120)} ${R(394, 120, 12, 180)} ${E(400, 300, 170, 14)}`} />
    {[0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={P(260 + i * 56, 120, 288 + i * 56, 120, 400, 30)} fill="#4a141c" opacity="0.8" />
    ))}
    {CAROUSEL_GEMS.map((kind, i) => {
      const a = (i / CAROUSEL_GEMS.length) * Math.PI * 2;
      return <Gem key={i} kind={kind} x={400 + Math.cos(a) * 150 - 14} y={210 + Math.sin(a) * 34 - 30} s={0.7} delay={-i * 0.6} />;
    })}
    <Glyph x={600} y={330} mono size={18} color={AMBER}>
      for (let i = 0; i &lt; 3; i++)
    </Glyph>
  </>
);

/** Котёл Функций: котёл кипит, рецепт написан, по конвейеру едут флаконы */
const CONVEYOR = (
  <>
    <Room tone="green" y={200} />
    <Cauldron x={250} y={230} s={0.9} />
    <Glyph x={520} y={90} mono size={20} color={TEAL}>
      function brew(herb) {'{'} return … {'}'}
    </Glyph>
    <path d={R(80, 286, 640, 10)} fill="#1c1f27" />
    <path d="M80 286 H720" stroke="#b9cbe8" strokeOpacity="0.2" />
    <g className="a-drift">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Flask key={i} x={120 + i * 86} y={232} s={1} type={FLASK_TYPES[i % 3]} />
      ))}
    </g>
  </>
);

/** Призрак Андефайнд над пустыми флаконами */
const GHOST = (
  <>
    <Room tone="ice" />
    <Glyph x={200} y={100} mono size={24} color="#bfe3ff" opacity={0.7} rotate={-6}>
      undefined
    </Glyph>
    <Glyph x={610} y={140} mono size={24} color="#bfe3ff" opacity={0.7} rotate={5}>
      undefined
    </Glyph>
    <g className="a-float">
      <path d="M340 230 Q336 120 400 110 Q464 120 460 230 L444 214 L428 232 L412 214 L400 234 L388 214 L372 232 L356 214 Z" fill="#cfe0f5" opacity="0.22" filter="url(#sil-glow)" />
      <g fill="#05060a">
        <ellipse cx="382" cy="160" rx="8" ry="11" />
        <ellipse cx="418" cy="160" rx="8" ry="11" />
      </g>
    </g>
    {[0, 1, 2].map((i) => (
      <Flask key={i} x={300 + i * 80} y={240} s={1.1} type="empty" />
    ))}
  </>
);

/** Обоз: вагоны с грузом и номерами с нуля */
const TRAIN = (
  <>
    {NOIR_SKY}
    {['уголь', 'руда', 'мёд', 'кристаллы'].map((cargo, i) => (
      <g key={cargo}>
        <Sil d={`${R(140 + i * 140, 220, 120, 60)} ${C(165 + i * 140, 286, 12)} ${C(235 + i * 140, 286, 12)}`} />
        <Glyph x={200 + i * 140} y={252} size={20}>
          {cargo}
        </Glyph>
        <Glyph x={200 + i * 140} y={210} mono size={18} color={TEAL}>
          {String(i)}
        </Glyph>
      </g>
    ))}
    <path d="M80 298 H720" stroke="#b9cbe8" strokeOpacity="0.35" strokeWidth="2" />
  </>
);

/** Картотека: ящики до потолка и карточки на столе */
const ARCHIVE = (
  <>
    <Room tone="gold" />
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <Sil d={R(140 + (i % 4) * 130, 40 + Math.floor(i / 4) * 80, 120, 70)} />
          <rect x={192 + (i % 4) * 130} y={70 + Math.floor(i / 4) * 80} width="16" height="6" fill={AMBER} opacity="0.6" />
        </g>
      ))}
    </g>
    {[
      ["name: 'Мята'", 'price: 3'],
      ["name: 'Мёд'", 'stock: 0'],
      ["color: 'синий'", 'size: 2'],
    ].map((rows, i) => (
      <g key={i} transform={`rotate(${(i - 1) * 4} ${220 + i * 180} 260)`}>
        <rect x={150 + i * 180} y={220} width="150" height="70" fill="#1d1712" stroke={AMBER} strokeOpacity="0.4" />
        {rows.map((row, k) => (
          <text key={row} x={162 + i * 180} y={250 + k * 24} fontFamily={MONO} fontSize="15" fill="#e4dccd">
            {row}
          </text>
        ))}
      </g>
    ))}
  </>
);

/** Город Механизмов: башни с окнами и большие шестерни над крышами */
const MECH_CITY = (
  <>
    <ScriptSky />
    <Gear x={250} y={110} r={60} teeth={12} fill="#0b2224" />
    <Gear x={560} y={90} r={44} teeth={10} reverse fill="#0b2224" />
    {[3, 5, 4, 7, 3, 5, 4].map((floors, i) => {
      const x = 120 + i * 82;
      const h = floors * 26;
      return (
        <g key={i}>
          <Sil d={R(x, 300 - h, 64, h)} />
          {Array.from({ length: floors - 1 }, (_, k) => (
            <rect key={k} className={(i + k) % 3 ? undefined : 'a-twinkle'} x={x + 12 + (k % 2) * 28} y={300 - h + 12 + k * 26} width="10" height="12" fill={(i + k) % 2 ? WINDOW : '#5c4630'} filter="url(#sil-glow)" />
          ))}
        </g>
      );
    })}
  </>
);

const LAMPS = (
  <>
    <ScriptSky />
    <Glyph x={400} y={110} size={34} className="a-pulse">
      Мастерская открыта
    </Glyph>
    {[200, 320, 480, 600].map((x) => (
      <Lamp key={x} x={x} h={110} />
    ))}
    <Gear x={700} y={300} r={60} teeth={12} />
  </>
);

/** Цех Рычагов: ворота расходятся, на пульте — кнопки событий */
const LEVERS = (
  <>
    <Room tone="amber" y={160} />
    <rect x="250" y="60" width="300" height="180" fill="#ffd27a" opacity="0.25" filter="url(#noir-shaft)" />
    <Sil d={`${R(220, 60, 110, 180)} ${R(470, 60, 110, 180)}`} />
    <path d={`M330 60 V240 M470 60 V240`} stroke="#ffd27a" strokeOpacity="0.6" strokeWidth="2" filter="url(#sil-glow)" />
    <Sil d={`${R(250, 262, 300, 44)} ${R(520, 220, 6, 44)} ${C(523, 218, 7)}`} />
    {['click', 'input', 'submit'].map((name, i) => (
      <Glyph key={name} x={300 + i * 80} y={290} mono size={16} color={AMBER}>
        {name}
      </Glyph>
    ))}
  </>
);

/** Мастерская игр: автомат-кликер и автомат Сфинкса */
function Cabinet({ x, children }: { x: number; children: ReactNode }) {
  return (
    <g>
      <Sil d={`${R(x, 90, 150, 210)} ${P(x - 6, 90, x + 75, 70, x + 156, 90)}`} />
      <rect x={x + 18} y={110} width="114" height="90" fill="#06100c" stroke={TEAL} strokeOpacity="0.4" />
      {children}
      <g fill="#ff7b98" filter="url(#sil-glow)">
        <circle cx={x + 50} cy={240} r="7" />
        <circle cx={x + 100} cy={240} r="7" className="a-pulse" />
      </g>
    </g>
  );
}

const ARCADE = (
  <>
    <Room tone="cyan" />
    <Cabinet x={190}>
      <circle cx={265} cy={140} r="12" fill="#ffd36b" filter="url(#sil-glow)" className="a-float" />
      <Glyph x={265} y={182} mono size={15} color="#ffd36b">
        Монет: 99
      </Glyph>
    </Cabinet>
    <Cabinet x={460}>
      <Glyph x={535} y={158} size={44} color="#c9a2ff">
        ?
      </Glyph>
      <Glyph x={535} y={188} mono size={15} color={TEAL}>
        Больше!
      </Glyph>
    </Cabinet>
  </>
);

/** Логово Лорда Дефолта: страницы перезагружаются сами собой, у ворот — форма */
const LAIR = (
  <>
    <ScriptSky />
    <Sil d={`${R(470, 60, 120, 240)} ${P(460, 60, 530, 0, 600, 60)} ${R(440, 200, 180, 100)}`} />
    <rect x="520" y="100" width="14" height="22" fill="#8fc0ff" filter="url(#sil-glow)" className="a-twinkle" />
    {[
      [200, 90, 40],
      [320, 160, 30],
      [690, 120, 34],
    ].map(([x, y, size], i) => (
      <Glyph key={i} x={x} y={y} size={size} mono color="#8fc0ff" className="a-pulse" opacity={0.7}>
        ↻
      </Glyph>
    ))}
    <rect x="160" y="230" width="190" height="34" fill="#050a0c" stroke={TEAL} strokeOpacity="0.4" />
    <text x="176" y="253" fontFamily={MONO} fontSize="16" fill="#6b8a86" fontStyle="italic">
      письмо…
    </text>
    <rect x="360" y="230" width="100" height="34" fill="#2e1f0c" stroke={AMBER} strokeOpacity="0.6" />
    <Glyph x={410} y={253} mono size={15}>
      Отправить
    </Glyph>
  </>
);

/** Руны Скриптории: четыре знака её земель загораются по очереди */
const RUNE_SIGNS = [
  // колба — Врата
  'M-6 -20 H6 V-8 Q16 -2 16 8 A16 16 0 0 1 -16 8 Q-16 -2 -6 -8 Z',
  // лабиринт — Решения
  'M-18 -18 H18 V18 H-18 Z M-10 -10 H10 V10 H-4 M-18 0 H-10',
  // котёл — Рецепты
  'M-18 -4 Q-18 18 0 18 Q18 18 18 -4 Z M-22 -8 H22 M-6 -14 Q-8 -20 -4 -24 M4 -14 Q2 -20 6 -24',
  // шестерня — Механизмы
  gear(0, 0, 18, 8),
];

const RUNES = (
  <>
    <ScriptSky />
    {RUNE_SIGNS.map((sign, i) => (
      <g key={i} transform={`translate(${200 + i * 133} 180)`}>
        <Sil d={`${C(0, 0, 48)}`} />
        <path d={sign} fill="none" stroke={TEAL} strokeWidth="2.4" strokeLinejoin="round" filter="url(#sil-glow)" className="a-pulse" style={{ animationDelay: `${i * 1.2}s` }} />
      </g>
    ))}
  </>
);

/** Два мира: остров Каскадии с кристаллами и открытая дверь в Скрипторию с шестернями */
const WORLDS = (
  <>
    {NOIR_SKY}
    <rect x="400" width="400" height="360" fill="url(#noir-sky-script)" opacity="0.7" />
    <g transform="translate(100 232) scale(0.7)">{NOIR_ISLAND}</g>
    {(['amethyst', 'emerald', 'ruby'] as GemKind[]).map((kind, i) => (
      <Gem key={kind} kind={kind} x={180 + i * 44} y={140} delay={i * -0.7} />
    ))}
    <ScriptDoor x={470} base={262} />
    <Gear x={640} y={140} r={50} teeth={11} fill="#0b2224" />
    <Gear x={700} y={220} r={36} teeth={9} reverse fill="#0b2224" />
  </>
);

/** Цитадель Лорда Дефолта: серые стены, огни погашены */
const CITADEL = (
  <>
    {NOIR_SKY}
    <Castle cursed />
  </>
);

/** Окно витражей целиком: стёкла светятся, цветной свет падает на пол */
const WINDOW_ART = (
  <>
    <Room tone="amethyst" y={160} />
    <StainedWindow x={300} y={92} />
    <path d="M310 262 L230 360 H570 L490 262 Z" fill="#b9a6ff" opacity="0.12" filter="url(#noir-shaft)" />
  </>
);

/** Стёкла выпали из рам и лежат внизу, потухшие */
const SHARDS = (
  <>
    <Room tone="ice" y={160} />
    <StainedWindow x={300} y={92} empty />
    <g filter="url(#noir-cursed)">
      {PANES.map((color, i) => (
        <rect key={i} x={240 + i * 56} y={262 + (i % 2) * 10} width="44" height="30" fill={color} opacity="0.55" transform={`rotate(${(i % 3) * 8 - 8} ${262 + i * 56} 277)`} />
      ))}
    </g>
  </>
);

/** Зеркала: узкое — кристаллы друг под другом, широкое — в ряд */
const MIRRORS = (
  <>
    {NOIR_SKY}
    <rect x="170" y="40" width="130" height="250" fill="rgba(185, 203, 232, 0.05)" stroke="#b9cbe8" strokeOpacity="0.5" />
    <rect x="360" y="90" width="280" height="160" fill="rgba(185, 203, 232, 0.05)" stroke="#b9cbe8" strokeOpacity="0.5" />
    {(['amethyst', 'emerald', 'ruby'] as GemKind[]).map((kind, i) => (
      <g key={kind}>
        <Gem kind={kind} x={222} y={58 + i * 74} s={0.8} delay={i * -0.6} />
        <Gem kind={kind} x={414 + i * 74} y={130} s={0.8} delay={i * -0.6} />
      </g>
    ))}
  </>
);

/** Сценки, которые рисует этот файл: имя — как в StoryFrame.art */
const SCENES: Record<string, (props: SceneProps) => ReactNode> = {
  village: () => VILLAGE,
  scroll: () => SCROLL,
  fair: () => FAIR,
  city: () => CITY,
  forge: () => FORGE,
  academy: () => ACADEMY,
  chaos: () => <Chaos />,
  forest: () => FOREST,
  fortress: () => FORTRESS,
  gate: () => GATE,
  clockwork: () => CLOCKWORK,
  oracle: () => ORACLE,
  shop: () => SHOP,
  jester: () => <Jester />,
  carousel: () => CAROUSEL,
  conveyor: () => CONVEYOR,
  ghost: () => GHOST,
  train: () => TRAIN,
  archive: () => ARCHIVE,
  'mech-city': () => MECH_CITY,
  lamps: () => LAMPS,
  levers: () => LEVERS,
  arcade: () => ARCADE,
  lair: () => LAIR,
  runes: () => RUNES,
  worlds: () => WORLDS,
  citadel: () => CITADEL,
  window: () => WINDOW_ART,
  shards: () => SHARDS,
  mirrors: () => MIRRORS,
};

/** Сценка «Сумрака» по имени кадра; у пролога островов и Лорда Дефолта своя отрисовка — в NoirStoryArt */
export function NoirStoryScene({ art, mood }: { art: string; mood?: 'laugh' | 'angry' }) {
  const scene = SCENES[art];
  return scene ? <>{scene({ mood })}</> : null;
}
