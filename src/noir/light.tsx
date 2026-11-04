import type { CSSProperties } from 'react';
import type { Figure, Role } from './types';
import type { Light } from './lights';

/* Свет и силуэты «Сумрака»: тёмная фигура с контровым светом и круги света вокруг огоньков */

export const SIL = '#130a1d';

/** Круг света: яркий центр, мягко гаснет к краю */
export function Glow({ x, y, r, light, className }: { x: number; y: number; r: number; light: Light; className?: string }) {
  return <circle className={className} cx={x} cy={y} r={r} fill={`url(#sil-light-${light})`} style={{ mixBlendMode: 'screen' } as CSSProperties} />;
}

interface SilhouetteProps {
  figure: Figure;
  /** Детали, которые горят своим цветом поверх силуэта */
  lit?: Partial<Record<Role, string>>;
  /** Цвет ореола вокруг огонька фигуры */
  light?: Light;
  /** Фильтр контрового света: у каждого стиля свой цвет и сторона */
  rim?: string;
  fill?: string;
}

/** Тёмная фигура с контровым светом по краю; детали из lit горят своим цветом поверх силуэта. */
export function Silhouette({ figure, lit = {}, light, rim = 'sil-rim', fill = SIL }: SilhouetteProps) {
  return (
    <g>
      <g filter={`url(#${rim})`}>
        {figure.parts.map((part, i) => (
          <path key={i} className={part.className} d={part.d} fill={fill} />
        ))}
      </g>
      {figure.glow && light && <Glow className="a-glow" x={figure.glow.x} y={figure.glow.y} r={figure.glow.r} light={light} />}
      <g filter="url(#sil-glow)">
        {figure.parts.map((part, i) => {
          const color = lit[part.role];
          return color ? <path key={i} d={part.d} fill={color} /> : null;
        })}
      </g>
    </g>
  );
}
