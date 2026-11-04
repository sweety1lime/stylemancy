import { gear } from './geometry';
import { random } from './random';

/*
  Небо под картой мира в «Сумраке» — панорама за землями. Земли стоят сеткой 3 × 3,
  поэтому всё крупное — в свободных местах: луна слева посередине, Академия (или город механизмов
  в Скриптории) справа посередине, хребты и туман внизу. Рамка 1000 × 700, по краям обрезается.
*/

const stars = random(131);
const STARS = Array.from({ length: 70 }, () => [stars() * 1000, stars() * 520, 0.4 + stars() * 0.9] as const);
const dust = random(137);
const DUST = Array.from({ length: 30 }, () => [dust() * 1000, 200 + dust() * 480, 0.5 + dust() * 1, dust()] as const);

/** Луна в свободном месте слева посередине — так, чтобы не обрезалась, когда панорама подрезана по бокам */
const MOON = { x: 245, y: 300, r: 46 };

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

const RIDGES = [
  { d: 'M0 560 L80 528 L160 548 L250 510 L340 540 L430 516 L520 546 L600 520 L690 548 L780 512 L870 540 L1000 520 V700 H0 Z', fill: '#141b2b', opacity: 0.9 },
  { d: 'M0 610 Q120 584 240 600 Q380 578 520 604 Q660 584 800 602 Q900 590 1000 600 V700 H0 Z', fill: '#0c111c', opacity: 1 },
];

/** Дальние парящие камни: висят в пустых местах, чуть покачиваются */
const FAR_ROCKS = [
  'M320 180 Q346 172 372 180 Q362 194 346 200 Q330 194 320 180 Z',
  'M600 600 Q632 590 664 600 Q652 616 632 622 Q612 616 600 600 Z',
  'M470 120 Q488 114 506 120 Q498 130 488 134 Q478 130 470 120 Z',
];

export function NoirMapSky({ world }: { world: 'cascadia' | 'scriptoria' }) {
  const script = world === 'scriptoria';
  return (
    <svg className="noir-map-sky noir-art" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1000" height="700" fill={script ? 'url(#noir-sky-script)' : 'url(#noir-sky)'} />
      {STARS.map(([x, y, r], i) => (
        <circle key={i} className={i % 7 ? undefined : 'a-twinkle'} cx={x} cy={y} r={r} fill={script ? '#c8f4ec' : '#dfe7f4'} opacity={0.75 - y / 800} />
      ))}

      {/* Низкая луна слева: ореол, холодные лучи вправо, облака поперёк диска */}
      <circle cx={MOON.x} cy={MOON.y} r="300" fill="url(#noir-halo)" />
      <path
        className="a-breathe"
        d={`M${MOON.x} ${MOON.y} L1000 120 L1000 210 Z M${MOON.x} ${MOON.y} L1000 380 L1000 440 Z`}
        fill="url(#noir-beam-side)"
        opacity="0.5"
      />
      <circle cx={MOON.x} cy={MOON.y} r={MOON.r} fill={script ? 'url(#noir-moon-script)' : 'url(#noir-moon)'} />
      <g transform={`translate(${MOON.x - 150} 0)`}>
      <g className="a-drift" filter="url(#noir-cloud)">
        <path d="M40 330 Q90 314 140 320 Q180 306 226 316 Q270 312 300 328 Q262 340 214 336 Q170 344 120 338 Q76 342 40 330 Z" fill="#0d1321" opacity="0.88" />
        <path d="M80 286 Q120 278 158 282 Q190 276 216 286 Q186 292 156 290 Q120 294 80 286 Z" fill="#141c2e" opacity="0.5" />
      </g>
      </g>

      {FAR_ROCKS.map((d, i) => (
        <g key={d} className={i % 2 ? 'a-hover a-delay' : 'a-hover'}>
          <path d={d} fill={script ? '#0e2426' : '#161e30'} />
        </g>
      ))}

      {script ? (
        <g fill="#0d2224">
          <g className="a-spin" style={{ transformOrigin: '800px 250px' }}>
            <path d={gear(800, 250, 44, 12)} fillRule="evenodd" />
          </g>
          <g className="a-spin a-reverse" style={{ transformOrigin: '900px 262px' }}>
            <path d={gear(900, 262, 30, 10)} fillRule="evenodd" />
          </g>
          <path d={MECH_CITY} />
          {[
            [776, 332],
            [826, 312],
            [868, 340],
            [916, 330],
          ].map(([x, y], i) => (
            <rect key={i} className={i === 1 ? 'a-twinkle' : undefined} x={x} y={y} width="3" height="5" fill="#6ff3d6" />
          ))}
          <g className="a-rise" style={{ animationDuration: '16s' }} filter="url(#noir-mist)">
            <ellipse cx="777" cy="300" rx="9" ry="18" fill="#5a8a88" opacity="0.35" />
            <ellipse cx="917" cy="286" rx="8" ry="16" fill="#5a8a88" opacity="0.3" />
          </g>
        </g>
      ) : (
        <g className="a-hover">
          <path d="M800 384 V430 M880 384 V420" stroke="#1d2638" strokeWidth="1.6" strokeDasharray="3 2.4" />
          <path d={ACADEMY} fill="#1a2234" />
          {ACADEMY_WINDOWS.map(([x, y], i) => (
            <rect key={i} className={i === 2 ? 'a-twinkle' : undefined} x={x} y={y} width="3" height="5" fill="#ffc77a" />
          ))}
        </g>
      )}

      {RIDGES.map((ridge) => (
        <path key={ridge.d} d={ridge.d} fill={script ? '#071618' : ridge.fill} opacity={ridge.opacity} />
      ))}
      <g className="a-drift a-delay" filter="url(#noir-mist)">
        <ellipse cx="260" cy="560" rx="300" ry="20" fill={script ? '#2a5a58' : '#3a4560'} opacity="0.4" />
        <ellipse cx="760" cy="590" rx="320" ry="22" fill={script ? '#2a5a58' : '#3a4560'} opacity="0.35" />
        <ellipse cx="520" cy="230" rx="260" ry="14" fill={script ? '#2a5a58' : '#3a4560'} opacity="0.22" />
      </g>
      {DUST.map(([x, y, r, delay], i) => (
        <circle
          key={i}
          className="a-rise"
          cx={x}
          cy={y}
          r={r}
          fill={i % 4 ? (script ? '#bff4ea' : '#c9d6ea') : '#ffc890'}
          opacity="0.6"
          style={{ animationDelay: `${-delay * 8}s`, animationDuration: '13s' }}
        />
      ))}
      <rect width="1000" height="700" fill="url(#noir-vignette)" />
      <rect width="1000" height="700" filter="url(#noir-grain)" opacity="0.4" />
    </svg>
  );
}
