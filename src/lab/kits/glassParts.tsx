import { useId } from 'react';
import { polygonPath, shade, type Cell } from '../voronoi';
import type { Piece } from './glassPaint';

/* Детали стиля «Витраж» */

export const LEAD = '#16111f';

interface GlassProps {
  pieces: Piece[];
  /** Сетка осколков; без неё деталь — одно стекло */
  cells?: Cell[];
  /** Роспись по стеклу: черты лица, складки */
  lines?: string[];
  dots?: string[];
  /** Насколько разнятся оттенки соседних осколков */
  spread?: number;
  /** Во сколько раз толще свинец: для крупных рамок вроде иконок 512 × 512 */
  weight?: number;
}

/**
 * Витраж: каждая деталь нарезана на осколки по общей сетке (сетка обрезается формой детали),
 * соседние осколки чуть разного оттенка, между ними свинцовые перемычки.
 */
export function Glass({ pieces, cells = [], lines = [], dots = [], spread = 0.28, weight = 1 }: GlassProps) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <g>
      {pieces.map((piece, i) => {
        const clip = `glass-${id}-${i}`;
        return (
          <g key={i}>
            <clipPath id={clip}>
              <path d={piece.d} />
            </clipPath>
            <g clipPath={`url(#${clip})`}>
              <path d={piece.d} fill={piece.color} />
              {cells.map((cell, k) => (
                <path
                  key={k}
                  d={polygonPath(cell.polygon)}
                  fill={shade(piece.color, (cell.jitter - 0.5) * spread)}
                  stroke={LEAD}
                  strokeWidth={0.9 * weight}
                />
              ))}
            </g>
            <path d={piece.d} fill="none" stroke={LEAD} strokeWidth={1.8 * weight} strokeLinejoin="round" />
          </g>
        );
      })}
      {lines.length > 0 && <path d={lines.join(' ')} fill="none" stroke={LEAD} strokeWidth={1.1 * weight} strokeLinecap="round" />}
      {dots.map((d) => (
        <path key={d} d={d} fill={LEAD} />
      ))}
    </g>
  );
}
