import type { Figure, Role } from '../figures';

export interface Piece {
  d: string;
  color: string;
}

/** Детали фигуры с цветами стекла по ролям */
export function paint(figure: Figure, colors: Partial<Record<Role, string>>): Piece[] {
  return figure.parts.map((part) => ({ d: part.d, color: colors[part.role] ?? '#8a8a9a' }));
}
