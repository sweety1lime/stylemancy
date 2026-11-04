import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useSettings } from '../game/settings';
import { cumulus, gear, ridge } from './geometry';
import { random } from './random';

/*
  Карта мира в «Сумраке» снята как кадр из кино: планы от неба до переднего края, каждый — свой слой.
  Слои двигаются целиком: камера чуть следует за мышью, облака дрейфуют, лучи луны дышат. Это работа
  видеокарты, а размытия внутри слоя рисуются один раз. Земли стоят сеткой 3 × 3, поэтому всё крупное —
  в свободных местах: луна слева посередине, Академия справа, море облаков внизу, скала переднего плана —
  внизу между землями. Рамка 1000 × 700, по краям обрезается.
*/

type World = 'cascadia' | 'scriptoria';

interface Palette {
  /** Небо сверху вниз: зенит, ночь, горизонт со свечением, низ */
  sky: [string, string, string, string, string, string];
  star: string;
  moon: string;
  /** Лунный свет: лучи, серебро на краях облаков */
  light: string;
  /** Дымка над горизонтом */
  haze: string;
  /** Тёплый свет на другой стороне кадра — против холодной луны */
  warm: string;
  /** Дальний и ближний хребет */
  ridge: [string, string];
  /** Силуэты вдали: Академия, город, парящие камни */
  far: string;
  window: string;
  /** Ряды моря облаков от дальнего к ближнему: освещённый верх и тень */
  sea: [string, string][];
  mist: string;
}

const PALETTES: Record<World, Palette> = {
  cascadia: {
    sky: ['#010207', '#050912', '#0d1528', '#1e2a46', '#151d33', '#090d18'],
    star: '#dfe7f4',
    moon: 'url(#noir-moon)',
    light: '#dfe8f5',
    haze: '#56688f',
    warm: '#ffb070',
    ridge: ['#1a2440', '#121a2f'],
    far: '#131b2d',
    window: '#ffc77a',
    sea: [
      ['#3a4868', '#151d33'],
      ['#2a3652', '#0f1626'],
      ['#1b2438', '#080b14'],
      ['#10161f', '#030408'],
    ],
    mist: '#3a4560',
  },
  scriptoria: {
    sky: ['#010404', '#030d0e', '#08201f', '#14403d', '#0d2b2a', '#041010'],
    star: '#c8f4ec',
    moon: 'url(#noir-moon-script)',
    light: '#d6f5ee',
    haze: '#3a7f77',
    warm: '#ffc27a',
    ridge: ['#0f302e', '#0a2221'],
    far: '#0b2020',
    window: '#6ff3d6',
    sea: [
      ['#22504c', '#0b2322'],
      ['#1a3f3c', '#081a1a'],
      ['#10292a', '#040e0e'],
      ['#091a1a', '#020606'],
    ],
    mist: '#2a5a58',
  },
};

const SKY_STOPS = [0, 0.3, 0.55, 0.71, 0.8, 1];

/** Луна в свободном месте слева посередине — так, чтобы не обрезалась, когда панорама подрезана по бокам */
const MOON = { x: 240, y: 285, r: 50 };

const stars = random(131);
const STARS = Array.from({ length: 90 }, () => [stars() * 1000, stars() * 470, 0.35 + stars() * 0.95] as const);
const dust = random(137);
const DUST = Array.from({ length: 24 }, () => [dust() * 1000, 220 + dust() * 460, 0.5 + dust(), dust()] as const);

/** Лучи луны вниз и вправо, сквозь разрывы облаков: угол ниже горизонта, ширина у луны и в конце, длина */
const SHAFTS: [number, number, number, number][] = [
  [-4, 16, 70, 760],
  [9, 26, 130, 820],
  [21, 18, 90, 800],
  [34, 30, 160, 760],
  [50, 16, 80, 640],
];

function shaft([angle, w0, w1, length]: [number, number, number, number]) {
  const a = (angle * Math.PI) / 180;
  const [dx, dy] = [Math.cos(a), Math.sin(a)];
  const [nx, ny] = [-dy, dx];
  const sx = MOON.x + dx * MOON.r * 0.9;
  const sy = MOON.y + dy * MOON.r * 0.9;
  const ex = MOON.x + dx * length;
  const ey = MOON.y + dy * length;
  const p = (x: number, y: number, w: number, side: number) => `${(x + nx * w * side).toFixed(1)} ${(y + ny * w * side).toFixed(1)}`;
  return { d: `M${p(sx, sy, w0 / 2, 1)} L${p(ex, ey, w1 / 2, 1)} L${p(ex, ey, w1 / 2, -1)} L${p(sx, sy, w0 / 2, -1)} Z`, sx, sy, ex, ey };
}
const SHAFT_SHAPES = SHAFTS.map(shaft);

