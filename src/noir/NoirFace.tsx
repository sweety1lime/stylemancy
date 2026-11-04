import { VILLAIN_NOIR } from './figures';
import { sparkle } from './geometry';
import { Glow, Silhouette } from './light';
import { BUSTS, POSES, type Bust, type Pose } from './mentors';
import { NIGHT } from './scene';

/** Кадр портрета Лорда Дефолта: голова в цилиндре и плечи из фигуры во весь рост */
const VILLAIN_BOX = { x: 20, y: -4, size: 60 };

/** Поза реакции: рука с кромкой поверх фигуры; у левой руки — зеркально. От радости над ладонью вспыхивает искра */
function PoseArm({ pose, side }: { pose: Pose; side: 'left' | 'right' }) {
  const shape = POSES[pose];
  return (
    <g transform={side === 'left' ? 'matrix(-1 0 0 1 120 0)' : undefined}>
      <g className="noir-bust__pose">
      <g filter="url(#noir-rim)" fill={NIGHT}>
        <path d={shape.arm} />
        <path d={shape.hand} />
      </g>
      {'spark' in shape && (
        <path className="a-twinkle" d={sparkle(shape.spark.x, shape.spark.y, 5)} fill="#fff1d6" filter="url(#sil-glow)" />
      )}
      </g>
    </g>
  );
}

/** Наставник погрудно: ореол цвета земли, тёмный силуэт с лунной кромкой и его огоньки. Рамка 120 × 120 */
export function NoirBust({ bust, pose }: { bust: Bust; pose?: Pose | null }) {
  const side = bust.free ?? 'right';
  return (
    <g>
      <circle cx="60" cy="56" r="66" fill={`url(#sil-light-${bust.halo})`} opacity="0.5" />
      <g filter="url(#noir-rim)">
        {bust.parts.map((d) => (
          <path key={d} d={d} fill={NIGHT} />
        ))}
      </g>
      {bust.glow && <Glow x={bust.glow.x} y={bust.glow.y} r={bust.glow.r} light={bust.glow.light} />}
      <g className="noir-bust__lights" filter="url(#sil-glow)">
        {bust.lights.map((lit) => (
          <path key={lit.d} className={lit.className} d={lit.d} fill={lit.color} fillRule="evenodd" opacity={lit.opacity} />
        ))}
      </g>
      {/* Руки впереди фигуры: свой силуэт — кромка отделяет их от тела */}
      {bust.hands && (
        <g filter="url(#noir-rim)" fill={NIGHT}>
          {bust.hands.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      )}
      {pose && side !== 'none' && <PoseArm pose={pose} side={side} />}
    </g>
  );
}

/**
 * Портрет «Сумрака»: силуэт на фоне лунного неба, лицо в тени, светится одна деталь.
 * У Лорда Дефолта блестит монокль. size — сторона квадрата в пикселях.
 */
export function NoirFace({ id, size, className, pose }: { id: string; size: number; className?: string; pose?: Pose | null }) {
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
        <NoirBust bust={BUSTS[id] ?? BUSTS.flex} pose={pose} />
      )}
    </svg>
  );
}
