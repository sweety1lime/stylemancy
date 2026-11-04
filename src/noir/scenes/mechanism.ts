import { gear } from '../geometry';
import { C } from '../shapes';
import { LANTERN_SVG } from './fortress';
import { GRAIN_SVG, silSvg, svgUrl } from './kit';

/*
  Город Механизмов в «Сумраке»: живые страницы — тёмная сталь, латунь ловит тёплый свет,
  таблички тлеют золотом. Фонари и шестерни — силуэты; горит только то, что включил код студента.
*/

/** Шестерня: тёмное железо, латунная кромка, ступица */
const GEAR_SVG = silSvg(
  60,
  60,
  {
    dark: gear(30, 30, 27, 10),
    detail: `<circle cx="30" cy="30" r="5" fill="#2a2116" stroke="#c8a24a" stroke-opacity="0.6" stroke-width="1"/><path d="${C(30, 30, 16)}" fill="none" stroke="#c8a24a" stroke-opacity="0.25" stroke-width="1"/>`,
  },
  { rimColor: '#e8c48a', rim: 0.8 },
);

const MECHANISM = `
body {
  background:
    radial-gradient(ellipse 60% 50% at 50% -10%, rgba(255, 194, 122, 0.14), transparent),
    radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0, 0, 0, 0.5)),
    ${svgUrl(GRAIN_SVG)},
    #0a0c11;
  color: #e9dcc0;
}

button {
  background: linear-gradient(180deg, #3a2c16, #24190b);
  color: #f0c890;
  box-shadow:
    inset 0 0 0 1px rgba(240, 200, 144, 0.55),
    0 0 0 3px #07080b,
    0 0 14px rgba(224, 160, 96, 0.18);
}

button:hover {
  background: linear-gradient(180deg, #4a3818, #2e1f0c);
  box-shadow:
    inset 0 0 0 1px rgba(240, 200, 144, 0.75),
    0 0 0 3px #07080b,
    0 0 22px rgba(224, 160, 96, 0.35);
}

button:disabled {
  background: #15161b;
  color: #4a4c55;
  box-shadow:
    inset 0 0 0 1px #2a2c34,
    0 0 0 3px #07080b;
}

input {
  background: #07080b;
  color: #e9dcc0;
  box-shadow:
    0 0 0 1px rgba(240, 200, 144, 0.45),
    0 0 0 4px #07080b;
}

input:focus {
  outline: 2px solid #ffb35c;
}

.plate {
  background: #16110a radial-gradient(circle at 6px 6px, rgba(200, 162, 74, 0.6) 0 1.5px, transparent 2.5px) 0 0 / calc(100% - 6px) calc(100% - 6px);
  color: #ffd27a;
  text-shadow: 0 0 10px rgba(255, 210, 122, 0.45);
  box-shadow:
    0 0 0 1px rgba(240, 200, 144, 0.55),
    0 0 0 4px #07080b;
}

.lamp {
  background-image: ${svgUrl(LANTERN_SVG)};
  image-rendering: auto;
  filter: grayscale(1) brightness(0.35);
}

.lamp.on {
  filter: drop-shadow(0 0 14px #ffb35c);
}

.gear {
  background-image: ${svgUrl(GEAR_SVG)};
  image-rendering: auto;
  filter: brightness(0.55);
}

.gear.spin {
  filter: drop-shadow(0 0 6px rgba(255, 194, 122, 0.45));
}

.gate {
  background: #050608;
  box-shadow:
    0 0 0 1px rgba(185, 203, 232, 0.3),
    0 0 0 4px #07080b;
}

.gate::before,
.gate::after {
  background: repeating-linear-gradient(90deg, #22252e 0 6px, #16181f 6px 14px);
  box-shadow: inset 0 0 0 1px #2e323d;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.gate.open {
  background: radial-gradient(circle, #fff1c4, #ffb35c 40%, #050608 80%);
}
`;

export const MECHANISM_SCENES: Record<string, string> = {
  'query-workshop': MECHANISM,
  'lever-works': MECHANISM,
  'game-workshop': MECHANISM,
  'default-lair': MECHANISM,
};
