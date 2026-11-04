import { spruce } from '../geometry';
import { random } from '../random';
import { C, E, P, R } from '../shapes';
import { farPlane, FILM_CSS, NIGHT, RIM, silSvg, svgUrl } from './kit';

/*
  Лес Селекторов в «Сумраке»: ельник в лунном тумане. Цвет предмета по-прежнему задаёт код студента —
  в «Сумраке» это его свет: шляпки грибов, брюшко светлячка, лепестки и стекло фонаря горят цветом color,
  а всё остальное — тёмный силуэт с лунной кромкой. Погасший серым лес едва тлеет.
  Маска заливки (--fill) и рисунок поверх (--details) — в одной рамке, как у пиксельных спрайтов.
*/

const SVG = (w: number, h: number, body: string, defs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${defs}${body}</svg>`;

/** Маска заливки: что красит color */
const mask = (w: number, h: number, d: string) => svgUrl(SVG(w, h, `<path d="${d}" fill="#000"/>`));

/** Тень снизу и холодный блик сверху справа поверх цветной части */
const SHADE = `<linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></linearGradient>`;

/** Рисунок поверх заливки: тень по цветной части, тёмные детали с кромкой, блики */
function details(w: number, h: number, colored: string, dark: string, extra = ''): string {
  return silSvg(w, h, {
    under: `<path d="${colored}" fill="url(#sh)"/>`,
    dark,
    lit: extra,
  }, { extraDefs: SHADE, rim: 0.6 });
}

const BOLETUS_CAP = 'M4 25 Q4 8 20 6 Q36 8 36 25 Q28 28 20 28 Q12 28 4 25 Z';
const BOLETUS = {
  fill: mask(40, 48, BOLETUS_CAP),
  details: details(
    40,
    48,
    BOLETUS_CAP,
    `M15.6 27 Q14.6 37 13.4 46 Q20 48 26.6 46 Q25.4 37 24.4 27 Z M6 25.6 Q20 31 34 25.6 Q33 28 20 29.6 Q7 28 6 25.6 Z`,
    `<path d="M23 8.6 Q32 10 34.4 18.6" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="1.2" stroke-linecap="round"/>`,
  ),
};

const AMANITA_CAP = 'M3 27 Q3 10 20 7 Q37 10 37 27 Q20 30 3 27 Z';
const AMANITA = {
  fill: mask(40, 48, AMANITA_CAP),
  details: details(
    40,
    48,
    AMANITA_CAP,
    `M15 28 Q14 38 13 44 Q11 47 14 47.6 H26 Q29 47 27 44 Q26 38 25 28 Z M12.6 34 Q20 37 27.4 34 L27.6 36.4 Q20 39 12.4 36.4 Z`,
    `<g fill="#f4ecdf" opacity="0.8"><circle cx="12" cy="17" r="2.2"/><circle cx="21" cy="12" r="2.4"/><circle cx="29" cy="18" r="2"/><circle cx="18" cy="22" r="1.6"/><circle cx="31" cy="24" r="1.3"/><circle cx="8" cy="23" r="1.3"/></g>`,
  ),
};

/** Светлячок: брюшко горит, крылья — в два кадра; маска брюшка общая */
const FIREFLY_BELLY = E(16, 21.5, 5, 6.5);
const fireflyFrame = (up: boolean) => ({
  under: `<path d="${FIREFLY_BELLY}" fill="url(#sh)"/>`,
  dark: [C(16, 9.4, 3.2), E(16, 14, 3.8, 3.4), 'M14.6 7 Q12 3 9.6 2.4 L9.8 1.8 Q12.6 2.4 15.2 6.6 Z M17.4 7 Q20 3 22.4 2.4 L22.2 1.8 Q19.4 2.4 16.8 6.6 Z'].join(' '),
  lit: up
    ? `<g fill="#dfe8f5" fill-opacity="0.22" stroke="#dfe8f5" stroke-opacity="0.5" stroke-width="0.6"><ellipse cx="9" cy="10" rx="7" ry="3.4" transform="rotate(-30 9 10)"/><ellipse cx="23" cy="10" rx="7" ry="3.4" transform="rotate(30 23 10)"/></g><path d="M11.4 20 H20.6 M11.6 23.6 H20.4" stroke="#000" stroke-opacity="0.45" stroke-width="1"/>`
    : `<g fill="#dfe8f5" fill-opacity="0.22" stroke="#dfe8f5" stroke-opacity="0.5" stroke-width="0.6"><ellipse cx="9" cy="17" rx="7" ry="3" transform="rotate(20 9 17)"/><ellipse cx="23" cy="17" rx="7" ry="3" transform="rotate(-20 23 17)"/></g><path d="M11.4 20 H20.6 M11.6 23.6 H20.4" stroke="#000" stroke-opacity="0.45" stroke-width="1"/>`,
});
const FIREFLY = {
  fill: mask(32, 32, FIREFLY_BELLY),
  details: silSvg(32, 32, [fireflyFrame(true), fireflyFrame(false)], { extraDefs: SHADE, rim: 0.5 }),
};

/** Лесной фонарь: стекло горит цветом color, оправа тёмная, пламя дрожит */
const LANTERN_GLASS = R(9, 14, 14, 22);
const lanternFrame = (k: number) => ({
  dark: [P(7.6, 14.4, 16, 6.4, 24.4, 14.4), R(7.6, 13.4, 16.8, 2.4), R(7.6, 35, 16.8, 3), R(7.2, 13.4, 2.2, 24), R(22.6, 13.4, 2.2, 24), R(10, 38, 12, 6), C(16, 4.6, 2.2)].join(' '),
  lit: `<path d="${k ? E(16, 26.4, 2.2, 4.2) : E(16, 25.6, 2.5, 5)}" fill="#fff6dc" opacity="0.9"/>`,
});
const LANTERN = {
  fill: mask(32, 48, LANTERN_GLASS),
  details: silSvg(32, 48, [lanternFrame(0), lanternFrame(1)], { rim: 0.5 }),
};

/** Цветок: лепестки горят, стебель и листья — силуэт */
const PETALS = [0, 72, 144, 216, 288]
  .map((a) => {
    const r = (a * Math.PI) / 180;
    return E(16 + Math.sin(r) * 6, 13 - Math.cos(r) * 6, 4.6, 4.6);
  })
  .join(' ');
const FLOWER = {
  fill: mask(32, 48, PETALS),
  details: details(
    32,
    48,
    PETALS,
    `${C(16, 13, 2.6)} M15.2 18 Q14.2 32 15.4 48 H17 Q16 32 16.8 18 Z M15.6 34 Q9 28 5 31 Q9 36 15.6 36 Z M16.4 29 Q22 24 27 26 Q23 31 16.4 31 Z`,
  ),
};

const LEAF_SHAPE = 'M5 27 Q3 8 27 4 Q29 25 5 27 Z';
const LEAF = {
  fill: mask(32, 32, LEAF_SHAPE),
  details: details(32, 32, LEAF_SHAPE, 'M3.6 29.4 L5.6 27.2 Q14 18 24 7.4 L24.8 8 Q15 19 6.6 28 L4.4 30 Z'),
};

/** Дуб: крона из клубов (её красит color, но тише), ствол с ветвями — силуэт */
const OAK_CROWN = [C(48, 40, 30), C(24, 52, 20), C(72, 52, 20), C(34, 28, 18), C(64, 26, 19), C(48, 18, 16), C(14, 64, 12), C(82, 64, 12), C(48, 64, 22)].join(' ');
const OAK = {
  fill: mask(96, 114, OAK_CROWN),
  details: details(
    96,
    114,
    OAK_CROWN,
    'M42 114 Q44 92 43 74 Q34 66 26 62 L28 59 Q37 63 44 69 Q44 60 40 52 L43 51 Q47 60 48 70 Q52 58 60 52 L62 55 Q54 62 52 74 Q51 94 54 114 Z',
    `<g fill="#000" opacity="0.28"><circle cx="30" cy="58" r="9"/><circle cx="60" cy="62" r="10"/><circle cx="46" cy="44" r="8"/><circle cx="72" cy="40" r="7"/></g>`,
  ),
};

const SPRUCE_SHAPE = spruce(36, 92, 90, 66, 7);
const SPRUCE = {
  fill: mask(72, 102, SPRUCE_SHAPE),
  details: details(72, 102, SPRUCE_SHAPE, `${R(33, 88, 6, 14)}`),
};

const STONE = silSvg(40, 24, {
  dark: 'M3 23 Q1.6 13 9 8.6 Q17 3.6 27 5.4 Q37.6 8 37.4 23 Z',
  lit: `<path d="M24 6.4 Q33 8.4 35.6 15" fill="none" stroke="${RIM}" stroke-opacity="0.45" stroke-width="0.8"/>`,
});

const STUMP = silSvg(40, 32, {
  dark: 'M8 31 Q9 22 9.4 12 Q4 30 1 31 Z M9.4 12 H30.6 Q31 22 32 31 H8 Z M30.6 12 Q36 28 39 31 H32 Z',
  detail: `<ellipse cx="20" cy="12" rx="10.6" ry="3.4" fill="#1d1712" stroke="${RIM}" stroke-opacity="0.4" stroke-width="0.6"/><ellipse cx="20" cy="12" rx="6" ry="1.8" fill="none" stroke="#000" stroke-opacity="0.5" stroke-width="0.6"/>`,
});

/** Ельник вдали: два ряда елей в тумане и холодная дымка между ними. Плитка 900 × 220, прижата к низу */
const FOREST_SVG = (() => {
  const row = (seed: number, base: number, hMin: number, hMax: number, step: number) => {
    const next = random(seed);
    const trees: string[] = [];
    for (let x = -20; x < 920; x += step * (0.6 + next() * 0.8)) {
      const h = hMin + next() * (hMax - hMin);
      trees.push(spruce(x, base, h, h * 0.42, seed + trees.length));
    }
    return trees.join(' ');
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220">
<defs><filter id="m" x="-10%" y="-60%" width="120%" height="220%"><feGaussianBlur stdDeviation="8"/></filter><filter id="f"><feGaussianBlur stdDeviation="1.2"/></filter>
<linearGradient id="h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4a44" stop-opacity="0"/><stop offset="1" stop-color="#2c4a44" stop-opacity="0.5"/></linearGradient></defs>
<path d="${row(3, 170, 60, 110, 34)}" fill="#0f241e" filter="url(#f)"/>
<rect y="120" width="900" height="100" fill="url(#h)"/>
<ellipse cx="300" cy="176" rx="320" ry="14" fill="#5c7f78" opacity="0.25" filter="url(#m)"/><ellipse cx="720" cy="168" rx="260" ry="12" fill="#5c7f78" opacity="0.2" filter="url(#m)"/>
<path d="${row(11, 226, 90, 160, 52)}" fill="${NIGHT}" stroke="#2a3b3a" stroke-width="0.8"/>
</svg>`;
})();