/** Облако поперёк луны: верхний край отдельно — по нему идёт серебряная кайма */
const CLOUD_TOP = `M${MOON.x - 124} ${MOON.y + 30} Q${MOON.x - 100} ${MOON.y + 14} ${MOON.x - 74} ${MOON.y + 18} Q${MOON.x - 40} ${MOON.y + 4} ${MOON.x} ${MOON.y + 13} Q${MOON.x + 42} ${MOON.y + 2} ${MOON.x + 84} ${MOON.y + 15} Q${MOON.x + 110} ${MOON.y + 10} ${MOON.x + 130} ${MOON.y + 28}`;
const CLOUD = `${CLOUD_TOP} Q${MOON.x + 100} ${MOON.y + 42} ${MOON.x + 60} ${MOON.y + 38} Q${MOON.x + 8} ${MOON.y + 48} ${MOON.x - 44} ${MOON.y + 40} Q${MOON.x - 96} ${MOON.y + 44} ${MOON.x - 124} ${MOON.y + 30} Z`;

const RIDGES = [ridge(41, 505, 52), ridge(43, 522, 34)];

/** Море облаков: четыре вала, дальний — выше и мельче, ближний — ниже и крупнее */
const SEA = [
  { base: 514, puffs: cumulus(3, 514, 10, 34) },
  { base: 552, puffs: cumulus(5, 552, 14, 46) },
  { base: 606, puffs: cumulus(7, 606, 20, 64) },
  { base: 664, puffs: cumulus(11, 664, 28, 80) },
];

/** Академия на дальней скале: башни с острыми крышами, тёплые окна, цепи под скалой */
const ACADEMY =
  'M760 352 Q850 340 950 352 Q932 370 902 380 Q866 396 836 384 Q796 372 760 352 Z ' +
  'M790 352 V306 L797 290 L804 306 V352 Z M810 352 V282 L820 250 L830 282 V352 Z ' +
  'M804 352 V318 H810 V352 Z M830 352 V312 H844 V352 Z M844 352 V294 L852 272 L860 294 V352 Z ' +
  'M860 352 V324 H888 V352 Z M874 324 V314 L881 304 L888 314 V324 Z M898 352 V330 L904 318 L910 330 V352 Z';
const ACADEMY_WINDOWS: [number, number][] = [
  [818, 290],
  [822, 304],
  [850, 302],
  [866, 334],
  [796, 314],
];

/** Город механизмов Скриптории: дома, трубы, купол и шестерни */
const MECH_CITY =
  'M740 380 V336 H770 V318 H784 V346 H808 V300 L820 284 L832 300 V352 H850 V326 Q866 306 882 326 V360 ' +
  'H900 V322 H912 V300 H922 V322 H936 V380 Z';
const CITY_WINDOWS: [number, number][] = [
  [776, 332],
  [826, 312],
  [868, 340],
  [916, 330],
];

/** Передний план: скала внизу между землями, на ней обломок колонны; размыта — камера смотрит дальше, на земли */
const CRAG =
  'M340 760 L356 694 L378 680 L396 684 L414 664 L436 656 L452 644 L470 648 L486 634 L504 640 L520 630 ' +
  'L540 636 L560 648 L578 646 L600 662 L622 670 L644 688 L668 694 L684 760 Z';
const RUIN =
  'M530 640 V566 L536 556 L540 562 L545 550 L550 559 L556 552 V640 Z M524 640 H562 V632 H524 Z M526 602 H560 V597 H526 Z ' +
  'M574 652 L598 644 L604 656 L580 664 Z';

/** Боке: огоньки у самой камеры, не в фокусе — тёплые и холодные */
const BOKEH: [number, number, number, 'warm' | 'cold', number][] = [
  [64, 640, 26, 'warm', 0.5],
  [132, 566, 12, 'cold', 0.6],
  [944, 92, 22, 'cold', 0.4],
  [884, 182, 10, 'warm', 0.7],
  [602, 690, 30, 'cold', 0.3],
  [302, 26, 16, 'warm', 0.35],
  [976, 566, 18, 'warm', 0.45],
];

/** Проявление из темноты — один раз за открытие игры: первый взгляд на королевство */
let revealed = false;

interface LayerProps {
  name: string;
  /** Насколько слой сдвигается за мышью: дальние — в её сторону, передние — навстречу */
  depth: number;
  /** Порядок проявления */
  order: number;
  children: ReactNode;
}

