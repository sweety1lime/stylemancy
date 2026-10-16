import { spriteCssUrl } from '../../pixel/pixelArt';
import { GEAR_FRAMES, LANTERN } from '../../pixel/sprites';

/*
  Страницы Города Механизмов: латунь, заклёпки и тёмная сталь. Страница живёт в iframe без доступа к игре,
  поэтому шрифты — системные, а картинки — только встроенные пиксельные спрайты.
*/

const GEAR = spriteCssUrl(GEAR_FRAMES[0]);
const LAMP = spriteCssUrl(LANTERN);

export const mechanismCss = `
:root { color-scheme: dark; }
body {
  display: grid; place-content: center; justify-items: center; gap: 14px;
  padding: 16px;
  background:
    radial-gradient(circle at 50% -20%, rgba(251, 191, 36, 0.16), transparent 60%),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.025) 0 2px, transparent 2px 48px),
    #161b26;
  color: #f3e7c4;
  font: 600 16px/1.35 ui-monospace, "Cascadia Mono", Consolas, "Courier New", monospace;
  text-align: center;
}
h1, h2, p { margin: 0; }
button {
  padding: 8px 14px;
  border: 0;
  background: #e0b84c;
  color: #1b1406;
  font: inherit;
  cursor: pointer;
  box-shadow: inset -3px -3px 0 #a07a22, inset 3px 3px 0 #ffe9a8, 0 0 0 3px #1b1406;
}
button:hover { background: #ecc85e; }
button:active { transform: translateY(2px); }
button:disabled {
  background: #5b5648; color: #2a2620; cursor: not-allowed;
  box-shadow: inset -3px -3px 0 #45413a, inset 3px 3px 0 #77715f, 0 0 0 3px #1b1406;
}
input {
  width: 12ch; padding: 8px 10px;
  border: 0; background: #0d1118; color: #f3e7c4;
  font: inherit; text-align: center;
  box-shadow: 0 0 0 3px #c8a24a, 0 0 0 6px #1b1406;
}
input:focus { outline: 3px solid #fbbf24; outline-offset: 4px; }
.row { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 14px; }
/* Табличка из латуни с заклёпками */
.plate {
  min-width: 12ch; padding: 8px 18px;
  background: #2a2116 radial-gradient(circle at 6px 6px, #c8a24a 0 2px, transparent 3px) 0 0 / calc(100% - 6px) calc(100% - 6px);
  color: #ffd978;
  box-shadow: 0 0 0 3px #c8a24a, 0 0 0 6px #1b1406;
}
/* Фонарь: погашен — тёмный, зажжён — светится */
.lamp {
  width: 48px; height: 72px;
  background: ${LAMP} center / contain no-repeat;
  image-rendering: pixelated;
  filter: grayscale(1) brightness(0.45);
  transition: filter 0.3s;
}
.lamp.on { filter: drop-shadow(0 0 14px #fbbf24); }
/* Шестерня: крутится, когда у неё класс spin */
.gear {
  width: 60px; height: 60px;
  background: ${GEAR} center / contain no-repeat;
  image-rendering: pixelated;
  filter: grayscale(0.7) brightness(0.7);
}
.gear.spin { filter: none; animation: spin 2s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
/* Ворота: створки расходятся, когда у них класс open */
.gate {
  position: relative; width: 140px; height: 110px;
  background: #0b0e14;
  box-shadow: 0 0 0 4px #3b4252, 0 0 0 7px #1b1406;
  overflow: hidden;
}
.gate::before, .gate::after {
  content: ""; position: absolute; top: 0; bottom: 0; width: 50%;
  background: repeating-linear-gradient(90deg, #6b7280 0 6px, #4b5563 6px 14px);
  box-shadow: inset 0 0 0 3px #1f2937;
  transition: transform 0.6s steps(6);
}
.gate::before { left: 0; }
.gate::after { right: 0; }
.gate.open::before { transform: translateX(-100%); }
.gate.open::after { transform: translateX(100%); }
.gate.open { background: radial-gradient(circle, #fde68a, #f59e0b 45%, #0b0e14 80%); }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
`;
