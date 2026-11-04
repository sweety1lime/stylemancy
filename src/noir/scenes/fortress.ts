import { C, E, P, R } from '../shapes';
import { bustSvg } from './bust';
import { motifUrl } from './motifs';
import { bricksSvg, EMBER_DUST, farPlane, FILM_CSS, MIST_SVG, nightSky, SHAFTS_SVG, silSvg, svgUrl, type SilFrame } from './kit';

/*
  Крепость Блоков в «Сумраке»: тёмный камень, тёплый свет факелов и холодная луна сверху.
  Часовые, шпион, флаги и фонари — силуэты с кромкой света; горит только огонь, золото и магия.
  Размеры коробок не трогаем: блочную модель студента проверяют по ним.
*/

/** Часовой: шлем-шапель, копьё, круглый щит. b — вдох: верх тела чуть опускается */
function guard(b: number): SilFrame {
  const y = (v: number) => v + b;
  return {
    dark: [
      'M19 46 L18 63 H22.5 L24 51 L25.5 63 H30 L29 46 Z',
      `M16 ${y(27)} Q24 ${y(23)} 32 ${y(27)} L33 48 L15 48 Z`,
      E(16.5, y(28), 3.6, 2.6),
      E(31.5, y(28), 3.6, 2.6),
      E(24, y(19), 3.8, 4.6),
      `M19.4 ${y(17)} Q19.4 ${y(9.6)} 24 ${y(9)} Q28.6 ${y(9.6)} 28.6 ${y(17)} Z`,
      `M16.6 ${y(16.6)} Q24 ${y(13.6)} 31.4 ${y(16.6)} L31.4 ${y(18)} Q24 ${y(15.4)} 16.6 ${y(18)} Z`,
      `M30.5 ${y(27)} Q35 ${y(29)} 36.6 ${y(35)} L34.4 ${y(35.8)} Q32.6 ${y(31)} 29.6 ${y(29.6)} Z`,
      C(36.2, y(35.4), 2.2),
      R(35.5, y(6), 1.4, 57 - b),
      P(36.2, y(0.6), 38.4, y(5.4), 36.2, y(8.4), 34, y(5.4)),
      C(13.5, y(36), 7.6),
    ].join(' '),
    lit: `<path d="${C(13.5, y(36), 1.4)}" fill="#e8c48a" opacity="0.8"/><path d="${P(36.2, y(1.8), 37.2, y(5.4), 36.2, y(7))}" fill="#dfe8f5" opacity="0.7"/>`,
  };
}

/** Шпион Лорда Дефолта: капюшон, плащ до земли, холодные глаза и кинжал */
function spy(b: number): SilFrame {
  const y = (v: number) => v + b;
  return {
    dark: [
      `M24 ${y(13)} Q31 ${y(14)} 33 ${y(28)} Q36 46 38 63 H10 Q12 46 15 ${y(28)} Q17 ${y(14)} 24 ${y(13)} Z`,
      `M16.6 ${y(24)} Q15.4 ${y(10)} 24 ${y(6)} Q32.6 ${y(10)} 31.4 ${y(24)} Q28 ${y(18)} 24 ${y(18)} Q20 ${y(18)} 16.6 ${y(24)} Z`,
      C(31, y(40.5), 1.9),
    ].join(' '),
    lit: `<path d="${E(22, y(20.4), 0.9, 0.6)} ${E(26, y(20.4), 0.9, 0.6)}" fill="#8fc0ff"/><path d="${P(31.6, y(39.4), 32.6, y(38.8), 38, y(45.2), 37, y(46))}" fill="#cfe0ff" opacity="0.75"/>`,
  };
}

const GUARD_SHEET = silSvg(48, 64, [guard(0), guard(0.8)]);
const SPY_SHEET = silSvg(48, 64, [spy(0), spy(0.8)]);

