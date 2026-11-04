import { VILLAIN_NOIR } from './figures';
import { sparkle } from './geometry';
import { Glow, Silhouette } from './light';
import { BUSTS, type Bust } from './mentors';
import { NIGHT } from './scene';

/** Кадр портрета Лорда Дефолта: голова в цилиндре и плечи из фигуры во весь рост */
const VILLAIN_BOX = { x: 20, y: -4, size: 60 };

/** Наставник погрудно: ореол цвета земли, тёмный силуэт с лунной кромкой и его огоньки. Рамка 120 × 120 */
export function NoirBust({ bust }: { bust: Bust }) {
  return (
    <g>
      <circle cx="60" cy="56" r="66" fill={`url(#sil-light-${bust.halo})`} opacity="0.5" />
      <g filter="url(#noir-rim)">
        {bust.parts.map((d) => (
          <path key={d} d={d} fill={NIGHT} />
        ))}
      </g>
      {bust.glow && <Glow className="a-pulse" x={bust.glow.x} y={bust.glow.y} r={bust.glow.r} light={bust.glow.light} />}
      <g filter="url(#sil-glow)">
        {bust.lights.map((lit) => (
          <path key={lit.d} className={lit.className} d={lit.d} fill={lit.color} fillRule="evenodd" opacity={lit.opacity} />
        ))}
      </g>
    </g>
  );
}

/**
 * Портрет «Сумрака»: силуэт на фоне лунного неба, лицо в тени, светится одна деталь.
 * У Лорда Дефолта блестит монокль. size — сторона квадрата в пикселях.
 */
export function NoirFace({ id, size, className }: { id: string; size: number; className?: string }) {
  const villain = id === 'default';
  const box = villain ? VILLAIN_BOX : { x: 0, y: 0, size: 120 };
  return (
    <svg
      className={['noir-face noir-art', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox={`${box.x} ${box.y} ${box.size} ${box.size}`}
      aria-hidden="true"
    >
      <rect x={box.x} y={box.y} width={box.size} height={box.size} fill="url(#noir-portrait)" />
      {villain ? (
        <>
          <Silhouette figure={VILLAIN_NOIR} rim="noir-rim" fill={NIGHT} />
          <path className="a-twinkle" d={sparkle(53.4, 35.4, 2.2)} fill="#d6e6ff" filter="url(#sil-glow)" />
        </>
      ) : (
        <NoirBust bust={BUSTS[id] ?? BUSTS.flex} />
      )}
    </svg>
  );
}