function Layer({ name, depth, order, children }: LayerProps) {
  return (
    <div className={`nl nl--${name}`} data-depth={depth} style={{ '--order': order } as CSSProperties}>
      <div className="nl__inner">
        <svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
          {children}
        </svg>
      </div>
    </div>
  );
}

/**
 * Камера следует за мышью: плавно догоняет её и останавливается, когда догнала. Сдвиг пишется прямо в transform
 * каждого слоя — тогда браузер не пересчитывает стили сотен фигур внутри. Только на полных эффектах и с мышью.
 */
function useCamera(ref: RefObject<HTMLDivElement | null>, on: boolean) {
  useEffect(() => {
    const map = ref.current?.closest<HTMLElement>('.world-map');
    const fine = typeof matchMedia === 'function' && matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!map || !on || !fine) return;
    const layers = [...map.querySelectorAll<HTMLElement>('.nl')].map((el) => ({ el, depth: Number(el.dataset.depth) }));
    map.classList.add('noir-cam');
    let target = [0, 0];
    let now = [0, 0];
    let frame = 0;
    const tick = () => {
      now = now.map((v, i) => v + (target[i] - v) * 0.06);
      for (const { el, depth } of layers) el.style.transform = `translate3d(${(now[0] * depth).toFixed(2)}px, ${(now[1] * depth * 0.6).toFixed(2)}px, 0)`;
      frame = Math.abs(target[0] - now[0]) + Math.abs(target[1] - now[1]) > 0.002 ? requestAnimationFrame(tick) : 0;
    };
    const follow = (next: number[]) => {
      target = next;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      const box = map.getBoundingClientRect();
      follow([((event.clientX - box.left) / box.width) * 2 - 1, ((event.clientY - box.top) / box.height) * 2 - 1]);
    };
    const leave = () => follow([0, 0]);
    map.addEventListener('pointermove', move);
    map.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      map.removeEventListener('pointermove', move);
      map.removeEventListener('pointerleave', leave);
      map.classList.remove('noir-cam');
      for (const { el } of layers) el.style.transform = '';
    };
  }, [ref, on]);
}

/** Проявлять ли кадр из темноты: решается один раз на всё время, пока карта открыта */
function useReveal(): boolean {
  const [reveal] = useState(() => !revealed);
  useEffect(() => {
    revealed = true;
  }, []);
  return reveal;
}