/** Каплевидный щит: тёмная сталь, крест и умбон с лунным бликом */
const SHIELD_SVG = silSvg(64, 80, {
  dark: 'M32 2 Q50 4 60 10 Q61 50 32 78 Q3 50 4 10 Q14 4 32 2 Z',
  detail: `<path d="M32 7 Q47 9 55 13.6 Q55.6 48 32 71 Q8.4 48 9 13.6 Q17 9 32 7 Z" fill="#0e1220" stroke="#3c4a66" stroke-width="1.4"/><path d="${R(30.6, 9, 2.8, 60)} ${R(11, 27.6, 42, 2.8)}" fill="#26314c"/>`,
  lit: `<path d="${C(32, 29, 3.2)}" fill="#9fb4d8"/><path d="${C(31, 28, 1)}" fill="#ffffff"/>`,
});

/** Меч: сталь ловит луну — светлая полоса вдоль клинка; гарда, рукоять и навершие тёмные */
const SWORD_SVG = silSvg(
  128,
  24,
  {
    under: `<path d="${P(29, 8.6, 116, 9.2, 125.5, 12, 116, 14.8, 29, 15.4)}" fill="url(#bl)"/><path d="${R(34, 11.5, 72, 1)}" fill="#2a3246" opacity="0.7"/>`,
    dark: `${R(25, 3, 5, 18)} ${R(10, 9.4, 15.5, 5.2)} ${C(7, 12, 4)}`,
    lit: `<path d="M113 12 L114 8.6 L115 12 L118.4 13 L115 14 L114 17.4 L113 14 L109.6 13 Z" fill="#ffffff" opacity="0.85"/>`,
  },
  {
    extraDefs: `<linearGradient id="bl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a9bb8"/><stop offset="0.42" stop-color="#e6eef9"/><stop offset="0.58" stop-color="#55627c"/><stop offset="1" stop-color="#232a3c"/></linearGradient>`,
  },
);

/** Знамя на древке: тёмно-красное полотно колышется в три кадра, золотой знак едва тлеет */
function flag(k: number): SilFrame {
  const cloth = `M5.4 6 Q16 ${3 + k * 1.5} 26 6 Q36 ${9 - k * 1.5} 46 ${5 + k} L46 ${24 + k} Q36 ${28 - k * 1.5} 26 25 Q16 ${22 + k * 1.5} 5.4 25 Z`;
  return {
    dark: `${R(3, 2, 2.4, 46)} ${C(4.2, 2.6, 1.8)}`,
    detail: `<path d="${cloth}" fill="#4a141c" stroke="#d6a0a8" stroke-opacity="0.3" stroke-width="0.8"/>`,
    lit: `<path d="${C(24, 15.4 + k * 0.3, 2.6)}" fill="none" stroke="#e8c48a" stroke-width="1" opacity="0.6"/>`,
  };
}

const FLAG_SHEET = silSvg(48, 48, [flag(0), flag(1), flag(2)]);

/** Фонарь: тёмная оправа, тёплое стекло, пламя дрожит в два кадра */
function lantern(k: number): SilFrame {
  return {
    under: `<circle cx="16" cy="24" r="16" fill="url(#lg)" opacity="${k ? 0.75 : 1}"/><path d="${R(9.5, 12, 13, 24)}" fill="#ffcf7a" opacity="${k ? 0.42 : 0.55}"/>`,
    dark: [P(8, 10.5, 16, 4.4, 24, 10.5), R(8, 10, 16, 2.2), R(8, 35.6, 16, 3), R(7.5, 10, 2, 28), R(22.5, 10, 2, 28), R(10, 38.6, 12, 5), `${C(16, 3, 2)}`].join(' '),
    lit: `<path d="${k ? E(16, 25.6, 2, 3.8) : E(16, 25, 2.2, 4.4)}" fill="#fff1c4"/>`,
  };
}

const LANTERN_GLOW = `<radialGradient id="lg"><stop offset="0" stop-color="#ffb35c" stop-opacity="0.6"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>`;

const LANTERN_SHEET = silSvg(32, 48, [lantern(0), lantern(1)], { extraDefs: LANTERN_GLOW });

