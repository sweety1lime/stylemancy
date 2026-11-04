import { MENTOR_NOIR, VILLAIN_NOIR } from './figures';
import { sparkle } from './geometry';
import { NIGHT } from './scene';
import { Silhouette } from './light';

/** Кадр портрета Лорда Дефолта: голова в цилиндре и плечи из фигуры во весь рост */
const VILLAIN_BOX = { x: 20, y: -4, size: 60 };

/**
 * Портрет «Сумрака»: силуэт на фоне лунного неба. У Магистра Флекса из-под полей шляпы тлеют глаза
 * и моргают, у Лорда Дефолта блестит монокль. size — сторона квадрата в пикселях.
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
      <Silhouette figure={villain ? VILLAIN_NOIR : MENTOR_NOIR} rim="noir-rim" fill={NIGHT} />
      {villain ? (
        <path className="a-twinkle" d={sparkle(53.4, 35.4, 2.2)} fill="#d6e6ff" filter="url(#sil-glow)" />
      ) : (
        <g className="a-blink" fill="#ffb067" filter="url(#sil-glow)">
          {MENTOR_NOIR.dots.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
    </svg>
  );
}