export function NoirMapSky({ world }: { world: World }) {
  const c = PALETTES[world];
  const script = world === 'scriptoria';
  const ref = useRef<HTMLDivElement>(null);
  const reveal = useReveal();
  useCamera(ref, useSettings().effects === 'full');

  return (
    <div
      ref={ref}
      className={`noir-map-sky noir-art${reveal ? ' noir-map-sky--reveal' : ''}`}
      style={{ background: `linear-gradient(180deg, ${c.sky[0]}, ${c.sky[2]} 45%, ${c.sky[5]})` }}
    >
      {/* Небо, звёзды и низкая луна в облаках с серебряной каймой */}
      <Layer name="sky" depth={6} order={0}>
        <defs>
          <linearGradient id="nms-sky" x1="0" y1="0" x2="0" y2="1">
            {c.sky.map((color, i) => (
              <stop key={i} offset={SKY_STOPS[i]} stopColor={color} />
            ))}
          </linearGradient>
          <radialGradient id="nms-bloom" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={c.light} stopOpacity="0.55" />
            <stop offset="0.35" stopColor={c.light} stopOpacity="0.16" />
            <stop offset="1" stopColor={c.light} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nms-lining" gradientUnits="userSpaceOnUse" cx={MOON.x} cy={MOON.y} r="105">
            <stop offset="0" stopColor={c.light} stopOpacity="0.85" />
            <stop offset="1" stopColor={c.light} stopOpacity="0" />
          </radialGradient>
          <filter id="nms-soft" x="-20%" y="-80%" width="140%" height="260%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
          <radialGradient id="nms-star" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={c.star} stopOpacity="0.5" />
            <stop offset="1" stopColor={c.star} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="-40" y="-40" width="1080" height="800" fill="url(#nms-sky)" />
        {STARS.map(([x, y, r], i) => (
          <g key={i} opacity={Math.max(0.12, 0.9 - y / 520)}>
            {r > 1.1 && <circle cx={x} cy={y} r={r * 5} fill="url(#nms-star)" />}
            <circle cx={x} cy={y} r={r} fill={c.star} />
          </g>
        ))}
        <circle cx={MOON.x} cy={MOON.y} r="380" fill="url(#noir-halo)" />
        <circle cx={MOON.x} cy={MOON.y} r="140" fill="url(#nms-bloom)" />
        <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill={c.moon} />
        <g fill={script ? '#7fa8a0' : '#8e9bb2'} opacity="0.3" filter="url(#noir-cloud)">
          <ellipse cx={MOON.x - 16} cy={MOON.y - 14} rx="15" ry="11" />
          <ellipse cx={MOON.x + 14} cy={MOON.y - 22} rx="9" ry="7" />
          <ellipse cx={MOON.x + 6} cy={MOON.y + 4} rx="12" ry="8" />
        </g>
        <g>
          <path d={`M${MOON.x - 120} ${MOON.y - 30} Q${MOON.x - 60} ${MOON.y - 42} ${MOON.x} ${MOON.y - 34} Q${MOON.x + 60} ${MOON.y - 44} ${MOON.x + 130} ${MOON.y - 30} Q${MOON.x + 40} ${MOON.y - 24} ${MOON.x - 120} ${MOON.y - 30} Z`} fill={c.sky[2]} opacity="0.5" filter="url(#nms-soft)" />
          <path d={CLOUD} fill={c.sky[1]} opacity="0.88" filter="url(#nms-soft)" />
          <path d={CLOUD_TOP} fill="none" stroke="url(#nms-lining)" strokeWidth="1.2" strokeLinecap="round" />
        </g>
      </Layer>

      {/* Лучи луны — двумя слоями, которые дышат по очереди, будто по ним проходят облака */}
      {[0, 1].map((half) => (
        <Layer key={half} name={`shafts-${half ? 'b' : 'a'}`} depth={6} order={1}>
          <defs>
            {SHAFT_SHAPES.map((s, i) =>
              i % 2 === half ? (
                <linearGradient key={i} id={`nms-shaft-${i}`} gradientUnits="userSpaceOnUse" x1={s.sx} y1={s.sy} x2={s.ex} y2={s.ey}>
                  <stop offset="0" stopColor={c.light} stopOpacity="0.32" />
                  <stop offset="0.45" stopColor={c.light} stopOpacity="0.1" />
                  <stop offset="1" stopColor={c.light} stopOpacity="0" />
                </linearGradient>
              ) : null,
            )}
          </defs>
          <g filter="url(#noir-mist)">
            {SHAFT_SHAPES.map((s, i) => (i % 2 === half ? <path key={i} d={s.d} fill={`url(#nms-shaft-${i})`} /> : null))}
          </g>
        </Layer>
      ))}

      {/* Даль: дымка над горизонтом, тёплое зарево против луны, хребты, Академия или город механизмов */}
      <Layer name="far" depth={4} order={2}>
        <defs>
          <filter id="nms-haze" x="-5%" y="-20%" width="110%" height="140%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <radialGradient id="nms-warm" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={c.warm} stopOpacity="0.2" />
            <stop offset="1" stopColor={c.warm} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="500" cy="500" rx="640" ry="46" fill={c.haze} opacity="0.55" filter="url(#noir-mist)" />
        <circle cx="850" cy="340" r="200" fill="url(#nms-warm)" />
        {script ? (
          <g fill={c.far}>
            <g>
              <path d={gear(800, 250, 44, 12)} fillRule="evenodd" />
            </g>
            <g>
              <path d={gear(900, 262, 30, 10)} fillRule="evenodd" />
            </g>
            <path d={MECH_CITY} />
            {CITY_WINDOWS.map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="3" height="5" fill={c.window} />
            ))}
          </g>
        ) : (
          <g>
            <path d="M800 384 V430 M880 384 V420" stroke={c.far} strokeWidth="1.6" strokeDasharray="3 2.4" />
            <path d={ACADEMY} fill={c.far} />
            {ACADEMY_WINDOWS.map(([x, y], i) => (
              <rect key={i} x={x} y={y} width="3" height="5" fill={c.window} />
            ))}
          </g>
        )}
        <g filter="url(#nms-haze)">
          {RIDGES.map((d, i) => (
            <path key={d} d={d} fill={c.ridge[i]} />
          ))}
        </g>
      </Layer>

      {/* Море облаков: дальние валы и ближние. Каждый клуб — дважды: светлый, а поверх тело со сдвигом вниз —
          на макушке остаётся серп лунного света */}
      {[0, 1].map((half) => (
        <Layer key={half} name={half ? 'sea-front' : 'sea-back'} depth={half ? 2 : 3} order={3 + half}>
          <defs>
            <filter id={`nms-puff-${half}`} x="-5%" y="-20%" width="110%" height="140%">
              <feGaussianBlur stdDeviation={half ? 3.2 : 1.6} />
            </filter>
            <radialGradient id={`nms-rim-${half}`} gradientUnits="userSpaceOnUse" cx={MOON.x + 60} cy="520" r="620">
              <stop offset="0" stopColor={c.light} stopOpacity={half ? 0.11 : 0.3} />
              <stop offset="0.6" stopColor={c.light} stopOpacity={half ? 0.03 : 0.08} />
              <stop offset="1" stopColor={c.light} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`nms-spill-${half}`} gradientUnits="userSpaceOnUse" cx={MOON.x + 90} cy="540" r={half ? 420 : 360}>
              <stop offset="0" stopColor={c.light} stopOpacity={half ? 0.12 : 0.2} />
              <stop offset="1" stopColor={c.light} stopOpacity="0" />
            </radialGradient>
            {[0, 1].map((k) => {
              const row = half * 2 + k;
              const { base, puffs } = SEA[row];
              const top = Math.min(...puffs.map(([, y, r]) => y - r));
              return (
                <g key={row}>
                  <linearGradient id={`nms-sea-${row}`} gradientUnits="userSpaceOnUse" x1="0" y1={top} x2="0" y2={base + 40}>
                    <stop offset="0" stopColor={c.sea[row][0]} />
                    <stop offset="1" stopColor={c.sea[row][1]} />
                  </linearGradient>
                  <clipPath id={`nms-sea-clip-${row}`}>
                    {puffs.map(([x, y, r]) => (
                      <circle key={x} cx={x + r * 0.06} cy={y + r * 0.12} r={r} />
                    ))}
                    <rect x="-100" y={base} width="1200" height="300" />
                  </clipPath>
                </g>
              );
            })}
          </defs>
          {[0, 1].map((k) => {
            const row = half * 2 + k;
            const { base, puffs } = SEA[row];
            return (
              <g key={row} filter={`url(#nms-puff-${half})`}>
                <g fill={`url(#nms-rim-${half})`}>
                  {puffs.map(([x, y, r]) => (
                    <circle key={x} cx={x} cy={y} r={r} />
                  ))}
                </g>
                <g fill={`url(#nms-sea-${row})`}>
                  {puffs.map(([x, y, r]) => (
                    <circle key={x} cx={x + r * 0.06} cy={y + r * 0.12} r={r} />
                  ))}
                  <rect x="-100" y={base} width="1200" height="300" />
                </g>
                <rect x="-100" y="380" width="1200" height="400" fill={`url(#nms-spill-${half})`} clipPath={`url(#nms-sea-clip-${row})`} />
              </g>
            );
          })}
          {half === 1 && (
            <g filter="url(#noir-mist)" fill={c.mist}>
              <ellipse cx="260" cy="596" rx="300" ry="14" opacity="0.3" />
              <ellipse cx="780" cy="650" rx="320" ry="16" opacity="0.26" />
            </g>
          )}
        </Layer>
      ))}

      {/* Пыль в лунном свете поднимается вверх */}
      <Layer name="dust" depth={1} order={5}>
        {DUST.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={i % 4 ? c.star : '#ffc890'} opacity="0.6" />
        ))}
      </Layer>
    </div>
  );
}