/** Фонарь одним кадром — для страниц Города Механизмов */
export const LANTERN_SVG = silSvg(32, 48, lantern(0), { extraDefs: LANTERN_GLOW });

/** Камень крепости: тёмная кладка с тёплыми кромками от факелов */
const STONE = svgUrl(bricksSvg(48, 24, '#1b1819', '#0a090b', '#352d30'));

/** Свет факелов по бокам и холодный сверху — для стен вокруг Казарм и Плаца */
const TORCHES =
  'radial-gradient(ellipse 30% 45% at 4% 55%, rgba(255, 154, 90, 0.2), transparent), radial-gradient(ellipse 30% 45% at 96% 55%, rgba(255, 154, 90, 0.2), transparent), linear-gradient(180deg, rgba(185, 203, 232, 0.07), transparent 45%)';

/** Рама сцены: тёмное железо и тонкая золотая полоса — вместо пиксельной трёхцветной рамки */
const FRAME = '0 0 0 4px #050406, 0 0 0 5px rgba(232, 196, 138, 0.32), 0 0 0 12px #050406';

/** Общее для районов Крепости: часовые и шпион, тёплые пылинки, плёнка */
const COMMON = `
${FILM_CSS}
.guard,
.soldier {
  --sprite: ${svgUrl(GUARD_SHEET)};
}

.spy {
  --sprite: ${svgUrl(SPY_SHEET)};
}
`;

/** Пылинки в свете факелов: те же, что в пиксельном виде, только тёплые и тише */
const DUST = `
body::after {
  background-image: ${EMBER_DUST};
}
`;

const WALL = `
html {
  background: none;
}

body {
  background: ${STONE} 0 0 / 48px 24px repeat, #0a090b;
}

/* Свет факелов — свой план: за мышью он чуть смещается по камню, и стена обретает глубину */
${farPlane(TORCHES)}`;

const BARRACKS = `${COMMON}${WALL}${DUST}
.barracks {
  background-color: #150f0b;
  background-image:
    radial-gradient(ellipse 60% 70% at 72% -10%, rgba(185, 203, 232, 0.12), transparent),
    radial-gradient(ellipse 40% 60% at 0% 60%, rgba(255, 154, 90, 0.12), transparent),
    repeating-linear-gradient(180deg, #1c140e 0 22px, #0a0705 22px 24px);
  box-shadow: ${FRAME};
}

.crate {
  background-color: #3a2717;
  background-image:
    linear-gradient(45deg, transparent calc(50% - 4px), #110b07 calc(50% - 4px) calc(50% + 4px), transparent calc(50% + 4px)),
    repeating-linear-gradient(180deg, transparent 0 14px, rgba(0, 0, 0, 0.35) 14px 16px);
  box-shadow:
    inset 0 0 0 4px #0f0a06,
    inset 0 0 0 5px rgba(232, 180, 120, 0.28);
}

.stand {
  background-color: #1f1835;
  background-image: radial-gradient(circle, rgba(170, 150, 230, 0.4) 0 1.5px, transparent 2px);
  box-shadow: inset 0 0 0 3px #0b0817;
}

.shield {
  background-image: ${svgUrl(SHIELD_SVG)};
}

.rack {
  background-color: #20160e;
  background-image: repeating-linear-gradient(90deg, transparent 0 14px, rgba(0, 0, 0, 0.35) 14px 16px);
  box-shadow: inset 0 0 0 3px #0c0806;
}

.sword {
  background-image: ${svgUrl(SWORD_SVG)};
}

.portrait {
  color: #3a3f4c;
  background: ${svgUrl(bustSvg('absolute'))} center 100% / 72px 72px no-repeat, radial-gradient(ellipse at 50% 30%, #1c2438, #07090f);
}

.gate {
  background-color: #1a120b;
  background-image:
    linear-gradient(0deg, rgba(255, 170, 90, 0.28), transparent 14%),
    linear-gradient(180deg, transparent 0 30%, #2b3140 30% 36%, transparent 36% 70%, #2b3140 70% 76%, transparent 76%),
    repeating-linear-gradient(90deg, #1e150d 0 18px, #0b0705 18px 20px);
  box-shadow:
    inset 0 0 0 6px #22262f,
    inset 0 1px 0 6px rgba(185, 203, 232, 0.12);
}

.chest {
  background-color: #2a1c0e;
  background-image:
    radial-gradient(circle at 50% 55%, #f0c890 0 5px, #ffb35c 5px 7px, #241707 7px 10px, transparent 10px),
    radial-gradient(circle at 50% 55%, rgba(255, 179, 92, 0.35), transparent 30%),
    linear-gradient(180deg, transparent 0 32%, #120c05 32% 38%, transparent 38%);
}

.board {
  background-color: #23170d;
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.35) 0 1px, transparent 1.5px);
}

.order {
  background-color: #c9bd9e;
  background-image: repeating-linear-gradient(180deg, transparent 0 9px, #978a6b 9px 11px);
  box-shadow: inset 0 0 0 4px #c9bd9e;
}
`;

