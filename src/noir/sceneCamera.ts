import { fullEffects } from '../game/settings';

/*
  Камера сцены уровня в «Сумраке»: за мышью планы сдвигаются на разную глубину — дальний чуть-чуть,
  туман сильнее. Двигаются только картинки фона (псевдоэлементы html и body), предметы стоят на месте:
  по ним идёт проверка. Сцена получает --cam-x и --cam-y от -1 до 1; как на них отвечать, решает её CSS.
*/

/** Насколько камера догоняет мышь за кадр: мягко, без рывков */
const FOLLOW = 0.08;

function cameraOn(): boolean {
  return (
    fullEffects() &&
    document.documentElement.classList.contains('look-noir') &&
    matchMedia('(pointer: fine)').matches &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Подключить камеру к документу сцены (iframe того же источника) */
export function attachSceneCamera(doc: Document) {
  const root = doc.documentElement;
  let target = { x: 0, y: 0 };
  let pos = { x: 0, y: 0 };
  let frame = 0;

  const tick = () => {
    pos = { x: pos.x + (target.x - pos.x) * FOLLOW, y: pos.y + (target.y - pos.y) * FOLLOW };
    root.style.setProperty('--cam-x', pos.x.toFixed(3));
    root.style.setProperty('--cam-y', pos.y.toFixed(3));
    // Камера встала — цикл кадров останавливается до следующего движения мыши
    frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.002 ? requestAnimationFrame(tick) : 0;
  };
  const aim = (x: number, y: number) => {
    target = { x, y };
    if (!frame) frame = requestAnimationFrame(tick);
  };

  doc.addEventListener('pointermove', (event) => {
    if (!cameraOn() || !root.clientWidth || !root.clientHeight) return;
    const x = (event.clientX / root.clientWidth) * 2 - 1;
    const y = (event.clientY / root.clientHeight) * 2 - 1;
    aim(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
  });
  root.addEventListener('pointerleave', () => aim(0, 0));
}