/** Лучи луны сквозь кроны: косые полосы сверху справа */
const BEAMS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
<linearGradient id="g" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe8f5" stop-opacity="0.3"/><stop offset="1" stop-color="#dfe8f5" stop-opacity="0"/></linearGradient></defs>
<g filter="url(#b)" fill="url(#g)"><path d="M520 -20 L560 -20 L330 400 L250 400 Z"/><path d="M600 20 L620 30 L470 400 L420 400 Z"/><path d="M430 -20 L450 -20 L160 380 L120 380 Z" opacity="0.6"/></g></svg>`;

/** Звёзды в просветах крон: редкие, только сверху */
const GAPS_SVG = (() => {
  const next = random(41);
  const dots = Array.from({ length: 22 }, () => `<circle cx="${(next() * 600).toFixed(1)}" cy="${(next() * 90).toFixed(1)}" r="${(0.4 + next() * 0.7).toFixed(2)}" fill="#dfe7f4" opacity="${(0.3 + next() * 0.5).toFixed(2)}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200">${dots}</svg>`;
})();

const colorable = (selector: string, item: { fill: string; details: string }) =>
  `${selector} {\n  --fill: ${item.fill};\n  --details: ${svgUrl(item.details)};\n}`;

const FOREST = `${FILM_CSS}
html {
  background: none;
}