const PARADE = `${COMMON}${WALL}${DUST}
.parade {
  background-color: #191c23;
  background-image:
    radial-gradient(ellipse 70% 80% at 80% -20%, rgba(185, 203, 232, 0.14), transparent),
    linear-gradient(90deg, rgba(0, 0, 0, 0.5) 2px, transparent 2px),
    linear-gradient(180deg, rgba(0, 0, 0, 0.5) 2px, transparent 2px);
  background-size: auto, 32px 32px, 32px 32px;
  box-shadow: ${FRAME};
}

.soldier {
  color: #e4dccd;
  text-shadow: 0 1px 0 #000;
}

.banner {
  color: #e4dccd;
  background-color: var(--banner, #4a141c);
  box-shadow:
    inset 0 -6px 0 rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.north {
  --banner: #172a55;
}

.south {
  --banner: #4a141c;
}

.west {
  --banner: #133526;
}

.decree {
  background: #1d1812;
  box-shadow:
    inset 0 0 0 4px #4a3d2a,
    inset 0 0 0 5px rgba(232, 196, 138, 0.3),
    0 4px 0 #050406;
}

.word {
  color: #f0c890;
  background: #4a2f17;
  box-shadow:
    inset 0 -3px 0 #24160a,
    inset 0 1px 0 rgba(240, 200, 144, 0.3);
}
`;