/** Передний план поверх земель: размытая скала с обломком колонны, боке и зерно плёнки. Мышь проходит насквозь */
export function NoirMapFront({ world }: { world: World }) {
  const c = PALETTES[world];
  const reveal = useReveal();
  return (
    <div className={`noir-map-front noir-art${reveal ? ' noir-map-front--reveal' : ''}`} aria-hidden="true">
      <Layer name="fg" depth={-8} order={6}>
        <defs>
          <filter id="nmf-focus" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>
        <g filter="url(#nmf-focus)">
          <path d={`${CRAG} ${RUIN}`} fill="#020306" />
        </g>
      </Layer>
      <Layer name="bokeh" depth={-14} order={7}>
        <defs>
          {(['warm', 'cold'] as const).map((tone) => (
            <radialGradient key={tone} id={`nmf-bokeh-${tone}`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={tone === 'warm' ? c.warm : c.light} stopOpacity="0.2" />
              <stop offset="0.85" stopColor={tone === 'warm' ? c.warm : c.light} stopOpacity="0.26" />
              <stop offset="0.96" stopColor={tone === 'warm' ? c.warm : c.light} stopOpacity="0.42" />
              <stop offset="1" stopColor={tone === 'warm' ? c.warm : c.light} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>
        {BOKEH.map(([x, y, r, tone, opacity]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={`url(#nmf-bokeh-${tone})`} opacity={opacity * 0.4} />
        ))}
      </Layer>
      <div className="nl-grain" />
    </div>
  );
}