body {
  background:
    ${svgUrl(GAPS_SVG)} left top / 600px 200px repeat-x,
    radial-gradient(ellipse 50% 60% at 85% 0%, rgba(185, 203, 232, 0.16), transparent),
    linear-gradient(180deg, #010403 0%, #030a07 40%, #08160f 75%, #0c1f17 100%);
}

/* Светлячки леса: плывут, как раньше, но мерцают плавно */
body::before,
body::after {
  animation:
    fireflies 16s ease-in-out infinite alternate,
    noir-flicker 3.6s ease-in-out infinite alternate;
}

body::after {
  animation-duration: 22s, 4.8s;
}

/* Светлячки фона тише светлячков-предметов */
@keyframes noir-flicker {
  from {
    opacity: 0.65;
  }

  to {
    opacity: 0.2;
  }
}

/* Ельник и лучи луны сквозь кроны — дальний план; светлячки ближе и сдвигаются за мышью сильнее */
${farPlane(`${svgUrl(BEAMS_SVG)} right 24px top 24px / 600px 400px no-repeat, ${svgUrl(FOREST_SVG)} center bottom 24px / 900px 220px repeat-x`)}

${colorable('.mushroom', BOLETUS)}
${colorable('.amanita, .poison', AMANITA)}
${colorable('.firefly', FIREFLY)}
${colorable('.lantern', LANTERN)}
${colorable('.flower', FLOWER)}
${colorable('.leaf', LEAF)}
${colorable('.tree', OAK)}
${colorable('.spruce', SPRUCE)}

/* Крону дерева color красит тише: светится лес, а не стена цвета */
.tree::before {
  opacity: 0.6;
}

.stone {
  background-image: ${svgUrl(STONE)};
}

.stump {
  background-image: ${svgUrl(STUMP)};
}

.basket {
  background: repeating-linear-gradient(45deg, #2a1c0e 0 6px, #1a1108 6px 12px);
  box-shadow:
    inset 0 4px 0 #0f0904,
    inset 0 5px 0 rgba(185, 203, 232, 0.12);
}

/* Земля под поляной: тёмная, по кромке — лунный свет на траве */
.glade,
.trail {
  background:
    linear-gradient(transparent calc(100% - 14px), rgba(185, 203, 232, 0.22) calc(100% - 14px), rgba(185, 203, 232, 0.22) calc(100% - 13px), #07110c calc(100% - 13px));
}

.row {
  box-shadow:
    inset 0 -6px 0 #07110c,
    inset 0 -7px 0 rgba(185, 203, 232, 0.18);
}

/* Указатель: тёмные доски, надписи светятся своим цветом */
.sign {
  background: repeating-linear-gradient(180deg, #17100a 0 22px, #0d0905 22px 24px);
  box-shadow:
    0 0 0 4px #070504,
    0 0 0 5px rgba(185, 203, 232, 0.14),
    0 6px 0 4px #070504;
  text-shadow: 0 0 6px currentColor;
}
`;

const CASCADE = `
.ancient {
  background:
    linear-gradient(90deg, #0c0907 47px, rgba(185, 203, 232, 0.35) 47px) 50% 100% / 48px 100% no-repeat,
    radial-gradient(ellipse at 50% 40%, rgba(93, 255, 176, 0.08), transparent 70%);
}

.branch {
  background:
    linear-gradient(#0c0907, #0c0907) 50% 75% / 100% 8px no-repeat,
    linear-gradient(rgba(185, 203, 232, 0.2), rgba(185, 203, 232, 0.2)) 50% calc(75% - 4px) / 100% 1px no-repeat;
}
`;

export const FOREST_SCENES: Record<string, string> = {
  'forest-edge': FOREST,
  'mushroom-glades': FOREST,
  'cascade-tree': FOREST + CASCADE,
};