/** Стена крепости на горизонте: зубцы, башенки и редкие тёплые окна. Плитка 800 × 120 */
const RAMPART_SVG = (() => {
  let d = 'M0 120 V78';
  for (let x = 0; x < 800; x += 20) d += ` H${x + 10} V70 H${x + 20} V78`;
  d += ' V120 Z';
  const towers = [
    [90, 46, 26],
    [330, 36, 30],
    [610, 50, 24],
  ]
    .map(([x, top, w]) => `M${x} 120 V${top} h${w / 4} v-6 h${w / 4} v6 h${w / 4} v-6 h${w / 4} v6 V120 Z`)
    .join(' ');
  const windows = [
    [100, 62],
    [344, 52],
    [348, 74],
    [620, 66],
    [480, 92],
  ]
    .map(([x, y]) => `<rect x="${x}" y="${y}" width="3" height="5" fill="#ffb35c"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 120"><defs><filter id="g"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<path d="${d} ${towers}" fill="#07080d" stroke="#3a4560" stroke-width="0.8"/><g filter="url(#g)">${windows}</g></svg>`;
})();

const WATCHTOWER = `${COMMON}
html {
  background: none;
}

body {
  --bricks: ${STONE};
  background: ${nightSky('linear-gradient(180deg, #010207 0%, #060a16 36%, #121a30 66%, #2a2234 100%)')};
}

/* Стена крепости на горизонте — дальний план */
${farPlane(`${svgUrl(RAMPART_SVG)} center bottom 24px / 800px 120px repeat-x`)}

/* Звёзды мерцали пиксельными искрами — здесь туман у стены и лучи луны */
body::before {
  background: ${svgUrl(MIST_SVG)} center bottom 20px / auto 100px no-repeat;
  animation: noir-mist 24s ease-in-out infinite alternate;
}

body::after {
  background: ${svgUrl(SHAFTS_SVG)} right top / 560px 340px no-repeat;
  animation: noir-shafts 12s ease-in-out infinite alternate;
}

@keyframes noir-mist {
  from {
    transform: translateX(-24px);
    opacity: 1;
  }

  to {
    transform: translateX(24px);
    opacity: 1;
  }
}

@keyframes noir-shafts {
  from {
    opacity: 0.45;
  }

  to {
    opacity: 1;
  }
}

/* Башня — силуэт: зубцы на фоне неба, горящее окно, тёмная дверь, кладка в темноте */
.tower {
  background:
    repeating-linear-gradient(90deg, #070a14 0 8px, #121216 8px 32px, #070a14 32px 40px) 0 0 / 100% 16px no-repeat,
    linear-gradient(rgba(185, 203, 232, 0.4), rgba(185, 203, 232, 0.4)) 0 16px / 100% 1px no-repeat,
    radial-gradient(circle at 50% 100%, #ffc27a 0 12px, transparent 12.5px) 50% 44px / 24px 12px no-repeat,
    linear-gradient(#ffc27a, #e0782e) 50% 56px / 24px 32px no-repeat,
    radial-gradient(circle at 50% 66px, rgba(255, 179, 92, 0.3), transparent 46px),
    radial-gradient(circle at 50% 100%, #040306 0 20px, transparent 20.5px) 50% calc(100% - 36px) / 40px 20px no-repeat,
    linear-gradient(#040306, #040306) 50% 100% / 40px 36px no-repeat,
    linear-gradient(90deg, rgba(185, 203, 232, 0.1), transparent 30%),
    ${STONE} 0 20px / 48px 24px repeat,
    #121216;
}

.flag {
  --flag: ${svgUrl(FLAG_SHEET)};
  animation-duration: 1.5s;
}

.lantern {
  --lantern: ${svgUrl(LANTERN_SHEET)};
}
`;

/** Луна-предмет из уровня pos-06: яркий диск с морями и ореолом */
const MOON_ITEM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-16 -16 96 96"><defs>
<radialGradient id="h"><stop offset="0.3" stop-color="#dfe8f5" stop-opacity="0.45"/><stop offset="1" stop-color="#dfe8f5" stop-opacity="0"/></radialGradient>
<radialGradient id="m" cx="0.4" cy="0.38" r="0.65"><stop offset="0" stop-color="#f4f7fb"/><stop offset="0.7" stop-color="#cfd8e6"/><stop offset="1" stop-color="#aab6c9"/></radialGradient>
<filter id="f"><feGaussianBlur stdDeviation="1.6"/></filter></defs>
<circle cx="32" cy="32" r="48" fill="url(#h)"/><circle cx="32" cy="32" r="26" fill="url(#m)"/>
<g fill="#8e9bb2" opacity="0.35" filter="url(#f)"><ellipse cx="25" cy="24" rx="8" ry="6"/><ellipse cx="40" cy="20" rx="5" ry="4"/><ellipse cx="35" cy="36" rx="6" ry="4"/></g></svg>`;

/** Отдельные уровни Дозорной башни: у них своя разметка поверх района */
const LEVEL_CSS: Record<string, string> = {
  // Стена с часовыми: зубчатый парапет в темноте, кромка — лунная
  'pos-01': `
.wall {
  background:
    linear-gradient(rgba(185, 203, 232, 0.4), rgba(185, 203, 232, 0.4)) 276px 136px / 48px 1px no-repeat,
    linear-gradient(#121216, #121216) 276px 136px / 48px 32px no-repeat,
    linear-gradient(rgba(185, 203, 232, 0.4), rgba(185, 203, 232, 0.4)) 0 168px / 100% 1px no-repeat,
    var(--bricks) 0 100% / 48px 24px repeat-x,
    var(--bricks) 0 calc(100% - 24px) / 48px 24px repeat-x,
    var(--bricks) 0 calc(100% - 48px) / 48px 24px repeat-x;
}
`,
  // Зал башни: знамёна в темноте, знаки на них тлеют золотом
  'pos-04': `
.hall {
  background:
    linear-gradient(rgba(185, 203, 232, 0.3), rgba(185, 203, 232, 0.3)) 0 calc(100% - 8px) / 100% 1px no-repeat,
    radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255, 179, 92, 0.12), transparent),
    linear-gradient(rgba(5, 4, 8, 0.5), rgba(5, 4, 8, 0.5)),
    var(--bricks) 0 0 / 48px 24px repeat;
  box-shadow: 0 0 0 4px #050406, 0 0 0 5px rgba(232, 196, 138, 0.3);
}

.royal {
  --motif: ${motifUrl('crown', '#f0c890')};
  --banner: linear-gradient(180deg, #2c1a4d, #1b1030);
}

.west {
  --motif: ${motifUrl('tree', '#a6e8c8')};
  --banner: linear-gradient(180deg, #123526, #0a1f16);
}

.east {
  --motif: ${motifUrl('star', '#b9cbe8')};
  --banner: linear-gradient(180deg, #172a55, #0d1a36);
}
`,
  // Лестница башни: тёмные ступени, фонарь светит сверху
  'pos-05': `
body {
  background: var(--bricks) 0 0 / 48px 24px repeat, #0a090b;
}

/* Внутри башни вместо стены на горизонте — свет факелов */
html::before {
  background: ${TORCHES};
}

/* Внутри башни нет неба: ни тумана, ни лучей луны */
body::before,
body::after {
  background: none;
}

.stairs {
  background: #0b0a0e;
  box-shadow: 0 0 0 4px #050406, 0 0 0 5px rgba(232, 196, 138, 0.3), 0 0 0 8px #050406;
  scrollbar-color: #4a3d2a #0b0a0e;
}

.floor {
  color: #e4dccd;
  background:
    repeating-linear-gradient(135deg, transparent 0 22px, rgba(0, 0, 0, 0.45) 22px 24px),
    linear-gradient(135deg, #24201f 0 50%, #191617 50%);
  box-shadow:
    inset 0 0 0 4px #0d0b0c,
    inset 0 1px 0 4px rgba(185, 203, 232, 0.1);
}
`,
  // Вершина башни: луна — предмет уровня, на небе её больше нет
  'pos-06': `
body {
  background: ${nightSky('linear-gradient(180deg, #010207 0%, #060a16 36%, #121a30 66%, #2a2234 100%)', false)};
}

body::after {
  background: none;
}

.tower {
  background:
    repeating-linear-gradient(90deg, #070a14 0 8px, #121216 8px 32px, #070a14 32px 40px) 0 0 / 100% 16px no-repeat,
    linear-gradient(rgba(185, 203, 232, 0.4), rgba(185, 203, 232, 0.4)) 0 16px / 100% 1px no-repeat,
    radial-gradient(circle at 50% 100%, #040306 0 24px, transparent 24.5px) 50% 16px / 48px 24px no-repeat,
    linear-gradient(#040306, #040306) 50% 40px / 48px 40px no-repeat,
    linear-gradient(90deg, rgba(185, 203, 232, 0.1), transparent 30%),
    var(--bricks) 0 20px / 48px 24px repeat,
    #121216;
}

.moon {
  background: ${svgUrl(MOON_ITEM_SVG)} center / 150% 150% no-repeat;
}
`,
};

export const FORTRESS_LEVELS = LEVEL_CSS;

export const FORTRESS_SCENES: Record<string, string> = {
  barracks: BARRACKS,
  'parade-ground': PARADE,
  watchtower: WATCHTOWER,
};
